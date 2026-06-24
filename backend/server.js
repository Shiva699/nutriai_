const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");

dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

const app = express();

// CORS FIX
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Extra CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

// Routes
const chatRoute = require("./routes/chat");
app.use("/api/chat", chatRoute);

// Debug Route
app.get("/api/debug", (req, res) => {
  const key = process.env.GROQ_API_KEY?.trim();

  res.json({
    envLoaded: true,
    keyExists: !!key,
    keyLength: key?.length || 0,
    corsEnabled: true,
  });
});

app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});