import { motion } from 'framer-motion';
import { WHATSAPP_DISPLAY } from '../utils';

const NAV_LINKS = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Productos', href: '#productos' },
  { label: 'Ofertas', href: '#ofertas-semana' },
  { label: 'Nosotros', href: '#nosotros' },
];

const CONTACT_ITEMS = [
  { icon: '📍', text: 'Famaillá, Tucumán, Argentina' },
  { icon: '📞', text: `+54 ${WHATSAPP_DISPLAY}` },
  { icon: '✉️', text: 'ventas@todogolosinas.com' },
  { icon: '🕐', text: 'Lun - Sáb: 8:00 a 20:00' },
];

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    href: '#',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    href: '#',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: 'WhatsApp',
    href: '#',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
];

function FooterMarquee() {
  const items = ['TODO GOLOSINAS', '✦', 'FAMAILLÁ', '✦', 'MAYORISTA & MINORISTA', '✦', 'ENVÍOS A TODO EL PAÍS', '✦'];
  const repeated = [...items, ...items, ...items];
  return (
    <div className="overflow-hidden border-b border-white/[0.06] py-5">
      <div className="marquee-track flex whitespace-nowrap">
        {repeated.map((t, i) => (
          <span
            key={i}
            className={`mx-8 font-display font-black tracking-[0.3em] uppercase ${
              t === '✦' ? 'text-brand text-sm' : 'text-white/[0.07] text-2xl md:text-4xl'
            }`}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="nosotros" className="relative bg-ink overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand/[0.06] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple/[0.05] rounded-full blur-[100px] pointer-events-none" />

      {/* Marquee band */}
      <FooterMarquee />

      {/* Main footer content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">

          {/* Brand column */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center shadow-lg shadow-brand/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                  <path d="M11 17H7l-4-4 4-4h4l-3 4 3 4zm2 0 3-4-3-4h4l4 4-4 4h-4z"/>
                </svg>
              </span>
              <div>
                <div className="font-display font-black text-lg text-white tracking-tight leading-none">TODO GOLOSINAS</div>
                <div className="text-[9px] font-bold tracking-[0.3em] uppercase text-brand/70 mt-0.5">Famaillá, Tucumán</div>
              </div>
            </div>
            <p className="text-sm text-white/40 leading-relaxed max-w-sm mb-6">
              Distribuidora de golosinas y snacks en Famaillá, Tucumán. Más de 15 años
              ofreciendo los mejores productos al mejor precio. Venta mayorista y minorista.
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-brand hover:bg-brand/10 hover:border-brand/30 transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation column */}
          <div className="md:col-span-3">
            <h3 className="font-display font-bold text-[11px] tracking-[0.25em] uppercase text-white/30 mb-5">
              Navegación
            </h3>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors duration-300"
                  >
                    <span className="w-0 h-px bg-brand group-hover:w-4 transition-all duration-300" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div className="md:col-span-4">
            <h3 className="font-display font-bold text-[11px] tracking-[0.25em] uppercase text-white/30 mb-5">
              Contacto
            </h3>
            <ul className="space-y-3.5">
              {CONTACT_ITEMS.map((item) => (
                <li key={item.text} className="flex items-start gap-3 text-sm text-white/50 group">
                  <span className="text-base mt-0.5 group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                  <span className="group-hover:text-white/70 transition-colors duration-300">{item.text}</span>
                </li>
              ))}
            </ul>

            {/* CTA mini */}
            <a
              href="#productos"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold uppercase tracking-wider hover:bg-brand/20 hover:border-brand/40 transition-all duration-300"
            >
              <span>Ver catálogo</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="relative h-px mb-8">
          <div className="absolute inset-0 bg-white/[0.06]" />
          <div className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-ink px-4">
            <span className="text-brand text-xs">✦</span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[11px] text-white/25 tracking-wider">
            © {currentYear} Todo Golosinas Famaillá. Todos los derechos reservados.
          </p>
          <p className="text-[11px] text-white/25 tracking-wider flex items-center gap-1.5">
            Hecho con <span className="text-brand animate-pulse">♥</span> y 🍬 en Tucumán
          </p>
        </div>
      </div>
    </footer>
  );
}
