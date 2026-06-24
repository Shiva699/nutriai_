import { useState, type SyntheticEvent } from 'react';

const DEFAULT_FOOD_IMAGE = '/assets/meals/snack1.jpg';

interface MealCardProps {
  image: string;
  title: string;
  description: string;
  badge: string;
  calories?: string | number | null;
  protein?: string | number | null;
  carbs?: string | number | null;
  fat?: string | number | null;
  colorIndicator?: string;
  className?: string;
}

function formatStatValue(value?: string | number | null, suffix = '') {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (typeof value === 'number') {
    return suffix ? `${value} ${suffix}` : `${value}`;
  }

  return value;
}

function StatPill({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export function MealCard({
  image,
  title,
  description,
  badge,
  calories,
  protein,
  carbs,
  fat,
  colorIndicator = 'from-emerald-400 to-cyan-400',
  className = '',
}: MealCardProps) {
  const [imgSrc, setImgSrc] = useState(image || DEFAULT_FOOD_IMAGE);

  const handleImageError = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    const target = event.currentTarget;
    if (target.src !== DEFAULT_FOOD_IMAGE) {
      setImgSrc(DEFAULT_FOOD_IMAGE);
    }
  };

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/80 shadow-[0_24px_60px_-42px_rgba(0,0,0,0.85)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_28px_72px_-44px_rgba(16,185,129,0.28)] ${className}`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${colorIndicator}`} />

      <div className="relative h-[260px] overflow-hidden bg-slate-900/60">
        <img
          src={imgSrc}
          alt={title}
          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
        <div className="absolute left-4 top-4 flex max-w-[calc(100%-2rem)] items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-slate-950/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-100 backdrop-blur">
            {badge}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">Meal plan</p>
          <h3 className="mt-2 line-clamp-2 text-xl font-semibold leading-tight text-white">{title}</h3>
        </div>

        <p className="mt-3 min-h-[4.5rem] line-clamp-3 text-sm leading-6 text-slate-400">{description}</p>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-4 sm:grid-cols-4">
          <StatPill label="Calories" value={formatStatValue(calories, 'kcal')} />
          <StatPill label="Protein" value={formatStatValue(protein, 'g')} />
          <StatPill label="Carbs" value={formatStatValue(carbs, 'g')} />
          <StatPill label="Fat" value={formatStatValue(fat, 'g')} />
        </div>
      </div>
    </article>
  );
}
