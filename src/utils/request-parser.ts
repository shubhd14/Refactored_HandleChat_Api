import { MODEL_PARAMS } from "../services/chat-service";

export function extractRequestParams(req: any) {
  return {
    userPrompt: String(req.body?.prompt ?? ""),
    sessionId: String(req.body?.chatId ?? ""),
    customModel: Number(req.body?.model) || MODEL_PARAMS.BASE,
    action: Number(req.body?.action) || 0
  };
}
