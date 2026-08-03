import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';

export default function OffersGrid({ products, onAdd }) {
  const offers = products.filter(p => p.isOffer).slice(0, 8);
  
  return (
    <section id="ofertas-semana" className="py-20 bg-gradient-to-b from-bg to-pink-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-brand mb-2">Precios imperdibles</p>
          <h2 className="font-display font-black text-ink leading-none tracking-tight" style={{fontSize:'clamp(2rem,5.5vw,3.8rem)'}}>
            OFERTAS <span className="text-brand">DE LA SEMANA</span>
          </h2>
          <p className="mt-3 text-ink-muted text-sm max-w-md mx-auto">Aprovechá los mejores descuentos en golosinas seleccionadas. ¡Stock limitado!</p>
        </div>
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {offers.map(p => <ProductCard key={p.id} product={p} onAdd={onAdd} />)}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
