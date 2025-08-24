import { sessionHistories } from "./session-helper";
import { Crmaction } from "../services/crm-service";
import { Logger } from "../utils/logger";
import { formatResponse } from "./response-formatter";

//Function Result
export interface FunctionResult {
  title?: string;              // Gemini function ya CRM action ka title
  response?: string;           // Optional AI ka response text
  crm_action?: boolean;        // Kya CRM action execute karna hai
  tracing_filters?: boolean;   // Kya tracing filters lagani hain
  prompts?: string[];          // Suggestion prompts
  action_type?: string;        // Action ka type (fetch, update, etc.)
  [key: string]: any;          // Extra dynamic fields
}


/**
 * Types for controlling response preparation
 */
interface ActionResponseOptions {
  sessionId: string;
  customModel: number;
  firstMessageText: string; // First message text to overwrite in copiedMessages[0]
  title: string;
  responseText: string;
  crmActionFlag?: boolean; // Whether to return crm_action
  tracingFiltersFlag?: boolean; // Whether to return tracing_filters
  nextUserResponses?: any[]; // List of follow-up responses
}

/**
 * Prepares a standard formatted response for actions (Base, Trace, Zero)
 * This function consolidates repeated logic:
 * - Retrieves and modifies session messages
 * - Optionally calls CRM action service
 * - Removes last 2 messages (clean-up)
 * - Returns a formatted response object
 */
export async function prepareActionResponse({
  sessionId,
  customModel,
  firstMessageText,
  title,
  responseText,
  crmActionFlag = false,
  tracingFiltersFlag = false,
  nextUserResponses = []
}: ActionResponseOptions) {
  
  // 1. Get session history 
  let copiedMessages = sessionHistories.get(sessionId) || [];

  // Safety check: If no session and no nextUserResponses, throw error 
  if (!copiedMessages.length && !nextUserResponses.length) {
    throw new Error(`Session history not found: ${sessionId}`);
  }

  // 2. Overwrite first user message with provided text
  copiedMessages[0] = { role: 'user', parts: [{ text: firstMessageText }] };

  // 3. Optionally call CRM Action service
  let crmResult: any = null;
  if (crmActionFlag || tracingFiltersFlag) {
    crmResult = await Crmaction(copiedMessages, customModel);
    if (tracingFiltersFlag) {
      Logger.debug("Trace CRM Action result", crmResult);
    }
  }

  // 4. Remove last 2 messages from history (same in all three original methods)
  copiedMessages.splice(-2, 2);

  // 5. Return formatted response with correct crm_action / tracing_filters
  return formatResponse({
    title,
    response: responseText,
    next_user_responses: nextUserResponses,
    crm_action: crmActionFlag ? crmResult : null,
    tracing_filters: tracingFiltersFlag ? crmResult : null
  });
}
