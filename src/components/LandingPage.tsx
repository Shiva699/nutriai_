import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { FiArrowRight, FiCheckCircle, FiCpu, FiHeart, FiShield, FiMail, FiGithub, FiLinkedin, FiTwitter, FiLock, FiZap, FiTrendingUp } from 'react-icons/fi';

const features = [
  { title: 'Personalized diet plans', description: 'AI-generated meal plans tailored to your goals, allergies, and preferences.', icon: FiHeart },
  { title: 'Nutrition coaching', description: 'Real-time guidance with an intelligent coach that helps you eat smarter daily.', icon: FiCpu },
  { title: 'Progress analytics', description: 'Track weight, BMI, hydration, and macro trends in one dashboard.', icon: FiCheckCircle },
  { title: 'Secure wellness platform', description: 'Premium health UX with secure onboarding, accountability, and easy tracking.', icon: FiShield },
];

const faqs = [
  { question: 'How does NutriVision generate meal plans?', answer: 'NutriVision uses AI to build meal plans based on your goals, body metrics, and activity level, then suggests a balanced daily macros split.' },
  { question: 'Can I track my BMI and hydration?', answer: 'Yes, the platform includes BMI, water intake, weight tracking, and calorie analysis in the dashboard.' },
  { question: 'Is there a free trial?', answer: 'Yes, start with the core dashboard and try the AI nutrition coach with sample data before upgrading.' },
];

