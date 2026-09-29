import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateDietPlan, askNutritionCoach } from '../services/groq';

describe('Groq Frontend Service Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('generateDietPlan sends formatted request payload to backend', async () => {
    const mockReply = 'Day 1\nBreakfast: Eggs\nLunch: Salad\nDinner: Fish\nSnack: Nuts';
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        reply: mockReply,
      }),
    } as Response);

    const payload = { age: 30, gender: 'male', height: 175, weight: 70, goal: 'Maintain weight', dietType: 'Balanced' };
    const result = await generateDietPlan(payload);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOptions] = fetchSpy.mock.calls[0];
    expect(calledUrl).toContain('/chat');
    expect(calledOptions?.method).toBe('POST');

    const parsedBody = JSON.parse(calledOptions?.body as string);
    expect(parsedBody.meta).toEqual({ type: 'diet_plan', ...payload });
    expect(parsedBody.message).toContain('Create a personalized 7 day meal plan');
    expect(result).toBe(mockReply);
  });

  it('askNutritionCoach dispatches question with coach meta', async () => {
    const mockAnswer = 'Drink at least 2L of water and maintain 1.5g protein per kg bodyweight.';
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        reply: mockAnswer,
      }),
    } as Response);

    const result = await askNutritionCoach('How much water should I drink?');
    expect(result).toBe(mockAnswer);
  });

  it('handles network error cleanly without unhandled exception', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network connection failed'));

    const result = await askNutritionCoach('Test network failure');
    expect(result).toContain('Error: Network connection failed');
  });

  it('handles HTTP error status codes from backend', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ success: false, error: 'Internal Server Error' }),
    } as Response);

    const result = await askNutritionCoach('Test server error');
    expect(result).toContain('Error: HTTP error! status: 500');
  });

  it('analyzeFoodImage passes base64 image data in meta to backend', async () => {
    const { analyzeFoodImage } = await import('../services/groq');
    const mockReply = 'Detected: Grilled Salmon with Steamed Broccoli. Approx 420 kcal, 42g protein, 8g carbs, 22g fat.';
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        reply: mockReply,
      }),
    } as Response);

    const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const result = await analyzeFoodImage(base64Data);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [, calledOptions] = fetchSpy.mock.calls[0];
    const parsedBody = JSON.parse(calledOptions?.body as string);
    expect(parsedBody.meta.type).toBe('food_analyzer');
    expect(parsedBody.meta.image).toBe(base64Data);
    expect(result).toBe(mockReply);
  });
});
