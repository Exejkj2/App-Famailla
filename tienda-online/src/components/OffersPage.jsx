import { motion } from 'framer-motion';
import ProductCard from './ProductCard';

const discountTiers = [
  {
    amount: '$30.000',
    discount: '3%',
    color: 'from-purple to-indigo-500',
    shadow: 'shadow-purple/25',
    icon: '🛒',
    description: 'En compras mayores a',
  },
  {
    amount: '$50.000',
    discount: '5%',
    color: 'from-brand to-pink-400',
    shadow: 'shadow-brand/25',
    icon: '🎉',
    description: 'En compras mayores a',
    featured: true,
  },
  {
    amount: '$100.000',
    discount: '7%',
    color: 'from-orange-500 to-amber-400',
    shadow: 'shadow-orange-500/25',
    icon: '🏆',
    description: 'En compras mayores a',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export default function OffersPage({ products, onAdd }) {
  const offers = products.filter(p => p.isOffer);

  return (
    <div className="pt-16 min-h-screen bg-bg">

      {/* ═══════ Hero Banner ═══════ */}
      <section className="relative bg-gradient-to-br from-ink via-purple to-brand overflow-hidden">
        {/* Decorative blurs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-brand/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-accent font-bold text-xs tracking-[0.25em] uppercase mb-3"
          >
            🔥 Descuentos exclusivos
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display font-black text-white leading-none tracking-tight mb-4"
            style={{ fontSize: 'clamp(2.2rem, 6vw, 4.5rem)' }}
          >
            OFERTAS Y <span className="text-accent">PROMOCIONES</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/75 text-sm sm:text-base max-w-xl mx-auto"
          >
            Aprovechá nuestros descuentos por volumen y los mejores precios en golosinas seleccionadas.
          </motion.p>
        </div>
      </section>

      {/* ═══════ 3 Discount Banners ═══════ */}
      <section className="relative -mt-8 z-10 pb-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {discountTiers.map((tier, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className={`
                relative rounded-2xl p-6 sm:p-7 text-white overflow-hidden
                bg-gradient-to-br ${tier.color}
                shadow-xl ${tier.shadow}
                transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl
                ${tier.featured ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg md:scale-[1.03]' : ''}
              `}
            >
              {/* Shine effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />

              {tier.featured && (
                <span className="absolute top-3 right-3 bg-accent text-ink text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full shadow-md">
                  ⭐ Más elegida
                </span>
              )}

              <div className="relative z-10">
                <span className="text-2xl mb-2 block">{tier.icon}</span>
                <p className="text-white/80 text-xs font-semibold tracking-wider uppercase mb-1">{tier.description}</p>
                <p className="font-display font-black text-2xl sm:text-3xl leading-none mb-2">{tier.amount}</p>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="font-display font-black text-4xl sm:text-5xl leading-none">{tier.discount}</span>
                  <span className="text-white/80 font-bold text-sm uppercase">de descuento</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════ Offers Product Grid ═══════ */}
      <section className="py-16 bg-gradient-to-b from-bg to-pink-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-brand mb-2">Precios imperdibles</p>
            <h2
              className="font-display font-black text-ink leading-none tracking-tight"
              style={{ fontSize: 'clamp(2rem, 5.5vw, 3.8rem)' }}
            >
              PRODUCTOS EN <span className="text-brand">OFERTA</span>
            </h2>
            <p className="mt-3 text-ink-muted text-sm max-w-md mx-auto">
              Aprovechá los mejores descuentos en golosinas seleccionadas. ¡Stock limitado!
            </p>
          </div>

          {offers.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {offers.map(p => (
                <ProductCard key={p.id} product={p} onAdd={onAdd} />
              ))}
            </motion.div>
          ) : (
            <div className="py-20 text-center text-ink-muted font-medium">
              No hay ofertas disponibles en este momento.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
