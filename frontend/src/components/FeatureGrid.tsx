const features = [
  {
    title: 'Personalized meal plans',
    description: 'Get customized daily menus that adapt to your goals, preferences, and dietary needs.',
  },
  {
    title: 'Nutrition insights',
    description: 'Understand macros, micronutrients, and food quality with clear AI-powered explanations.',
  },
  {
    title: 'Recipe recommendations',
    description: 'Discover tasty recipes tailored to your lifestyle and available ingredients.',
  },
  {
    title: 'Progress tracking',
    description: 'Monitor your nutrition habits and receive suggestions for continuous improvement.',
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="mt-16">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-lg shadow-slate-950/20">
            <h2 className="text-xl font-semibold text-white">{feature.title}</h2>
            <p className="mt-4 text-sm leading-6 text-slate-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
