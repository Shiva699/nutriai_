const express = require("express");
const { Groq } = require("groq-sdk");

const router = express.Router();

const apiKey = process.env.GROQ_API_KEY?.trim();

if (!apiKey) {
  console.error("Missing GROQ_API_KEY in .env");
}

const groq = new Groq({
  apiKey,
});

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
    const models = await groq.models.list();

    res.json({
      success: true,
      modelCount: models.data?.length || 0,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// AI Route
router.post("/", async (req, res) => {
  try {
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
    const modelName = isVisionRequest ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile";

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

    const completion = await groq.chat.completions.create({
      model: modelName,
      messages,
      temperature: 0.6,
      max_tokens: 2000,
    });

    const reply =
      completion?.choices?.[0]?.message?.content ||
      "No response generated";

    console.log("========== AI RESPONSE ==========");
    console.log(reply);
    console.log("================================");

    return res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("GROQ ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;