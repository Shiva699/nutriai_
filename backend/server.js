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
  "http://localhost:3000",
];

// CORS Configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without origin (Postman, curl, mobile apps)
      if (!origin) {
        return callback(null, true);
      }

      // Allow localhost
      if (allowedOrigins.includes(origin)) {
        console.log(`✅ CORS Allowed: ${origin}`);
        return callback(null, true);
      }

      // Allow ALL Vercel deployments
      if (origin.endsWith(".vercel.app")) {
        console.log(`✅ CORS Allowed (Vercel): ${origin}`);
        return callback(null, true);
      }

      console.log(`❌ CORS Blocked: ${origin}`);
      return callback(
        new Error(`CORS policy: Origin ${origin} is not allowed`)
      );
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

// Root Route
app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});