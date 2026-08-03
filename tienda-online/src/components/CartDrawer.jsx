import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fmt } from '../utils';
import CartItem from './CartItem';

export default function CartDrawer({ isOpen, cart, onClose, onRemove, onQty, onClear }) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  
  // Lógica de Cupón
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  // Descuentos hardcodeados de ejemplo
  const validCoupons = {
    'PROMO10': { type: 'percent', value: 10 },
    'GOLOSINAS20': { type: 'percent', value: 20 },
    'ENVIOFREE': { type: 'fixed', value: 1500 }
  };

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    
    if (validCoupons[code]) {
      setAppliedCoupon({ code, ...validCoupons[code] });
      setCouponError('');
    } else {
      setAppliedCoupon(null);
      setCouponError('Cupón inválido');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  // Cálculo de total con descuento
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      discountAmount = subtotal * (appliedCoupon.value / 100);
    } else if (appliedCoupon.type === 'fixed') {
      discountAmount = appliedCoupon.value;
    }
  }
  
  const total = Math.max(0, subtotal - discountAmount);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;
    
    let message = "Hola Todo Golosinas, quiero pedir:\n";
    cart.forEach(item => {
      message += `- ${item.qty}x ${item.name} (${fmt(item.price * item.qty)})\n`;
    });
    
    message += `\nSubtotal: ${fmt(subtotal)}`;
    if (appliedCoupon) {
      message += `\nCupón aplicado (${appliedCoupon.code}): -${fmt(discountAmount)}`;
    }
    message += `\n*Total a pagar: ${fmt(total)}*`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "5493816096311";
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
    onClear();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="overlay" id="cart-overlay"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:0.2 }}
            className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-[60]"
            onClick={onClose} />
          <motion.aside key="drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-label="Carrito de compras"
            initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
            transition={{ type:'spring', stiffness:320, damping:38 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-surface z-[70] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="font-display font-black text-2xl text-ink tracking-tight">TU CARRITO</h2>
                <p className="text-xs text-ink-muted">{cart.length} {cart.length === 1 ? 'producto' : 'productos'}</p>
              </div>
              <button id="cart-close-btn" onClick={onClose}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors" aria-label="Cerrar carrito">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                  </div>
                  <p className="font-display font-bold text-xl text-ink mb-2">Carrito vacío</p>
                  <button onClick={onClose} className="bg-brand text-white font-semibold px-6 py-3 rounded-full hover:bg-brand-dark transition-colors text-sm shadow-md">
                    Explorar productos
                  </button>
                </div>
              ) : (
                <AnimatePresence>
                  {cart.map(item => <CartItem key={item.id} item={item} onRemove={onRemove} onQty={onQty} />)}
                </AnimatePresence>
              )}
            </div>

            {cart.length > 0 && (
              <div className="px-6 py-6 border-t border-gray-100 bg-surface/95 backdrop-blur-sm">
                {/* Sección Cupón */}
                <div className="mb-5 pb-5 border-b border-gray-100 border-dashed">
                  {!appliedCoupon ? (
                    <button onClick={() => setIsDiscountModalOpen(true)} className="flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      Agregar código de descuento
                    </button>
                  ) : (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        <div>
                          <p className="text-xs font-bold text-emerald-700">Cupón aplicado: {appliedCoupon.code}</p>
                          <p className="text-[10px] text-emerald-600 font-medium">-{fmt(discountAmount)} descuento</p>
                        </div>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline">Quitar</button>
                    </div>
                  )}
                </div>

                {/* Resumen Totales */}
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm text-ink-muted font-medium">Subtotal</span>
                  <span className="font-semibold text-lg text-ink">{fmt(subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between items-baseline mb-1 text-emerald-600">
                    <span className="text-sm font-medium">Descuento</span>
                    <span className="font-semibold text-lg">-{fmt(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline mb-1 mt-2">
                  <span className="text-sm text-ink font-bold uppercase tracking-wide">Total a Pagar</span>
                  <span className="font-black text-2xl text-brand">{fmt(total)}</span>
                </div>
                
                <p className="text-[10px] text-ink-muted mb-5 text-right">Envío calculado en WhatsApp.</p>
                
                <button id="checkout-btn" onClick={handleWhatsAppCheckout}
                  className="flex items-center justify-center gap-2 w-full bg-brand text-white font-bold text-base py-4 rounded-full hover:bg-brand-dark active:scale-[0.98] transition-all duration-200 shadow-lg shadow-brand/25">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 002 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                  Pedir por WhatsApp
                </button>
                
                <div className="flex flex-col items-center gap-2 mt-4">
                  <button onClick={onClose} className="text-ink-muted text-sm font-medium hover:text-ink transition-colors py-1">
                    Seguir comprando
                  </button>
                  <button onClick={onClear} className="text-red-500 hover:text-red-700 text-sm font-semibold flex items-center gap-1 transition-colors py-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Vaciar carrito
                  </button>
                </div>
              </div>
            )}
          </motion.aside>

          {/* Modal de Descuento */}
          <AnimatePresence>
            {isDiscountModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
                >
                  <h3 className="font-display font-black text-xl text-ink mb-4">Ingresar código</h3>
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => { setCouponInput(e.target.value); setCouponError(''); }}
                    className="w-full bg-gray-50 border border-gray-200 text-ink text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-brand mb-2"
                    placeholder="Ej: PROMO10"
                    autoFocus
                  />
                  {couponError && <p className="text-xs text-red-500 font-semibold mb-4">{couponError}</p>}
                  
                  <div className="flex items-center gap-3 mt-6">
                    <button
                      onClick={() => {
                        setIsDiscountModalOpen(false);
                        setCouponError('');
                      }}
                      className="flex-1 bg-gray-100 text-ink-muted px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        handleApplyCoupon();
                        if (validCoupons[couponInput.trim().toUpperCase()]) {
                          setIsDiscountModalOpen(false);
                        }
                      }}
                      className="flex-1 bg-brand text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors shadow-md shadow-brand/20"
                    >
                      Aplicar
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
