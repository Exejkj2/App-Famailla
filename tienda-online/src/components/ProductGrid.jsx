import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseClient } from '../utils';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, onAdd }) {
  const [cat, setCat] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabaseClient.from('categories').select('*').order('name');
      if (!error && data) {
        setCategories(['Todos', ...data.map(c => c.name)]);
      } else {
        setCategories(['Todos']);
      }
    };
    fetchCategories();
  }, []);
  
  const all = products.filter(p => {
    const matchCat = cat === 'Todos' || p.category === cat;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });
  
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
        
        {/* Buscador */}
        <div className="mb-6 max-w-md mx-auto md:mx-0 relative px-4 md:px-0">
          <div className="absolute inset-y-0 left-4 md:left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl leading-5 bg-white text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent sm:text-sm shadow-sm transition-all duration-200"
            placeholder="Buscar golosinas, marcas, etc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div id="category-filter" className="flex items-center gap-2 mb-10 overflow-x-auto pb-4 px-4 scrollbar-none flex-nowrap justify-start md:justify-center -mx-4 md:mx-0">
          {categories.map(c => (
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-20 text-center flex flex-col items-center">
                <span className="text-5xl mb-4">🔍</span>
                <p className="text-ink font-bold text-lg">No encontramos resultados</p>
                <p className="text-ink-muted text-sm mt-1">Intentá buscar con otras palabras o probá en otra categoría.</p>
                <button onClick={() => {setSearchTerm(''); setCat('Todos');}} className="mt-6 text-brand font-semibold text-sm hover:underline">
                  Ver todos los productos
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
