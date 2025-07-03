const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const {
  generateAIResponse,
  createChat,
  addMessage,
  getChat,
  getChatHistory,
} = require("../controller/chatController");

router.post("/prompt", authenticateToken, generateAIResponse);
router.post("/new", authenticateToken, createChat);
router.post("/:chatId", authenticateToken, addMessage);
router.get("/:chatId", authenticateToken, getChat);
router.get("/history/:userId", authenticateToken, getChatHistory);

module.exports = router;
