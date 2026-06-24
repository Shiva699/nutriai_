import { ReactNode } from 'react';
import { FiMenu } from 'react-icons/fi';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: ReactNode;
  activePage: string;
  onPageChange: (page: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function AppShell({ children, activePage, onPageChange, sidebarOpen, setSidebarOpen }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePage={activePage}
        onSelect={onPageChange}
      />
      <div className="lg:ml-[280px]">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 px-6 py-4 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/70">NutriVision</p>
              <h1 className="text-xl font-semibold text-white">Health Dashboard</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
            >
              <FiMenu className="h-5 w-5" />
            </button>
          </div>
        </header>
        <main className="min-h-screen px-6 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
