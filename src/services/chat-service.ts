
import { Request, Response } from "express";
import { callGeminiAI } from "./system-message-builder";
import {SystemMessageBuilder } from "./system-message-builder";
import { GeminiService } from "./system-message-builder";
import { getCurrentDateTime } from "../utils/date-utils";
import Constant from "../constants/constant";
import { DefaultValues } from "../constants/default-value";
import { followupprompts } from "../helpers/followup-prompt-helper";
import Chat from "../models/chat";
import UserChats from "../models/user-chats";
import { sessionHistories } from "../helpers/session-helper";
import { functionDeclarations } from "../gemini/functions/crmFunctionDeclarations";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { formatResponse } from "../helpers/response-formatter";
import { FormatResponseOptions } from "../helpers/response-formatter";
import { prepareActionResponse } from "../helpers/action-response";
import { FunctionResult } from "../helpers/action-response";
import { Logger } from "../utils/logger";
import { ConstantMessage } from "../constants/constant-messages";
import { ChatRequestDto } from "../dtos/chat-dto";

const apiKey = process.env.GOOGLE_API_KEY || "";
export const genAI = new GoogleGenerativeAI(apiKey);
export const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro-latest",
  tools: [{ functionDeclarations }],
});

const cons = new Constant();
 const geminiService = new GeminiService(apiKey, sessionHistories);
 async function saveToChatHistory(
  chatId: string,
  userId: string,
  prompt: string,
  response: string,
  title: string // <-- Pass title from responseJson
) {
  const chat = await Chat.findOne({ chatId, userId });
  if (!chat) throw new Error("Chat not found!");

  const isFirstMessage = chat.history.length === 0;

  // Step 1: Push the new prompt and response
  await Chat.updateOne(
    { chatId, userId },
    {
      $push: {
        history: {
          $each: [
            { role: "user", parts: [{ text: prompt }] },
            { role: "model", parts: [{ text: response }] },
          ],
        },
      },
    }
  );

  // Step 2: If first message, update title inside UserChats
  if (isFirstMessage) {
    await UserChats.updateOne(
      { userId: userId, "chats.chatId": chatId },
      {
        $set: {
          "chats.$.title": title,
        },
      }
    );
  }
}

  async function generateTitle(prompt: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const userPrompt = `
    You are a smart and precise title generator.Based on the user's input prompt, generate a very short, relevant, and attractive title.The title must be 25 characters or fewer.The title should clearly reflect the main intent of the prompt, without adding unrelated or generic words.Avoid repetition or vague language.Focus on action keywords, context, and intent to generate the title.
    Prompt: "${prompt}"
  `;
    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    const text = response.text().trim();
    return text;
  }

  //Enum
 export enum MODEL_PARAMS {
  BASE = 0,
  TRACE = 1,
  GEMINI = 2
}

const BaseMessageKey= {
  BASE : (ConstantMessage.SYSTEM_MESSAGE_BASE),
  TRACE : (ConstantMessage.SYSTEM_MESSAGE_BASE_TRACE)
}as const;

const GuidelinesKey ={
  BASE : (ConstantMessage.SYSTEM_MESSAGE_GUIDELINES),
  TRACE : (ConstantMessage.SYSTEM_MESSAGE_GUIDELINES_TRACE)
} as const;

export namespace ChatModule {
  export class ChatHandler {

