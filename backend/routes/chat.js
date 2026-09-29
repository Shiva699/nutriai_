const express = require("express");
const { Groq } = require("groq-sdk");

const router = express.Router();

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) return null;
  return new Groq({ apiKey });
}

// Health Route
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Chat API Working 🚀",
  });
});

// Test Route
router.get("/test", async (req, res) => {
  try {
    const groq = getGroqClient();
    if (!groq) {
      return res.status(503).json({
        success: false,
        error: "AI service configuration error: Missing GROQ_API_KEY in backend environment.",
      });
    }

    const models = await groq.models.list();
    const modelIds = models.data?.map((m) => m.id) || [];

    res.json({
      success: true,
      modelCount: modelIds.length,
      models: modelIds,
    });
  } catch (error) {
    const isAuthError =
      error?.status === 401 ||
      error?.code === "invalid_api_key" ||
      /invalid api key/i.test(error?.message || "");

    const statusCode = isAuthError
      ? 502
      : typeof error?.status === "number" && error.status >= 400 && error.status < 600
      ? error.status
      : 500;

    res.status(statusCode).json({
      success: false,
      error: isAuthError
        ? "AI service configuration error: Invalid or expired GROQ_API_KEY in backend environment."
        : error.message,
    });
  }
});

// AI Route
router.post("/", async (req, res) => {
  try {
    const groq = getGroqClient();
    if (!groq) {
      console.error("GROQ CONFIG ERROR: Missing GROQ_API_KEY in backend environment");
      return res.status(503).json({
        success: false,
        error: "AI service configuration error: Missing GROQ_API_KEY in backend environment. Please configure GROQ_API_KEY in deployment settings.",
      });
    }

    const { message, meta } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    // ✅ STRICT + CONSISTENT PROMPT (IMPORTANT FIX)
    let systemPrompt =
      "You are a professional nutrition coach. Always respond in structured format with clear meals: Breakfast, Lunch, Dinner, Snack. Always include approximate Calories, Protein, Carbs, and Fat values for each meal.";

    switch (meta?.type) {
      case "diet_plan":
        systemPrompt = `Generate EXACTLY 7 days.Format:Day 1Breakfast:Calories:Protein:Carbs:Fat:Lunch:Calories:Protein:Carbs:Fat:Dinner:Calories:Protein:Carbs:Fat:Snack:Calories:Protein:Carbs:Fat:Repeat until Day 7.Rules:- Always return Day 1 to Day 7.- Never skip a day.- No markdown.- No bullet points.- No explanations.`;
        break;

      case "coach":
        systemPrompt =
          "You are an expert nutrition coach. Give concise structured answers with bullet points.";
        break;

      case "bmi_analysis":
        systemPrompt =
          "You are a BMI and health assessment expert.";
        break;

      case "weight_prediction":
        systemPrompt =
          "You are a weight management specialist.";
        break;

      case "calorie_recs":
        systemPrompt =
          "You are a calorie planning expert.";
        break;

      case "hydration":
        systemPrompt =
          "You are a hydration coach.";
        break;

      case "macros":
        systemPrompt =
          "You are a sports nutrition and macro expert.";
        break;

      case "progress_summary":
        systemPrompt =
          "You are a fitness progress analyst.";
        break;

      case "health_score":
        systemPrompt =
          "You are a preventive healthcare specialist.";
        break;

      case "food_analyzer":
        systemPrompt =
          "You are a nutrition expert. Analyze food and return Calories, Protein, Carbs, Fat clearly.";
        break;
    }

    if (meta?.type === "diet_plan") {
      if (meta?.age !== undefined && (Number(meta.age) < 18 || Number(meta.age) > 80)) {
        return res.status(400).json({
          success: false,
          error: "Age must be between 18 and 80",
        });
      }
      if (meta?.height !== undefined && (Number(meta.height) < 140 || Number(meta.height) > 220)) {
        return res.status(400).json({
          success: false,
          error: "Height must be between 140 and 220 cm",
        });
      }
      if (meta?.weight !== undefined && (Number(meta.weight) < 40 || Number(meta.weight) > 150)) {
        return res.status(400).json({
          success: false,
          error: "Weight must be between 40 and 150 kg",
        });
      }
    }

    if (meta?.type === "food_analyzer") {
      if (!meta?.image || typeof meta.image !== "string" || !meta.image.trim()) {
        return res.status(400).json({
          success: false,
          error: "Image data is required for food analysis",
        });
      }
    }

    const isVisionRequest = meta?.type === "food_analyzer" && Boolean(meta?.image);
    const primaryTextModel = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
    const visionModel = process.env.GROQ_VISION_MODEL || "qwen/qwen3.8-27b";

    const candidateModels = isVisionRequest
      ? [visionModel]
      : [
          primaryTextModel,
          "openai/gpt-oss-20b",
          "openai/gpt-oss-120b",
          "qwen/qwen3.8-27b",
        ].filter((val, idx, arr) => val && arr.indexOf(val) === idx);

    let messages;
    if (isVisionRequest) {
      const rawImage = String(meta.image).trim();
      const imageUrl = rawImage.startsWith("data:")
        ? rawImage
        : `data:image/jpeg;base64,${rawImage}`;

      messages = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `${message || "Analyze this food image"}. Identify the food, estimate portion size, and return estimated Calories, Protein, Carbs, and Fat breakdown.`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ];
    } else {
      messages = [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ];
    }

    let completion = null;
    let usedModel = candidateModels[0];

    for (const modelToTry of candidateModels) {
      try {
        usedModel = modelToTry;
        completion = await groq.chat.completions.create({
          model: modelToTry,
          messages,
          temperature: 0.6,
          max_tokens: 2000,
        });
        break;
      } catch (err) {
        const isNotFound =
          err?.status === 404 ||
          err?.code === "model_not_found" ||
          /model_not_found/i.test(err?.message || "");

        if (!isNotFound || modelToTry === candidateModels[candidateModels.length - 1]) {
          throw err;
        }
        console.warn(`Model ${modelToTry} not available, attempting next candidate...`);
      }
    }

    const reply =
      completion?.choices?.[0]?.message?.content ||
      "No response generated";

    console.log(`========== AI RESPONSE (${usedModel}) ==========`);
    console.log(reply);
    console.log("================================");

    return res.json({
      success: true,
      reply,
      model: usedModel,
    });
  } catch (error) {
    console.error("GROQ API ERROR:", {
      status: error?.status,
      code: error?.code,
      message: error?.message,
    });

    const isAuthError =
      error?.status === 401 ||
      error?.code === "invalid_api_key" ||
      /invalid api key/i.test(error?.message || "");

    const isRateLimit =
      error?.status === 429 ||
      /rate limit/i.test(error?.message || "");

    const isModelNotFoundError =
      error?.status === 404 ||
      error?.code === "model_not_found" ||
      /model_not_found/i.test(error?.message || "");

    if (isAuthError) {
      return res.status(502).json({
        success: false,
        error: "AI service configuration error: Invalid or expired GROQ_API_KEY in backend environment. Please update the API key in deployment settings.",
      });
    }

    if (isRateLimit) {
      return res.status(429).json({
        success: false,
        error: "AI service rate limit reached. Please wait a moment before trying again.",
      });
    }

    if (isModelNotFoundError) {
      return res.status(502).json({
        success: false,
        error: "AI service configuration error: The configured AI model is not available or not permitted on this Groq account.",
      });
    }

    const statusCode =
      typeof error?.status === "number" && error.status >= 400 && error.status < 600
        ? error.status
        : 500;

    return res.status(statusCode).json({
      success: false,
      error: error?.message || "Failed to process AI request",
    });
  }
});

module.exports = router;