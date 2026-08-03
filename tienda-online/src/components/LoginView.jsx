import { useState } from 'react';
import { motion } from 'framer-motion';

export default function LoginView({ onLogin, onBack }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user === 'admin' && pass === 'admin') {
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
      <button onClick={onBack} className="absolute top-6 left-6 text-ink-muted hover:text-ink flex items-center gap-2 text-sm font-semibold transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Volver a la tienda
      </button>
      
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="bg-surface w-full max-w-md p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand rounded-full mx-auto flex items-center justify-center mb-4 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h1 className="font-display font-black text-2xl text-ink tracking-tight">Acceso Privado</h1>
          <p className="text-sm text-ink-muted mt-1">Ingresa tus credenciales de administrador</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">Usuario</label>
            <input type="text" value={user} onChange={e => {setUser(e.target.value); setError(false);}}
              className="w-full bg-gray-50 border border-gray-200 text-ink text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
              placeholder="admin" autoFocus />
          </div>
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">Contraseña</label>
            <input type="password" value={pass} onChange={e => {setPass(e.target.value); setError(false);}}
              className="w-full bg-gray-50 border border-gray-200 text-ink text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
              placeholder="••••••••" />
          </div>
          
          {error && <p className="text-xs text-red-500 font-semibold text-center">Credenciales incorrectas.</p>}

          <button type="submit" className="mt-2 w-full bg-brand text-white font-bold text-base py-3.5 rounded-xl hover:bg-brand-dark active:scale-[0.98] transition-all shadow-md shadow-brand/20">
            Iniciar Sesión
          </button>
        </form>
      </motion.div>
    </div>
  );
}
