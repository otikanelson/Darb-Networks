import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, BarChart3, Globe2, Zap, ArrowRight, CheckCircle2, TrendingUp, Users, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LAGOS_SKYLINE_URL =
  'https://images.unsplash.com/photo-1559833064-6f4573ec1ac9?auto=format&fit=crop&w=1600&q=60';

const features = [
  {
    id: 'network',
    icon: Globe2,
    title: 'Continental Investor Network',
    description:
      'Access a curated network of verified investors from Nigeria, Kenya, Ghana, South Africa, and beyond — all in one place.',
    badge: 'Pan-African Ecosystem',
    accent: 'primary',
  },
  {
    id: 'escrow',
    icon: ShieldCheck,
    title: 'Milestone-Based Funding',
    description:
      'Funds are held in escrow and released as you hit pre-defined milestones, giving investors confidence and founders accountability.',
    badge: 'Escrow Security',
    accent: 'secondary',
  },
  {
    id: 'analytics',
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description:
      'Track investor engagement, funding progress, and campaign performance with a live dashboard built for founders.',
    badge: 'Live Insights',
    accent: 'primary',
  },
  {
    id: 'launch',
    icon: Zap,
    title: 'Fast Campaign Launch',
    description:
      'Go from idea to live campaign in under an hour. Our guided editor handles the structure so you can focus on your story.',
    badge: '< 60 Min Setup',
    accent: 'secondary',
  },
];

const TICKER_ITEMS = [
  'SECURE FUNDING — MILESTONE-BASED RELEASES',
  'VERIFIED INVESTORS — PAN-AFRICAN NETWORK',
  'CAMPAIGN ANALYTICS — REAL-TIME TRACKING',
  'QUICK LAUNCH — UNDER 60 MINUTES',
  'TRANSPARENT PROCESS — ESCROW PROTECTION',
  'FOUNDER SUPPORT — GUIDED CAMPAIGN SETUP',
];

const ACCENT = {
  primary: {
    text: 'text-primary-400',
    bg: 'bg-primary-500',
    soft: 'bg-primary-500/10',
    border: 'border-primary-500/30',
    gradient: 'from-primary-500 to-primary-600',
  },
  secondary: {
    text: 'text-secondary-400',
    bg: 'bg-secondary-500',
    soft: 'bg-secondary-500/10',
    border: 'border-secondary-500/30',
    gradient: 'from-secondary-500 to-secondary-600',
  },
};

const FeaturesSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  const sectionRef = useRef(null);
  const railTrackRef = useRef(null);
  const railIndicatorRef = useRef(null);
  const tabRefs = useRef([]);
  const stageContentRef = useRef(null);
  const tickerInnerRef = useRef(null);
  const tickerTweenRef = useRef(null);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Entrance sequence, scroll-triggered
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion) return;

      gsap.set('[data-reveal]', { opacity: 0, y: 24 });
      gsap.set('[data-stage]', { opacity: 0, y: 24, scale: 0.98 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.7 } });
          tl.to('[data-reveal="eyebrow"]', { opacity: 1, y: 0 })
            .to('[data-reveal="heading"]', { opacity: 1, y: 0 }, '-=0.5')
            .to('[data-reveal="sub"]', { opacity: 1, y: 0 }, '-=0.5')
            .to('[data-reveal="tab"]', { opacity: 1, y: 0, stagger: 0.1 }, '-=0.3')
            .to('[data-stage]', { opacity: 1, y: 0, scale: 1, duration: 0.8 }, '-=0.5');
        },
      });
    }, sectionRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite ticker loop
  useEffect(() => {
    if (prefersReducedMotion || !tickerInnerRef.current) return;

    tickerTweenRef.current = gsap.to(tickerInnerRef.current, {
      xPercent: -50,
      duration: 22,
      ease: 'none',
      repeat: -1,
    });

    return () => tickerTweenRef.current && tickerTweenRef.current.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sliding rail indicator, glides to the active tab
  useEffect(() => {
    const track = railTrackRef.current;
    const target = tabRefs.current[activeTab];
    const indicator = railIndicatorRef.current;
    if (!track || !target || !indicator) return;

    const trackBox = track.getBoundingClientRect();
    const targetBox = target.getBoundingClientRect();
    const top = targetBox.top - trackBox.top;

    if (prefersReducedMotion) {
      gsap.set(indicator, { top, height: targetBox.height });
    } else {
      gsap.to(indicator, { top, height: targetBox.height, duration: 0.5, ease: 'power3.out' });
    }
  }, [activeTab, prefersReducedMotion]);

  // Content crossfade when the active tab changes
  useEffect(() => {
    if (!stageContentRef.current) return;
    if (prefersReducedMotion) {
      gsap.set(stageContentRef.current, { opacity: 1, y: 0 });
      return;
    }
    gsap.fromTo(
      stageContentRef.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
    );
  }, [activeTab, prefersReducedMotion]);

  const active = features[activeTab];
  const accent = ACCENT[active.accent];

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-slate-950 py-20 sm:py-28 md:py-32"
    >
      {/* Atmosphere: desaturated Lagos skyline, faded into the panel */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
        <img
          src={LAGOS_SKYLINE_URL}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover grayscale"
          style={{
            maskImage: 'linear-gradient(to bottom, black, transparent 75%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 75%)',
          }}
        />
      </div>
      <div className="pointer-events-none absolute -top-32 right-0 h-[420px] w-[420px] rounded-full bg-primary-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 left-0 h-[320px] w-[320px] rounded-full bg-secondary-500/10 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 text-center sm:mb-16">
          <span
            data-reveal="eyebrow"
            className="mb-2 block font-mono text-xs font-semibold tracking-[0.25em] text-primary-400 uppercase"
          >
            WHY DARB
          </span>
          <h2
            data-reveal="heading"
            className="text-3xl font-extrabold tracking-tight text-slate-50 sm:text-4xl md:text-5xl"
          >
            Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">African</span> startups
          </h2>
          <p data-reveal="sub" className="mx-auto mt-4 max-w-xl text-base text-slate-400 sm:text-lg">
            Every feature is shaped around the real mechanics of raising capital across the continent —
            not a template borrowed from somewhere else.
          </p>
        </div>

        {/* Interactive Feature Rail + Live Stage */}
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          {/* Left: vertical rail of feature tabs */}
          <div className="lg:col-span-5">
            <div ref={railTrackRef} className="relative space-y-2 pl-7">
              {/* static track line */}
              <div className="absolute left-[3px] top-0 bottom-0 w-px bg-white/10" />
              {/* animated indicator */}
              <div
                ref={railIndicatorRef}
                className={`absolute left-0 w-[3px] rounded-full bg-gradient-to-b ${accent.gradient}`}
                style={{ top: 0, height: 0 }}
              />

              {features.map(({ icon: Icon, title, description, accent: accentKey }, index) => {
                const isActive = activeTab === index;
                const a = ACCENT[accentKey];
                return (
                  <button
                    key={title}
                    type="button"
                    data-reveal="tab"
                    ref={(el) => (tabRefs.current[index] = el)}
                    onClick={() => setActiveTab(index)}
                    aria-pressed={isActive}
                    className={`block w-full rounded-xl border p-5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/60 ${
                      isActive
                        ? 'border-white/15 bg-white/[0.06] shadow-lg'
                        : 'border-transparent hover:bg-white/[0.03] hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border transition-colors ${
                          isActive
                            ? `${a.soft} ${a.border} ${a.text}`
                            : 'border-white/10 bg-white/[0.03] text-slate-400'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className={`font-semibold text-base transition-colors ${isActive ? 'text-slate-50' : 'text-slate-300'}`}>
                          {title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-slate-400">{description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: live terminal-style stage */}
          <div className="lg:col-span-7">
            <div
              data-stage
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-primary-500/5"
            >
              {/* Ticker bar */}
              <div className="overflow-hidden border-b border-white/10 bg-slate-950/50 backdrop-blur-sm">
                <div ref={tickerInnerRef} className="flex w-max whitespace-nowrap py-2">
                  {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-2 px-4 font-mono text-[11px] tracking-wide text-secondary-400/90"
                    >
                      <span className="text-primary-400">■</span> {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {/* Status row */}
                <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                  <span
                    className={`rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider ${accent.soft} ${accent.border} ${accent.text}`}
                  >
                    {active.badge}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-400">Platform Interface</span>
                  </div>
                </div>

                {/* Animated screen content */}
                <div ref={stageContentRef} className="flex min-h-[220px] flex-1 flex-col justify-center">
                  {activeTab === 0 && (
                    <div className="space-y-3">
                      {[
                        { code: 'AF', name: 'African Investor Network', sub: 'Verified Investors Platform' },
                        { code: 'PAN', name: 'Pan-African Pool', sub: 'Multi-Country Access' },
                      ].map((row) => (
                        <div
                          key={row.code}
                          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.05] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500/15 text-xs font-bold text-primary-400">
                              {row.code}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-50">{row.name}</div>
                              <div className="text-[11px] text-slate-400">{row.sub}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 1 && (
                    <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05] transition-colors">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-50">
                        <span className="flex items-center gap-1 text-secondary-400">
                          <CheckCircle2 className="h-4 w-4" /> Escrow Protected
                        </span>
                        <span className="font-mono">Milestone-Based</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-secondary-500 to-secondary-600" />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Secure fund releases</span>
                        <span>Progress tracking</span>
                      </div>
                    </div>
                  )}

                  {activeTab === 2 && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.05] transition-colors">
                        <div className="mb-2 flex items-center justify-between text-primary-400">
                          <Users className="h-4 w-4" />
                          <span className="rounded bg-primary-500/10 px-1.5 py-0.5 text-[10px] font-bold text-primary-400">
                            Live
                          </span>
                        </div>
                        <div className="text-xl font-extrabold text-slate-50">Real-Time</div>
                        <div className="text-xs text-slate-400">Engagement tracking</div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.05] transition-colors">
                        <div className="mb-2 flex items-center justify-between text-secondary-400">
                          <TrendingUp className="h-4 w-4" />
                          <span className="rounded bg-secondary-500/10 px-1.5 py-0.5 text-[10px] font-bold text-secondary-400">
                            Active
                          </span>
                        </div>
                        <div className="text-xl font-extrabold text-slate-50">Analytics</div>
                        <div className="text-xs text-slate-400">Campaign insights</div>
                      </div>
                    </div>
                  )}

                  {activeTab === 3 && (
                    <div className="space-y-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05] transition-colors">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-50">Quick Setup Process</span>
                        <span className="font-mono font-extrabold text-primary-400">&lt; 60 Min</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/10">
                        <div className="h-full w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600" />
                      </div>
                      <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
                        <span>✓ Guided campaign builder</span>
                        <span>✓ Template support</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom CTA */}
                <div className="flex items-center justify-between border-t border-white/10 pt-5">
                  <Link
                    to="/register"
                    className="group flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-primary-500/40 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/60"
                  >
                    Get started 
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;