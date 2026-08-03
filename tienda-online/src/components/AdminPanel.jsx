import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseClient, mapToSupabase, CATEGORIES, fmt } from '../utils';

const toTitleCase = (str) => {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
};

export default function AdminPanel({ products, fetchProducts, onLogout }) {
  const defaultForm = { name: '', price: '', img: '', isFeatured: false, isOffer: false, inStock: true, category: 'Golosinas', unit: 'Unidad' };
  const [form, setForm] = useState(defaultForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F4') {
        e.preventDefault();
        openModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openModal = (product) => {
    if (product) {
      setEditingProduct(product);
      setForm({
        name: product.name,
        price: product.price,
        img: product.img,
        isFeatured: product.isFeatured || false,
        isOffer: product.isOffer || false,
        inStock: product.inStock !== false,
        category: product.category,
        unit: product.unit
      });
    } else {
      setEditingProduct(null);
      setForm(defaultForm);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setForm(defaultForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.img) return alert('Completa nombre, precio e imagen');
    
    setIsSaving(true);
    const productData = {
      ...form,
      name: toTitleCase(form.name),
      oldPrice: form.isOffer ? Number(form.price) * 1.2 : null,
      badge: form.isOffer ? 'OFERTA' : null,
    };

    const dbPayload = mapToSupabase(productData);

    if (editingProduct) {
      const { error } = await supabaseClient.from('products').update(dbPayload).eq('id', editingProduct.id);
      if (error) alert('Error al actualizar: ' + error.message);
      else {
        alert('Producto actualizado exitosamente');
        fetchProducts();
        closeModal();
      }
    } else {
      const { error } = await supabaseClient.from('products').insert([dbPayload]);
      if (error) alert('Error al guardar: ' + error.message);
      else {
        alert('Producto agregado exitosamente');
        fetchProducts();
        closeModal();
      }
    }
    setIsSaving(false);
  };

  const toggleStock = async (id, currentStock) => {
    const { error } = await supabaseClient.from('products').update({ in_stock: !currentStock }).eq('id', id);
    if (error) alert('Error al actualizar stock: ' + error.message);
    else fetchProducts();
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      const { error } = await supabaseClient.from('products').delete().eq('id', id);
      if (error) alert('Error al eliminar: ' + error.message);
      else fetchProducts();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-surface shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-ink rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
            <h1 className="font-display font-black text-xl text-ink tracking-tight">Panel de Administración</h1>
          </div>
          <button onClick={onLogout} className="text-sm font-semibold text-brand hover:text-brand-dark transition-colors flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Salir a tienda
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-2xl text-ink">Catálogo de Productos</h2>
          <button onClick={() => openModal(null)} className="flex items-center gap-2 bg-brand text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-brand-dark transition-all shadow-md active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            Cargar Nuevo Producto <span className="text-white/60 ml-1 text-xs">(F4)</span>
          </button>
        </div>

        <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <span className="text-sm font-semibold text-ink-muted">Total: {products.length} productos</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase font-bold tracking-wider text-ink-muted border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4">Precio</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200/50 shadow-sm">
                        <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-ink text-base">{p.name}</div>
                        <div className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold">{p.category} • {p.unit}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-ink text-base">{fmt(p.price)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {p.isFeatured && <span className="bg-purple/10 text-purple text-[10px] font-bold px-2.5 py-1 rounded-full border border-purple/20">Destacado</span>}
                        {p.isOffer && <span className="bg-accent/20 text-accent-dark text-[10px] font-bold px-2.5 py-1 rounded-full border border-accent/40">Oferta</span>}
                        {!p.inStock && <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-red-200">Agotado</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => toggleStock(p.id, p.inStock)} title={p.inStock ? "Marcar como Agotado" : "Reponer Stock"}
                          className={`p-2 rounded-lg transition-colors ${p.inStock ? 'text-ink-muted hover:bg-gray-200 hover:text-ink' : 'text-emerald-600 hover:bg-emerald-100'}`}>
                          {p.inStock ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                          )}
                        </button>
                        <button onClick={() => openModal(p)} title="Editar"
                          className="p-2 text-ink-muted hover:bg-gray-200 hover:text-ink rounded-lg transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(p.id)} title="Eliminar"
                          className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="py-12 text-center text-ink-muted">No hay productos cargados en el catálogo.</div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-surface w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-display font-bold text-xl text-ink">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
                <button onClick={closeModal} className="p-2 text-ink-muted hover:text-ink hover:bg-gray-200 rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">Nombre</label>
                    <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="Ej. Caramelos..." autoFocus />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">Precio ($)</label>
                      <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="850" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">Categoría</label>
                      <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand">
                        {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">URL de Imagen</label>
                    <input type="text" value={form.img} onChange={e => setForm({...form, img: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="https://..." />
                  </div>
                  
                  <div className="flex flex-col gap-3 mt-2 border-t border-gray-100 pt-4 bg-gray-50/50 -mx-6 px-6 pb-2">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm font-semibold text-ink group-hover:text-brand transition-colors">¿Es Destacado?</span>
                      <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} className="w-4 h-4 text-brand rounded focus:ring-brand" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm font-semibold text-ink group-hover:text-brand transition-colors">¿Es Oferta de la semana?</span>
                      <input type="checkbox" checked={form.isOffer} onChange={e => setForm({...form, isOffer: e.target.checked})} className="w-4 h-4 text-brand rounded focus:ring-brand" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm font-semibold text-ink group-hover:text-brand transition-colors">Stock Disponible</span>
                      <input type="checkbox" checked={form.inStock} onChange={e => setForm({...form, inStock: e.target.checked})} className="w-4 h-4 text-brand rounded focus:ring-brand" />
                    </label>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button type="button" onClick={closeModal} className="flex-1 bg-gray-100 text-ink font-bold text-sm py-3 rounded-xl hover:bg-gray-200 transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" disabled={isSaving} className="flex-1 bg-ink text-white font-bold text-sm py-3 rounded-xl hover:bg-black transition-colors shadow-md disabled:opacity-50">
                      {isSaving ? 'Guardando...' : (editingProduct ? 'Actualizar' : 'Guardar')}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
