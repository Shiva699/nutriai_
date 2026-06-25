import { API_BASE_URL } from "../config/api";
import { logApiCall, logApiResponse } from "../utils/api-debug";

type AIResult = {
success: boolean;
reply?: string;
error?: string;
};

async function postToAI(
  message: string,
  meta: Record<string, any> = {}
): Promise<AIResult> {
  try {
    const payload = {
      message,
      meta,
    };

    logApiCall(API_BASE_URL, "POST", payload);

    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    logApiResponse(API_BASE_URL, response, data);

    return {
      success: data.success ?? false,
      reply: data.reply ?? "",
      error: data.error ?? "",
    };
  } catch (error: any) {
    console.error("❌ API Error:", error);
    return {
      success: false,
      error: error?.message || "Network error",
    };
  }
}

export async function generateDietPlan(payload: any): Promise<string> {
const res = await postToAI(
`Create a personalized 7 day meal plan for ${JSON.stringify(payload)}`,
{ type: "diet_plan" }
);

return res.success ? res.reply || "" : `Error: ${res.error}`;
}

export async function askNutritionCoach(
question: string
): Promise<string> {
const res = await postToAI(question, {
type: "coach",
});

return res.success ? res.reply || "" : `Error: ${res.error}`;
}

export async function analyzeBMI(
heightCm: number,
weightKg: number
): Promise<string> {
const bmi = weightKg / ((heightCm / 100) ** 2);

const res = await postToAI(
`Analyze BMI ${bmi.toFixed(1)}`,
{
type: "bmi_analysis",
}
);

return res.success ? res.reply || "" : `Error: ${res.error}`;
}

export async function predictWeightTimeline(
currentKg: number,
goalKg: number
): Promise<string> {
const res = await postToAI(
`Predict timeline from ${currentKg}kg to ${goalKg}kg`,
{
type: "weight_prediction",
}
);

return res.success ? res.reply || "" : `Error: ${res.error}`;
}

export async function calorieRecommendations(
payload: any
): Promise<string> {
const res = await postToAI(
`Calorie recommendation ${JSON.stringify(payload)}`,
{
type: "calorie_recs",
}
);

return res.success ? res.reply || "" : `Error: ${res.error}`;
}

export async function hydrationRecommendation(
goalMl: number,
consumedMl: number
): Promise<string> {
const res = await postToAI(
`Hydration advice. Goal ${goalMl}, consumed ${consumedMl}`,
{
type: "hydration",
}
);

return res.success ? res.reply || "" : `Error: ${res.error}`;
}

export async function explainMacros(
calories: number
): Promise<string> {
const res = await postToAI(
`Explain macros for ${calories} calories`,
{
type: "macros",
}
);

return res.success ? res.reply || "" : `Error: ${res.error}`;
}

export async function progressSummary(
data: any
): Promise<string> {
const res = await postToAI(
`Analyze progress ${JSON.stringify(data)}`,
{
type: "progress_summary",
}
);

return res.success ? res.reply || "" : `Error: ${res.error}`;
}

export async function healthScore(
profile: any
): Promise<string> {
const res = await postToAI(
`Health score ${JSON.stringify(profile)}`,
{
type: "health_score",
}
);

return res.success ? res.reply || "" : `Error: ${res.error}`;
}

export async function analyzeFoodImage(
base64: string
): Promise<string> {
const res = await postToAI(
"Analyze food image",
{
type: "food_analyzer",
image: base64,
}
);

return res.success ? res.reply || "" : `Error: ${res.error}`;
}
