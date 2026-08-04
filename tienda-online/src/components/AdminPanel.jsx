import { useState, useEffect, useRef } from 'react';
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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
        setModalMessage('Producto actualizado exitosamente');
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000);
        fetchProducts();
        closeModal();
      }
    } else {
      const { error } = await supabaseClient.from('products').insert([dbPayload]);
      if (error) alert('Error al guardar: ' + error.message);
      else {
        setModalMessage('Producto agregado exitosamente');
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000);
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

  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      alert('No se pudo acceder a la cámara. Verifica los permisos de tu navegador.');
      setIsCameraOpen(false);
    }
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the frame on canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to blob and upload
    setIsUploadingPic(true);
    canvas.toBlob(async (blob) => {
      if (!blob) {
        alert('Error al procesar la imagen.');
        setIsUploadingPic(false);
        return;
      }
      
      const fileName = `producto_${Date.now()}.jpg`;
      const { error: uploadError } = await supabaseClient.storage.from('productos').upload(fileName, blob, { contentType: 'image/jpeg' });
      
      if (uploadError) {
        console.error('Error al subir la imagen:', uploadError);
        alert('Error al subir la imagen a Supabase.');
        setIsUploadingPic(false);
        return;
      }
      
      const { data } = supabaseClient.storage.from('productos').getPublicUrl(fileName);
      setForm(prev => ({ ...prev, img: data.publicUrl }));
      
      setIsUploadingPic(false);
      closeCamera();
    }, 'image/jpeg', 0.8);
  };

  const handleExportCSV = async () => {
    try {
      const { data, error } = await supabaseClient.from('products').select('*');
      if (error) throw error;
      
      if (!data || data.length === 0) {
        alert("No hay productos guardados para exportar.");
        return;
      }

      const headers = ['id', 'name', 'price', 'old_price', 'stock', 'category', 'image_url', 'is_offer'];
      const csvRows = [];
      csvRows.push(headers.join(','));

      for (const product of data) {
        const row = headers.map(header => {
          let value = product[header] !== null && product[header] !== undefined ? product[header] : '';
          value = String(value).replace(/"/g, '""');
          return `"${value}"`;
        });
        csvRows.push(row.join(','));
      }

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Corrección estricta para forzar el nombre y extensión
      const link = document.createElement('a');
      link.href = url;
      link.download = 'todo_golosinas_backup.csv'; 
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      // Limpieza
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error("Error al exportar:", err);
      alert("Hubo un error al intentar exportar el archivo CSV.");
    }
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      
      // Native CSV Parser
      const parseCSV = (str) => {
        const arr = [];
        let quote = false;
        for (let row = 0, col = 0, c = 0; c < str.length; c++) {
          let cc = str[c], nc = str[c+1];
          arr[row] = arr[row] || [];
          arr[row][col] = arr[row][col] || '';
          if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
          if (cc == '"') { quote = !quote; continue; }
          if (cc == ',' && !quote) { ++col; continue; }
          if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
          if (cc == '\n' && !quote) { ++row; col = 0; continue; }
          if (cc == '\r' && !quote) { ++row; col = 0; continue; }
          arr[row][col] += cc;
        }
        return arr;
      };

      const rows = parseCSV(text).filter(r => r.length > 1 || r[0] !== '');
      if (rows.length < 2) return alert('El CSV está vacío o es inválido.');
      
      const headers = rows[0].map(h => h.trim());
      const parsedData = [];
      
      for (let i = 1; i < rows.length; i++) {
        const rowData = rows[i];
        const row = {};
        headers.forEach((header, index) => {
          let val = rowData[index] !== undefined ? rowData[index].trim() : '';
          
          if (header === 'price' || header === 'old_price') {
             val = val ? parseFloat(val) : null;
          } else if (header === 'is_offer' || header === 'is_featured' || header === 'in_stock') {
             val = val.toLowerCase() === 'true';
          }
          
          // Only add properties that exist in headers
          if (header) row[header] = val;
        });
        parsedData.push(row);
      }
      
      if (window.confirm(`¿Estás seguro de que deseas importar ${parsedData.length} productos? Esto podría sobrescribir datos existentes.`)) {
        setIsSaving(true);
        const { error } = await supabaseClient.from('products').upsert(parsedData);
        setIsSaving(false);
        if (error) {
          alert('Error al importar CSV: ' + error.message);
        } else {
          alert('Productos importados exitosamente.');
          fetchProducts();
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 md:justify-between mb-6">
          <h2 className="font-display font-bold text-2xl text-ink">Catálogo de Productos</h2>
          <div className="grid grid-cols-2 md:flex md:flex-row md:flex-wrap md:items-center gap-2">
            <button onClick={handleExportCSV} title="Exportar CSV" className="flex justify-center items-center gap-1.5 bg-emerald-500 text-white font-bold text-sm px-4 py-2.5 rounded-full hover:bg-emerald-600 transition-all shadow-md active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              <span className="hidden sm:inline md:inline">Exportar</span>
            </button>
            
            <label title="Importar CSV" className="flex justify-center items-center gap-1.5 bg-gray-600 text-white font-bold text-sm px-4 py-2.5 rounded-full hover:bg-gray-700 transition-all shadow-md cursor-pointer active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              <span className="hidden sm:inline md:inline">Importar</span>
              <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
            </label>

            <button onClick={() => openModal(null)} className="col-span-2 md:col-auto w-full md:w-auto flex justify-center items-center gap-1.5 bg-brand text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-brand-dark transition-all shadow-md active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              Nuevo <span className="text-white/60 text-[10px] sm:text-xs ml-0.5">(F4)</span>
            </button>
          </div>
        </div>

        <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <span className="text-sm font-semibold text-ink-muted">Total: {products.length} productos</span>
          </div>
          {/* Vista de Tarjetas para Móviles */}
          <div className="grid grid-cols-1 gap-4 md:hidden p-4">
            {products.length === 0 && (
              <div className="py-8 text-center text-ink-muted">No hay productos cargados en el catálogo.</div>
            )}
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
                {/* Fila 1: Imagen, Nombre y Categoría */}
                <div className="flex gap-3 items-center">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200/50 shadow-sm">
                    <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-ink text-base truncate">{p.name}</h3>
                    <p className="text-xs text-ink-muted uppercase tracking-wider font-semibold truncate">{p.category} • {p.unit}</p>
                  </div>
                </div>

                {/* Fila 2: Precio y Badges */}
                <div className="flex items-center justify-between mt-1">
                  <div className="text-lg font-bold text-ink">{fmt(p.price)}</div>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    {p.isFeatured && <span className="bg-purple/10 text-purple text-[10px] font-bold px-2 py-1 rounded-full border border-purple/20">Destacado</span>}
                    {p.isOffer && <span className="bg-accent/20 text-accent-dark text-[10px] font-bold px-2 py-1 rounded-full border border-accent/40">Oferta</span>}
                    {!p.inStock && <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full border border-red-200">Agotado</span>}
                  </div>
                </div>

                {/* Fila 3: Botones de Acción */}
                <div className="flex gap-2 border-t border-gray-100 pt-3 mt-1">
                  <button onClick={() => toggleStock(p.id, p.inStock)} title={p.inStock ? "Marcar como Agotado" : "Reponer Stock"}
                    className={`flex-none flex items-center justify-center py-2 px-3 rounded-lg transition-colors ${p.inStock ? 'bg-gray-100 text-ink-muted hover:bg-gray-200 hover:text-ink' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
                    {p.inStock ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    )}
                  </button>
                  <button onClick={() => openModal(p)}
                    className="flex-1 flex items-center justify-center gap-1 bg-gray-100 text-ink-muted hover:bg-gray-200 hover:text-ink font-bold text-sm py-2 rounded-lg transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(p.id)}
                    className="flex-1 flex items-center justify-center gap-1 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 font-bold text-sm py-2 rounded-lg transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Vista de Tabla para Desktop */}
          <div className="hidden md:block overflow-x-auto">
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
                    <div className="flex gap-2">
                      <input type="text" value={form.img} onChange={e => setForm({...form, img: e.target.value})} className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="https://..." />
                      <button type="button" onClick={openCamera} className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center shadow-sm" title="Tomar foto con la cámara">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </button>
                    </div>
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

      <AnimatePresence>
        {isCameraOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-surface w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-display font-bold text-xl text-ink">Tomar Foto</h3>
                <button type="button" onClick={closeCamera} disabled={isUploadingPic} className="p-2 text-ink-muted hover:text-ink hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="relative bg-black flex-1 min-h-[300px] flex items-center justify-center">
                <video ref={videoRef} className="w-full max-h-[60vh] object-contain" playsInline autoPlay muted />
                <canvas ref={canvasRef} className="hidden" />
                {isUploadingPic && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white">
                    <svg className="animate-spin h-8 w-8 text-emerald-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span className="font-semibold text-sm">Subiendo foto...</span>
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-50 flex gap-3 justify-center">
                <button type="button" onClick={closeCamera} disabled={isUploadingPic} className="flex-1 max-w-[140px] bg-gray-200 text-ink font-bold text-sm py-3 rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50">
                  Cancelar
                </button>
                <button type="button" onClick={capturePhoto} disabled={isUploadingPic} className="flex-1 max-w-[140px] bg-emerald-500 text-white font-bold text-sm py-3 rounded-xl hover:bg-emerald-600 transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Capturar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mt-4">¡Éxito!</h3>
              <p className="text-gray-500 mt-2">{modalMessage}</p>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="mt-6 w-full bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand-dark transition-colors shadow-md">
                Aceptar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
