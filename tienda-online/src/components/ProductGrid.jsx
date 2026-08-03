import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '../utils';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, onAdd }) {
  const [cat, setCat] = useState('Todos');
  const all = cat === 'Todos' ? products : products.filter(p => p.category === cat);
  
  return (
    <section id="productos" className="py-20 bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center md:text-left">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-brand mb-2">Explorá nuestra variedad</p>
          <h2 className="font-display font-black text-ink leading-none tracking-tight" style={{fontSize:'clamp(2rem,5.5vw,3.8rem)'}}>
            NUESTROS <span className="text-brand">PRODUCTOS</span>
          </h2>
          <p className="mt-3 text-ink-muted text-sm max-w-xl">
            Encontrá todo lo que buscás, desde clásicos de siempre hasta las últimas novedades en golosinas y snacks.
          </p>
        </div>
        
        <div id="category-filter" className="flex items-center gap-2 mb-10 overflow-x-auto pb-4 scrollbar-none sm:flex-wrap md:justify-start justify-center">
          {CATEGORIES.map(c => (
            <button key={c} id={`cat-${c.toLowerCase()}`} onClick={() => setCat(c)}
              className={`shrink-0 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${cat === c ? 'bg-brand text-white shadow-lg shadow-brand/30 scale-105' : 'bg-white text-ink-muted hover:bg-brand/10 hover:text-brand border border-gray-100 hover:border-brand/30'}`}>
              {c}
            </button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {all.map(p => <ProductCard key={p.id} product={p} onAdd={onAdd} />)}
            {all.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-20 text-center text-ink-muted font-medium">
                No se encontraron productos en esta categoría.
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
