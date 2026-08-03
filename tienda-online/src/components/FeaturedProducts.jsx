import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';

export default function FeaturedProducts({ products, onAdd }) {
  // Show up to 8 products — prefer those marked featured, otherwise show newest
  const featured = products.filter(p => p.isFeatured);
  const display = featured.length > 0 ? featured.slice(0, 8) : products.slice(0, 8);

  if (display.length === 0) return null;

  return (
    <section id="destacados" className="py-20 bg-gradient-to-b from-bg to-purple/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-purple mb-2">Lo más elegido</p>
          <h2 className="font-display font-black text-ink leading-none tracking-tight" style={{fontSize:'clamp(2rem,5.5vw,3.8rem)'}}>
            ARTÍCULOS <span className="text-purple">DESTACADOS</span>
          </h2>
          <p className="mt-3 text-ink-muted text-sm max-w-md mx-auto">
            Los productos favoritos de nuestros clientes. ¡No te los pierdas!
          </p>
        </div>
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {display.map(p => <ProductCard key={p.id} product={p} onAdd={onAdd} />)}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
