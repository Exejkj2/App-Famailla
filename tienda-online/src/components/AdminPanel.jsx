import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseClient, mapToSupabase, fmt } from '../utils';
import MarketingPanel from './MarketingPanel';

const toTitleCase = (str) => {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
};

export default function AdminPanel({ products, fetchProducts, onLogout }) {
  const defaultForm = { name: '', price: '', img: '', isFeatured: false, isOffer: false, inStock: true, category: '', unit: 'Unidad' };
  const [form, setForm] = useState(defaultForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  
  // Dashboard states
  const [activeTab, setActiveTab] = useState('resumen');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Categories state
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryNameInline, setNewCategoryNameInline] = useState('');

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Orders state
  const [orders, setOrders] = useState([]);
  
  // Auth states
  const [session, setSession] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // --- NUEVOS ESTADOS DE NOTIFICACION Y CONFIRMACION ---
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    const { error } = await supabaseClient.auth.signInWithPassword({ email: authEmail, password: authPassword });
    if (error) {
      showNotification('Credenciales incorrectas', 'error');
    }
    setIsAuthenticating(false);
  };

  // --- NUEVOS ESTADOS DE ESTADÍSTICAS ---
  const [stats, setStats] = useState({ totalProducts: 0, totalCategories: 0, pendingOrders: 0, totalRevenue: 0, recentOrders: [] });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const [
        { count: prodCount },
        { count: catCount },
        { count: pendingCount },
        { data: allOrders }
      ] = await Promise.all([
        supabaseClient.from('products').select('*', { count: 'exact', head: true }),
        supabaseClient.from('categories').select('*', { count: 'exact', head: true }),
        supabaseClient.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'Pendiente'),
        supabaseClient.from('orders').select('*').order('created_at', { ascending: false })
      ]);
      
      const revenue = (allOrders || []).filter(o => o.status !== 'Cancelado').reduce((s, o) => s + (Number(o.total) || 0), 0);
      const recent = (allOrders || []).slice(0, 5);

      setStats({
        totalProducts: prodCount || 0,
        totalCategories: catCount || 0,
        pendingOrders: pendingCount || 0,
        totalRevenue: revenue,
        recentOrders: recent
      });
    } catch(err) {
      console.error("Error fetching stats", err);
    }
    setIsLoadingStats(false);
  };

  useEffect(() => {
    fetchCategories();
    fetchOrders();
    fetchStats();
    
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabaseClient.from('orders').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error("Error al obtener pedidos:", error);
    } else {
      setOrders(data || []);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const { error } = await supabaseClient.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) {
      showNotification('Error al actualizar pedido: ' + error.message, 'error');
    } else {
      showNotification('Estado del pedido actualizado', 'success');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  const printTicket = (order) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) {
      showNotification('Por favor permite las ventanas emergentes (pop-ups)', 'error');
      return;
    }

    let items = [];
    try {
      items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
    } catch (e) {
      console.error("Error al parsear items del pedido", e);
    }

    let itemsHtml = '';
    items.forEach(item => {
      const q = item.quantity || 1;
      const name = item.name || 'Producto';
      const price = item.price || 0;
      const subtotal = q * price;
      
      itemsHtml += `
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <div style="flex: 1; padding-right: 10px;">${q}x ${name}</div>
          <div style="text-align: right;">${fmt(subtotal)}</div>
        </div>
      `;
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ticket de Venta - ${order.customer_name || ''}</title>
        <style>
          body {
            font-family: monospace;
            max-width: 300px;
            margin: 0 auto;
            padding: 10px;
            color: #000;
            background: #fff;
          }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
          .total { font-size: 1.2em; text-align: right; margin-top: 10px; }
          @media print {
            body { width: 100%; margin: 0; padding: 0; }
            @page { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="text-center">
          <div class="font-bold" style="font-size: 1.1em;">TODO GOLOSINAS FAMAILLÁ</div>
          <div style="margin: 5px 0;">Ticket de Venta</div>
          <div>${new Date(order.created_at).toLocaleString()}</div>
        </div>
        <div class="divider"></div>
        <div>Cliente: ${order.customer_name}</div>
        ${order.customer_phone ? `<div>Tel: ${order.customer_phone}</div>` : ''}
        <div class="divider"></div>
        ${itemsHtml}
        <div class="divider"></div>
        <div class="total font-bold">TOTAL: ${fmt(order.total)}</div>
        
        <script>
          window.onafterprint = function() { window.close(); };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250); // Pequeño delay para asegurar renderizado en algunos navegadores
  };

  const fetchCategories = async () => {
    const { data, error } = await supabaseClient.from('categories').select('*').order('name');
    if (error) {
      console.error("Error al obtener categorías:", error);
    } else {
      setCategories(data || []);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F4') {
        e.preventDefault();
        if (activeTab === 'productos') {
          openModal(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, categories]);

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
      setForm({ ...defaultForm, category: categories.length > 0 ? categories[0].name : '' });
    }
    setIsNewCategory(false);
    setNewCategoryNameInline('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setForm({ ...defaultForm, category: categories.length > 0 ? categories[0].name : '' });
    setIsNewCategory(false);
    setNewCategoryNameInline('');
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      return showNotification('El nombre y el precio son obligatorios', 'error');
    }
    if (Number(form.price) <= 0) {
      return showNotification('El precio debe ser mayor a 0', 'error');
    }
    if (!form.img) {
      return showNotification('La imagen es obligatoria', 'error');
    }
    if (isNewCategory && !newCategoryNameInline.trim()) {
      return showNotification('Ingresa un nombre para la nueva categoría', 'error');
    }
    
    setIsSubmitting(true);
    
    try {
      let finalCategory = form.category || (categories.length > 0 ? categories[0].name : '');
      
      if (isNewCategory && newCategoryNameInline.trim() !== '') {
        const formattedName = toTitleCase(newCategoryNameInline.trim());
        const { error: catError } = await supabaseClient.from('categories').insert([{ name: formattedName }]);
        if (catError) {
          showNotification('Error al guardar la nueva categoría: ' + catError.message, 'error');
          return;
        }
        finalCategory = formattedName;
        fetchCategories(); 
      }

    const productData = {
      ...form,
      name: toTitleCase(form.name),
      category: finalCategory,
      oldPrice: form.isOffer ? Number(form.price) * 1.2 : null,
      badge: form.isOffer ? 'OFERTA' : null,
    };

    const dbPayload = mapToSupabase(productData);

    if (editingProduct) {
      const { error } = await supabaseClient
        .from('products')
        .update(dbPayload)
        .eq('id', editingProduct.id);
        
      if (error) {
        showNotification('Error al actualizar: ' + error.message, 'error');
      } else {
        setModalMessage('Producto actualizado exitosamente');
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000);
        fetchProducts();
        closeModal();
      }
    } else {
      const { error } = await supabaseClient
        .from('products')
        .insert([dbPayload]);
        
      if (error) {
        showNotification('Error al guardar: ' + error.message, 'error');
      } else {
        setModalMessage('Producto agregado exitosamente');
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000);
        fetchProducts();
        closeModal();
      }
    }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStock = async (id, currentStock) => {
    const { error } = await supabaseClient.from('products').update({ in_stock: !currentStock }).eq('id', id);
    if (error) showNotification('Error al actualizar stock: ' + error.message, 'error');
    else fetchProducts();
  };

  const handleDeleteProduct = (id) => {
    setConfirmDialog({
      isOpen: true,
      message: '¿Estás seguro de que deseas eliminar este producto?',
      onConfirm: async () => {
        const { error } = await supabaseClient.from('products').delete().eq('id', id);
        if (error) {
          showNotification('Error al eliminar: ' + error.message, 'error');
        } else {
          showNotification('Producto eliminado exitosamente', 'success');
          fetchProducts();
        }
        setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  // Categories Handlers
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsSubmitting(true);
    try {
    
    const formattedName = toTitleCase(newCatName.trim());
    
    if (editingCategory) {
      const oldName = editingCategory.name;
      const { error } = await supabaseClient.from('categories').update({ name: formattedName }).eq('id', editingCategory.id);
      if (error) {
        showNotification('Error al actualizar categoría: ' + error.message, 'error');
      } else {
        await supabaseClient.from('products').update({ category: formattedName }).eq('category', oldName);
        setEditingCategory(null);
        setNewCatName('');
        fetchCategories();
        fetchProducts();
        showNotification('Categoría actualizada exitosamente', 'success');
      }
    } else {
      const { error } = await supabaseClient.from('categories').insert([{ name: formattedName }]);
      if (error) {
        showNotification('Error al crear categoría: ' + error.message, 'error');
      } else {
        setNewCatName('');
        fetchCategories();
        showNotification('Categoría creada exitosamente', 'success');
      }
    }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setNewCatName(cat.name);
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setNewCatName('');
  };

  const handleDeleteCategory = (id, name) => {
    setConfirmDialog({
      isOpen: true,
      message: `¿Seguro que deseas eliminar la categoría "${name}"? Los productos asociados no se eliminarán pero quedarán desvinculados.`,
      onConfirm: async () => {
        const { error } = await supabaseClient.from('categories').delete().eq('id', id);
        if (error) {
          showNotification('Error al eliminar categoría: ' + error.message, 'error');
        } else {
          showNotification('Categoría eliminada', 'success');
          fetchCategories();
        }
        setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  // Camera Handlers
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      e.target.value = '';
      return showNotification('La imagen es muy pesada. Máximo 5MB.', 'error');
    }

    setIsSubmitting(true);
    const fileName = `producto_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
    const { error: uploadError } = await supabaseClient.storage.from('productos').upload(fileName, file);

    if (uploadError) {
      console.error('Error al subir la imagen:', uploadError);
      showNotification('Error al subir la imagen a Supabase.', 'error');
      setIsSubmitting(false);
      e.target.value = '';
      return;
    }

    const { data } = supabaseClient.storage.from('productos').getPublicUrl(fileName);
    setForm(prev => ({ ...prev, img: data.publicUrl }));
    setIsSubmitting(false);
    e.target.value = '';
    showNotification('Imagen subida correctamente', 'success');
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
      showNotification('No se pudo acceder a la cámara. Verifica los permisos.', 'error');
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
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    setIsUploadingPic(true);
    canvas.toBlob(async (blob) => {
      if (!blob) {
        showNotification('Error al procesar la imagen.', 'error');
        setIsUploadingPic(false);
        return;
      }
      
      const fileName = `producto_${Date.now()}.jpg`;
      const { error: uploadError } = await supabaseClient.storage.from('productos').upload(fileName, blob, { contentType: 'image/jpeg' });
      
      if (uploadError) {
        console.error('Error al subir la imagen:', uploadError);
        showNotification('Error al subir la imagen a Supabase.', 'error');
        setIsUploadingPic(false);
        return;
      }
      
      const { data } = supabaseClient.storage.from('productos').getPublicUrl(fileName);
      setForm(prev => ({ ...prev, img: data.publicUrl }));
      
      setIsUploadingPic(false);
      closeCamera();
    }, 'image/jpeg', 0.8);
  };

  // CSV Handlers
  const handleExportCSV = async () => {
    try {
      const { data, error } = await supabaseClient.from('products').select('*');
      if (error) throw error;
      
      if (!data || data.length === 0) {
        showNotification('No hay productos guardados para exportar.', 'error');
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
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'todo_golosinas_backup.csv'; 
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      showNotification('Exportación completada exitosamente', 'success');
    } catch (err) {
      console.error("Error al exportar:", err);
      showNotification('Hubo un error al intentar exportar el archivo CSV.', 'error');
    }
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      
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
      if (rows.length < 2) return showNotification('El CSV está vacío o es inválido.', 'error');
      
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
          
          if (header) row[header] = val;
        });
        parsedData.push(row);
      }
      
      setConfirmDialog({
        isOpen: true,
        message: `¿Estás seguro de que deseas importar ${parsedData.length} productos? Esto sobrescribirá datos si hay conflictos de ID.`,
        onConfirm: async () => {
          setIsSubmitting(true);
          try {
            const { error } = await supabaseClient.from('products').upsert(parsedData);
            if (error) {
              showNotification('Error al importar CSV: ' + error.message, 'error');
            } else {
              showNotification('Productos importados exitosamente.', 'success');
              fetchProducts();
            }
          } finally {
            setIsSubmitting(false);
          }
          setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
        }
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans relative p-4">
        {/* Toast Notification */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border ${
                notification.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                  : 'bg-red-50 border-red-100 text-red-800'
              }`}
            >
              {notification.type === 'success' ? (
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
              )}
              <p className="font-bold text-sm leading-tight pr-2">{notification.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand rounded-full mx-auto flex items-center justify-center mb-4 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <h1 className="font-display font-black text-2xl text-ink tracking-tight">Todo Golosinas Famaillá</h1>
            <p className="text-sm text-ink-muted mt-2 font-bold uppercase tracking-widest">Admin</p>
          </div>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">Email</label>
              <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required className="w-full bg-gray-50 border border-gray-200 text-ink text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all" placeholder="admin@ejemplo.com" autoFocus />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">Contraseña</label>
              <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required className="w-full bg-gray-50 border border-gray-200 text-ink text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={isAuthenticating} className="mt-4 w-full bg-brand text-white font-bold text-base py-3.5 rounded-xl hover:bg-brand-dark active:scale-[0.98] transition-all shadow-md shadow-brand/20 disabled:opacity-50">
              {isAuthenticating ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
          <button onClick={onLogout} className="mt-6 w-full text-center flex items-center justify-center gap-2 text-ink-muted hover:text-brand font-semibold text-sm transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Volver a la tienda
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border ${
              notification.type === 'success' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                : 'bg-red-50 border-red-100 text-red-800'
            }`}
          >
            {notification.type === 'success' ? (
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
            )}
            <p className="font-bold text-sm leading-tight pr-2">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm w-full text-center border border-gray-100"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">¿Estás seguro?</h3>
              <p className="text-gray-500 text-sm mb-8">{confirmDialog.message}</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmDialog({ isOpen: false, message: '', onConfirm: null })}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDialog.onConfirm}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md shadow-red-500/20"
                >
                  Sí, confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-ink/40 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center mr-3 shadow-md shadow-brand/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <h1 className="font-display font-black text-lg text-ink tracking-tight">Admin</h1>
        </div>
        
        <nav className="p-4 flex flex-col gap-2">
          <button 
            onClick={() => { setActiveTab('resumen'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'resumen' ? 'bg-brand text-white shadow-md shadow-brand/20' : 'text-ink-muted hover:bg-gray-100 hover:text-ink'}`}>
            <span className="text-xl">📊</span> Resumen
          </button>
          <button 
            onClick={() => { setActiveTab('productos'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'productos' ? 'bg-brand text-white shadow-md shadow-brand/20' : 'text-ink-muted hover:bg-gray-100 hover:text-ink'}`}>
            <span className="text-xl">📦</span> Productos
          </button>
          <button 
            onClick={() => { setActiveTab('categorias'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'categorias' ? 'bg-brand text-white shadow-md shadow-brand/20' : 'text-ink-muted hover:bg-gray-100 hover:text-ink'}`}>
            <span className="text-xl">🏷️</span> Categorías
          </button>
          <button 
            onClick={() => { setActiveTab('pedidos'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'pedidos' ? 'bg-brand text-white shadow-md shadow-brand/20' : 'text-ink-muted hover:bg-gray-100 hover:text-ink'}`}>
            <span className="text-xl">🛒</span> Pedidos
          </button>
          <button 
            onClick={() => { setActiveTab('marketing'); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'marketing' ? 'bg-brand text-white shadow-md shadow-brand/20' : 'text-ink-muted hover:bg-gray-100 hover:text-ink'}`}>
            <span className="text-xl">📢</span> Marketing
          </button>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 flex flex-col gap-2">
          <button onClick={() => supabaseClient.auth.signOut()} className="flex items-center gap-2 w-full px-4 py-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Cerrar Sesión
          </button>
          <button onClick={onLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm font-bold text-ink-muted hover:text-brand transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            Salir a la tienda
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/50">
        
        {/* Header móvil */}
        <header className="md:hidden bg-surface h-16 border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-ink hover:bg-gray-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <h1 className="font-display font-black text-lg text-ink tracking-tight">Admin</h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {/* ----- VISTA RESUMEN ----- */}
          {activeTab === 'resumen' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h2 className="font-display font-bold text-3xl text-ink mb-2">Panel de Control</h2>
              
              {isLoadingStats ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1 */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <span className="text-2xl">📦</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-500">Total Productos</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
                      </div>
                    </div>
                    {/* Card 2 */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                        <span className="text-2xl">🏷️</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-500">Total Categorías</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.totalCategories}</p>
                      </div>
                    </div>
                    {/* Card 3 */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                        <span className="text-2xl">⏱️</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-500">Pedidos Pendientes</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.pendingOrders}</p>
                      </div>
                    </div>
                    {/* Card 4 */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <span className="text-2xl">💰</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-500">Ingresos Totales</p>
                        <p className="text-3xl font-bold text-gray-800">{fmt(stats.totalRevenue)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Últimos Pedidos */}
                  <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                      <h3 className="font-bold text-lg text-ink">Últimos Pedidos</h3>
                    </div>
                    <div className="overflow-x-auto">
                      {stats.recentOrders.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No hay pedidos recientes.</div>
                      ) : (
                        <table className="w-full text-left border-collapse min-w-[600px]">
                          <thead>
                            <tr className="bg-white border-b border-gray-100">
                              <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                              <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                              <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                              <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {stats.recentOrders.map(order => (
                              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-6 text-sm font-semibold text-gray-800">{order.customer_name}</td>
                                <td className="py-3 px-6 text-sm font-bold text-brand">{fmt(order.total)}</td>
                                <td className="py-3 px-6 text-sm">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${order.status === 'Completado' ? 'bg-emerald-100 text-emerald-800' : order.status === 'Cancelado' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="py-3 px-6 text-sm text-gray-500">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ----- VISTA PRODUCTOS ----- */}
          {activeTab === 'productos' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 md:justify-between mb-8">
                <h2 className="font-display font-bold text-3xl text-ink">Catálogo</h2>
                <div className="grid grid-cols-2 md:flex md:flex-row md:flex-wrap md:items-center gap-2">
                  <button onClick={handleExportCSV} title="Exportar CSV" className="flex justify-center items-center gap-1.5 bg-emerald-500 text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-emerald-600 transition-all shadow-sm active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    <span className="hidden sm:inline md:inline">Exportar</span>
                  </button>
                  <label title="Importar CSV" className="flex justify-center items-center gap-1.5 bg-ink text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-all shadow-sm cursor-pointer active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                    <span className="hidden sm:inline md:inline">Importar</span>
                    <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
                  </label>
                  <button onClick={() => openModal(null)} className="col-span-2 md:col-auto w-full md:w-auto flex justify-center items-center gap-1.5 bg-brand text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-brand-dark transition-all shadow-md shadow-brand/20 active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                    Nuevo Producto
                  </button>
                </div>
              </div>

              {/* Buscador */}
              <div className="mb-6 relative w-full max-w-md">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                </div>
                <input type="text" className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-white text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm shadow-sm transition-all" placeholder="Buscar por nombre o categoría..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>

              <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <span className="text-sm font-semibold text-ink-muted">Total: {filteredProducts.length} productos</span>
                </div>
                
                {/* Mobile Cards */}
                <div className="grid grid-cols-1 gap-4 md:hidden p-4">
                  {filteredProducts.length === 0 && <div className="py-8 text-center text-ink-muted">No hay productos que coincidan.</div>}
                  {filteredProducts.map(p => (
                    <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
                      <div className="flex gap-3 items-center">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200/50">
                          <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-ink text-base truncate">{p.name}</h3>
                          <p className="text-xs text-ink-muted uppercase tracking-wider font-semibold truncate">{p.category} • {p.unit}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-lg font-bold text-ink">{fmt(p.price)}</div>
                        <div className="flex gap-1.5 flex-wrap justify-end">
                          {p.isFeatured && <span className="bg-purple/10 text-purple text-[10px] font-bold px-2 py-1 rounded-full border border-purple/20">Destacado</span>}
                          {p.isOffer && <span className="bg-accent/20 text-accent-dark text-[10px] font-bold px-2 py-1 rounded-full border border-accent/40">Oferta</span>}
                          {!p.inStock && <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full border border-red-200">Agotado</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 border-t border-gray-100 pt-3 mt-1">
                        <button onClick={() => toggleStock(p.id, p.inStock)} className={`flex-none flex items-center justify-center py-2 px-3 rounded-lg transition-colors ${p.inStock ? 'bg-gray-100 text-ink-muted hover:bg-gray-200' : 'bg-emerald-100 text-emerald-700'}`}>
                          {p.inStock ? <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                        </button>
                        <button onClick={() => openModal(p)} className="flex-1 flex items-center justify-center gap-1 bg-gray-100 text-ink-muted hover:bg-gray-200 font-bold text-sm py-2 rounded-lg transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg> Editar
                        </button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="flex-1 flex items-center justify-center gap-1 bg-red-50 text-red-500 hover:bg-red-100 font-bold text-sm py-2 rounded-lg transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg> Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
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
                      {filteredProducts.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="px-6 py-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200/50">
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
                              <button onClick={() => toggleStock(p.id, p.inStock)} className={`p-2 rounded-lg transition-colors ${p.inStock ? 'text-ink-muted hover:bg-gray-200' : 'text-emerald-600 hover:bg-emerald-100'}`}>
                                {p.inStock ? <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                              </button>
                              <button onClick={() => openModal(p)} className="p-2 text-ink-muted hover:bg-gray-200 hover:text-ink rounded-lg transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                              </button>
                              <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredProducts.length === 0 && <div className="py-12 text-center text-ink-muted">No hay productos que coincidan.</div>}
                </div>
              </div>
            </motion.div>
          )}

          {/* ----- VISTA CATEGORIAS ----- */}
          {activeTab === 'categorias' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
              <h2 className="font-display font-bold text-3xl text-ink mb-8">Gestor de Categorías</h2>
              
              <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <h3 className="font-bold text-lg text-ink mb-4">{editingCategory ? 'Editar Categoría' : 'Agregar Nueva Categoría'}</h3>
                <form onSubmit={handleSaveCategory} className="flex flex-col sm:flex-row gap-4">
                  <input 
                    type="text" 
                    value={newCatName} 
                    onChange={e => setNewCatName(e.target.value)} 
                    placeholder="Ej. Alfajores Premium" 
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    {editingCategory && (
                      <button type="button" onClick={handleCancelEditCategory} className="px-5 py-3 bg-gray-200 hover:bg-gray-300 text-ink font-bold text-sm rounded-xl transition-colors">
                        Cancelar
                      </button>
                    )}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button type="submit" disabled={isSubmitting || !newCatName.trim()} className="flex-1 sm:flex-none px-6 py-3 bg-brand hover:bg-brand-dark text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-brand/20 disabled:opacity-50">
                        {isSubmitting ? 'Guardando...' : (editingCategory ? 'Actualizar' : 'Agregar')}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <span className="text-sm font-semibold text-ink-muted">Total: {categories.length} categorías</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {categories.length === 0 && (
                    <div className="py-12 text-center text-ink-muted">No hay categorías cargadas.</div>
                  )}
                  {categories.map(cat => (
                    <div key={cat.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                      <div className="font-bold text-ink text-base">{cat.name}</div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditCategory(cat)} className="p-2 text-ink-muted hover:bg-gray-200 hover:text-ink rounded-lg transition-colors" title="Editar">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" title="Eliminar">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ----- VISTA PEDIDOS ----- */}
          {activeTab === 'pedidos' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 md:justify-between mb-8">
                <h2 className="font-display font-bold text-3xl text-ink">Gestor de Pedidos</h2>
              </div>
              
              <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <span className="text-sm font-semibold text-ink-muted">Total: {orders.length} pedidos</span>
                </div>
                
                {/* Mobile Cards */}
                <div className="grid grid-cols-1 gap-4 md:hidden p-4">
                  {orders.length === 0 && <div className="py-8 text-center text-ink-muted">No hay pedidos registrados.</div>}
                  {orders.map(o => (
                    <div key={o.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start border-b border-gray-50 pb-2">
                        <div>
                          <p className="text-xs text-ink-muted font-bold uppercase tracking-wider">{new Date(o.created_at).toLocaleString()}</p>
                          <h3 className="font-bold text-ink text-base">{o.customer_name}</h3>
                          <p className="text-sm text-ink-muted">📞 {o.customer_phone}</p>
                        </div>
                        <div className="text-lg font-bold text-brand">{fmt(o.total)}</div>
                      </div>
                      <div className="pt-2 flex flex-col gap-2 border-t border-gray-50 mt-1">
                        <select
                          value={o.status || 'Pendiente'}
                          onChange={e => updateOrderStatus(o.id, e.target.value)}
                          className={`w-full font-bold text-sm px-3 py-2 rounded-lg border-none focus:ring-2 focus:ring-brand/50 transition-colors appearance-none ${
                            o.status === 'Pendiente' ? 'bg-amber-100 text-amber-800' :
                            o.status === 'Preparando' ? 'bg-blue-100 text-blue-800' :
                            o.status === 'Entregado' ? 'bg-emerald-100 text-emerald-800' :
                            o.status === 'Cancelado' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <option value="Pendiente" className="bg-white text-ink">Pendiente</option>
                          <option value="Preparando" className="bg-white text-ink">Preparando</option>
                          <option value="Entregado" className="bg-white text-ink">Entregado</option>
                          <option value="Cancelado" className="bg-white text-ink">Cancelado</option>
                        </select>
                        <button onClick={() => printTicket(o)} className="flex items-center justify-center gap-2 w-full py-2 border border-gray-300 rounded-lg text-ink font-bold text-sm hover:bg-gray-50 transition-colors">
                          🖨️ Imprimir Ticket
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs uppercase font-bold tracking-wider text-ink-muted border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4">Fecha</th>
                        <th className="px-6 py-4">Cliente</th>
                        <th className="px-6 py-4">Teléfono</th>
                        <th className="px-6 py-4">Total</th>
                        <th className="px-6 py-4 text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map(o => (
                        <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-ink-muted font-medium">
                            {new Date(o.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 font-bold text-ink">{o.customer_name}</td>
                          <td className="px-6 py-4 text-ink-muted">{o.customer_phone}</td>
                          <td className="px-6 py-4 font-bold text-brand">{fmt(o.total)}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => printTicket(o)} className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-ink font-bold text-xs hover:bg-gray-50 transition-colors" title="Imprimir Ticket">
                                🖨️ Imprimir
                              </button>
                              <select
                                value={o.status || 'Pendiente'}
                                onChange={e => updateOrderStatus(o.id, e.target.value)}
                                className={`font-bold text-sm px-3 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-brand/50 transition-colors cursor-pointer outline-none ${
                                  o.status === 'Pendiente' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' :
                                  o.status === 'Preparando' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                                  o.status === 'Entregado' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' :
                                  o.status === 'Cancelado' ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                <option value="Pendiente" className="bg-white text-ink text-left">Pendiente</option>
                                <option value="Preparando" className="bg-white text-ink text-left">Preparando</option>
                                <option value="Entregado" className="bg-white text-ink text-left">Entregado</option>
                                <option value="Cancelado" className="bg-white text-ink text-left">Cancelado</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && <div className="py-12 text-center text-ink-muted">No hay pedidos registrados.</div>}
                </div>
              </div>
            </motion.div>
          )}

          {/* ----- VISTA MARKETING ----- */}
          {activeTab === 'marketing' && (
            <MarketingPanel showNotification={showNotification} />
          )}

        </main>
      </div>

      {/* Modal Crear/Editar Producto */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm overflow-y-auto">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-surface w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-auto">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 sticky top-0 z-10">
                <h3 className="font-display font-bold text-xl text-ink">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
                <button onClick={closeModal} className="p-2 text-ink-muted hover:text-ink hover:bg-gray-200 rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <form onSubmit={handleSubmitProduct} id="productForm" className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">Nombre</label>
                    <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent" placeholder="Ej. Caramelos..." autoFocus />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">Precio ($)</label>
                      <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent" placeholder="850" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">Categoría</label>
                      {!isNewCategory ? (
                        <select 
                          value={form.category} 
                          onChange={e => {
                            if (e.target.value === 'NUEVA') {
                              setIsNewCategory(true);
                            } else {
                              setForm({...form, category: e.target.value});
                            }
                          }} 
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                        >
                          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                          {categories.length === 0 && <option value="">Sin categorías...</option>}
                          <option value="NUEVA" className="font-bold text-brand">+ Crear nueva categoría...</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input 
                            type="text" 
                            value={newCategoryNameInline} 
                            onChange={e => setNewCategoryNameInline(e.target.value)} 
                            className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent" 
                            placeholder="Nombre de categoría" 
                            autoFocus
                          />
                          <button 
                            type="button" 
                            onClick={() => { setIsNewCategory(false); setNewCategoryNameInline(''); }}
                            className="flex-shrink-0 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 p-2 rounded-full transition-colors flex items-center justify-center"
                            title="Cancelar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">URL de Imagen</label>
                    <div className="flex gap-2">
                      <input type="text" value={form.img} onChange={e => setForm({...form, img: e.target.value})} className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent" placeholder="https://..." />
                      
                      <input type="file" accept="image/*" className="hidden" id="productImageUpload" onChange={handleImageUpload} />
                      <button type="button" onClick={() => document.getElementById('productImageUpload').click()} disabled={isSubmitting} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center shadow-sm disabled:opacity-50 shrink-0" title="Subir desde dispositivo">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      </button>

                      <button type="button" onClick={openCamera} disabled={isSubmitting} className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center shadow-sm disabled:opacity-50 shrink-0" title="Tomar foto con la cámara">
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
                </form>
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                <div className="flex gap-3">
                  <button type="button" onClick={closeModal} className="flex-1 bg-gray-200 text-ink font-bold text-sm py-3 rounded-xl hover:bg-gray-300 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" form="productForm" disabled={isSubmitting} className="flex-1 bg-ink text-white font-bold text-sm py-3 rounded-xl hover:bg-black transition-colors shadow-md disabled:opacity-50">
                    {isSubmitting ? 'Guardando...' : (editingProduct ? 'Actualizar' : 'Guardar')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCameraOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
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
            className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
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
