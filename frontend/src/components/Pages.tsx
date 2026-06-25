import { motion } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';
import { FiBarChart2, FiCheckCircle, FiClock, FiDroplet, FiHeart, FiMessageCircle, FiPieChart, FiTrendingUp } from 'react-icons/fi';
import { Header } from './Header';
import { InsightCard } from './InsightCard';
import { MealCard } from './MealCard';
import { SnackCard } from './SnackCard';
import { WeekSelector } from './WeekSelector';
import { generateDietPlan, askNutritionCoach, analyzeBMI, predictWeightTimeline, calorieRecommendations, hydrationRecommendation, explainMacros, progressSummary, healthScore } from '../services/groq';
import { Card } from './ui/Card';
import ProgressRing from './ui/ProgressRing';
import Gauge from './ui/Gauge';
import Avatar from './ui/Avatar';
import DietPlanRenderer from './DietPlanRenderer';
import { parseDietPlanResponse } from './dietPlanParser';
import { sanitizeAIText } from './aiText';

function getMonday(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day + 6) % 7;
  result.setDate(result.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatMonthDayYear(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatWeekRange(start: Date) {
  const end = addDays(start, 6);
  return `${formatMonthDayYear(start)} - ${formatMonthDayYear(end)}`;
}

function buildWeekDays(start: Date, activeIndex: number) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    return {
      day: date.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase(),
      date: String(date.getDate()),
      active: index === activeIndex,
    };
  });
}

const mealPlans = [
  {
    image: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=900&q=80',
    title: 'Avocado & Egg Power Bowl',
    description: 'A nutrient-dense start with omega-3s and high protein to fuel your morning.',
    badge: 'Energy Boost',
    calories: '366 kcal',
    protein: '24g',
    carbs: '18g',
    fat: '22g',
    colorIndicator: 'from-cyan-400 to-cyan-300',
  },
  {
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
    title: 'Mediterranean Bass & Quinoa',
    description: 'Optimized for afternoon metabolic stability with slow-burning nutrients.',
    badge: 'Light & Lean',
    calories: '348 kcal',
    protein: '32g',
    carbs: '28g',
    fat: '12g',
    colorIndicator: 'from-violet-400 to-violet-300',
  },
  {
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80',
    title: 'Grass-Fed Steak & Kale',
    description: 'High-iron dinner designed to support overnight muscle recovery and balance.',
    badge: 'Recovery',
    calories: '366 kcal',
    protein: '38g',
    carbs: '22g',
    fat: '14g',
    colorIndicator: 'from-orange-400 to-orange-300',
  },
];

export function DashboardOverview() {
  const [aiHealthScore, setAiHealthScore] = useState<string | null>(null);
  const [dailyInsight, setDailyInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Persisted dashboard overview values
  const [dailyCalories, setDailyCalories] = useState<string>(() => localStorage.getItem('nv_daily_calories') || '1,850 kcal');
  const [currentBMI, setCurrentBMI] = useState<string>(() => localStorage.getItem('nv_current_bmi') || '22.8');
  const [currentWeight, setCurrentWeight] = useState<string>(() => localStorage.getItem('nv_current_weight') || '72.4 kg');
  const [waterIntake, setWaterIntake] = useState<string>(() => localStorage.getItem('nv_water_intake') || '1.9 L');
  const [dailyCaloriesDetail, setDailyCaloriesDetail] = useState<string>(() => localStorage.getItem('nv_daily_calories_detail') || '85% of goal');
  const [weightDetail, setWeightDetail] = useState<string>(() => localStorage.getItem('nv_weight_detail') || '+0.3 kg this week');
  const [waterDetail, setWaterDetail] = useState<string>(() => localStorage.getItem('nv_water_detail') || '95% goal');

  // sync to localStorage
  useEffect(() => { localStorage.setItem('nv_daily_calories', dailyCalories); }, [dailyCalories]);
  useEffect(() => { localStorage.setItem('nv_current_bmi', currentBMI); }, [currentBMI]);
  useEffect(() => { localStorage.setItem('nv_current_weight', currentWeight); }, [currentWeight]);
  useEffect(() => { localStorage.setItem('nv_water_intake', waterIntake); }, [waterIntake]);
  useEffect(() => { localStorage.setItem('nv_daily_calories_detail', dailyCaloriesDetail); }, [dailyCaloriesDetail]);
  useEffect(() => { localStorage.setItem('nv_weight_detail', weightDetail); }, [weightDetail]);
  useEffect(() => { localStorage.setItem('nv_water_detail', waterDetail); }, [waterDetail]);

  const loadInsights = async () => {
    setLoadingInsight(true);
    try {
      const score = await healthScore({});
      setAiHealthScore(score);
      const insight = await askNutritionCoach('Provide a one-line daily health insight for the user.');
      setDailyInsight(insight);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-8 shadow-[0_30px_70px_-40px_rgba(5,12,31,0.9)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/70">Dashboard Overview</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Welcome back, health champion.</h1>
          </div>
          <div className="rounded-3xl bg-white/5 px-5 py-4 text-sm text-slate-300 shadow-inner shadow-black/20">
            <p className="font-semibold text-white">Your next check-in</p>
            <p className="mt-1 text-slate-400">Tomorrow at 7:30 AM</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Daily calories',
            value: dailyCalories,
            accent: 'from-emerald-500 to-teal-400',
            icon: FiHeart,
            detail: dailyCaloriesDetail,
          },
          {
            label: 'Current BMI',
            value: currentBMI,
            accent: 'from-cyan-400 to-blue-400',
            icon: FiBarChart2,
            detail: 'Healthy range',
          },
          {
            label: 'Weight',
            value: currentWeight,
            accent: 'from-amber-400 to-orange-400',
            icon: FiCheckCircle,
            detail: weightDetail,
          },
          {
            label: 'Water intake',
            value: waterIntake,
            accent: 'from-sky-400 to-cyan-400',
            icon: FiDroplet,
            detail: waterDetail,
          },
        ].map((card) => (
          <div key={card.label} className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
                <p className="mt-4 text-3xl font-semibold text-white">{card.value}</p>
              </div>
              <div className={`flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br ${card.accent} text-white shadow-lg shadow-slate-950/20`}>
                <card.icon className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-5 text-sm text-slate-400">{card.detail}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">AI Health Score</p>
            <p className="mt-2 text-2xl font-semibold text-white">{loadingInsight ? 'Loading...' : (aiHealthScore ? sanitizeAIText(aiHealthScore) : '-')}</p>
          </div>
          <div>
            <button onClick={loadInsights} className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm text-slate-950">Refresh</button>
          </div>
        </div>
        {dailyInsight && <p className="mt-3 text-sm text-slate-300">{sanitizeAIText(dailyInsight)}</p>}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.75)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/70">Goal completion</p>
              <h2 className="mt-3 text-xl font-semibold text-white">84% completed</h2>
            </div>
            <div className="rounded-3xl bg-white/5 px-4 py-2 text-sm text-slate-300">Today</div>
          </div>
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_20px_rgba(16,185,129,0.35)]" />
          </div>
          <p className="mt-4 text-sm text-slate-400">Your meal, hydration, and activity targets are aligned for a strong recovery day.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.75)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Weekly progress</p>
              <h2 className="mt-3 text-xl font-semibold text-white">+1.6 kg gain</h2>
            </div>
            <FiTrendingUp className="h-6 w-6 text-emerald-300" />
          </div>
          <div className="mt-6 space-y-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
              <div key={day} className="flex items-center justify-between text-sm text-slate-400">
                <span>{day}</span>
                <span>+{(index * 0.3 + 0.4).toFixed(1)} kg</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.75)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Hydration profile</p>
              <h2 className="mt-3 text-xl font-semibold text-white">1.9L / 2.0L</h2>
            </div>
            <FiDroplet className="h-6 w-6 text-cyan-300" />
          </div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[95%] rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 shadow-[0_0_18px_rgba(56,189,248,0.35)]" />
          </div>
          <p className="mt-4 text-sm text-slate-400">Stay on track by adding a glass before your afternoon workout.</p>
        </motion.div>
      </div>
    </div>
  );
}

