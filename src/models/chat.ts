import mongoose, { Schema, Document, Model } from "mongoose";

// Define a TypeScript union type for roles
type RoleType = "user" | "model";

// Define interfaces for nested parts
interface IPart {
  text: string;
  developermode?: string;
}

// Define interface for history items
interface IHistory {
  role: RoleType;
  parts: IPart[];
}

// Define the main interface for the chat document
export interface IChat extends Document {
  userId: string;
  chatId: string;
  history: IHistory[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for the chat model
const chatSchema: Schema<IChat> = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    chatId: {
      type: String,
      required: true,
    },

    history: [
      {
        role: {
          type: String,
          enum: ["user", "model"], // Enum array for allowed values
          required: true,
        },
        parts: [
          {
            text: {
              type: String,
              required: true,
            },
            // developermodetext: {
            //   type: String,
            // },
          },
          { _id: false }, // Disable _id for nested parts
        ],
      },
    ],
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Define the model with type safety
const Chat: Model<IChat> =
  mongoose.models.chat || mongoose.model<IChat>("chat", chatSchema);

export default Chat;
