import { useState } from 'react';
import { motion } from 'framer-motion';
import { fmt } from '../utils';

export default function ProductCard({ product, onAdd }) {
  const [adding, setAdding] = useState(false);
  const isOut = product.inStock === false;
  
  const handle = () => { 
    if (isOut) return;
    setAdding(true); 
    onAdd(product); 
    setTimeout(() => setAdding(false), 700); 
  };

  return (
    <motion.article id={`product-${product.id}`} layout
      initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.95 }}
      transition={{ duration:0.28 }}
      className="bg-surface rounded-2xl overflow-hidden flex flex-col shadow-sm border border-gray-100 hover:shadow-xl hover:border-brand/20 transition-all duration-300 group">
      <div className="relative overflow-hidden bg-pink-50/50 aspect-square">
        <img src={product.img} alt={product.name} loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {product.badge && (
          <span className="absolute top-3 left-3 bg-brand text-white text-[9px] font-display font-black tracking-widest uppercase px-2.5 py-1 rounded-full shadow-md">
            {product.badge}
          </span>
        )}
        {isOut && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-ink text-white font-display font-black text-sm tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg rotate-12">
              Agotado
            </span>
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[10px] font-bold text-brand uppercase tracking-widest mb-1">{product.category}</p>
        <h3 className="font-display font-bold text-xl text-ink leading-tight mb-1">{product.name}</h3>
        <p className="text-xs text-ink-muted mb-4">{product.unit}</p>
        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <div className="font-bold text-xl text-ink">{fmt(product.price)}</div>
            {product.oldPrice && <div className="text-xs text-ink-muted line-through">{fmt(product.oldPrice)}</div>}
          </div>
          <button id={`add-to-cart-${product.id}`} onClick={handle} disabled={isOut}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 active:scale-95 shadow-sm ${isOut ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : adding ? 'bg-emerald-500 text-white' : 'bg-brand text-white hover:bg-brand-dark'}`}
            aria-label={isOut ? `Producto agotado` : `Agregar ${product.name} al carrito`}>
            {isOut ? (
              <>Agotado</>
            ) : adding ? (
              <><svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Listo!</>
            ) : (
              <><svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>Agregar</>
            )}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
