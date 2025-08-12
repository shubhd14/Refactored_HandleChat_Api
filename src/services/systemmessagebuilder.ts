import { GoogleGenerativeAI } from "@google/generative-ai";
import { sessionHistories } from "../helpers/sessionHelper"; 
import { getPluginTraceDetails,Tracelogchecker,execute_data_operation,execute_retrieve_query,create_custom_entity, retrieve_entity_metadata,enableTraceLog} from "./crmApiFunctions";
import dotenv from "dotenv";
import { functionDeclarationstwo } from "./data/geminiifunctions/hardcodeddata/followuppromptfunction";
import { formatResponseSummary } from "./crmApiFunctions";
import { genAI } from "./chatService";
import { model } from "./chatService";
import Constant from "../constants/constant";
import { formatResponse } from "../helpers/responseFormatter";
dotenv.config();

const cons = new Constant();


const systemPrompt = {
  role: "user",
  parts: [
    {
      text: cons.SYSTEM_MESSAGE_BASE_Crm_Assistant
    },
  ],
};

export class SystemMessageBuilder {
  private userRole: string;
  private baseMessage: string;
  private guidelines: string[];
  private safeReplies: string[];

  constructor(
    baseMessageKey: string,
    guidelinesKey: string,
    baseMessage: string = "",
    guidelines: string[] = [],
    safeReplies: string[] = [],
    userRole: string = ""
  ) {
    this.baseMessage = baseMessage;
    this.guidelines = guidelines;
    this.safeReplies = safeReplies;
    this.userRole = userRole;

    if (process.env["SYSTEM_MESSAGE_USER_ROLE"]) {
      this.userRole = process.env["SYSTEM_MESSAGE_USER_ROLE"];
    }

    if (process.env[baseMessageKey]) {
      this.baseMessage = process.env[baseMessageKey];
    }

    if (process.env[guidelinesKey]) {
      this.guidelines = this.guidelines.concat(
        process.env[guidelinesKey].split("||")
      );
    }

    if (
      this.safeReplies.length === 0 &&
      process.env["SYSTEM_MESSAGE_SAFE_REPLIES"]
    ) {
      this.safeReplies = process.env["SYSTEM_MESSAGE_SAFE_REPLIES"].split("||");
    }
  }

  addGuideline(guideline: string): SystemMessageBuilder {
    this.guidelines.push(guideline);
    return this;
  }

  addSafeReply(reply: string): SystemMessageBuilder {
    this.safeReplies.push(reply);
    return this;
  }

  build(): string {
    let message = this.baseMessage + " " + this.userRole + " ";
    message += this.guidelines.join(" ");
    if (this.safeReplies.length > 0) {
      message +=
        " If asked 'Who created you?', respond with: " +
        this.safeReplies[0] +
        ". Also, use the following safe replies when similar questions are asked: " +
        this.safeReplies.slice(1).join(" ");
    }
    return message;
  }
}

export class GeminiService {
  private apiKey: string;
  private modelName: string;
  private sessionHistories = new Map();

  constructor(
    apiKey: string,
    sessionHistories: Map<string, any> = new Map(),
    modelName: string = "gemini-1.5-pro-latest"
  ) {
    this.apiKey = apiKey;
    this.modelName = modelName;
    this.sessionHistories = sessionHistories;
  }

