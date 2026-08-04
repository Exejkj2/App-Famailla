import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export default function Navbar({ cartCount, onCartOpen, onLoginClick, onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <header id="navbar" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-surface shadow-md' : 'bg-surface/95 backdrop-blur-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <button onClick={() => onNavigate('store')} id="logo-link" className="flex items-center gap-2 group text-left outline-none">
          <span className="w-9 h-9 rounded-full bg-brand flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shrink-0 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
              <path d="M11 17H7l-4-4 4-4h4l-3 4 3 4zm2 0 3-4-3-4h4l4 4-4 4h-4z"/>
            </svg>
          </span>
          <div className="leading-tight">
            <div className="font-display text-lg sm:text-xl font-black text-ink tracking-tight leading-none">TODO GOLOSINAS</div>
            <div className="text-[8px] sm:text-[9px] font-semibold text-brand tracking-widest uppercase">FAMAILLA, TUCUMAN</div>
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-8">
          <button onClick={() => onNavigate('store')} className="text-sm font-semibold text-ink/70 hover:text-brand transition-colors duration-150 outline-none">Inicio</button>
          <button onClick={() => onNavigate('catalog')} className="text-sm font-semibold text-ink/70 hover:text-brand transition-colors duration-150 outline-none">Productos</button>
          <button onClick={() => onNavigate('offers')} className="text-sm font-semibold text-ink/70 hover:text-brand transition-colors duration-150 outline-none">Ofertas</button>
          <button onClick={() => onNavigate('location')} className="text-sm font-semibold text-ink/70 hover:text-brand transition-colors duration-150 outline-none">Dónde encontrarnos</button>
          <button onClick={() => onNavigate('about')} className="text-sm font-semibold text-ink/70 hover:text-brand transition-colors duration-150 outline-none">Nosotros</button>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {location.pathname === '/' && (
            <button id="login-open-btn" onClick={onLoginClick}
              className="flex items-center gap-1.5 bg-surface text-ink px-3 sm:px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
              aria-label="Iniciar Sesión">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-ink/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="hidden sm:block text-xs font-semibold">Ingresar</span>
            </button>
          )}

          <button id="cart-open-btn" onClick={onCartOpen}
            className="relative flex items-center gap-1.5 sm:gap-2 bg-brand text-white px-3.5 sm:px-4 py-2 rounded-full hover:bg-brand-dark transition-all duration-200 shadow-md shadow-brand/20"
            aria-label={`Abrir carrito, ${cartCount} articulos`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <span className="text-xs sm:text-sm font-semibold">Carrito</span>
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span key="badge" id="cart-badge"
                  initial={{ scale:0 }} animate={{ scale:1 }} exit={{ scale:0 }}
                  className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 rounded-full bg-accent text-ink text-[10px] font-bold flex items-center justify-center shadow">
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button id="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-ink hover:text-brand focus:outline-none" aria-label="Abrir menu movil">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
            className="md:hidden bg-surface border-t border-gray-100 px-4 py-4 flex flex-col gap-3 shadow-lg">
            <button onClick={() => { setMobileMenuOpen(false); onNavigate('store'); }} className="text-base text-left font-semibold text-ink hover:text-brand py-1 px-2 rounded-lg hover:bg-pink-50 transition-colors">Inicio</button>
            <button onClick={() => { setMobileMenuOpen(false); onNavigate('catalog'); }} className="text-base text-left font-semibold text-ink hover:text-brand py-1 px-2 rounded-lg hover:bg-pink-50 transition-colors">Productos</button>
            <button onClick={() => { setMobileMenuOpen(false); onNavigate('offers'); }} className="text-base text-left font-semibold text-ink hover:text-brand py-1 px-2 rounded-lg hover:bg-pink-50 transition-colors">Ofertas</button>
            <button onClick={() => { setMobileMenuOpen(false); onNavigate('location'); }} className="text-base text-left font-semibold text-ink hover:text-brand py-1 px-2 rounded-lg hover:bg-pink-50 transition-colors">Dónde encontrarnos</button>
            <button onClick={() => { setMobileMenuOpen(false); onNavigate('about'); }} className="text-base text-left font-semibold text-ink hover:text-brand py-1 px-2 rounded-lg hover:bg-pink-50 transition-colors">Nosotros</button>
            {location.pathname === '/' && (
              <button onClick={() => { setMobileMenuOpen(false); onLoginClick(); }} className="text-base font-semibold text-brand text-left py-1 px-2 rounded-lg hover:bg-pink-50 transition-colors">
                Iniciar Sesión
              </button>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
