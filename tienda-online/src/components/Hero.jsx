import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

/* ───────────────── Candy Particle System ───────────────── */
const CANDY_EMOJIS = ['🍬', '🍭', '🍫', '🧁', '🍩', '🍪', '🎂', '🍰', '⭐', '✨', '💖', '🎁'];

function CandyParticle({ emoji, delay, duration, startX, size, drift }) {
  return (
    <motion.span
      initial={{ y: '-5%', x: `${startX}vw`, opacity: 0, scale: 0, rotate: 0 }}
      animate={{
        y: '105vh',
        x: `${startX + drift}vw`,
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0.5],
        rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
      className="absolute pointer-events-none select-none z-[1]"
      style={{ fontSize: size }}
    >
      {emoji}
    </motion.span>
  );
}

function ParticleField() {
  const particles = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      emoji: CANDY_EMOJIS[Math.floor(Math.random() * CANDY_EMOJIS.length)],
      delay: Math.random() * 12,
      duration: 10 + Math.random() * 14,
      startX: Math.random() * 95,
      size: `${14 + Math.random() * 22}px`,
      drift: (Math.random() - 0.5) * 15,
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <CandyParticle key={p.id} {...p} />
      ))}
    </div>
  );
}

/* ───────────────── Mouse Spotlight Removed (Integrated into Hero) ───────────────── */

