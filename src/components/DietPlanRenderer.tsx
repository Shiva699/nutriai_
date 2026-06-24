import { useEffect, useMemo, useState } from 'react';
import { FiHeart } from 'react-icons/fi';
import { MealCard } from './MealCard';
import ProgressRing from './ui/ProgressRing';
import { Card } from './ui/Card';
import { MealType, parseDietPlanResponse } from './dietPlanParser';

function cleanDisplayText(text: string) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
    .replace(/^\s*#{1,6}\s*/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/^\s*>\s+/gm, '')
    .replace(/^[-*_]{3,}$/gm, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function formatStatValue(value: number | null, unit = '') {
  if (!value || Number.isNaN(value)) {
    return '-';
  }

  return unit ? `${value} ${unit}` : `${value}`;
}

function mealAccent(type: MealType, fallback?: boolean) {
  if (fallback) {
    return 'from-slate-500 to-slate-400';
  }

  switch (type) {
    case 'Breakfast':
      return 'from-cyan-400 to-sky-300';
    case 'Lunch':
      return 'from-emerald-400 to-teal-300';
    case 'Dinner':
      return 'from-orange-400 to-amber-300';
    case 'Snack':
      return 'from-violet-400 to-fuchsia-300';
  }

  return 'from-slate-500 to-slate-400';
}

function StatCard({
  label,
  value,
  detail,
  ring,
}: {
  label: string;
  value: string;
  detail: string;
  ring?: number;
}) {
  return (
    <Card className="h-full min-h-[124px]">
      <div className="flex h-full items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
          <p className="mt-2 text-sm text-slate-400">{detail}</p>
        </div>
        {typeof ring === 'number' && (
          <div className="shrink-0 w-20">
            <ProgressRing size={72} stroke={8} percentage={ring} />
          </div>
        )}
      </div>
    </Card>
  );
}

export default function DietPlanRenderer({
  plan,
  dietType,
  goal,
  regenerate,
  selectedDayIndex,
}: {
  plan: string;
  dietType?: string;
  goal?: string;
  regenerate?: () => void;
  selectedDayIndex?: number;
}) {
  const days = useMemo(() => parseDietPlanResponse(plan), [plan]);
  const [currentDay, setCurrentDay] = useState(0);

  useEffect(() => {
    setCurrentDay(0);
  }, [plan]);

  useEffect(() => {
    if (typeof selectedDayIndex === 'number') {
      setCurrentDay(selectedDayIndex);
    }
  }, [selectedDayIndex]);

  const activeDay = days[currentDay] ?? days[0];

  const totals = useMemo(() => {
    if (!activeDay) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    return activeDay.meals.reduce(
      (acc, meal) => {
        acc.calories += meal.calories || 0;
        acc.protein += meal.protein || 0;
        acc.carbs += meal.carbs || 0;
        acc.fat += meal.fat || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [activeDay]);

  const recommendation = useMemo(() => {
    const match = cleanDisplayText(plan).match(/(?:increase|decrease|focus|aim to|limit|consider|recommendation|recommend).{1,140}/i);
    return match ? cleanDisplayText(match[0]) : null;
  }, [plan]);

  const hasFallbackMeals = activeDay?.meals.every((meal) => meal.fallback) ?? false;
  const planGoal = goal?.trim() || 'Personal goal';
  const planType = dietType?.trim() || 'Diet';

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/80 shadow-[0_30px_70px_-40px_rgba(5,12,31,0.9)] backdrop-blur-xl">
        <div className="relative min-h-[250px] bg-[url('https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/30" />
          <div className="relative flex min-h-[250px] flex-col justify-between gap-6 p-6 sm:p-8">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.28em] text-emerald-300/70">AI Diet Generator</p>
              <h3 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                Personalized {planType} Plan
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                {planGoal} | {days.length} day plan parsed into structured meal cards.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                Selected day: {activeDay?.name ?? 'Plan'}
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                Breakfast, lunch, dinner, snack
              </div>
              {regenerate && (
                <button
                  onClick={regenerate}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Regenerate
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Calories"
          value={formatStatValue(totals.calories, 'kcal')}
          detail="Selected day total"
          ring={Math.min(100, Math.round((totals.calories / 2200) * 100))}
        />
        <StatCard label="Protein" value={formatStatValue(totals.protein, 'g')} detail="Parsed from the AI response" />
        <StatCard label="Carbs" value={formatStatValue(totals.carbs, 'g')} detail="Parsed from the AI response" />
        <StatCard label="Fat" value={formatStatValue(totals.fat, 'g')} detail="Parsed from the AI response" />
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 sm:p-5">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((day, index) => (
            <button
              key={`${day.name}-${index}`}
              onClick={() => setCurrentDay(index)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                currentDay === index
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-950/70 text-slate-300 hover:bg-slate-900'
              }`}
            >
              {day.name}
            </button>
          ))}
        </div>
      </div>

      {hasFallbackMeals && (
        <Card className="border-amber-400/20 bg-amber-500/10 text-amber-50">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/80">Fallback layout</p>
          <p className="mt-2 text-sm leading-6 text-amber-50/90">
            The AI response did not map cleanly into meal sections, so a structured fallback layout is shown instead.
          </p>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {activeDay?.meals.map((meal, index) => (
          <MealCard
            key={`${activeDay.name}-${meal.type}-${index}`}
            image={meal.image}
            title={meal.title}
            description={meal.description}
            badge={meal.type}
            calories={meal.calories}
            protein={meal.protein}
            carbs={meal.carbs}
            fat={meal.fat}
            colorIndicator={mealAccent(meal.type, meal.fallback)}
          />
        ))}
      </div>

      {recommendation && (
        <Card className="flex items-center gap-4">
          <div className="flex-none">
            <div className="rounded-full bg-emerald-500 p-3 text-slate-950">
              <FiHeart className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-sm uppercase text-slate-400">AI recommendation</p>
            <p className="mt-1 text-white">{recommendation}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
