const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const cors = require("cors");

const User = require("./models/User");
const Chat = require("./models/Chat");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(session({ secret: "mysecret", resave: false, saveUninitialized: true }));

mongoose.connect("mongodb://test:067567@ac-x0q8ji7-shard-00-00.lejhojc.mongodb.net:27017,ac-x0q8ji7-shard-00-01.lejhojc.mongodb.net:27017,ac-x0q8ji7-shard-00-02.lejhojc.mongodb.net:27017/?ssl=true&replicaSet=atlas-iybcwr-shard-0&authSource=admin&appName=Cluster0")
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    server.listen(3001, () => console.log("✅ Server running on port 3001"));
  })
  .catch(err => console.error("❌ MongoDB error:", err));

/* ------------------- AUTH ------------------- */
app.post("/login", async (req, res) => {
  const { userId, password } = req.body;
  const user = await User.findOne({ userId });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  req.session.userId = user._id;
  res.json({ message: "Login successful" });
});

/* ------------------- FRIENDS ------------------- */
app.get("/friends/:userId", async (req, res) => {
  const user = await User.findOne({ userId: req.params.userId });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user.friends);
});

app.post("/addFriend", async (req, res) => {
  const { userId, friendId } = req.body;
  await User.updateOne({ userId }, { $addToSet: { friends: friendId } });
  await User.updateOne({ userId: friendId }, { $addToSet: { friends: userId } });
  res.json({ message: "Friend added successfully" });
});

/* ------------------- CHAT ------------------- */
app.get("/chat/:userA/:userB", async (req, res) => {
  const chatId = [req.params.userA, req.params.userB].sort().join("_");
  const chats = await Chat.find({ chatId }).sort({ createdAt: 1 });
  res.json(chats);
});

/* ------------------- SOCKET.IO ------------------- */
io.on("connection", (socket) => {
  socket.on("register user", (userId) => {
    socket.userId = userId;
    socket.join(userId);
  });

  socket.on("chat message", async ({ senderId, receiverId, message }) => {
    const chatId = [senderId, receiverId].sort().join("_");
    const chat = new Chat({ chatId, senderId, receiverId, message, status: "sent", createdAt: new Date() });
    await chat.save();

    // Sender sees ✓ (sent)
    io.to(senderId).emit("chat message", { ...chat.toObject(), status: "sent" });

    // Receiver sees ✓✓ (delivered)
    io.to(receiverId).emit("chat message", { ...chat.toObject(), status: "delivered" });
  });

  socket.on("mark read", async ({ userA, userB }) => {
    const chatId = [userA, userB].sort().join("_");
    await Chat.updateMany({ chatId, receiverId: userA }, { status: "read" });
    io.to(userA).emit("messages read", { chatId });
    io.to(userB).emit("messages read", { chatId });
  });

  socket.on("delete chat", async ({ userA, userB }) => {
    const chatId = [userA, userB].sort().join("_");
    await Chat.deleteMany({ chatId });
    io.to(userA).emit("chat deleted", { chatId });
    io.to(userB).emit("chat deleted", { chatId });
  });

  // WebRTC signaling
  socket.on("call request", ({ fromId, toId, callType, offer }) => {
    io.to(toId).emit("incoming call", { fromId, callType, offer });
  });

  socket.on("call answer", ({ fromId, toId, answer }) => {
    io.to(toId).emit("call answered", { fromId, answer });
  });

  socket.on("ice candidate", ({ toId, candidate }) => {
    io.to(toId).emit("ice candidate", candidate);
  });
});