export function LandingPage() {
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('reveal--visible');
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('[data-reveal]').forEach((el) => {
      el.classList.add('reveal');
      io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden px-6 py-16 lg:px-12 lg:py-32" style={{background: 'linear-gradient(180deg, rgba(6,10,26,0.85), rgba(3,6,22,0.95))'}}>
        <div className="mx-auto flex max-w-7xl flex-col gap-16 lg:flex-row lg:items-center lg:gap-12">
          <div className="max-w-2xl space-y-8 flex-1" data-reveal>
            <div className="space-y-3">
              <p className="inline-flex rounded-full bg-emerald-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-300/90 border border-emerald-500/20">AI-powered nutrition platform</p>
              <h1 className="text-5xl font-black leading-tight tracking-tight text-white sm:text-6xl">Transform your nutrition with intelligent AI coaching.</h1>
              <p className="text-lg leading-8 text-slate-300/90 max-w-xl">Get personalized meal plans, real-time nutrition guidance, and comprehensive health analytics—all powered by advanced AI. Start your wellness journey today.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/dashboard" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 px-8 py-4 text-base font-semibold text-slate-950 btn-cta hover:shadow-[0_0_30px_rgba(52,211,153,0.3)] hover:scale-105 transition-all">
                Get started free
                <FiArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/ai-coach" className="inline-flex items-center justify-center rounded-full border border-slate-400/30 bg-slate-900/40 px-8 py-4 text-base font-semibold text-white btn-cta hover:bg-slate-900/70 hover:border-slate-400/50 transition-all">
                Try AI Coach
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 pt-4 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="h-5 w-5 text-emerald-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <FiZap className="h-5 w-5 text-emerald-400" />
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] glass-card p-8 shadow-[0_40px_120px_-70px_rgba(0,0,0,0.9)] lg:flex-1 border border-white/10" data-reveal>
            <div className="flex flex-col gap-6">
              <div className="rounded-[24px] bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 p-6 border border-emerald-400/20">
                <p className="text-xs uppercase tracking-[0.32em] text-emerald-300/80 font-semibold">Dashboard Preview</p>
                <p className="mt-4 text-2xl font-bold text-white">Your nutrition at a glance</p>
                <p className="mt-2 text-sm text-slate-300">Track weight, water intake, calories, and macros in one unified dashboard.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[20px] bg-slate-900/50 border border-slate-700/50 p-5 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400 font-semibold">Daily Calories</p>
                  <p className="mt-3 text-3xl font-bold text-emerald-400">1,850</p>
                  <p className="mt-1 text-xs text-slate-500">85% of goal</p>
                </div>
                <div className="rounded-[20px] bg-slate-900/50 border border-slate-700/50 p-5 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400 font-semibold">Goal Progress</p>
                  <p className="mt-3 text-3xl font-bold text-cyan-400">92%</p>
                  <p className="mt-1 text-xs text-slate-500">On track</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-6xl space-y-16">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/80 font-semibold">Core Features</p>
                <h2 className="mt-3 text-5xl font-bold text-white leading-tight">Everything to master your nutrition</h2>
              </div>
              <p className="text-lg leading-8 text-slate-300/90">From intelligent meal planning to comprehensive health tracking, NutriVision delivers the tools modern health-conscious people need.</p>
            </div>

            <div className="grid gap-5">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="rounded-[20px] bg-slate-900/50 border border-slate-800/50 p-5 hover:border-emerald-500/30 transition-all group">
                    <div className="flex items-start gap-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 flex-shrink-0 group-hover:bg-emerald-500/25 transition-all">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                        <p className="mt-2 text-sm text-slate-400 leading-6">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Trust / stats section */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/80 font-semibold">Trusted by thousands</p>
            <h2 className="mt-3 text-4xl font-bold text-white">Proven results & credibility</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div data-reveal className="glass-card rounded-[28px] p-8 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
                <FiTrendingUp className="h-7 w-7 text-emerald-400" />
              </div>
              <p className="mt-6 text-4xl font-bold text-white">120k+</p>
              <p className="mt-2 text-sm text-slate-400 font-medium">Active Users</p>
              <p className="mt-3 text-xs text-slate-500">Helping people achieve their health goals</p>
            </div>
            <div data-reveal className="glass-card rounded-[28px] p-8 border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/15">
                <FiZap className="h-7 w-7 text-cyan-400" />
              </div>
              <p className="mt-6 text-4xl font-bold text-white">1.8M</p>
              <p className="mt-2 text-sm text-slate-400 font-medium">Meals Generated</p>
              <p className="mt-3 text-xs text-slate-500">AI-personalized nutrition plans</p>
            </div>
            <div data-reveal className="glass-card rounded-[28px] p-8 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
                <FiCheckCircle className="h-7 w-7 text-emerald-400" />
              </div>
              <p className="mt-6 text-4xl font-bold text-white">95%</p>
              <p className="mt-2 text-sm text-slate-400 font-medium">Accuracy Rate</p>
              <p className="mt-3 text-xs text-slate-500">Recommendation satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-900/50 px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-6xl space-y-16">
          <div className="space-y-6 text-center max-w-2xl mx-auto">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/80 font-semibold">How It Works</p>
            <h2 className="text-5xl font-bold text-white leading-tight">Your path to better nutrition in 3 steps</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { title: 'Set Your Goal', description: 'Tell NutriVision your health goal, current stats, and dietary preferences.', badge: 'Step 1', icon: '🎯' },
              { title: 'Get AI Plan', description: 'Receive a personalized meal plan with macros, recipes, and daily targets.', badge: 'Step 2', icon: '✨' },
              { title: 'Track & Optimize', description: 'Monitor progress with real-time analytics and AI-powered suggestions.', badge: 'Step 3', icon: '📊' },
            ].map((item, idx) => (
              <div key={item.title} data-reveal className="relative">
                <div className="rounded-[28px] border border-slate-700/50 bg-slate-950/50 p-8 h-full backdrop-blur">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl mb-6">
                    {item.icon}
                  </div>
                  <span className="inline-block text-xs uppercase tracking-[0.28em] text-emerald-300/70 font-semibold">{item.badge}</span>
                  <h3 className="mt-4 text-2xl font-bold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{item.description}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <FiArrowRight className="h-6 w-6 text-slate-700" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900 px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-6xl space-y-12 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/80">What customers say</p>
          <h2 className="text-4xl font-semibold text-white">Trusted by modern wellness teams and people who want real results.</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: 'Ariana P.', role: 'Fitness Coach', quote: 'NutriVision has streamlined client meal planning and helped us deliver smarter nutrition guidance.' },
              { name: 'Marcus L.', role: 'Product Manager', quote: 'The dashboard makes it easy to stay on pace, track weight, and adjust macros in real time.' },
              { name: 'Jade S.', role: 'Nutrition Lead', quote: 'The AI coach recommendations are surprisingly practical and easy to follow every day.' },
            ].map((item) => (
              <div key={item.name} className="rounded-[32px] border border-white/10 bg-slate-950/80 p-8 shadow-[0_30px_50px_-30px_rgba(0,0,0,0.7)] backdrop-blur-xl">
                <p className="text-lg leading-8 text-slate-300">“{item.quote}”</p>
                <p className="mt-6 text-sm font-semibold text-white">{item.name}</p>
                <p className="text-sm text-emerald-300">{item.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="space-y-4 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/80">FAQ</p>
            <h2 className="text-4xl font-semibold text-white">Your questions answered.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {faqs.map((item) => (
              <div key={item.question} className="rounded-[32px] border border-white/10 bg-slate-900/80 p-8 shadow-[0_30px_50px_-30px_rgba(0,0,0,0.7)] backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.28em] text-emerald-300/70">{item.question}</p>
                <p className="mt-4 text-sm leading-7 text-slate-300">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 px-6 py-20 lg:px-12 border-t border-b border-emerald-500/20">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[32px] bg-gradient-to-r from-emerald-500 to-cyan-500 p-0.5">
            <div className="rounded-[32px] bg-slate-950 p-12 md:p-16">
              <div className="max-w-2xl mx-auto text-center space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500/20">
                    <FiMail className="h-7 w-7 text-emerald-400" />
                  </div>
                  <h2 className="text-4xl font-bold text-white">Stay in the loop</h2>
                  <p className="text-lg text-slate-300">Get weekly nutrition tips, new AI features, and health insights delivered to your inbox.</p>
                </div>
                <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto w-full">
                  <input type="email" placeholder="Enter your email" className="flex-1 rounded-full bg-slate-900/50 border border-slate-700/50 px-6 py-3 text-white placeholder-slate-500 outline-none focus:border-emerald-500/50 transition-all" />
                  <button type="submit" className="rounded-full bg-emerald-500 px-8 py-3 font-semibold text-slate-950 hover:bg-emerald-400 transition-all">Subscribe</button>
                </form>
                <p className="text-xs text-slate-500">No spam. Unsubscribe anytime.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900/50 px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-5 mb-12">
            {/* Brand */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                  <span className="text-lg font-bold text-slate-950">NV</span>
                </div>
                <span className="text-xl font-bold text-white">NutriVision</span>
              </div>
              <p className="text-sm text-slate-400 leading-6">AI-powered nutrition platform for smarter health decisions.</p>
              <div className="flex gap-4">
                <a href="#" className="h-10 w-10 rounded-full bg-slate-900/50 border border-slate-800/50 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                  <FiGithub className="h-5 w-5" />
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-slate-900/50 border border-slate-800/50 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                  <FiTwitter className="h-5 w-5" />
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-slate-900/50 border border-slate-800/50 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                  <FiLinkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Product</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link to="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link></li>
                <li><Link to="/ai-coach" className="hover:text-emerald-400 transition-colors">AI Coach</Link></li>
                <li><Link to="/weight-tracker" className="hover:text-emerald-400 transition-colors">Trackers</Link></li>
                <li><Link to="/saved-plans" className="hover:text-emerald-400 transition-colors">Meal Plans</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Company</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">GDPR</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Security</a></li>
              </ul>
            </div>

            {/* Security */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Security</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <FiLock className="h-4 w-4 text-emerald-400" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <FiShield className="h-4 w-4 text-emerald-400" />
                  <span>256-bit Encryption</span>
                </div>
                <a href="#" className="text-xs text-emerald-400/70 hover:text-emerald-400 transition-colors flex items-center gap-1">
                  View Security &rarr;
                </a>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-slate-900/50 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
              <p>&copy; 2024 NutriVision. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <span className="text-xs">Built with ❤️ for your health</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
