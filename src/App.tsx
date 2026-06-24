import { useEffect, useState, ReactNode } from 'react';
import { BrowserRouter, Link, Route, Routes, Navigate } from 'react-router-dom';
import { FiMoon, FiSun, FiMenu, FiMessageCircle } from 'react-icons/fi';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import {
  AINutritionCoach,
  // FoodAnalyzer is a new page
  BMICalculator,
  CalorieCalculator,
  DashboardOverview,
  DietPlannerPage,
  MacroCalculator,
  ProgressAnalytics,
  ProfileSettings,
  SavedPlans,
  WaterTracker,
  WeightTracker,
} from './components/Pages';
import FoodAnalyzer from './components/FoodAnalyzer';

interface AppLayoutProps {
  children: ReactNode;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

function AppLayout({ children, sidebarOpen, setSidebarOpen, theme, setTheme }: AppLayoutProps) {
  return (
    <>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-[280px]">
        <header
          className={`sticky top-0 z-40 border-b ${
            theme === 'dark'
              ? 'border-white/10 bg-slate-950/95'
              : 'border-slate-200/70 bg-white/90'
          } px-6 py-4 backdrop-blur-xl lg:hidden`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p
                className={`text-sm uppercase tracking-[0.3em] ${
                  theme === 'dark' ? 'text-emerald-300/70' : 'text-slate-500'
                }`}
              >
                NutriVision
              </p>
              <h1
                className={`text-xl font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-slate-950'
                }`}
              >
                Health Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="inline-flex h-12 w-12 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
              >
                {theme === 'dark' ? (
                  <FiSun className="h-5 w-5" />
                ) : (
                  <FiMoon className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={() => setSidebarOpen(true)}
                className="inline-flex h-12 w-12 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
              >
                <FiMenu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="min-h-screen px-6 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      <Link
        to="/ai-coach"
        className="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:scale-105 lg:hidden"
      >
        <FiMessageCircle className="h-6 w-6" />
      </Link>
    </>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const stored = localStorage.getItem('nv_theme');
    return stored === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('nv_theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <div
        className={`min-h-screen ${
          theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-950'
        }`}
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/dashboard"
            element={
              <AppLayout
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                theme={theme}
                setTheme={setTheme}
              >
                <DashboardOverview />
              </AppLayout>
            }
          />
          <Route
            path="/diet-planner"
            element={
              <AppLayout
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                theme={theme}
                setTheme={setTheme}
              >
                <DietPlannerPage />
              </AppLayout>
            }
          />
          <Route
            path="/ai-coach"
            element={
              <AppLayout
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                theme={theme}
                setTheme={setTheme}
              >
                <AINutritionCoach />
              </AppLayout>
            }
          />
          <Route
            path="/food-analyzer"
            element={
              <AppLayout
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                theme={theme}
                setTheme={setTheme}
              >
                <FoodAnalyzer />
              </AppLayout>
            }
          />
          <Route
            path="/bmi"
            element={
              <AppLayout
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                theme={theme}
                setTheme={setTheme}
              >
                <BMICalculator />
              </AppLayout>
            }
          />
          <Route
            path="/weight-tracker"
            element={
              <AppLayout
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                theme={theme}
                setTheme={setTheme}
              >
                <WeightTracker />
              </AppLayout>
            }
          />
          <Route
            path="/calorie-calculator"
            element={
              <AppLayout
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                theme={theme}
                setTheme={setTheme}
              >
                <CalorieCalculator />
              </AppLayout>
            }
          />
          <Route
            path="/water-tracker"
            element={
              <AppLayout
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                theme={theme}
                setTheme={setTheme}
              >
                <WaterTracker />
              </AppLayout>
            }
          />
          <Route
            path="/macro-calculator"
            element={
              <AppLayout
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                theme={theme}
                setTheme={setTheme}
              >
                <MacroCalculator />
              </AppLayout>
            }
          />
          <Route
            path="/saved-plans"
            element={
              <AppLayout
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                theme={theme}
                setTheme={setTheme}
              >
                <SavedPlans />
              </AppLayout>
            }
          />
          <Route
            path="/progress"
            element={
              <AppLayout
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                theme={theme}
                setTheme={setTheme}
              >
                <ProgressAnalytics />
              </AppLayout>
            }
          />
          <Route
            path="/profile-settings"
            element={
              <AppLayout
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                theme={theme}
                setTheme={setTheme}
              >
                <ProfileSettings theme={theme} setTheme={setTheme} />
              </AppLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
