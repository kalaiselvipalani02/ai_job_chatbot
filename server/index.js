const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.js");
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to AI Job Chat");
});

// Use auth routes
app.use("/api/auth", authRoutes);

// Use chat routes
app.use("/api/chat", chatRoutes);

//db connection and server start
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
