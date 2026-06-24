export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export type ParsedMeal = {
  type: MealType;
  title: string;
  description: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  image: string;
  fallback?: boolean;
};

export type ParsedDay = {
  name: string;
  summary: string;
  meals: ParsedMeal[];
};

const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const mealImages: Record<MealType, string[]> = {
  Breakfast: [
    '/assets/meals/breakfast1.jpg',
    '/assets/meals/breakfast2.jpg',
    '/assets/meals/breakfast3.jpg',
  ],
  Lunch: [
    '/assets/meals/lunch1.jpg',
    '/assets/meals/lunch2.jpg',
    '/assets/meals/lunch3.jpg',
  ],
  Dinner: [
    '/assets/meals/dinner1.jpg',
    '/assets/meals/dinner2.jpg',
    '/assets/meals/dinner3.jpg',
  ],
  Snack: [
    '/assets/meals/snack1.jpg',
    '/assets/meals/snack2.jpg',
    '/assets/meals/snack3.jpg',
  ],
};

const MEAL_IMAGE_LOOKUP: Record<MealType, Array<{ keywords: string[]; image: string }>> = {
  Breakfast: [
    { keywords: ['oatmeal', 'porridge'], image: mealImages.Breakfast[0] },
    { keywords: ['pancake', 'pancakes'], image: mealImages.Breakfast[1] },
    { keywords: ['smoothie bowl', 'smoothie'], image: mealImages.Breakfast[2] },
    { keywords: ['egg', 'eggs', 'toast'], image: mealImages.Breakfast[1] },
    { keywords: ['fruit', 'berry'], image: mealImages.Breakfast[2] },
  ],
  Lunch: [
    { keywords: ['grilled chicken', 'chicken'], image: mealImages.Lunch[0] },
    { keywords: ['rice bowl', 'rice'], image: mealImages.Lunch[1] },
    { keywords: ['salad'], image: mealImages.Lunch[2] },
    { keywords: ['pasta'], image: mealImages.Lunch[1] },
    { keywords: ['fish', 'salmon'], image: mealImages.Lunch[0] },
  ],
  Dinner: [
    { keywords: ['salmon'], image: mealImages.Dinner[0] },
    { keywords: ['soup'], image: mealImages.Dinner[1] },
    { keywords: ['stir fry', 'stir-fry'], image: mealImages.Dinner[2] },
    { keywords: ['veg', 'vegetable', 'veggie'], image: mealImages.Dinner[1] },
    { keywords: ['protein bowl', 'bowl'], image: mealImages.Dinner[2] },
  ],
  Snack: [
    { keywords: ['nuts', 'trail mix', 'almond', 'walnut'], image: mealImages.Snack[1] },
    { keywords: ['yogurt', 'greek yogurt', 'greek'], image: mealImages.Snack[0] },
    { keywords: ['fruit', 'fruits', 'berries', 'berry'], image: mealImages.Snack[2] },
    { keywords: ['protein bar', 'bar'], image: mealImages.Snack[1] },
    { keywords: ['smoothie'], image: mealImages.Snack[2] },
  ],
};

const DEFAULT_MEAL_IMAGE: Record<MealType, string> = {
  Breakfast: mealImages.Breakfast[0],
  Lunch: mealImages.Lunch[0],
  Dinner: mealImages.Dinner[0],
  Snack: mealImages.Snack[0],
};

