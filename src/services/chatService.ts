
import { Request, Response } from "express";
import ServiceManager from "./CRMTraceLogServices";
import { callGeminiAI } from "./systemmessagebuilder";
import {SystemMessageBuilder } from "./systemmessagebuilder";
import { GeminiService } from "./systemmessagebuilder";
import { Crmaction } from "./crmService";
import { getCurrentDateTime } from "../utils/dateUtils";
import Constant from "../constants/constant";
import { DefaultValues } from "../constants/defaultValue";
import { followupprompts } from "../helpers/followupPromptHelper";
import { ChatApi } from "../controllers/chatController";
import Chat from "../models/chat";
import UserChats from "../models/userChats";
import { sessionHistories } from "../helpers/sessionHelper";
import { functionDeclarations } from "../gemini/functions/crmFunctionDeclarations";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { formatResponse } from "../helpers/responseFormatter";
import { FormatResponseOptions } from "../helpers/responseFormatter";

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
  enum MODEL_PARAMS {
  BASE = 0,
  TRACE = 1,
  GEMINI = 2
}

enum BaseMessageKey {
  BASE = "SYSTEM_MESSAGE_BASE",
  TRACE = "SYSTEM_MESSAGE_BASE_TRACE"
}

enum GuidelinesKey {
  BASE = "SYSTEM_MESSAGE_GUIDELINES",
  TRACE = "SYSTEM_MESSAGE_GUIDELINES_TRACE"
}

enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  DEBUG = "DEBUG"
}

class Logger {
  static log(level: LogLevel, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`, ...args);
  }
  static info(message: string, ...args: any[]) {
    this.log(LogLevel.INFO, message, ...args);
  }
  static warn(message: string, ...args: any[]) {
    this.log(LogLevel.WARN, message, ...args);
  }
  static error(message: string, ...args: any[]) {
    this.log(LogLevel.ERROR, message, ...args);
  }
  static debug(message: string, ...args: any[]) {
    this.log(LogLevel.DEBUG, message, ...args);
  }
}

export namespace ChatModule {
  export class ChatHandler {

    public async handleChatRequest(req: ChatApi, res: Response): Promise<void> {
      const userPrompt: string = req.body.prompt;
      const sessionId: string = req.body.chatId;
      const customModel: number = Number(req.body.model) || MODEL_PARAMS.BASE;
      const action: number = req.body.action || 0;

      let crmaction: any;
      let tittle: string = "";
      let responseJson: FormatResponseOptions | string = "";
      let baseMessageKey: string = "";
      let guidelinesKey: string = "";
      let functionResult: any;
      let prompts: string[] = [];
      let geminiResponse = "";
      const maxRetries = 3;
      let attempt = 0;
      let success = false;
      const currentDatestring = getCurrentDateTime();

      try {
        //  Model selection
        if (!this.setModelKeys(customModel, res, baseMessageKey, guidelinesKey)) return;

        // Gemini model direct call
        if (customModel === MODEL_PARAMS.GEMINI) {
          await this.handleGeminiDirect(userPrompt, sessionId, res);
          return;
        }

        //  Build system message & call Gemini with retries
        const systemMessageBuilder = new SystemMessageBuilder(baseMessageKey, guidelinesKey);
        while (attempt < maxRetries && !success) {
          try {
            geminiResponse = await geminiService.interactWithGemini(userPrompt, systemMessageBuilder, sessionId);
            success = true;
          } catch (error) {
            attempt++;
            Logger.error(`Gemini attempt ${attempt} failed`, error);
            if (attempt >= maxRetries) throw new Error(`Failed after ${maxRetries} attempts`);
            await new Promise(res => setTimeout(res, 1000 * attempt)); // backoff
          }
        }

        // Title generation
        tittle = await generateTitle(userPrompt);
        Logger.info("Generated title", tittle);

        // Action handling
        if (action === 1 && customModel === MODEL_PARAMS.BASE) {
          responseJson = await this.handleActionOneBase(sessionId, customModel, functionResult, tittle);
        }
        else if (action === 1 && customModel === MODEL_PARAMS.TRACE) {
          responseJson = await this.handleActionOneTrace(sessionId, customModel, tittle, currentDatestring);
        }
        else if (action === 0) {
          responseJson = await this.handleActionZero(sessionId, customModel, geminiResponse, functionResult, tittle);
        }

        //  Send response
        res.status(200).send(responseJson ?? "");
      } catch (error) {
        Logger.error("Error in handleChatRequest", error);
        const fallbackResponse = formatResponse({
          title: "Retry Request",
          response: "Something went wrong, please try again.",
          next_user_responses: [`Retry this ${userPrompt}`],
          crm_action: null,
          tracing_filters: null
        });
        res.status(200).send(fallbackResponse);
      }
    }

    // --------------------------
    // Helper Functions
    // --------------------------

    private setModelKeys(customModel: number, res: Response, baseKey: string, guideKey: string): boolean {
      switch (customModel) {
        case MODEL_PARAMS.BASE:
          baseKey = BaseMessageKey.BASE;
          guideKey = GuidelinesKey.BASE;
          return true;
        case MODEL_PARAMS.TRACE:
          baseKey = BaseMessageKey.TRACE;
          guideKey = GuidelinesKey.TRACE;
          return true;
        case MODEL_PARAMS.GEMINI:
          return true; // handled separately
        default:
          Logger.warn(`Invalid model: ${customModel}`);
          res.status(400).json({ error: "Invalid model type provided." });
          return false;
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

    private async handleActionOneBase(sessionId: string, customModel: number, functionResult: any, tittle: string) {
      let copiedMessages = sessionHistories.get(sessionId) || [];
      const storedValue = await DefaultValues();
      const masterMsg = (cons.Masterjsonmsg || "") + storedValue;
      copiedMessages[0] = { role: 'user', parts: [{ text: masterMsg }] };
      const crmaction = await Crmaction(copiedMessages, customModel);
      copiedMessages.splice(-2, 2);
      return formatResponse({
        title: functionResult?.title || tittle,
        response: cons.showdetailsForcustomisation,
        next_user_responses: [],
        crm_action: crmaction,
        tracing_filters: null
      });
    }

    private async handleActionOneTrace(sessionId: string, customModel: number, tittle: string, currentDate: string) {
      let copiedMessages = sessionHistories.get(sessionId) || [];
      copiedMessages[0] = { role: 'user', parts: [{ text: cons.plugincrmactionmsg + currentDate }] };
      copiedMessages.splice(-2, 2);
      const crmaction = await Crmaction(copiedMessages, customModel);
      Logger.debug("Trace CRM Action result", crmaction);
      return formatResponse({
        title: tittle,
        response: cons.showdetailsForLogs,
        next_user_responses: [],
        crm_action: null,
        tracing_filters: crmaction
      });
    }

    private async handleActionZero(sessionId: string, customModel: number, geminiResponse: string, functionResult: any, tittle: string) {
      let copiedMessages = sessionHistories.get(sessionId) || [];
      if (!copiedMessages) throw new Error(`Session history not found: ${sessionId}`);

      copiedMessages[0] = {
        role: 'user',
        parts: [{ text: customModel === MODEL_PARAMS.BASE ? cons.convertationfollowupprompts : cons.pluginfollowupprompts }]
      };

      const prompts = await followupprompts(copiedMessages);
      copiedMessages.splice(-2, 2);

      return formatResponse({
        title: functionResult?.title || tittle,
        response: geminiResponse,
        next_user_responses: prompts || [],
        crm_action: null,
        tracing_filters: null
      });
    }
  }
}
export default ChatModule;
