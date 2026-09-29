import { FiDownload } from 'react-icons/fi';

interface HeaderProps {
  onDownload: () => void;
  loading: boolean;
  disabled: boolean;
  weekRange: string;
}

export function Header({ onDownload, loading, disabled, weekRange }: HeaderProps) {
  return (
    <div className="mb-10 rounded-[32px] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[#0B1638]/80 p-8 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.07)] dark:shadow-[0_30px_80px_-50px_rgba(8,23,52,0.9)] backdrop-blur-xl md:flex md:items-center md:justify-between md:gap-6">
      <div className="max-w-3xl">
        <h1 className="text-5xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-white">Weekly Precision Meal Plan</h1>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{weekRange}</p>
      </div>
      <button
        type="button"
        aria-label={loading ? 'Generating PDF…' : 'Export diet plan to PDF'}
        onClick={onDownload}
        disabled={disabled}
        className="mt-6 inline-flex items-center gap-3 rounded-[26px] border border-slate-200/80 dark:border-cyan-400/20 bg-slate-100 dark:bg-white/5 px-6 py-3 text-sm font-semibold text-slate-700 dark:text-white transition hover:border-cyan-500/40 dark:hover:border-cyan-300/40 hover:bg-cyan-50 dark:hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50 md:mt-0"
      >
        <FiDownload className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
        {loading ? 'Generating PDF…' : 'Export to PDF'}
      </button>
    </div>
  );
}

