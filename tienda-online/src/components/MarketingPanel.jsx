import { useState, useEffect } from 'react';
import { supabaseClient } from '../utils';

export default function MarketingPanel({ showNotification }) {
  const [customers, setCustomers] = useState([]);
  const [promoText, setPromoText] = useState('¡Hola! Te escribimos de Todo Golosinas Famaillá para contarte sobre nuestra oferta especial del día: \n\n');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    const { data, error } = await supabaseClient
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
      if (showNotification) showNotification('Error al cargar clientes', 'error');
    } else {
      setCustomers(data || []);
    }
    setIsLoading(false);
  };

  const handleExportCSV = () => {
    if (!customers || customers.length === 0) {
      if (showNotification) showNotification('No hay contactos para exportar.', 'error');
      return;
    }

    const headers = ['Nombre', 'Telefono'];
    const csvRows = [headers.join(',')];

    for (const c of customers) {
      const name = `"${(c.name || '').replace(/"/g, '""')}"`;
      const phone = `"${(c.phone || '').replace(/"/g, '""')}"`;
      csvRows.push(`${name},${phone}`);
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'clientes_marketing.csv';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    if (showNotification) showNotification('Contactos exportados correctamente', 'success');
  };

  const handleSendOffer = (phone) => {
    if (!phone) {
      if (showNotification) showNotification('El cliente no tiene teléfono válido', 'error');
      return;
    }
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(promoText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in zoom-in duration-300">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 md:justify-between mb-8">
        <h2 className="font-display font-bold text-3xl text-ink">Marketing y Clientes</h2>
        <button 
          onClick={handleExportCSV} 
          className="flex justify-center items-center gap-1.5 bg-emerald-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-emerald-600 transition-all shadow-sm active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Exportar Contactos
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Redactor de Mensaje */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
            <h3 className="font-bold text-lg text-ink mb-4 flex items-center gap-2">
              <span className="text-xl">✍️</span> Redactar Oferta
            </h3>
            <p className="text-sm text-ink-muted mb-4">
              Escribe el mensaje que enviarás a tus clientes. 
              <br/><br/>
              <strong className="text-brand">Importante:</strong> La imagen de la oferta deberá adjuntarse manualmente en WhatsApp antes de enviar el mensaje.
            </p>
            <textarea
              className="w-full flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none min-h-[200px]"
              value={promoText}
              onChange={(e) => setPromoText(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
            ></textarea>
          </div>
        </div>

        {/* Tabla de Clientes */}
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <span className="text-sm font-semibold text-ink-muted">Total: {customers.length} clientes</span>
            </div>
            
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand"></div>
                </div>
              ) : customers.length === 0 ? (
                <div className="py-12 text-center text-ink-muted">No hay clientes registrados aún.</div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase font-bold tracking-wider text-ink-muted border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-6 py-4">Teléfono</th>
                      <th className="px-6 py-4">Fecha Registro</th>
                      <th className="px-6 py-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customers.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-ink">{c.name}</td>
                        <td className="px-6 py-4 text-ink-muted">{c.phone}</td>
                        <td className="px-6 py-4 text-ink-muted text-xs font-medium">
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleSendOffer(c.phone)}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-500 hover:text-white font-bold text-xs rounded-lg transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                            Enviar Oferta
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
