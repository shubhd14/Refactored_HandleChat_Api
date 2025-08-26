import {Request} from 'express'
// Custom Request type with `auth` and `body`
export interface ChatApi extends Request {
user?: {uid:string};
  body: {
    chatId: string;
    prompt: string;
    response: string;
    model?: number;
    action?: number;
    currentModel?: number;
    newTitle?: string;
  };
}

// dto/chat.dto.ts
export class ChatRequestDto {
  chatId: string;
  prompt: string;
  response?: string;
  model: number = 0;
  action: number = 0;
  currentModel?: number;
  newTitle?: string;

  constructor(body: ChatApi["body"]) {
    this.chatId = body.chatId;
    this.prompt = body.prompt;
    this.response = body.response;
    this.model = body.model ?? 0;
    this.action = body.action ?? 0;
    this.currentModel = body.currentModel;
    this.newTitle = body.newTitle;
  }
}
