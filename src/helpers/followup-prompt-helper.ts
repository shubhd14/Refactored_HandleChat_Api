import { genAI } from "../services/chat-service";

export async function followupprompts(input: any): Promise<string[]> {
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 1000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const chat = model.startChat({ history: input });
        const result = await chat.sendMessage("Generate the next 4 user messages based on the conversation history below.");
        const response = await result.response;
        const text = await response.text();
        const promptsArray = text
          .split('\n')
          .map(line=>
            line
              .replace(/^\d+\.\s*/, '')          // remove numbering like "1. "
              .replace(/\\/g, '')                // remove backslashes
              .replace(/"/g, "'")                // replace double quotes with single quotes
              .replace(/[?!.,;:(){}[\]<>*]/g, '') // remove punctuation marks including *
              .trim()
          )
          .filter(line => line.length > 0);
        return promptsArray;
      } catch (err: any) {
        console.error(`Attempt ${attempt} failed:`, err);
        if (attempt < MAX_RETRIES) {
          await new Promise(res => setTimeout(res, RETRY_DELAY_MS * attempt)); // Exponential backoff
        } else {
          return [`Error after ${MAX_RETRIES} attempts: ${err.toString()}`];
        }
      }
    }

    // fallback, though code never reaches here
    return ['Unknown error'];
  }
