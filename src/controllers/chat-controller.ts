

import { Response } from "express";
import Chat from "../models/chat";
import UserChats from "../models/user-chats";
import ChatModule from "../services/chat-service";
import { ChatApi } from "../dtos/chat-dto";
import { ChatRequestDto } from "../dtos/chat-dto";




 //---CONTROLLER---
 export class ChatController{

// fetch all recent chat list
public getRecentChats = async (req: ChatApi, res: Response): Promise<void> => {
  const userId:string|undefined = req.user?.uid;
   if (!userId) {
      res.status(400).json({ error: "Missing user ID." });
      return;
    }
  try {
    const userChats = await UserChats.findOne({ userId });
    if (!userChats) {
      // Return empty chat list structure for new users
      res.status(200).json({
        userId,
        chats: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      // console.log(userChats.chats);
      res.status(200).send(userChats);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("error fetching user chats!");
  }
};

// fetch a single chat by chatId and userId from the database
public getChat = async (req: ChatApi, res: Response):Promise<void>=> {
  const userId:string|undefined= req.user?.uid;
  const chatId:string|undefined = req.query.chatId as string;
   if (!userId || !chatId) {
      res.status(400).json({ error: "Missing user ID or chat ID." });
      return;
    }
  try {
    const chat = await Chat.findOne({
      chatId: chatId,
      userId: userId,
    });
    res.status(200).send(chat);
  } catch (err) {
    console.log("Error fetching chat:",err);
    res.status(500).send("Error fetching chat!");
  }
};

//delete a chat by chatId and userId from the database
public deleteChat = async (req: ChatApi, res: Response): Promise<void> => {
  const userId:string|undefined = req.user?.uid;
  const chatId:string|undefined = req.query.chatId as string;

  if (!userId || !chatId) {
    res.status(400).json({ error: "Missing user ID or chat ID." });
    return;
  }

  try {
    // Step 1: Delete the chat document
    const chatDeleteResult = await Chat.deleteOne({ chatId, userId });

    // Step 2: Remove the chat from UserChats
    const userChatsUpdateResult = await UserChats.updateOne(
      { userId },
      { $pull: { chats: { chatId } } }
    );

    // Step 3: Check if both deletions were successful
    if (chatDeleteResult.deletedCount === 0) {
      res.status(404).json({ error: "Chat not found or not owned by user." });
      return;
    }

    res.status(200).json({ message: "Chat deleted successfully." });
  } catch (err) {
    console.error("Error deleting chat:", err);
    res.status(500).json({ error: "Failed to delete chat." });
  }
};

// update chat title by chatId and userId from the database
public updateChatTitle = async (req: ChatApi, res: Response): Promise<void> => {
  const userId = req.user?.uid;
  const { chatId, newTitle } = req.body;
  if (!userId || !chatId || !newTitle) {
    res.status(400).json({ error: "Missing userId, chatId, or newTitle." });
    return;
  }
  try {
    const result = await UserChats.updateOne(
      { userId, "chats.chatId": chatId },
      { $set: { "chats.$.title": newTitle } }
    );
    if (result.modifiedCount === 0) {
      res.status(404).json({ error: "Chat not found or title unchanged." });
      return;
    }
    res.status(200).json({ message: "Chat title updated successfully." });
  } catch (err) {
    console.error("Error updating chat title:", err);
    res.status(500).json({ error: "Failed to update chat title." });
  }
};


// Load conversation history by user ID and populate sessionHistories map

public getConversationHistory = async (req: ChatApi, res: Response) => {
  const userId:string|undefined = req?.user?.uid;
  
    if (!userId) {
      res.status(400).json({ success: false, message: "Missing user ID." });
      return;
    }

  try {
    
    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Error loading conversation history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load conversation history",
    });
  }
};
public async saveChatMessage(
  chatId: string,
  userId: string,
  prompt: string,
  response: string,
  title: string // <-- Pass title from responseJson
):Promise<void>{
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
 }

export async function handleChatRequestApi(req: ChatApi, res: Response):Promise<void> {
  const dto = new ChatRequestDto(req.body);
  const handler = new ChatModule.ChatHandler();
  await handler.handleChatRequest(dto, res);
}
 

