const snacks = [
  {
    title: 'Activated Almonds',
    calories: '150 kcal',
    time: 'Mid-Morning',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80',
  },
  {
    title: 'Matcha Protein Shake',
    calories: '220 kcal',
    time: 'Post-Workout',
    image: 'https://images.unsplash.com/photo-1510627498534-cf7e9002facc?auto=format&fit=crop&w=500&q=80',
  },
];

export function SnackCard() {
  return (
    <div className="rounded-[36px] border border-white/10 bg-[#0D163B]/80 p-6 shadow-[0_30px_80px_-70px_rgba(2,17,43,0.9)] backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Daily Snacks</h2>
        <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-400">2 items</span>
      </div>
      <div className="space-y-4">
        {snacks.map((snack) => (
          <div key={snack.title} className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4">
            <img src={snack.image} alt={snack.title} className="h-16 w-16 rounded-3xl object-cover" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{snack.title}</p>
              <p className="mt-1 text-xs text-slate-400">{snack.calories} • {snack.time}</p>
            </div>
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-cyan-400/30 bg-white/5 text-cyan-300">
              ●
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
