import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatsBand from './components/StatsBand';
import ProductGrid from './components/ProductGrid';
import OffersGrid from './components/OffersGrid';
import FeaturedProducts from './components/FeaturedProducts';
import Promotions from './components/Promotions';
import OffersPage from './components/OffersPage';
import SobreNosotros from './components/SobreNosotros';
import Ubicacion from './components/Ubicacion';
import CartDrawer from './components/CartDrawer';
import Toast from './components/Toast';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import WhatsAppButton from './components/WhatsAppButton';
import { mapToReact, supabaseClient } from './utils';

// OfferBanner extraído directamente
function OfferBanner() {
  return (
    <section id="ofertas" className="bg-gradient-to-r from-purple via-brand to-purple py-16 overflow-hidden relative shadow-lg">
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        <div>
          <span className="inline-block bg-accent text-ink font-display font-black text-xs tracking-widest uppercase px-3.5 py-1 rounded-full mb-3 shadow-md">
            🚚 Envío gratis
          </span>
          <h2 className="font-display font-black text-white leading-none tracking-tight mb-3" style={{fontSize:'clamp(2rem,5vw,3.5rem)'}}>
            ENVÍOS GRATIS EN<br />COMPRAS MAYORES A $10.000
          </h2>
          <p className="text-white/90 max-w-md text-sm leading-relaxed font-medium">
            Comprá todo lo que necesites desde nuestro catálogo completo y recibilo en la puerta de tu casa sin costo adicional.
          </p>
        </div>
        <a href="#productos" id="offer-cta-btn" onClick={(e) => { e.preventDefault(); document.getElementById('navbar')?.querySelector('button:nth-child(2)')?.click() }}
          className="shrink-0 bg-accent text-ink font-bold text-base px-8 py-4 rounded-full hover:bg-accent-dark active:scale-95 transition-all duration-200 shadow-lg shadow-accent/15">
          Ver productos
        </a>
      </div>
    </section>
  );
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabaseClient.from('products').select('*');
    if (error) {
      console.error('Error fetching products:', error);
    } else if (data) {
      setProducts(data.map(mapToReact));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      return ex ? prev.map(i => i.id === product.id ? {...i, qty:i.qty+1} : i) : [...prev, {...product, qty:1}];
    });
    setToast(product);
  }, []);

  const removeFromCart = useCallback((id) => setCart(prev => prev.filter(i => i.id !== id)), []);

  const changeQty = useCallback((id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart(prev => prev.map(i => i.id === id ? {...i, qty} : i));
  }, [removeFromCart]);

  const navigate = useNavigate();

  const handleNavigate = (view) => {
    window.scrollTo(0, 0);
    if (view === 'store') navigate('/');
    else if (view === 'catalog') navigate('/productos');
    else if (view === 'offers') navigate('/ofertas');
    else if (view === 'location') navigate('/ubicacion');
    else if (view === 'about') navigate('/nosotros');
  };

  return (
    <>
      <Routes>
        {/* --- RUTA DE ADMINISTRADOR (SIN LAYOUT PÚBLICO) --- */}
        <Route path="/admin" element={
          <AdminPanel products={products} fetchProducts={fetchProducts} onLogout={() => navigate('/')} />
        } />

        {/* --- RUTAS PÚBLICAS (CON NAVBAR Y FOOTER) --- */}
        <Route path="*" element={
          <>
            <Navbar 
              cartCount={cartCount} 
              onCartOpen={() => setCartOpen(true)} 
              onLoginClick={() => navigate('/admin')} 
              onNavigate={handleNavigate} 
            />
            
            <Routes>
              <Route path="/" element={
                <main>
                  <Hero onShopNow={() => handleNavigate('catalog')} onOffersClick={() => handleNavigate('store')} />
                  <StatsBand />
                  {isLoading ? (
                    <div className="flex justify-center items-center py-40">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
                    </div>
                  ) : (
                    <OffersGrid products={products} onAdd={addToCart} />
                  )}
                  <FeaturedProducts products={products} onAdd={addToCart} />
                  <Promotions />
                  <OfferBanner />
                </main>
              } />

              <Route path="/productos" element={
                <main className="pt-16 min-h-screen bg-bg">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-40">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
                    </div>
                  ) : (
                    <ProductGrid products={products} onAdd={addToCart} />
                  )}
                </main>
              } />

              <Route path="/ofertas" element={
                <main>
                  {isLoading ? (
                    <div className="pt-16 flex justify-center items-center py-40">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
                    </div>
                  ) : (
                    <OffersPage products={products} onAdd={addToCart} />
                  )}
                </main>
              } />

              <Route path="/ubicacion" element={
                <main>
                  <Ubicacion />
                </main>
              } />

              <Route path="/nosotros" element={
                <main>
                  <SobreNosotros />
                </main>
              } />
            </Routes>

            <Footer />
            <WhatsAppButton />
            <CartDrawer isOpen={cartOpen} cart={cart} onClose={() => setCartOpen(false)} onRemove={removeFromCart} onQty={changeQty} onClear={() => setCart([])} />
            <Toast toast={toast} onClose={() => setToast(null)} />
          </>
        } />
      </Routes>
    </>
  );
}

