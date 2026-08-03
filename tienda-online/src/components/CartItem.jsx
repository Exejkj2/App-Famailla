import { motion } from 'framer-motion';
import { fmt } from '../utils';

export default function CartItem({ item, onRemove, onQty }) {
  return (
    <motion.div layout initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:40 }}
      transition={{ duration:0.22 }}
      className="flex gap-4 py-5 border-b border-gray-100 last:border-0">
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0">
        <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-display font-bold text-sm text-ink truncate">{item.name}</h4>
        <p className="text-xs text-ink-muted mb-3">{item.unit}</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
            <button onClick={() => onQty(item.id, item.qty-1)}
              className="w-7 h-7 flex items-center justify-center text-ink hover:bg-gray-100 transition-colors" aria-label="Reducir">-</button>
            <span className="w-6 text-center text-sm font-semibold text-ink">{item.qty}</span>
            <button onClick={() => onQty(item.id, item.qty+1)}
              className="w-7 h-7 flex items-center justify-center text-ink hover:bg-gray-100 transition-colors" aria-label="Aumentar">+</button>
          </div>
          <span className="font-semibold text-sm text-ink">{fmt(item.price * item.qty)}</span>
        </div>
      </div>
      <button onClick={() => onRemove(item.id)}
        className="text-gray-300 hover:text-red-400 transition-colors shrink-0 self-start pt-0.5" aria-label={`Eliminar ${item.name}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </motion.div>
  );
}
