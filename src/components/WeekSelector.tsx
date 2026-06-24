import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface WeekSelectorDay {
  day: string;
  date: string;
  active: boolean;
}

interface WeekSelectorProps {
  days: WeekSelectorDay[];
  onSelectDay: (index: number) => void;
  selectedDay: number;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

export function WeekSelector({ days, onSelectDay, selectedDay, onPreviousWeek, onNextWeek }: WeekSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onPreviousWeek}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-cyan-400/10"
        >
          <FiChevronLeft className="h-4 w-4" />
          Previous Week
        </button>
        <button
          type="button"
          onClick={onNextWeek}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-cyan-400/10"
        >
          Next Week
          <FiChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-7 md:gap-4">
        {days.map((item, index) => (
          <button
            type="button"
            key={`${item.day}-${item.date}`}
            onClick={() => onSelectDay(index)}
            className={`rounded-[28px] border px-4 py-4 text-center transition ${
              item.active
                ? 'border-transparent bg-gradient-to-b from-cyan-500/15 via-[#0B173C] to-[#0B1638] shadow-[0_30px_90px_-70px_rgba(41,216,255,0.3)]'
                : 'border-white/10 bg-[#0C1A3A] hover:border-cyan-400/20 hover:bg-white/5'
            }`}
          >
            <div className="text-[11px] uppercase tracking-[0.32em] text-slate-400">{item.day}</div>
            <div
              className={`mt-4 inline-flex h-14 w-14 items-center justify-center rounded-[20px] text-xl font-semibold ${
                item.active
                  ? 'bg-gradient-to-br from-cyan-400 to-violet-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                  : 'bg-white/5 text-white'
              }`}
            >
              {item.date}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
