import { motion } from 'framer-motion';

const promos = [
  {
    id: 1,
    minAmount: '$30.000',
    discount: '3%',
    label: null,
    featured: false,
    perks: ['Válido en todos los productos', 'Acumulable con ofertas', 'Sin límite de uso'],
  },
  {
    id: 2,
    minAmount: '$50.000',
    discount: '5%',
    label: 'Más Elegida',
    featured: true,
    perks: ['Válido en todos los productos', 'Acumulable con ofertas', 'Envío gratis incluido'],
  },
  {
    id: 3,
    minAmount: '$100.000',
    discount: '7%',
    label: null,
    featured: false,
    perks: ['Válido en todos los productos', 'Acumulable con ofertas', 'Envío gratis + regalo sorpresa'],
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function Promotions() {
  return (
    <section id="promos-volumen" className="py-20 bg-gradient-to-b from-bg via-pink-50/40 to-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Heading ── */}
        <div className="mb-14 text-center">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-brand mb-2">Precios por volumen</p>
          <h2
            className="font-display font-black text-ink leading-none tracking-tight"
            style={{ fontSize: 'clamp(2rem, 5.5vw, 3.8rem)' }}
          >
            ¡AHORRÁ MÁS{' '}
            <span className="text-brand">LLEVANDO MÁS!</span>
          </h2>
          <p className="mt-3 text-ink-muted text-sm max-w-lg mx-auto">
            Cuanto más grande sea tu compra, mayor es el descuento. ¡Aprovechá nuestras promociones por volumen!
          </p>
        </div>

        {/* ── Cards Grid ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center"
        >
          {promos.map((promo) => (
            <motion.div
              key={promo.id}
              variants={cardVariants}
              className={`
                relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 flex flex-col items-center text-center
                transition-all duration-300 hover:-translate-y-2
                ${promo.featured
                  ? 'border-2 border-brand shadow-xl shadow-brand/10 md:scale-105 md:py-10 z-10'
                  : 'border border-gray-100 shadow-sm hover:shadow-[0_10px_40px_-10px_rgba(255,42,117,0.3)]'
                }
              `}
            >
              {/* ── "Más Elegida" Badge ── */}
              {promo.label && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand text-white text-[10px] font-display font-black tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg shadow-brand/30 whitespace-nowrap">
                  ⭐ {promo.label}
                </span>
              )}

              {/* ── Discount Badge ── */}
              <div className={`
                w-24 h-24 rounded-full flex items-center justify-center mb-5
                ${promo.featured
                  ? 'bg-gradient-to-br from-brand to-pink-400 shadow-lg shadow-brand/30'
                  : 'bg-gradient-to-br from-purple to-purple/70 shadow-lg shadow-purple/20'
                }
              `}>
                <span className="font-display font-black text-white text-3xl leading-none">{promo.discount}</span>
              </div>

              {/* ── Text ── */}
              <p className="text-ink-muted text-xs font-bold tracking-widest uppercase mb-1">De descuento</p>
              <p className="text-ink font-display font-bold text-lg mb-1">
                En compras mayores a
              </p>
              <p className="font-display font-black text-ink text-3xl mb-5">{promo.minAmount}</p>

              {/* ── Perks List ── */}
              <ul className="w-full space-y-2.5 mb-8">
                {promo.perks.map((perk, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-ink-muted">
                    <svg className={`w-4 h-4 shrink-0 ${promo.featured ? 'text-brand' : 'text-purple'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {perk}
                  </li>
                ))}
              </ul>

              {/* ── CTA Button ── */}
              <a
                href="#productos"
                className={`
                  mt-auto w-full py-3 rounded-full font-bold text-sm text-center transition-all duration-200 active:scale-95
                  ${promo.featured
                    ? 'bg-brand text-white hover:bg-brand-dark shadow-lg shadow-brand/25'
                    : 'bg-ink text-white hover:bg-ink/90 shadow-md'
                  }
                `}
              >
                Comprar ahora
              </a>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