export function parseDietPlanResponse(raw: string): ParsedDay[] {
  console.log("RAW RESPONSE:", raw);

  if (!raw || typeof raw !== 'string') {
    return [fallbackDay('Plan', 'No response')];
  }

  const cleanedRaw = raw
    .replace(/\*\*/g, '')
    .replace(/\r/g, '');

  const lines = cleanedRaw
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  const days: ParsedDay[] = [];

  let currentDay = createDay('Day 1');
  let currentDayHasContent = false;

  let buffer: Record<MealType, string[]> = {
    Breakfast: [],
    Lunch: [],
    Dinner: [],
    Snack: [],
  };

  let activeMeal: MealType | null = null;

  const dayHeaderRegex = /^(?:\d+[\.\)]\s*)?(day\s*\d+|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b(?:[:\-]?\s*(.*))?$/i;

  const hasBufferContent = () =>
    buffer.Breakfast.length ||
    buffer.Lunch.length ||
    buffer.Dinner.length ||
    buffer.Snack.length;

  const pushDay = () => {
    if (!currentDayHasContent && !hasBufferContent()) return;
    days.push(buildDay(currentDay.name, buffer));
  };

  const appendMealLine = (line: string) => {
    const mealType = detectMealType(line);
    if (mealType) activeMeal = mealType;

    if (!activeMeal) return;

    const cleaned = line
      .replace(/^[\*\-\•]\s*/, '')
      .replace(/^\d+[\.\)]\s*/, '')
      .replace(/\b(breakfast|lunch|dinner|snacks?)\b/gi, '')
      .replace(/[:\-]/g, '')
      .trim();

    if (cleaned.length > 0) {
      buffer[activeMeal].push(cleaned);
      currentDayHasContent = true;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const strippedLine = line.replace(/^[\*\-\•]\s*/, '').replace(/^\d+[\.\)]\s*/, '').trim();

    const dayMatch = strippedLine.match(dayHeaderRegex);

    if (dayMatch) {
      pushDay();

      const rawDay = dayMatch[1].toLowerCase();
      const dayName = normalizeDayName(rawDay);

      currentDay = createDay(dayName);
      buffer = {
        Breakfast: [],
        Lunch: [],
        Dinner: [],
        Snack: [],
      };
      activeMeal = null;
      currentDayHasContent = true;

      const remainder = dayMatch[2]?.trim();
      if (remainder) {
        appendMealLine(remainder);
      }

      continue;
    }

    appendMealLine(strippedLine);
  }

  pushDay();

  console.log("TOTAL DAYS FOUND:", days.length);
  console.log(days);

  return days.length ? days : [fallbackDay('Plan', raw)];
}

function normalizeDayName(rawDay: string): string {
  const cleaned = rawDay.trim();
  if (/^day/i.test(cleaned)) {
    return cleaned.replace(/\s+/g, ' ').replace(/^./, char => char.toUpperCase());
  }
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
}

function detectMealType(line: string): MealType | null {
  const match = line.match(/\b(breakfast|lunch|dinner|snacks?)\b/i);
  if (!match) return null;

  const meal = match[1].toLowerCase();
  if (meal.startsWith('snack')) return 'Snack';
  return (meal.charAt(0).toUpperCase() + meal.slice(1)) as MealType;
}

function createDay(name: string): ParsedDay {
  return {
    name,
    summary: '',
    meals: [],
  };
}

function buildDay(name: string, buffer: Record<MealType, string[]>): ParsedDay {
  return {
    name,
    summary: 'AI generated diet plan',
    meals: MEAL_TYPES.map(type => buildMeal(type, buffer[type])),
  };
}

function selectMealImage(type: MealType, text: string): string {
  const candidates = MEAL_IMAGE_LOOKUP[type];
  const normalized = text.toLowerCase();

  for (const candidate of candidates) {
    if (candidate.keywords.some(keyword => normalized.includes(keyword))) {
      return candidate.image;
    }
  }

  return DEFAULT_MEAL_IMAGE[type];
}

function buildMeal(type: MealType, lines: string[]): ParsedMeal {
  const text = lines.join(' ');

  return {
    type,
    title: `${type} Meal`,
    description: text || `Healthy ${type.toLowerCase()} option`,

    // ✅ FIXED MACROS (ROBUST EXTRACTION)
    calories: extract(text, /(\d{2,4})\s*(?:calories?|kcal)/i),
    protein: extract(text, /(\d{1,3})\s*g\s*protein/i),
    carbs: extract(text, /(\d{1,3})\s*g\s*carb/i),
    fat: extract(text, /(\d{1,3})\s*g\s*fat/i),

    image: selectMealImage(type, text),
  };
}

function extract(text: string, regex: RegExp): number | null {
  const match = text.match(regex);
  return match ? Number(match[1]) : null;
}

function fallbackDay(name: string, raw: string): ParsedDay {
  return {
    name,
    summary: raw,
    meals: MEAL_TYPES.map(type => ({
      type,
      title: `${type} Meal`,
      description: 'AI response parsing failed',
      calories: null,
      protein: null,
      carbs: null,
      fat: null,
      image: DEFAULT_MEAL_IMAGE[type],
      fallback: true,
    })),
  };
}