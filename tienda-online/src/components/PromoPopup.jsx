import { useState, useEffect } from 'react';
import { supabaseClient } from '../utils';

export default function PromoPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const hasSeenPromo = localStorage.getItem('hasSeenPromo');
    if (!hasSeenPromo) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const closePopup = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenPromo', 'true');
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabaseClient
        .from('customers')
        .insert([{ name, phone }]);

      if (error) throw error;

      setIsSuccess(true);
      localStorage.setItem('hasSeenPromo', 'true');
      
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    } catch (error) {
      console.error('Error exacto de Supabase:', error);
      setErrorMsg('Hubo un error. Por favor intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-300">
        <button 
          onClick={closePopup}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors z-10 bg-gray-100 rounded-full p-1.5"
          aria-label="Cerrar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <div className="bg-gradient-to-r from-brand to-purple p-6 text-center">
          <h2 className="text-3xl font-display font-black text-white mb-2 leading-tight">¡Sumate a nuestro<br/>Club de Descuentos!</h2>
          <p className="text-white/90 text-sm font-medium">Dejanos tu nombre y WhatsApp para recibir ofertas exclusivas y novedades antes que nadie.</p>
        </div>

        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">¡Gracias! Ya estás en la lista.</h3>
              <p className="text-ink-light">Pronto recibirás nuestras mejores ofertas.</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {errorMsg}
                </div>
              )}
              
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-ink mb-1.5">Nombre completo</label>
                <input 
                  type="text" 
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all font-medium"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-ink mb-1.5">Número de WhatsApp</label>
                <input 
                  type="tel" 
                  id="phone"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all font-medium"
                  placeholder="Ej: 3811234567"
                />
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-accent hover:bg-accent-dark text-ink font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-accent/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 text-lg"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-ink border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    '¡Quiero las ofertas!'
                  )}
                </button>
                <button 
                  type="button"
                  onClick={closePopup}
                  className="text-ink-light hover:text-ink font-medium text-sm transition-colors py-2"
                >
                  No gracias
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