    public async handleChatRequest(dto: ChatRequestDto, res: Response): Promise<void> {
      let tittle: string = "";
      let responseJson: FormatResponseOptions | string = "";
      let baseMessageKey: string = "";
      let guidelinesKey: string[]= [];
      let functionResult: FunctionResult | undefined;
      let prompts: string[] = [];
      let geminiResponse = "";
      const maxRetries = 3;
      let attempt = 0;
      let success = false;  
      const currentDatestring = getCurrentDateTime();

      try {
        //  Model selection
const modelKeys = this.setModelKeys(dto.model ?? 0, res);
if (!modelKeys) return;
        // Gemini model direct call
        if (dto.model === MODEL_PARAMS.GEMINI) {
          await this.handleGeminiDirect(dto.prompt, dto.chatId, res);
          return;
        }

        //  Build system message & call Gemini with retries
        const systemMessageBuilder = new SystemMessageBuilder(baseMessageKey, guidelinesKey);
        while (attempt < maxRetries && !success) {
          try {
            geminiResponse = await geminiService.interactWithGemini(
              dto.prompt,
               systemMessageBuilder,
              dto.chatId
            );
            success = true;
          } catch (error) {
            attempt++;
            Logger.error(`Gemini attempt ${attempt} failed`, error);
            if (attempt >= maxRetries) throw new Error(`Failed after ${maxRetries} attempts`);
            await new Promise(res => setTimeout(res, 1000 * attempt)); // backoff
          }
        }

        // Title generation
        tittle = await generateTitle(dto.prompt);
        Logger.info("Generated title", tittle);

        // Action handling
        if (dto.action === 1 && dto.model === MODEL_PARAMS.BASE) {
          const storedValue = await DefaultValues();
          const masterMsg = (ConstantMessage.Masterjsonmsg|| "") + storedValue;

          responseJson = await prepareActionResponse({
            sessionId:dto.chatId,
            customModel:dto.model,
            firstMessageText: masterMsg,
            title: functionResult?.title || tittle,
            responseText: cons.showdetailsForcustomisation,
            crmActionFlag: true
          });
        }
        else if (dto.action === 1 && dto.model === MODEL_PARAMS.TRACE) {
          responseJson = await prepareActionResponse({
            sessionId:dto.chatId,
            customModel:dto.model,
            firstMessageText: cons.plugincrmactionmsg + currentDatestring,
            title: tittle,
            responseText: cons.showdetailsForLogs,
            tracingFiltersFlag: true
          });
        }
        else if (dto.action === 0) {
          const prompts = await followupprompts(sessionHistories.get(dto.chatId) || []);

          responseJson = await prepareActionResponse({
            sessionId:dto.chatId,
            customModel:dto.model,
            firstMessageText:
              dto.model=== MODEL_PARAMS.BASE
                ? cons.convertationfollowupprompts
                : cons.pluginfollowupprompts,
            title: functionResult?.title || tittle,
            responseText: geminiResponse,
            nextUserResponses: prompts || []
          });
        }
        //  Send response
        res.status(200).send(responseJson ?? "");
      } catch (error) {
        Logger.error("Error in handleChatRequest", error);
        const fallbackResponse = formatResponse({
          title: "Retry Request",
          response: "Something went wrong, please try again.",
          next_user_responses: [`Retry this ${dto.prompt}`],
          crm_action: null,
          tracing_filters: null
        });
        res.status(200).send(fallbackResponse);
      }
    }

    // --------------------------
    // Helper Functions
    // --------------------------

    private setModelKeys(customModel: number, res: Response):{ baseKey: string,guideKey: string[]}| null {
       switch (customModel) {
    case MODEL_PARAMS.BASE:
      return { baseKey: BaseMessageKey.BASE, guideKey: GuidelinesKey.BASE };
    case MODEL_PARAMS.TRACE:
      return { baseKey: BaseMessageKey.TRACE, guideKey: GuidelinesKey.TRACE };
    case MODEL_PARAMS.GEMINI:
      return { baseKey: "", guideKey: [] }; // handled separately
    default:
      Logger.warn(`Invalid model: ${customModel}`);
      res.status(400).json({ error: "Invalid model type provided." });
      return null;
  }
    }
    private async handleGeminiDirect(userPrompt: string, sessionId: string, res: Response) {
      try {
        const responseJson = await callGeminiAI(userPrompt, sessionId);
        const parsedResponse = JSON.parse(responseJson);
        res.status(200).send(parsedResponse ?? "");
      } catch (error) {
        Logger.error("Gemini direct model error", error);
        res.status(500).json({ error: "Error processing GeminiAI response." });
      }
    }
  }
}
export default ChatModule;
