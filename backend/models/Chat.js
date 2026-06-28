const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  chatId: String,
  senderId: String,
  receiverId: String,
  message: String,
  status: { type: String, enum: ["sent", "delivered", "read"], default: "sent" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Chat", ChatSchema);
