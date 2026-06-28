const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  password: String,
  friends: [String],
  online: { type: Boolean, default: false },
  lastSeen: Date
});

module.exports = mongoose.model("User", UserSchema);
