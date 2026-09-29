const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");

dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

const app = express();

// Allowed Origins
const allowedOrigins = [
  "https://nutriai-sable.vercel.app",
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:4173",
  "http://127.0.0.1:3000",
];

const isLocalhostOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

// CORS Configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without origin (Postman, curl, mobile apps)
      if (!origin) {
        return callback(null, true);
      }

      // Allow configured origins or any local dev port
      if (allowedOrigins.includes(origin) || isLocalhostOrigin.test(origin)) {
        return callback(null, true);
      }

      // Allow ALL Vercel deployments
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      console.log(`❌ CORS Blocked: ${origin}`);
      return callback(new Error(`CORS policy: Origin ${origin} is not allowed`));
    },

    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Origin",
      "Accept",
    ],
    optionsSuccessStatus: 200,
  })
);

// Security Headers
app.use((req, res, next) => {
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("X-XSS-Protection", "1; mode=block");
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Body parser error handler for oversized payloads
app.use((err, req, res, next) => {
  if (err?.type === "entity.too.large" || err?.status === 413) {
    return res.status(413).json({
      success: false,
      error: "Payload too large: The uploaded image exceeds the 10MB limit. Please upload a smaller image.",
    });
  }
  next(err);
});

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

// Root Route
app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});