/* ───────────────── Infinite Marquee ───────────────── */
function Marquee() {
  const items = ['GOLOSINAS', '✦', 'CHOCOLATES', '✦', 'ALFAJORES', '✦', 'CARAMELOS', '✦', 'SNACKS', '✦', 'TURRONES', '✦', 'GOMITAS', '✦', 'CHICLES', '✦'];
  const repeated = [...items, ...items, ...items];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[3] overflow-hidden border-t border-white/[0.06]">
      <div className="py-3.5 bg-gradient-to-r from-brand/5 via-transparent to-brand/5">
        <div className="marquee-track flex whitespace-nowrap">
          {repeated.map((t, i) => (
            <span key={i} className={`mx-6 font-display font-black text-sm tracking-[0.3em] uppercase ${t === '✦' ? 'text-brand' : 'text-white/20'}`}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────── Animated Counter ───────────────── */
function AnimatedNumber({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const numTarget = parseInt(target.replace(/\D/g, ''));
          const step = Math.ceil(numTarget / 60);
          let current = 0;
          const timer = setInterval(() => {
            current += step;
            if (current >= numTarget) {
              current = numTarget;
              clearInterval(timer);
            }
            setCount(current);
          }, 25);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString('es-AR')}{suffix}
    </span>
  );
}

/* ───────────────── Feature Pill ───────────────── */
function FeaturePill({ icon, text, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1 + delay * 0.15, type: 'spring', stiffness: 100, damping: 14 }}
      className="flex items-center gap-2.5 bg-white/[0.06] backdrop-blur-md border border-white/[0.08] px-4 py-2.5 rounded-xl hover:bg-white/[0.1] hover:border-brand/30 transition-all duration-300 group cursor-default"
    >
      <span className="text-lg group-hover:scale-125 transition-transform duration-300">{icon}</span>
      <span className="text-xs font-semibold text-white/70 tracking-wider uppercase group-hover:text-white transition-colors">{text}</span>
    </motion.div>
  );
}

/* ───────────────── MAIN HERO ───────────────── */
export default function Hero({ onShopNow, onOffersClick }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.3 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 50, filter: 'blur(10px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring', stiffness: 60, damping: 16 },
    },
  };

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const handleMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }, [mouseX, mouseY]);

  return (
    <section id="inicio" onMouseMove={handleMove} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-ink">
      {/* Deep layered background */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-[#1a0a2e] to-ink" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,42,117,0.15),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_120%,rgba(124,58,237,0.12),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_20%_80%,rgba(255,214,0,0.06),transparent)]" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Animated glow orbs */}
      <motion.div
        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[150px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple/15 rounded-full blur-[120px] pointer-events-none"
      />

      {/* Particles, spotlight, marquee */}
      <ParticleField />
      
      {/* Mouse Spotlight inline */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none z-[2]"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          background: 'radial-gradient(circle, rgba(255,42,117,0.08) 0%, transparent 70%)',
        }}
      />

      <Marquee />

      {/* ─── Main Content ─── */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 md:pt-32 md:pb-28 flex flex-col items-center text-center">
        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col items-center">

          {/* Top badge */}
          <motion.div variants={fadeUp} className="mb-8">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/[0.08] shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand shadow-lg shadow-brand/50" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/60">Famaillá, Tucumán — Desde 2008</span>
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.div variants={fadeUp}>
            <h1 className="font-display font-black uppercase leading-[0.85] tracking-tighter mb-2" style={{ fontSize: 'clamp(3rem, 10vw, 7.5rem)' }}>
              <span className="block text-white/90 drop-shadow-2xl">Bienvenido a</span>
              <span className="relative inline-block mt-1 md:mt-2">
                <motion.span
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  className="text-transparent bg-clip-text bg-[length:200%_auto]"
                  style={{ backgroundImage: 'linear-gradient(90deg, #FF2A75, #FFD600, #7C3AED, #FF2A75)' }}
                >
                  Todo Golosinas
                </motion.span>
                {/* Glow behind text */}
                <div className="absolute -inset-x-8 -inset-y-4 bg-brand/10 blur-3xl rounded-full -z-10 pointer-events-none" />
              </span>
            </h1>
          </motion.div>

          {/* Decorative line */}
          <motion.div variants={fadeUp} className="flex items-center gap-4 my-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-brand/50" />
            <span className="text-brand text-sm">✦</span>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-brand/50" />
          </motion.div>

          {/* Subtitle */}
          <motion.p variants={fadeUp} className="max-w-xl mx-auto text-base md:text-lg text-white/50 font-medium leading-relaxed mb-10">
            Las mejores golosinas y snacks seleccionados al mejor precio. Venta mayorista y minorista con envíos a todo el país.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 mb-14 w-full sm:w-auto">
            <button
              id="hero-shop-btn"
              onClick={(e) => {
                if (onShopNow) {
                  e.preventDefault();
                  onShopNow();
                }
              }}
              className="group relative px-9 py-4 bg-brand text-white font-bold text-base rounded-full overflow-hidden shadow-2xl shadow-brand/30 hover:shadow-brand/50 hover:scale-[1.03] active:scale-95 transition-all duration-300 outline-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand to-brand-dark bg-[length:200%_100%] group-hover:animate-[shimmer_2s_linear_infinite]" />
              <span className="relative flex items-center justify-center gap-2.5 pointer-events-none">
                Ver Productos
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            <button
              onClick={(e) => {
                if (onOffersClick) {
                  e.preventDefault();
                  onOffersClick();
                  setTimeout(() => document.getElementById('ofertas-semana')?.scrollIntoView({behavior:'smooth'}), 100);
                }
              }}
              id="hero-offers-btn"
              className="px-9 py-4 bg-white/[0.06] backdrop-blur-md text-white font-bold text-base rounded-full border border-white/[0.1] hover:bg-white/[0.12] hover:border-brand/40 hover:scale-[1.03] active:scale-95 transition-all duration-300 outline-none"
            >
              🔥 Ofertas de Hoy
            </button>
          </motion.div>

          {/* Feature pills */}
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3 mb-16">
            <FeaturePill icon="🚚" text="Envío gratis +$10.000" delay={0} />
            <FeaturePill icon="⚡" text="Despacho en 24hs" delay={1} />
            <FeaturePill icon="🏆" text="+5.000 clientes" delay={2} />
            <FeaturePill icon="💳" text="Todos los medios" delay={3} />
          </motion.div>

          {/* Trust stats */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 w-full max-w-3xl"
          >
            {[
              { value: '5000', suffix: '+', label: 'Clientes' },
              { value: '200', suffix: '+', label: 'Productos' },
              { value: '15', suffix: ' años', label: 'Experiencia' },
              { value: '24', suffix: 'hs', label: 'Despacho' },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="font-display font-black text-2xl md:text-3xl text-white/90 group-hover:text-brand transition-colors duration-300">
                  <AnimatedNumber target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-semibold">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-2 rounded-full bg-brand/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}
