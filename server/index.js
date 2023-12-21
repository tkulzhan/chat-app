const http = require("http");
const ws = require("ws");
const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const PORT = 4321;

const userModel = mongoose.model(
  "user",
  new mongoose.Schema({
    username: String,
    password: String,
    chats: [{ type: mongoose.Schema.ObjectId, ref: "chat" }],
  })
);

const chatModel = mongoose.model(
  "chat",
  new mongoose.Schema({
    participants: [{ type: mongoose.Schema.ObjectId, ref: "user" }],
    messages: [{ type: mongoose.Schema.ObjectId, ref: "message" }],
    name: String,
  })
);

const messageModel = mongoose.model(
  "message",
  new mongoose.Schema({
    body: String,
    author: { type: mongoose.Schema.ObjectId, ref: "user" },
    time: Date,
  })
);

const app = express();
const server = http.createServer(app);
const wsServer = new ws.WebSocket.Server({ server });

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/chats", async function (req, res) {
  const encryptedId = req.cookies["acdc"];
  if (!encryptedId) return res.status(403).json({ message: "Unauthorized" });
  const id = decryptUserId(encryptUserId);
  try {
    const user = await userModel.findById(id);
    return res.json(user.chats);
  } catch (error) {
    console.error(error);
  }
});

app.post("/register", async function (req, res) {
  const { username, password } = req.body;
  try {
    const candidate = await userModel.findOne({ username: username });
    if (candidate) res.status(400).json({ message: "Username occupied" });
    await userModel.create({
      username: username,
      password: password,
      chats: [],
    });
    return res.status(200).json({ message: "Registration successful" });
  } catch (error) {
    console.error(error);
  }
});

app.post("/login", async function (req, res) {
  const { username, password } = req.body;
  try {
    const candidate = await userModel.findOne({ username: username });
    if (!candidate) return res.status(400).json({ message: "No such user" });
    if (candidate.password !== password)
      return res.status(400).json({ message: "Incorrect password" });
    const encryptedUserId = encryptUserId(candidate._id);
    return res
      .status(200)
      .cookie("acdc", encryptedUserId, { httpOnly: true })
      .json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
  }
});

wsServer.on("connection", (wcCon) => {
  // Web socket implementation
});

// Function to encrypt the user ID
function encryptUserId(userId) {
  const algorithm = "aes-256-cbc";
  const key = Buffer.alloc(32, "^FJUUFfhu46VHU58(&)", "utf-8");
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(userId.toString(), "utf-8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
}

// Function to decrypt the user ID
function decryptUserId(encryptedUserId) {
  const algorithm = "aes-256-cbc";
  const key = Buffer.alloc(32, "^FJUUFfhu46VHU58(&)", "utf-8");

  const [iv, encrypted] = encryptedUserId.split(":");
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encrypted, "hex", "utf-8");
  decrypted += decipher.final("utf-8");

  return decrypted;
}

server.listen(PORT, async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/chat-app");
    console.log(`Server listening at http://localhost:${PORT}`);
  } catch (error) {
    console.error(error);
  }
});
