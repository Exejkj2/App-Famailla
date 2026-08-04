import React from 'react';
import { WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from '../utils';

export default function Ubicacion() {
  return (
    <section className="bg-bg min-h-screen pt-24 pb-16">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Título de la sección */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand/10 text-brand font-bold text-xs uppercase tracking-wider mb-3">
            Visítanos
          </span>
          <h1 className="font-display font-black text-4xl md:text-5xl text-ink tracking-tight mb-4">
            Dónde encontrarnos
          </h1>
          <p className="text-ink-muted max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Te esperamos en nuestro local en Famaillá. Vení a conocer nuestra amplia variedad de golosinas, chocolates y snacks, tanto por mayor como por menor.
          </p>
        </div>

        {/* Grid de Ubicación y Mapa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch bg-white rounded-3xl shadow-xl shadow-brand/5 border border-gray-100 overflow-hidden">
          
          {/* Columna 1: Datos */}
          <div className="p-8 md:p-12 flex flex-col justify-center gap-8">
            <h2 className="font-display font-bold text-2xl text-ink border-b border-gray-100 pb-4">
              Información del Local
            </h2>

            <div className="flex flex-col gap-6">
              
              {/* Dirección */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center shrink-0">
                  <span className="text-2xl">📍</span>
                </div>
                <div>
                  <h3 className="font-bold text-ink mb-1 text-lg">Dirección</h3>
                  <p className="text-ink-muted text-sm leading-relaxed">
                    Lavalle 340 (frente al ANSES), Famaillá, Tucumán
                  </p>
                </div>
              </div>

              {/* Horarios */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                  <span className="text-2xl">🕒</span>
                </div>
                <div>
                  <h3 className="font-bold text-ink mb-1 text-lg">Horarios de Atención</h3>
                  <p className="text-ink-muted text-sm leading-relaxed">
                    Lunes a Sábados:<br />
                    <span className="font-semibold text-gray-600">09:00 a 13:00</span> y <span className="font-semibold text-gray-600">17:30 a 21:30</span>
                  </p>
                </div>
              </div>

              {/* Contacto */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <span className="text-2xl">💬</span>
                </div>
                <div>
                  <h3 className="font-bold text-ink mb-1 text-lg">Contacto</h3>
                  <p className="text-ink-muted text-sm leading-relaxed mb-2">
                    Escribinos por WhatsApp para consultas sobre stock o ventas mayoristas.
                  </p>
                  <a 
                    href={`https://wa.me/${WHATSAPP_NUMBER}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold text-sm rounded-xl transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                    +54 {WHATSAPP_DISPLAY}
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* Columna 2: Mapa */}
          <div className="w-full h-full flex bg-gray-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!3m2!1ses!2sar!4v1785856495104!5m2!1ses!2sar!6m8!1m7!1snJr7ZeALCrc8q5gSSyVYYg!2m2!1d-27.05556632270596!2d-65.40193326694619!3f175.09311321826914!4f-18.078509550304346!5f0.4000000000000002"
              className="w-full h-80 md:h-full min-h-[300px] rounded-xl shadow-lg"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Mapa de ubicación de Todo Golosinas en Famaillá"
            ></iframe>
          </div>

        </div>
      </div>
    </section>
  );
}
