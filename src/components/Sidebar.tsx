import { NavLink } from 'react-router-dom';
import { FiBarChart2, FiChevronRight, FiCpu, FiDroplet, FiHeart, FiPieChart, FiSettings, FiTrendingUp, FiX, FiClock } from 'react-icons/fi';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  activePage?: string;
  onSelect?: (page: string) => void;
}

const menu = [
  { label: 'Dashboard', icon: FiBarChart2, path: '/dashboard' },
  { label: 'AI Diet Generator', icon: FiHeart, path: '/diet-planner' },
  { label: 'AI Nutrition Coach', icon: FiCpu, path: '/ai-coach' },
  { label: 'Food Analyzer', icon: FiClock, path: '/food-analyzer' },
  { label: 'BMI Calculator', icon: FiBarChart2, path: '/bmi' },
  { label: 'Weight Tracker', icon: FiTrendingUp, path: '/weight-tracker' },
  { label: 'Calorie Calculator', icon: FiDroplet, path: '/calorie-calculator' },
  { label: 'Water Intake Tracker', icon: FiDroplet, path: '/water-tracker' },
  { label: 'Macro Calculator', icon: FiPieChart, path: '/macro-calculator' },
  { label: 'Saved Diet Plans', icon: FiClock, path: '/saved-plans' },
  { label: 'Progress Analytics', icon: FiPieChart, path: '/progress' },
  { label: 'Profile Settings', icon: FiSettings, path: '/profile-settings' },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-[280px] border-r border-white/10 bg-slate-950/90 backdrop-blur-xl z-50">
        <div className="flex h-full flex-col justify-between px-6 py-8">
          <div>
            <div className="mb-12 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 shadow-lg shadow-emerald-500/20">
                <FiCpu className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">NutriVision</p>
                <p className="text-[10px] uppercase tracking-[0.32em] text-emerald-300/70">Health Dashboard</p>
              </div>
            </div>
            <nav className="space-y-3">
              {menu.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex w-full items-center gap-3 rounded-[24px] border px-4 py-3 text-left transition ${
                        isActive
                          ? 'border-emerald-400/20 bg-emerald-500/10 text-white shadow-[0_20px_50px_-30px_rgba(16,185,129,0.35)]'
                          : 'border-transparent text-slate-400 hover:border-white/10 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="space-y-4">
            <button className="w-full rounded-[26px] bg-gradient-to-r from-emerald-400 to-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110">
              Upgrade to Pro
            </button>
            <div className="flex items-center justify-between rounded-[26px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
              <div className="text-slate-300">Help</div>
              <FiChevronRight className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between rounded-[26px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
              <div className="text-slate-300">Sign out</div>
              <FiChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </aside>

      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] border-r border-white/10 bg-slate-950/95 p-6 backdrop-blur-xl transition-transform duration-300 lg:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 shadow-lg shadow-emerald-500/20">
              <FiCpu className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">NutriVision</p>
              <p className="text-[10px] uppercase tracking-[0.32em] text-emerald-300/70">Health Dashboard</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 space-y-3">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-[24px] border px-4 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? 'border-emerald-400/20 bg-emerald-500/10 text-white'
                      : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
