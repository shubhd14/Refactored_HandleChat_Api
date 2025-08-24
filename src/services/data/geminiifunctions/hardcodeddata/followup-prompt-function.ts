import { SchemaType, FunctionDeclaration } from "@google/generative-ai";
export const functionDeclarationstwo: FunctionDeclaration[] = [
{
  name: "formatResponseSummary",
  description:
    "Always use this function when a user input represents a step in a structured CRM CRUD  process. and plugin trace This function generates a short summary (title) of the user's current step and returns exactly 4 next-step user-style messages that would logically follow. These should look like realistic user inputs — not questions.", 

  parameters: {
    type: SchemaType.OBJECT,
    required: ["title", "followupPrompts"],
    properties: {
      title: {
        type: SchemaType.STRING,
        description:
          "Short, clear summary of what the user is currently doing, such as 'create a new record', 'Naming Primary Field', 'retrive entity metadata'." 
      },
      followupPrompts: {
        type: SchemaType.ARRAY,
        description:
          "An array of exactly 4 next-step user inputs — . These are not questions but actual user-style inputs that logically continue the crud opreation and plugin tracing flow flow. ", 
        minItems: 4,
        maxItems: 4,
        items: {
          type: SchemaType.STRING,
        }
      }
    }
  }
}


];