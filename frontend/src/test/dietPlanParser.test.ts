import { describe, it, expect } from 'vitest';
import { parseDietPlanResponse } from '../components/dietPlanParser';

describe('dietPlanParser - parseDietPlanResponse', () => {
  it('returns fallback day when input is empty string', () => {
    const result = parseDietPlanResponse('');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Plan');
    expect(result[0].meals).toHaveLength(4);
    expect(result[0].meals[0].fallback).toBe(true);
  });

  it('correctly parses structured 7-day plan with meals', () => {
    const sampleAIResponse = `
Day 1
Breakfast: Oatmeal with blueberries. 350 calories, 15g protein, 55g carbs, 8g fat.
Lunch: Grilled chicken salad with olive oil. 450 calories, 40g protein, 15g carbs, 22g fat.
Dinner: Baked salmon with asparagus. 500 calories, 42g protein, 10g carbs, 28g fat.
Snack: Greek yogurt with honey. 180 calories, 15g protein, 20g carbs, 4g fat.

Day 2
Breakfast: Scrambled eggs and whole wheat toast. 380 calories, 22g protein, 30g carbs, 16g fat.
Lunch: Quinoa and black bean bowl. 420 calories, 18g protein, 65g carbs, 12g fat.
Dinner: Turkey breast with sweet potato. 480 calories, 45g protein, 40g carbs, 10g fat.
Snack: Mixed almonds and walnuts. 200 calories, 6g protein, 8g carbs, 18g fat.
`;

    const parsed = parseDietPlanResponse(sampleAIResponse);
    expect(parsed.length).toBeGreaterThanOrEqual(2);

    const day1 = parsed[0];
    expect(day1.name).toBe('Day 1');
    expect(day1.meals).toHaveLength(4);

    // Verify Breakfast on Day 1
    const breakfast = day1.meals.find(m => m.type === 'Breakfast');
    expect(breakfast).toBeDefined();
    expect(breakfast?.calories).toBe(350);
    expect(breakfast?.protein).toBe(15);
    expect(breakfast?.carbs).toBe(55);
    expect(breakfast?.fat).toBe(8);

    // Verify Lunch on Day 1
    const lunch = day1.meals.find(m => m.type === 'Lunch');
    expect(lunch?.calories).toBe(450);
    expect(lunch?.protein).toBe(40);
  });

  it('assigns appropriate fallback meal images based on keywords', () => {
    const text = `
Day 1
Breakfast: Pancakes with maple syrup 350 calories 10g protein 60g carbs 5g fat
Lunch: Grilled salmon with lemon 400 calories 35g protein 5g carbs 20g fat
Dinner: Vegetable stir fry 300 calories 12g protein 40g carbs 10g fat
Snack: Greek yogurt 150 calories 15g protein 10g carbs 2g fat
`;
    const parsed = parseDietPlanResponse(text);
    const day1 = parsed[0];
    expect(day1.meals[0].image).toContain('/assets/meals/');
  });

  it('correctly parses prefix-style macro labels (Fixed BUG-004)', () => {
    const prefixFormat = `
Day 1
Breakfast: Omelette
Calories: 300
Protein: 25g
Carbs: 10g
Fat: 18g
`;
    const parsed = parseDietPlanResponse(prefixFormat);
    const breakfast = parsed[0]?.meals.find(m => m.type === 'Breakfast');
    expect(breakfast).toBeDefined();
    expect(breakfast?.calories).toBe(300);
    expect(breakfast?.protein).toBe(25);
    expect(breakfast?.carbs).toBe(10);
    expect(breakfast?.fat).toBe(18);
  });

  it('correctly parses value-first, space-separated, and unitless macro formats', () => {
    const mixedFormat = `
Day 1
Breakfast: Tofu scramble. 320 kcal, 24 g protein, 15 g carbs, 12 g fat.
Lunch: Turkey sandwich. 410 calories, 35g of protein, 45g carbs, 10g of fat.
Dinner: Grilled chicken. Calories: 500. Protein: 45. Carbs: 30. Fat: 14.
Snack: Protein shake. 200 calories, 30g protein, 5g carbs, 3g fat.
`;
    const parsed = parseDietPlanResponse(mixedFormat);
    const day1 = parsed[0];
    expect(day1.meals[0].protein).toBe(24);
    expect(day1.meals[0].calories).toBe(320);
    expect(day1.meals[1].protein).toBe(35);
    expect(day1.meals[2].protein).toBe(45);
    expect(day1.meals[2].calories).toBe(500);
  });
});
