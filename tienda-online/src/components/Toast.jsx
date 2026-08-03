import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity:0, y:50, scale:0.9 }}
          animate={{ opacity:1, y:0, scale:1 }}
          exit={{ opacity:0, y:20, scale:0.9 }}
          className="fixed bottom-6 right-6 z-[80] bg-ink text-surface px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-purple/30 max-w-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-accent uppercase tracking-wider">¡Producto agregado!</p>
            <p className="text-sm font-semibold text-white truncate">{toast.name}</p>
          </div>
          <button onClick={onClose} className="text-surface/50 hover:text-white transition-colors p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
