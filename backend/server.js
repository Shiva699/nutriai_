const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");

dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

const app = express();

// CORS Configuration for Production
const allowedOrigins = [
  "https://nutriai-sable.vercel.app",
  "http://localhost:5173", // For local development
  "http://localhost:3000", // Alternative local port
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        console.log(`✅ CORS: Allowed origin: ${origin}`);
        return callback(null, true);
      } else {
        console.log(`❌ CORS: Blocked origin: ${origin}`);
        return callback(new Error(`CORS policy: Origin ${origin} is not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type", 
      "Authorization", 
      "X-Requested-With", 
      "Origin", 
      "Accept"
    ],
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  })
);

// Add security headers
app.use((req, res, next) => {
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("X-XSS-Protection", "1; mode=block");
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