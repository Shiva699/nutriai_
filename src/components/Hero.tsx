export function Hero() {
  return (
    <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl text-center">
        <p className="mb-4 inline-flex rounded-full bg-cyan-500/10 px-4 py-1 text-sm font-semibold text-cyan-300">
          AI-powered nutrition insights
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Smarter food guidance with AI-driven meal planning
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300">
          NutriAI helps you build balanced meals, discover healthier recipes, and track progress through personalized recommendations.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="#features"
            className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Explore features
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
          >
            Start for free
          </a>
        </div>
      </div>
    </section>
  );
}
