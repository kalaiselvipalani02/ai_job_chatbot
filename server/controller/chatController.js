require("dotenv").config();
const Chat = require("../models/Chat");
const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateAIResponse = async (model, message) => {
  if (!model || !message) {
    throw new Error("Model and message are required");
  }

  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }

  if (model === "openai") {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
      max_tokens: 500,
      temperature: 0.7,
    });
    return response.choices[0].message.content;
  } else if (model === "gemini") {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const geminiModel = await genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 512,
      },
    });

    const result = await geminiModel.generateContent([message]);
    const response = result.response;
    return await response.text();
  } else {
    return res.status(400).json({
      message: "Invalid or missing model type. Use 'openai' or 'gemini'.",
    });
  }
};

//New Chat generation
const createChat = async (req, res) => {
  const { userId, message, model } = req.body;

  try {
    let text = "";

    //getting model
    /* if (model === "openai") {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
        max_tokens: 500,
        temperature: 0.7,
      });

      text = response.choices[0].message.content;
    } else if (model === "gemini") {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

      const geminiModel = await genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          maxOutputTokens: 512,
        },
      });

      const result = await geminiModel.generateContent([message]);
      const response = result.response;
      text = await response.text();
    } */
    text = await generateAIResponse(model, message);
    //save to chat , response from api is added to messages array
    const chat = await Chat.create({
      user: userId,
      messages: [
        { role: "user", content: message },
        { role: "assistant", content: text },
      ],
    });

    return res.status(201).json({
      message: text,
      chatId: chat._id,
    });
  } catch (error) {
    // console.error("API Error:", error);
    console.error(error.name, error.message, error.stack);
    if (error.response?.status === 401) {
      return res.status(401).json({ message: "Invalid API key" });
    }
    if (error.response?.status === 429) {
      return res.status(429).json({ message: "Rate limit exceeded" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
//Update with existing chat
const addMessage = async (req, res) => {
  const { chatId } = req.params;
  const { message, model, userId } = req.body;

  if (!chatId || !userId || !message || !model) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    text = await generateAIResponse(model, message);

    const chat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: {
          messages: [
            { role: "user", content: message },
            { role: "assistant", content: text },
          ],
        },
      },
      { new: true }
    );
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    return res.status(200).json({
      message: text,
      chatId: chat._id,
      messages: chat.messages,
    });
  } catch (error) {
    console.error(error.name, error.message, error.stack);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//Get chat with chatId
const getChat = async (req, res) => {
  const { chatId } = req.params;
  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }
  return res.status(200).json(chat);
};

//getting chat history
const getChatHistory = async (req, res) => {
  const { userId } = req.params;
  const chats = await Chat.find({ user: userId }).sort({ timestamp: -1 });

  const response = chats.map((chat) => {
    const userMsg = chat.messages.find((msg) => msg.role === "user");
    return {
      chatId: chat._id,
      heading: userMsg?.content.slice(0, 60) || "No message",
      timestamp: chat.timestamp,
    };
  });
  return res.status(200).json(response);
};

module.exports = {
  generateAIResponse,
  createChat,
  addMessage,
  getChat,
  getChatHistory,
};
