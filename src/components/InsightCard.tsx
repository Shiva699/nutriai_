export function InsightCard() {
  return (
    <div className="rounded-[36px] border border-white/10 bg-gradient-to-b from-[#232d63] to-[#0A132E] p-6 shadow-[0_30px_80px_-70px_rgba(35,44,99,0.9)] backdrop-blur-xl">
      <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/70">AI Chef Insight</p>
      <h2 className="mt-4 text-2xl font-semibold text-white">Precision Analysis</h2>
      <p className="mt-4 text-sm leading-7 text-slate-300">
        “Based on your 18% reduction in resting heart rate this week, I’ve adjusted today’s plan to focus on anti-inflammatory proteins.”
      </p>
      <p className="mt-4 text-sm leading-7 text-slate-300">
        “The Quinoa at lunch provides the necessary amino acid profile to support your high-intensity workout scheduled for 4:00 PM. I’ve specifically limited saturated fats in the evening to optimize your deep sleep latency.”
      </p>
      <div className="mt-7 rounded-3xl bg-white/5 p-5">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Goal Alignment</span>
          <span className="text-white">94%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 shadow-[0_0_20px_rgba(41,216,255,0.35)]"></div>
        </div>
      </div>
      <button className="mt-6 w-full rounded-3xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
        Update My Goals
      </button>
    </div>
  );
}