export function DietPlannerPage() {
  const [age, setAge] = useState<number | undefined>(() => {
    const value = localStorage.getItem('nv_diet_age');
    return value ? Number(value) : 30;
  });
  const [gender, setGender] = useState<'male' | 'female'>(() => {
    const value = localStorage.getItem('nv_diet_gender');
    return value === 'female' ? 'female' : 'male';
  });
  const [height, setHeight] = useState<number | undefined>(() => {
    const value = localStorage.getItem('nv_diet_height');
    return value ? Number(value) : 175;
  });
  const [weight, setWeight] = useState<number | undefined>(() => {
    const value = localStorage.getItem('nv_diet_weight');
    return value ? Number(value) : 72;
  });
  const [goal, setGoal] = useState<string>(() => localStorage.getItem('nv_diet_goal') || 'Maintain weight');
  const [dietType, setDietType] = useState<string>(() => localStorage.getItem('nv_diet_type') || 'Balanced');
  const [plan, setPlan] = useState<string | null>(() => localStorage.getItem('nv_diet_plan'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(() => {
    const today = new Date();
    return ((today.getDay() + 6) % 7);
  });

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const reply = await generateDietPlan({ age, gender, height, weight, goal, dietType });
      setPlan(reply);
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate diet plan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('nv_diet_age', String(age ?? ''));
  }, [age]);

  useEffect(() => {
    localStorage.setItem('nv_diet_gender', gender);
  }, [gender]);

  useEffect(() => {
    localStorage.setItem('nv_diet_height', String(height ?? ''));
  }, [height]);

  useEffect(() => {
    localStorage.setItem('nv_diet_weight', String(weight ?? ''));
  }, [weight]);

  useEffect(() => {
    localStorage.setItem('nv_diet_goal', goal);
  }, [goal]);

  useEffect(() => {
    localStorage.setItem('nv_diet_type', dietType);
  }, [dietType]);

  useEffect(() => {
    if (plan) {
      localStorage.setItem('nv_diet_plan', plan);
    } else {
      localStorage.removeItem('nv_diet_plan');
    }
  }, [plan]);

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = window.setTimeout(() => setToastMessage(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const planAvailable = Boolean(plan && plan.trim().length > 0);
  const weekDays = useMemo(() => buildWeekDays(weekStart, selectedDayIndex), [weekStart, selectedDayIndex]);
  const weekRange = formatWeekRange(weekStart);

  useEffect(() => {
    setSelectedDayIndex((prev) => Math.min(prev, 6));
  }, [weekStart]);

  const previousWeek = () => {
    setWeekStart((current) => addDays(current, -7));
  };

  const nextWeek = () => {
    setWeekStart((current) => addDays(current, 7));
  };

  const getUserName = () => {
    try {
      const raw = localStorage.getItem('nv_user_profile');
      if (!raw) return 'NutriVision User';
      const parsed = JSON.parse(raw);
      return parsed.fullName?.trim() || 'NutriVision User';
    } catch {
      return 'NutriVision User';
    }
  };

  const exportDietPlanPdf = async () => {
    setExportError(null);
    if (!planAvailable) {
      setExportError('No diet plan available to export');
      return;
    }

    setPdfLoading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'pt', format: 'letter' });
      const margin = 40;
      const lineHeight = 18;
      let y = margin;

      const userName = getUserName();
      const planDays = parseDietPlanResponse(plan || '');
      const activeDay = planDays[0] ?? planDays[planDays.length - 1];
      const nutritionTotals = activeDay?.meals.reduce(
        (sum, meal) => ({
          calories: sum.calories + (meal.calories || 0),
          protein: sum.protein + (meal.protein || 0),
          carbs: sum.carbs + (meal.carbs || 0),
          fat: sum.fat + (meal.fat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      doc.setFontSize(18);
      doc.text('NutriVision AI Diet Plan', margin, y);
      y += lineHeight * 2;

      doc.setFontSize(12);
      doc.text('User Information:', margin, y);
      y += lineHeight;
      doc.text(`- Name: ${userName}`, margin + 10, y);
      y += lineHeight;
      doc.text(`- Goal: ${goal}`, margin + 10, y);
      y += lineHeight;
      doc.text(`- Weight: ${weight ?? '-'} kg`, margin + 10, y);
      y += lineHeight;
      doc.text(`- Height: ${height ?? '-'} cm`, margin + 10, y);
      y += lineHeight;
      doc.text(`- Age: ${age ?? '-'}`, margin + 10, y);
      y += lineHeight * 2;

      doc.text('Diet Plan Details:', margin, y);
      y += lineHeight;

      const mealTypes: Array<{ label: string; type: string }> = [
        { label: 'Breakfast', type: 'Breakfast' },
        { label: 'Lunch', type: 'Lunch' },
        { label: 'Dinner', type: 'Dinner' },
        { label: 'Snacks', type: 'Snack' },
      ];

      mealTypes.forEach(({ label, type }) => {
        const meal = activeDay?.meals.find((item) => item.type === type);
        if (!meal) return;

        doc.setFont('helvetica', 'bold');
        doc.text(`- ${label}:`, margin + 10, y);
        y += lineHeight;
        doc.setFont('helvetica', 'normal');
        const descriptionLines = doc.splitTextToSize(meal.description, 520);
        descriptionLines.forEach((line: string) => {
          doc.text(`  ${line}`, margin + 20, y);
          y += lineHeight;
        });
        y += lineHeight / 2;
      });

      y += lineHeight;
      doc.text('Nutrition Summary:', margin, y);
      y += lineHeight;

      doc.text(`- Calories: ${nutritionTotals?.calories || 0} kcal`, margin + 10, y);
      y += lineHeight;
      doc.text(`- Protein: ${nutritionTotals?.protein || 0} g`, margin + 10, y);
      y += lineHeight;
      doc.text(`- Carbs: ${nutritionTotals?.carbs || 0} g`, margin + 10, y);
      y += lineHeight;
      doc.text(`- Fat: ${nutritionTotals?.fat || 0} g`, margin + 10, y);
      y += lineHeight * 2;

      const date = new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      doc.text(`Generated Date: ${date}`, margin, y);
      y += lineHeight;

      doc.save('NutriVision-Diet-Plan.pdf');
      setToastMessage('PDF downloaded successfully');
    } catch (err) {
      console.error(err);
      setExportError('Failed to generate PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Header onDownload={exportDietPlanPdf} loading={pdfLoading} disabled={!planAvailable || pdfLoading} weekRange={weekRange} />
      <WeekSelector
        days={weekDays}
        selectedDay={selectedDayIndex}
        onSelectDay={setSelectedDayIndex}
        onPreviousWeek={previousWeek}
        onNextWeek={nextWeek}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6">
            <h2 className="text-lg font-semibold text-white">AI Diet Generator</h2>
            <p className="mt-2 text-sm text-slate-400">Provide a few details and generate a tailored meal plan.</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="age" className="block text-sm uppercase tracking-[0.3em] text-slate-400">Age</label>
                <input
                  id="age"
                  type="number"
                  min={18}
                  max={80}
                  placeholder="18 - 80"
                  value={age ?? ''}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
                {age !== undefined && (age < 18 || age > 80) && (
                  <p className="text-sm text-rose-400">Please enter an age between 18 and 80.</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="gender" className="block text-sm uppercase tracking-[0.3em] text-slate-400">Gender</label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="height" className="block text-sm uppercase tracking-[0.3em] text-slate-400">Height (cm)</label>
                <input
                  id="height"
                  type="number"
                  min={140}
                  max={220}
                  placeholder="140 - 220"
                  value={height ?? ''}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
                {height !== undefined && (height < 140 || height > 220) && (
                  <p className="text-sm text-rose-400">Height should be between 140 and 220 cm.</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="weight" className="block text-sm uppercase tracking-[0.3em] text-slate-400">Weight (kg)</label>
                <input
                  id="weight"
                  type="number"
                  min={40}
                  max={150}
                  placeholder="40 - 150"
                  value={weight ?? ''}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
                {weight !== undefined && (weight < 40 || weight > 150) && (
                  <p className="text-sm text-rose-400">Weight should be between 40 and 150 kg.</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="goal" className="block text-sm uppercase tracking-[0.3em] text-slate-400">Goal</label>
                <select
                  id="goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                >
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Weight Gain">Weight Gain</option>
                  <option value="Maintain Weight">Maintain Weight</option>
                  <option value="Muscle Gain">Muscle Gain</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="dietType" className="block text-sm uppercase tracking-[0.3em] text-slate-400">Diet Type</label>
                <select
                  id="dietType"
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value)}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                >
                  <option value="Balanced">Balanced</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="High Protein">High Protein</option>
                  <option value="Keto">Keto</option>
                  <option value="Low Carb">Low Carb</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full rounded-3xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {loading ? 'Generating...' : 'Generate AI Diet Plan'}
              </button>
              <div className="space-y-1">
                {error && <div className="text-sm text-rose-400">{error}</div>}
                {exportError && <div className="text-sm text-rose-400">{exportError}</div>}
                {toastMessage && <div className="text-sm text-emerald-300">{toastMessage}</div>}
              </div>
            </div>
          </div>

          {plan && (
            <DietPlanRenderer
              plan={plan}
              dietType={dietType}
              goal={goal}
              regenerate={handleGenerate}
              selectedDayIndex={selectedDayIndex}
            />
          )}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {mealPlans.map((meal) => (
              <MealCard key={meal.title} {...meal} />
            ))}
          </div>
        </div>
        <aside className="space-y-6">
          <InsightCard />
          <SnackCard />
        </aside>
      </div>
    </div>
  );
}

export function AINutritionCoach() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages((m) => [...m, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);
    try {
      const reply = await askNutritionCoach(userText);
      setMessages((m) => [...m, { role: 'assistant', text: reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', text: 'Error: failed to get response.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-8 shadow-[0_30px_70px_-40px_rgba(5,12,31,0.9)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/70">AI Nutrition Coach</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Smart guidance for every meal.</h1>
          </div>
          <div className="rounded-3xl bg-white/5 px-4 py-2 text-sm text-slate-300">Chat</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <InsightCard />
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-4">
            <div className="h-[400px] overflow-auto space-y-3 p-3">
              {messages.length === 0 && <p className="text-sm text-slate-400">Start a conversation with your nutrition coach.</p>}
              {messages.map((m, idx) => (
                <div key={idx} className={`max-w-[80%] ${m.role === 'user' ? 'ml-auto bg-slate-900/80 text-white' : 'bg-slate-950/80 text-slate-200'} rounded-2xl p-3`}> 
                  <div className="text-sm whitespace-pre-wrap break-words">{sanitizeAIText(m.text)}</div>
                </div>
              ))}
              {loading && <div className="text-sm text-slate-400">AI is typing...</div>}
            </div>

            <div className="mt-3 flex gap-3">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about meals, macros, hydration..." className="flex-1 rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white" />
              <button onClick={sendMessage} disabled={loading} className="rounded-3xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BMICalculator() {
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const bmi = useMemo(() => {
    if (!height || !weight) return 0;
    return Number((weight / ((height / 100) ** 2)).toFixed(1));
  }, [height, weight]);

  const { category, recommendation } = useMemo(() => {
    if (bmi < 18.5) {
      return { category: 'Underweight', recommendation: 'Increase nutrient-dense calories and lean protein to reach a healthy range.' };
    }
    if (bmi < 25) {
      return { category: 'Normal weight', recommendation: 'Maintain your balanced routine and support recovery with hydration.' };
    }
    if (bmi < 30) {
      return { category: 'Overweight', recommendation: 'Focus on whole foods, controlled portions, and regular activity.' };
    }
    return { category: 'Obese', recommendation: 'Work with a coach for a personalized plan emphasizing nutrient quality and consistency.' };
  }, [bmi]);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-8 shadow-[0_30px_70px_-40px_rgba(5,12,31,0.9)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">BMI Calculator</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Measure your body mass index.</h1>
          </div>
          <div className="rounded-3xl bg-white/5 px-5 py-3 text-sm text-slate-300">Instant results</div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <label className="text-sm uppercase tracking-[0.3em] text-slate-400">Height (cm)</label>
            <input type="number" value={height} min={100} max={230} onChange={(event) => setHeight(Number(event.target.value))} className="mt-4 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400" />
          </div>
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <label className="text-sm uppercase tracking-[0.3em] text-slate-400">Weight (kg)</label>
            <input type="number" value={weight} min={35} max={180} onChange={(event) => setWeight(Number(event.target.value))} className="mt-4 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400" />
          </div>
          <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">BMI result</p>
            <p className="mt-4 text-5xl font-semibold text-white">{bmi || '0.0'}</p>
            <p className="mt-2 text-lg text-emerald-300">{category}</p>
          </div>
        </div>

        <div className="mt-8 rounded-[32px] border border-white/10 bg-white/5 p-6 text-sm leading-7 text-slate-300">
          <p className="font-semibold text-white">Recommendation</p>
          <p className="mt-3">{recommendation}</p>
          <div className="mt-4 flex gap-3">
            <button onClick={async () => { setAiLoading(true); setAiAnalysis(null); try { const r = await analyzeBMI(height, weight); setAiAnalysis(r); } catch (e) { setAiAnalysis('Failed to get analysis'); } finally { setAiLoading(false); } }} className="rounded-3xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">{aiLoading ? 'Analyzing...' : 'Get AI Analysis'}</button>
          </div>
          {aiAnalysis && (
            <div className="mt-4 rounded-2xl bg-slate-950/80 p-4 text-sm text-slate-300">
              <div className="whitespace-pre-wrap break-words">{sanitizeAIText(aiAnalysis)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function WeightTracker() {
  const [weightHistory, setWeightHistory] = useState<{ date: string; weight: number }[]>(() => {
    try {
      const raw = localStorage.getItem('nv_weight_history');
      return raw ? JSON.parse(raw) : [
        { date: 'Jun 16', weight: 71.8 },
        { date: 'Jun 18', weight: 72.0 },
        { date: 'Jun 20', weight: 72.1 },
        { date: 'Jun 22', weight: 72.4 },
      ];
    } catch (e) {
      return [
        { date: 'Jun 16', weight: 71.8 },
        { date: 'Jun 18', weight: 72.0 },
        { date: 'Jun 20', weight: 72.1 },
        { date: 'Jun 22', weight: 72.4 },
      ];
    }
  });
  const [entry, setEntry] = useState(() => localStorage.getItem('nv_current_weight_entry') || '');
  const [goalWeight, setGoalWeight] = useState<number | undefined>(() => {
    const s = localStorage.getItem('nv_goal_weight');
    return s ? Number(s) : 68;
  });
  const [userHeight, setUserHeight] = useState<number>(() => {
    const s = localStorage.getItem('nv_user_height');
    return s ? Number(s) : 170;
  });
  const [prediction, setPrediction] = useState<string | null>(null);

  // Calculate weekly progress from actual weightHistory
  const weeklyChangeNum = weightHistory.length >= 2 
    ? weightHistory[0].weight - weightHistory[weightHistory.length - 1].weight
    : 0;
  const weeklyChange = weeklyChangeNum.toFixed(1);

  // Calculate BMI from latest weight
  const currentWeight = weightHistory.length > 0 ? weightHistory[0].weight : 72.4;
  const currentBMI = (currentWeight / ((userHeight / 100) ** 2)).toFixed(1);
  const [predLoading, setPredLoading] = useState(false);

  const handleAdd = () => {
    if (!entry) return;
    const updated = [{ date: 'Today', weight: Number(entry) }, ...weightHistory].slice(0, 7);
    setWeightHistory(updated);
    localStorage.setItem('nv_weight_history', JSON.stringify(updated));
    localStorage.setItem('nv_current_weight', `${Number(entry)} kg`);
    localStorage.setItem('nv_weight_detail', `${(Number(entry) - (weightHistory[0]?.weight ?? Number(entry))).toFixed(1)} kg change`);
    const newBMI = (Number(entry) / ((userHeight / 100) ** 2)).toFixed(1);
    localStorage.setItem('nv_current_bmi', newBMI);
    setEntry('');
    localStorage.removeItem('nv_current_weight_entry');
  };

  // ensure localStorage kept in sync when history changes elsewhere
  useEffect(() => {
    localStorage.setItem('nv_weight_history', JSON.stringify(weightHistory));
    if (weightHistory.length > 0) {
      localStorage.setItem('nv_current_weight', `${weightHistory[0].weight} kg`);
    }
  }, [weightHistory]);

  useEffect(() => { if (entry) localStorage.setItem('nv_current_weight_entry', entry); else localStorage.removeItem('nv_current_weight_entry'); }, [entry]);
  useEffect(() => { if (goalWeight) localStorage.setItem('nv_goal_weight', String(goalWeight)); }, [goalWeight]);
  useEffect(() => { localStorage.setItem('nv_user_height', String(userHeight)); }, [userHeight]);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-8 shadow-[0_30px_70px_-40px_rgba(5,12,31,0.9)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Weight Tracker</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Log progress with confidence.</h1>
          </div>
          <button onClick={handleAdd} className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
            Add current weight
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Weekly progress</p>
                <p className="mt-3 text-3xl font-semibold text-white">{weeklyChangeNum >= 0 ? '+' : ''}{weeklyChange} kg</p>
              </div>
              <FiTrendingUp className="h-6 w-6 text-cyan-300" />
            </div>
            <div className="mt-8 space-y-3">
              {weightHistory.map((item) => (
                <div key={item.date} className="flex items-center justify-between text-sm text-slate-300">
                  <span>{item.date}</span>
                  <span>{item.weight.toFixed(1)} kg</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Log weight</p>
            <div className="mt-5 flex gap-3">
              <input type="number" value={entry} placeholder="72.4" onChange={(event) => setEntry(event.target.value)} className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400" />
            </div>
            <button onClick={handleAdd} className="mt-4 w-full rounded-3xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
              Save weight
            </button>
            <div className="mt-4">
              <label className="block text-sm uppercase tracking-[0.3em] text-slate-400">Goal weight (kg)</label>
              <div className="mt-2 flex gap-2">
                <input type="number" value={goalWeight ?? ''} onChange={(e) => setGoalWeight(Number(e.target.value))} className="rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-2 text-white" />
                <button onClick={async () => { if (!goalWeight) return; setPredLoading(true); setPrediction(null); try { const r = await predictWeightTimeline(Number(weightHistory[0]?.weight ?? entry), goalWeight); setPrediction(r); } catch (e) { setPrediction('Prediction failed'); } finally { setPredLoading(false); } }} className="rounded-3xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950">{predLoading ? 'Predicting...' : 'AI Prediction'}</button>
              </div>
              {prediction && <div className="mt-3 rounded-2xl bg-white/5 p-3 text-sm text-slate-300"><div className="whitespace-pre-wrap break-words">{sanitizeAIText(prediction)}</div></div>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Monthly progress</p>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs uppercase text-emerald-300">Stable</span>
          </div>
          <div className="mt-6 space-y-4">
            {(weightHistory.length > 0 ? weightHistory.slice().reverse() : [{ date: 'Week 1', weight: 72.4 }]).slice(0, 5).map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>{item.date || `Week ${index + 1}`}</span>
                  <span>{item.weight.toFixed(1)} kg</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className={`h-full rounded-full ${index % 2 === 0 ? 'bg-emerald-400' : 'bg-cyan-400'}`} style={{ width: `${Math.min(100, 60 + (item.weight / 80) * 50)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Weekly progress</p>
          <div className="mt-6 grid gap-3">
            {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const).map((day, index) => {
              const dayIndex = Math.min(index, weightHistory.length - 1);
              const dayWeight = dayIndex >= 0 && weightHistory.length > dayIndex ? weightHistory[dayIndex].weight : (71.5 + index * 0.12);
              return (
              <div key={day} className="flex items-center gap-3">
                <span className="w-10 text-sm text-slate-400">{day}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.min(100, 50 + (dayWeight / 80) * 50)}%` }} />
                </div>
                <span className="w-12 text-right text-sm text-slate-300">{dayWeight.toFixed(1)}</span>
              </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CalorieCalculator() {
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(72);
  const [activity, setActivity] = useState(1.55);

  const [aiRecs, setAiRecs] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const bmr = useMemo(() => {
    const base = gender === 'male'
      ? 88.36 + 13.4 * weight + 4.8 * height - 5.7 * age
      : 447.6 + 9.2 * weight + 3.1 * height - 4.3 * age;
    return Math.round(base);
  }, [age, gender, height, weight]);

  const maintenance = Math.round(bmr * activity);
  const loss = maintenance - 450;
  const gain = maintenance + 350;

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-8 shadow-[0_30px_70px_-40px_rgba(5,12,31,0.9)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">Calorie Calculator</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Fuel your goals with precision.</h1>
          </div>
          <div className="rounded-3xl bg-white/5 px-5 py-3 text-sm text-slate-300">Metabolic estimates</div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 space-y-4">
            <label className="block text-sm uppercase tracking-[0.3em] text-slate-400">Age</label>
            <input type="number" min={16} max={80} value={age} onChange={(event) => setAge(Number(event.target.value))} className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400" />

            <label className="block text-sm uppercase tracking-[0.3em] text-slate-400">Gender</label>
            <div className="grid grid-cols-2 gap-3">
              {['male', 'female'].map((item) => (
                <button key={item} type="button" onClick={() => setGender(item as 'male' | 'female')} className={`rounded-3xl border px-4 py-3 text-sm font-semibold transition ${gender === item ? 'border-cyan-400 bg-cyan-500/10 text-white' : 'border-white/10 bg-slate-950/90 text-slate-300'}`}>
                  {item}
                </button>
              ))}
            </div>

            <label className="block text-sm uppercase tracking-[0.3em] text-slate-400">Activity level</label>
            <select value={activity} onChange={(event) => setActivity(Number(event.target.value))} className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400">
              <option value={1.2}>Sedentary</option>
              <option value={1.375}>Light active</option>
              <option value={1.55}>Moderate active</option>
              <option value={1.725}>Very active</option>
            </select>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 space-y-4">
            <label className="block text-sm uppercase tracking-[0.3em] text-slate-400">Height (cm)</label>
            <input type="number" min={140} max={210} value={height} onChange={(event) => setHeight(Number(event.target.value))} className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400" />

            <label className="block text-sm uppercase tracking-[0.3em] text-slate-400">Weight (kg)</label>
            <input type="number" min={45} max={140} value={weight} onChange={(event) => setWeight(Number(event.target.value))} className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400" />
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'BMR', value: `${bmr} kcal`, accent: 'bg-cyan-500/10 text-cyan-200' },
            { label: 'Maintenance', value: `${maintenance} kcal`, accent: 'bg-emerald-500/10 text-emerald-200' },
            { label: 'Weight loss', value: `${loss} kcal`, accent: 'bg-amber-500/10 text-amber-200' },
            { label: 'Weight gain', value: `${gain} kcal`, accent: 'bg-fuchsia-500/10 text-fuchsia-200' },
          ].map((item) => (
            <div key={item.label} className="rounded-[28px] border border-white/10 bg-slate-950/80 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
              <p className={`mt-4 text-3xl font-semibold ${item.accent}`}>{item.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <button onClick={async () => { setAiLoading(true); setAiRecs(null); try { const r = await calorieRecommendations({ age, gender, height, weight, activity }); setAiRecs(r); } catch (e) { setAiRecs('Failed to fetch recommendations'); } finally { setAiLoading(false); } }} className="rounded-3xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950">{aiLoading ? 'Loading...' : 'Get AI Recommendations'}</button>
          {aiRecs && <div className="mt-4 rounded-2xl bg-white/5 p-4 text-sm text-slate-300"><div className="whitespace-pre-wrap break-words">{sanitizeAIText(aiRecs)}</div></div>}
        </div>
      </div>
    </div>
  );
}

export function WaterTracker() {
  const [goal, setGoal] = useState<number>(() => {
    const s = localStorage.getItem('nv_water_goal');
    return s ? Number(s) : 2000;
  });
  const [consumed, setConsumed] = useState<number>(() => {
    const s = localStorage.getItem('nv_water_consumed');
    return s ? Number(s) : 0;
  });
  const [history, setHistory] = useState<{ label: string; amount: number }[]>(() => {
    try {
      const raw = localStorage.getItem('nv_water_history');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const progress = Math.min(100, Math.round((consumed / goal) * 100));

  const addGlass = () => {
    const nextConsumed = Math.min(goal, consumed + 250);
    setConsumed(nextConsumed);
    const nextHistory = [{ label: 'Added', amount: 250 }, ...history].slice(0, 6);
    setHistory(nextHistory);
    localStorage.setItem('nv_water_consumed', String(nextConsumed));
    localStorage.setItem('nv_water_history', JSON.stringify(nextHistory));
    localStorage.setItem('nv_water_intake', `${(nextConsumed/1000).toFixed(1)} L`);
    localStorage.setItem('nv_water_detail', `${Math.round((nextConsumed/goal)*100)}% goal`);
  };

  const resetIntake = () => {
    setConsumed(0);
    setHistory([]);
    localStorage.setItem('nv_water_consumed', '0');
    localStorage.setItem('nv_water_history', JSON.stringify([]));
    localStorage.setItem('nv_water_intake', '0.0 L');
    localStorage.setItem('nv_water_detail', '0% goal');
  };
  const [hydrationAdvice, setHydrationAdvice] = useState<string | null>(null);
  const [hydrationLoading, setHydrationLoading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-8 shadow-[0_30px_70px_-40px_rgba(5,12,31,0.9)] backdrop-blur-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-300/70">Water Intake Tracker</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Hit your hydration goal.</h1>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button onClick={addGlass} className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
              Add 250ml
            </button>
            <button onClick={resetIntake} className="inline-flex items-center justify-center rounded-full bg-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-600">
              Reset
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-[32px] border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Daily goal</p>
              <p className="mt-2 text-3xl font-semibold text-white">{goal} ml</p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 px-4 py-3 text-sm text-slate-300">{progress}%</div>
          </div>
          <div className="mt-6 h-4 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 shadow-[0_0_20px_rgba(56,189,248,0.35)]" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-4 text-sm text-slate-400">{consumed} ml consumed so far. Keep it steady to maintain focus and recovery.</p>
        </div>
      </div>

      <div className="mt-4">
        <button onClick={async () => { setHydrationLoading(true); setHydrationAdvice(null); try { const r = await hydrationRecommendation(goal, consumed); setHydrationAdvice(r); } catch (e) { setHydrationAdvice('Failed to get advice'); } finally { setHydrationLoading(false); } }} className="rounded-3xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">{hydrationLoading ? 'Loading...' : 'AI Hydration Tip'}</button>
        {hydrationAdvice && <div className="mt-3 rounded-2xl bg-white/5 p-3 text-sm text-slate-300"><div className="whitespace-pre-wrap break-words">{sanitizeAIText(hydrationAdvice)}</div></div>}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Daily tracking history</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-300">
            {history.map((item, index) => (
              <div key={index} className="flex items-center justify-between rounded-3xl bg-slate-950/80 px-4 py-3">
                <span>{item.label}</span>
                <span>{item.amount} ml</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6">
          <h2 className="text-lg font-semibold text-white">Progress indicators</h2>
          <div className="mt-5 space-y-4 text-sm text-slate-300">
            {(() => {
              const morningGoal = 500;
              const preMealGoal = 400;
              const eveningGoal = 500;
              const morningAmt = Math.min(consumed, morningGoal);
              const preMealAmt = Math.max(0, Math.min(consumed - morningGoal, preMealGoal));
              const eveningAmt = Math.max(0, consumed - morningGoal - preMealGoal);
              const morningPct = Math.round((morningAmt / morningGoal) * 100);
              const preMealPct = Math.round((preMealAmt / preMealGoal) * 100);
              const eveningPct = Math.round((eveningAmt / eveningGoal) * 100);
              return [
                { label: 'Morning hydration', value: morningPct },
                { label: 'Pre-meal water', value: preMealPct },
                { label: 'Evening water', value: eveningPct },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-cyan-400" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MacroCalculator() {
  const [calories, setCalories] = useState(1850);
  const protein = Math.round((calories * 0.3) / 4);
  const carbs = Math.round((calories * 0.4) / 4);
  const fat = Math.round((calories * 0.3) / 9);
  const [macroExplanation, setMacroExplanation] = useState<string | null>(null);
  const [macroLoading, setMacroLoading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-8 shadow-[0_30px_70px_-40px_rgba(5,12,31,0.9)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">Macro Calculator</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Balance protein, carbs, and fat.</h1>
          </div>
          <div className="rounded-3xl bg-white/5 px-5 py-3 text-sm text-slate-300">Recommended targets</div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <label className="block text-sm uppercase tracking-[0.3em] text-slate-400">Daily calories</label>
            <input type="number" min={1200} max={3500} value={calories} onChange={(event) => setCalories(Number(event.target.value))} className="mt-4 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-cyan-400" />
          </div>
          <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Macro split</p>
            <div className="mt-5 space-y-4">
              {[
                { label: 'Protein', value: `${protein} g`, detail: '30%' },
                { label: 'Carbohydrates', value: `${carbs} g`, detail: '40%' },
                { label: 'Fats', value: `${fat} g`, detail: '30%' },
              ].map((macro) => (
                <div key={macro.label} className="rounded-3xl bg-white/5 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>{macro.label}</span>
                    <span>{macro.detail}</span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-white">{macro.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button onClick={async () => { setMacroLoading(true); setMacroExplanation(null); try { const r = await explainMacros(calories); setMacroExplanation(r); } catch (e) { setMacroExplanation('Failed to fetch explanation'); } finally { setMacroLoading(false); } }} className="rounded-3xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">{macroLoading ? 'Loading...' : 'Explain macros (AI)'}</button>
              {macroExplanation && <div className="mt-3 rounded-2xl bg-white/5 p-3 text-sm text-slate-300"><div className="whitespace-pre-wrap break-words">{sanitizeAIText(macroExplanation)}</div></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProgressAnalytics() {
  // load or derive trends
  const [weightTrend, setWeightTrend] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem('nv_weight_trend');
      if (raw) return JSON.parse(raw);
      const hist = JSON.parse(localStorage.getItem('nv_weight_history') || '[]');
      return (hist || []).slice(0, 6).map((h: any) => h.weight).reverse();
    } catch (e) {
      return [72.4, 72.1, 71.8, 71.7, 71.5, 71.4];
    }
  });

  const [bmiTrend, setBmiTrend] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem('nv_bmi_trend');
      if (raw) return JSON.parse(raw);
      // derive from weightTrend if possible (assume height stored)
      const height = Number(localStorage.getItem('nv_user_height') || 170);
      return weightTrend.map((w) => Number((w / ((height / 100) ** 2)).toFixed(1)));
    } catch (e) {
      return [23.2, 23.0, 22.8, 22.7, 22.6, 22.5];
    }
  });

  const [calorieTrend, setCalorieTrend] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem('nv_calorie_trend');
      return raw ? JSON.parse(raw) : [1900, 1850, 1800, 1880, 1840, 1820];
    } catch (e) {
      return [1900, 1850, 1800, 1880, 1840, 1820];
    }
  });

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // keep derived trends in sync when weightHistory changes elsewhere
  useEffect(() => {
    try {
      const hist = JSON.parse(localStorage.getItem('nv_weight_history') || '[]');
      if (hist && hist.length) {
        const derived = (hist || []).slice(0, 6).map((h: any) => h.weight).reverse();
        setWeightTrend(derived);
        localStorage.setItem('nv_weight_trend', JSON.stringify(derived));
        const height = Number(localStorage.getItem('nv_user_height') || 170);
        setBmiTrend(derived.map((w: number) => Number((w / ((height / 100) ** 2)).toFixed(1))));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-8 shadow-[0_30px_70px_-40px_rgba(5,12,31,0.9)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">Progress Analytics</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">See trends at a glance.</h1>
          </div>
          <div className="rounded-3xl bg-white/5 px-5 py-3 text-sm text-slate-300">Performance dashboard</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Weight trend</p>
              <p className="mt-3 text-xl font-semibold text-white">Stable progress</p>
            </div>
            <FiBarChart2 className="h-6 w-6 text-emerald-300" />
          </div>
          <div className="mt-8 space-y-4">
            {weightTrend.map((value, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>{`Day ${index + 1}`}</span>
                  <span>{value.toFixed(1)} kg</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${70 + index * 5}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">BMI trend</p>
              <p className="mt-3 text-xl font-semibold text-white">Healthy range</p>
            </div>
            <FiPieChart className="h-6 w-6 text-cyan-300" />
          </div>
          <div className="mt-8 space-y-4">
            {bmiTrend.map((value, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>{`Week ${index + 1}`}</span>
                  <span>{value.toFixed(1)}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-cyan-400" style={{ width: `${70 + index * 3}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Calorie trend</p>
              <p className="mt-3 text-xl font-semibold text-white">Energy balance</p>
            </div>
            <FiTrendingUp className="h-6 w-6 text-emerald-300" />
          </div>
          <div className="mt-8 space-y-4">
            {calorieTrend.map((value, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>{`Day ${index + 1}`}</span>
                  <span>{value} kcal</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${60 + index * 6}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 text-slate-300">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Goal completion</p>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            {/* compute goal completion dynamically from hydration and weight */}
            {(() => {
              const consumed = Number(localStorage.getItem('nv_water_consumed') || 0);
              const goal = Number(localStorage.getItem('nv_water_goal') || 2000);
              const hydrationPct = goal ? Math.round((consumed / goal) * 100) : 0;
              const currentWeightStr = localStorage.getItem('nv_current_weight') || '';
              const currentWeight = Number((currentWeightStr.match(/\d+\.?\d*/)?.[0]) || 0);
              const goalWeight = Number(localStorage.getItem('nv_goal_weight') || currentWeight);
              let weightScore = 50;
              if (goalWeight && currentWeight) {
                const diff = Math.abs(currentWeight - goalWeight);
                weightScore = Math.max(0, Math.round(100 - (diff / Math.max(goalWeight, 1)) * 100));
              }
              const completion = Math.round((hydrationPct + weightScore) / 2);
              return (
                <>
                  <p className="text-3xl font-semibold text-white">{completion}%</p>
                  <p className="mt-2 text-sm text-slate-400">Across weight, hydration, and nutrient targets.</p>
                </>
              );
            })()}
          </div>
          <div className="h-20 w-20 rounded-full bg-slate-950/80 p-4">
            <div className="relative h-full w-full rounded-full bg-white/5">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-400/50" />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button onClick={async () => { setAiLoading(true); setAiSummary(null); try { const r = await progressSummary({ weightTrend, bmiTrend, calorieTrend }); setAiSummary(r); } catch (e) { setAiSummary('Failed to fetch summary'); } finally { setAiLoading(false); } }} className="rounded-3xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">{aiLoading ? 'Loading...' : 'AI Progress Summary'}</button>
          {aiSummary && <div className="mt-3 rounded-2xl bg-slate-950/80 p-3 text-sm text-slate-300"><div className="whitespace-pre-wrap break-words">{sanitizeAIText(aiSummary)}</div></div>}
        </div>
      </div>
    </div>
  );
}

export function SavedPlans() {
  const [saved, setSaved] = useState(() => {
    try {
      const raw = localStorage.getItem('nv_saved_plans');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    goal: 'Weight Loss',
    calories: 1800,
    protein: 150,
    carbs: 200,
    fat: 60,
    notes: '',
  });

  const openNewPlan = () => {
    setEditingId(null);
    setFormData({ name: '', goal: 'Weight Loss', calories: 1800, protein: 150, carbs: 200, fat: 60, notes: '' });
    setShowModal(true);
  };

  const openEditPlan = (plan: any) => {
    setEditingId(plan.id);
    setFormData({ name: plan.name, goal: plan.goal, calories: plan.calories, protein: plan.protein, carbs: plan.carbs, fat: plan.fat, notes: plan.notes || '' });
    setShowModal(true);
  };

  const savePlan = () => {
    if (!formData.name.trim()) { alert('Plan name is required'); return; }
    if (editingId) {
      const updated = saved.map((p: any) => p.id === editingId ? { ...p, ...formData, updatedAt: new Date().toISOString() } : p);
      setSaved(updated);
      localStorage.setItem('nv_saved_plans', JSON.stringify(updated));
    } else {
      const newPlan = { id: Date.now().toString(), ...formData, createdAt: new Date().toISOString() };
      const next = [newPlan, ...saved];
      setSaved(next);
      localStorage.setItem('nv_saved_plans', JSON.stringify(next));
    }
    setShowModal(false);
  };

  const deletePlan = (id: string) => {
    if (confirm('Delete this plan?')) {
      const updated = saved.filter((p: any) => p.id !== id);
      setSaved(updated);
      localStorage.setItem('nv_saved_plans', JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-8 shadow-[0_30px_70px_-40px_rgba(5,12,31,0.9)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">Saved Diet Plans</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Your best routines saved.</h1>
          </div>
          <button onClick={openNewPlan} className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">Create new plan</button>
        </div>
      </div>

      {saved.length === 0 ? (
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-lg text-slate-300">No diet plans created yet.</p>
          <button onClick={openNewPlan} className="mt-6 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">Create First Plan</button>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          {saved.map((plan: any) => (
            <div key={plan.id} className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.75)] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{plan.goal}</p>
                  <h2 className="mt-3 text-xl font-semibold text-white">{plan.name}</h2>
                </div>
                <FiClock className="h-5 w-5 text-cyan-300" />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">{plan.calories} kcal/day</p>
              {plan.notes && <p className="mt-2 text-xs text-slate-400">{plan.notes}</p>}
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <span className="rounded-2xl bg-slate-950/70 px-3 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">{plan.protein} P</span>
                <span className="rounded-2xl bg-slate-950/70 px-3 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">{plan.carbs} C</span>
                <span className="rounded-2xl bg-slate-950/70 px-3 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">{plan.fat} F</span>
              </div>
              <div className="mt-6 flex gap-2">
                <button onClick={() => openEditPlan(plan)} className="flex-1 rounded-2xl bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-600">Edit</button>
                <button onClick={() => deletePlan(plan.id)} className="flex-1 rounded-2xl bg-rose-900/50 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-900">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur">
          <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-slate-950 p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold text-white">{editingId ? 'Edit Plan' : 'Create New Plan'}</h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm uppercase tracking-[0.3em] text-slate-400">Plan Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., High Protein Bulking" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-2 text-white outline-none focus:border-cyan-400" />
              </div>
              <div>
                <label className="block text-sm uppercase tracking-[0.3em] text-slate-400">Goal</label>
                <select value={formData.goal} onChange={(e) => setFormData({ ...formData, goal: e.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-2 text-white outline-none focus:border-cyan-400">
                  <option>Weight Loss</option>
                  <option>Weight Gain</option>
                  <option>Maintenance</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-[0.3em] text-slate-400">Calories</label>
                  <input type="number" value={formData.calories} onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 text-white text-sm outline-none focus:border-cyan-400" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.3em] text-slate-400">Protein (g)</label>
                  <input type="number" value={formData.protein} onChange={(e) => setFormData({ ...formData, protein: Number(e.target.value) })} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 text-white text-sm outline-none focus:border-cyan-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-[0.3em] text-slate-400">Carbs (g)</label>
                  <input type="number" value={formData.carbs} onChange={(e) => setFormData({ ...formData, carbs: Number(e.target.value) })} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 text-white text-sm outline-none focus:border-cyan-400" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.3em] text-slate-400">Fat (g)</label>
                  <input type="number" value={formData.fat} onChange={(e) => setFormData({ ...formData, fat: Number(e.target.value) })} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 text-white text-sm outline-none focus:border-cyan-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm uppercase tracking-[0.3em] text-slate-400">Notes (optional)</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Add notes..." className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-2 text-white text-sm outline-none focus:border-cyan-400" rows={3} />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-full bg-slate-700 px-4 py-2 font-semibold text-slate-300 transition hover:bg-slate-600">Cancel</button>
              <button onClick={savePlan} className="flex-1 rounded-full bg-cyan-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400">Save Plan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface UserProfile {
  fullName: string;
  email: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  fitnessGoal: string;
}

interface UserPreferences {
  weeklyReminders: boolean;
  aiCoachSuggestions: boolean;
}

interface ProfileSettingsProps {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

const defaultProfile: UserProfile = {
  fullName: 'Jamie Morgan',
  email: 'jamie@nutriai.com',
  age: '30',
  gender: 'Female',
  height: '170',
  weight: '72',
  fitnessGoal: 'Maintain energy and lean muscle',
};

const defaultPreferences: UserPreferences = {
  weeklyReminders: true,
  aiCoachSuggestions: true,
};

export function ProfileSettings({ theme, setTheme }: ProfileSettingsProps) {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const raw = localStorage.getItem('nv_user_profile');
    if (!raw) return defaultProfile;
    try {
      return { ...defaultProfile, ...JSON.parse(raw) };
    } catch {
      return defaultProfile;
    }
  });

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const raw = localStorage.getItem('nv_user_preferences');
    if (!raw) return defaultPreferences;
    try {
      return { ...defaultPreferences, ...JSON.parse(raw) };
    } catch {
      return defaultPreferences;
    }
  });

  const [savedMessage, setSavedMessage] = useState('');

  const saveSettings = () => {
    localStorage.setItem('nv_user_profile', JSON.stringify(profile));
    localStorage.setItem('nv_user_preferences', JSON.stringify(preferences));
    setSavedMessage('Profile settings saved successfully.');
    window.setTimeout(() => setSavedMessage(''), 3000);
  };

  const togglePreference = (key: keyof UserPreferences) => {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-8 shadow-[0_30px_70px_-40px_rgba(5,12,31,0.9)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/70">Profile Settings</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Manage your account and preferences.</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Keep your personal details up to date and control the way NutriVision supports your daily routine.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </button>
            <button
              type="button"
              onClick={saveSettings}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Save changes
            </button>
          </div>
        </div>
        {savedMessage && (
          <div className="mt-6 rounded-3xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {savedMessage}
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Account info</h2>
          <div className="mt-6 grid gap-4">
            <label className="block text-sm text-slate-300">
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Full name</span>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </label>

            <label className="block text-sm text-slate-300">
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Email address</span>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-300">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Age</span>
                <input
                  type="number"
                  min={13}
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
              </label>
              <label className="block text-sm text-slate-300">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Gender</span>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Non-binary</option>
                  <option>Prefer not to say</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-300">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Height (cm)</span>
                <input
                  type="number"
                  min={120}
                  value={profile.height}
                  onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
              </label>
              <label className="block text-sm text-slate-300">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Weight (kg)</span>
                <input
                  type="number"
                  min={30}
                  value={profile.weight}
                  onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
              </label>
            </div>

            <label className="block text-sm text-slate-300">
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Fitness goal</span>
              <input
                type="text"
                value={profile.fitnessGoal}
                onChange={(e) => setProfile({ ...profile, fitnessGoal: e.target.value })}
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </label>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6">
          <h2 className="text-lg font-semibold text-white">Preferences</h2>
          <div className="mt-6 space-y-4 text-sm text-slate-300">
            <div className="rounded-3xl bg-white/5 px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">Weekly reminder emails</p>
                  <p className="mt-1 text-slate-400">Receive a progress summary and tips every week.</p>
                </div>
                <button
                  type="button"
                  onClick={() => togglePreference('weeklyReminders')}
                  className={`h-11 w-20 rounded-full p-1 transition ${preferences.weeklyReminders ? 'bg-emerald-500/20' : 'bg-slate-800'}`}
                >
                  <span
                    className={`block h-9 w-9 rounded-full bg-white shadow transition ${preferences.weeklyReminders ? 'translate-x-11' : 'translate-x-0'}`}
                  />
                </button>
              </div>
            </div>
            <div className="rounded-3xl bg-white/5 px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">AI coach suggestions</p>
                  <p className="mt-1 text-slate-400">Enable custom prompts and feedback from your AI coach.</p>
                </div>
                <button
                  type="button"
                  onClick={() => togglePreference('aiCoachSuggestions')}
                  className={`h-11 w-20 rounded-full p-1 transition ${preferences.aiCoachSuggestions ? 'bg-emerald-500/20' : 'bg-slate-800'}`}
                >
                  <span
                    className={`block h-9 w-9 rounded-full bg-white shadow transition ${preferences.aiCoachSuggestions ? 'translate-x-11' : 'translate-x-0'}`}
                  />
                </button>
              </div>
            </div>
            <div className="rounded-3xl bg-white/5 px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">Dark mode</p>
                  <p className="mt-1 text-slate-400">Toggle the app theme instantly.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={`h-11 w-20 rounded-full p-1 transition ${theme === 'dark' ? 'bg-emerald-500/20' : 'bg-slate-800'}`}
                >
                  <span
                    className={`block h-9 w-9 rounded-full bg-white shadow transition ${theme === 'dark' ? 'translate-x-11' : 'translate-x-0'}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