  async interactWithGemini(
    userMessage: string,
    systemMessageBuilder: SystemMessageBuilder,
    chatId: string,
    maxOutputTokens: number = 1024
  ): Promise<string> {
    const genAI = new GoogleGenerativeAI(this.apiKey);
    const model = genAI.getGenerativeModel({ model: this.modelName });

    const systemMessage = systemMessageBuilder.build();

    const systemUserMsg = {
      role: "user",
      parts: [{ text: systemMessage }],
    };

    if (!this.sessionHistories.has(chatId)) {
      this.sessionHistories.set(chatId, [systemUserMsg]);
    }

    const chatHistory = this.sessionHistories.get(chatId);

    const chat
    = model.startChat({
      history: chatHistory,
      generationConfig: { maxOutputTokens: maxOutputTokens },
    });
    
    const result = await chat.sendMessage(userMessage);
    const responseText = result.response.text();
    return responseText;
  }
}

 export async function callGeminiAI(userprompt: string, sessionid: string): Promise<string>{
  const userPrompt= userprompt;
  const sessionId = sessionid || "default";
          let functionResult: any;
  try {
      if (!sessionHistories.has(sessionId)) {
        sessionHistories.set(sessionId, [systemPrompt]);
      }
      let chatHistory = sessionHistories.get(sessionId)! as any[];
      const chat = model.startChat({ history: chatHistory });
      const currentResponse = await chat.sendMessage(userPrompt);
      let finalBotResponse: string | null = null;
      let loopSafetyCounter = 0;
      while (loopSafetyCounter < 10) {
        const candidate = currentResponse.response.candidates?.[0];
        const parts = candidate?.content?.parts ?? [];
        const functionCallPart = parts.find(
          (p: any) => typeof p === "object" && "functionCall" in p
        ) as { functionCall: { name: string; args: any } } | undefined;

      if (functionCallPart?.functionCall) {
        loopSafetyCounter++;

        const { name, args } = functionCallPart.functionCall;
        switch (name) {
          case "getPluginTraceDetails":
            functionResult = await getPluginTraceDetails(
            );
            break;

          case "Tracelogchecker":
            functionResult = await Tracelogchecker();
            break;

          case "execute_data_operation":
            functionResult = await execute_data_operation(
              args.entity,
              args.operation,
              args.id,
              args.body
            );
            break;

          case "execute_retrieve_query":
            functionResult = await execute_retrieve_query(args.partialoDataUrl);
            break;

          case "retrieve_entity_metadata":
            functionResult = await retrieve_entity_metadata(
              args.partialmetadataurl,
              args.entity,
              args.attribute
            );
            break;

          case "enableTraceLog":
            functionResult = await enableTraceLog(args.plugintracelogsetting);
            break;

          default:
            console.warn(`⚠️ Unknown function name: ${name}`);
            functionResult = { error: "Function not handled" };
            break;
        }
        let followUp = await chat.sendMessage([
          {
            functionResponse: {
              name,
              response: { result: functionResult }
            }
          }
        ]);
        finalBotResponse = followUp.response.text();
        while (finalBotResponse === "") {
            followUp = await chat.sendMessage([{ text: "Response corrctly according to my function result and chat history" }]);
          finalBotResponse = followUp.response.text();
        }
        chatHistory.push({ role: "model", parts: [{ text: finalBotResponse }] });
         const secondModel = genAI.getGenerativeModel({
            model: "gemini-1.5-pro-latest",
            tools: [{functionDeclarations : functionDeclarationstwo}],
          });
          const newChat = secondModel.startChat();
          let currentResponse2 = await newChat.sendMessage(finalBotResponse + "\n\nBased on this response, generate a short summary title and 4 possible user inputs that would logically come next. Format it using the formatResponseSummary function.");
          const followCandidate = currentResponse2.response.candidates?.[0];
          const followParts = followCandidate?.content?.parts ?? [];
          const secondFunctionCall = followParts.find(
            (p: any) => typeof p === "object" && "functionCall" in p
          ) as { functionCall: { name: string; args: any } } | undefined;
          if (secondFunctionCall?.functionCall) {
            const { name, args } = secondFunctionCall.functionCall;
            if (name === "formatResponseSummary") {
           functionResult = await formatResponseSummary(args.title, args.followupPrompts);
            }
          }
        break;
      } else {
        const responseText = candidate?.content?.parts?.[0]?.text;
        if (responseText) {
          chatHistory.push({ role: "model", parts: [{ text: responseText }] });
          finalBotResponse = responseText;
          const secondModel = genAI.getGenerativeModel({
            model: "gemini-1.5-pro-latest",
            tools: [{functionDeclarations : functionDeclarationstwo}],
          });
          const newChat = secondModel.startChat();
          let currentResponse2 = await newChat.sendMessage(finalBotResponse + "\n\nBased on this response, generate a short summary title and 4 possible user inputs that would logically come next. Format it using the formatResponseSummary function.");
          const followCandidate = currentResponse2.response.candidates?.[0];
          const followParts = followCandidate?.content?.parts ?? [];
          const secondFunctionCall = followParts.find(
            (p: any) => typeof p === "object" && "functionCall" in p
          ) as { functionCall: { name: string; args: any } } | undefined;
          if (secondFunctionCall?.functionCall) {
            const { name, args } = secondFunctionCall.functionCall;
            if (name === "formatResponseSummary") {
           functionResult = await formatResponseSummary(args.title, args.followupPrompts);
            }
          }
        }
        break;
      }
    }
    // Update the session history
    sessionHistories.set(sessionId, chatHistory);

    try {
      const responseJson = formatResponse({
          title: functionResult?.title ,
          response: finalBotResponse,
          next_user_responses: functionResult?.followupPrompts,
          crm_action: null,
          tracing_filters: null,//
        });
      return JSON.stringify(responseJson);

      } catch {
        const responseJson = formatResponse({
          title: "Retry Request",
          response: "Something went wrong, please try again.",
          next_user_responses: ["Retry this " + userprompt],
          crm_action: null,
          tracing_filters: null,//
        });
        return JSON.stringify(responseJson);
      }
  } catch (err) {
    console.error("❌ Error in callGeminiAI:", {
            prompt: userprompt,
            sessionId,
            error: err,});
    const responseJson = formatResponse({
        title: "Retry Request",
        response: "Something went wrong, please try again.",
        next_user_responses: ["Retry this " + userprompt],
        crm_action: null,
        tracing_filters: null,//
      });
      return JSON.stringify(responseJson);
    }
}
  export function cleanText(input: string, model: number): any {
   const cleanedInput = input.replace(/(\r\n|\n|\r)/gm, " ");
      const jsonString = cleanedInput.match(/\{.*\}/);
      if (jsonString) {
        return jsonString[0];
      } else {
        return null;
      }
  }


//Gemini Response logic
export const getGeminiResponse = async (prompt: string, history: any[] = []) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(prompt);
    return result;
  } catch (error) {
    console.error("Error in getGeminiResponse:", error);
    throw error;
  }
};

export const getFunctionCallResponse = async (prompt: string, history: any[] = []) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.4,
        topP: 1,
        topK: 32,
        maxOutputTokens: 4096,
      },
      tools: [
        {
          functionDeclarations: [
            {
              name: "formatResponseSummary",
              description:
                "Returns a structured response with a title and a list of follow-up prompts",
              parameters: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "One-line title summarizing the content",
                  },
                  followupPrompts: {
                    type: "array",
                    description:
                      "List of related or follow-up prompts to continue the conversation",
                    items: {
                      type: "string",
                    },
                  },
                },
                required: ["title", "followupPrompts"],
              },
            },
          ]as any,
        },
      ],
    });
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(prompt);
    return result;
  } catch (error) {
    console.error("Error in getFunctionCallResponse:", error);
    throw error;
  }
};

