import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  {
    value: '+10',
    label: 'Años de Experiencia',
    description: 'Trabajando con pasión y dedicación para endulzar cada momento de nuestros clientes.',
    icon: '🎂'
  },
  {
    value: '+5',
    label: 'Sucursales en Tucumán',
    description: 'Estratégicamente ubicadas para brindarte la mejor atención mayorista y minorista.',
    icon: '📍'
  },
  {
    value: '10k',
    label: 'Clientes Felices',
    description: 'Familias y negocios locales que confían día a día en nuestra calidad y precios.',
    icon: '❤️'
  }
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function SobreNosotros() {
  return (
    <div className="pt-16 min-h-screen bg-bg">
      {/* ═══════ Hero Section ═══════ */}
      <section className="relative bg-surface overflow-hidden border-b border-gray-100">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center md:text-left"
          >
            <p className="text-brand font-bold text-sm tracking-[0.2em] uppercase mb-3">
              Nuestra Historia
            </p>
            <h1 className="font-display font-black text-ink leading-tight tracking-tight mb-6" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
              ENDULZANDO <br className="hidden md:block" />
              <span className="text-brand">TUS MOMENTOS</span>
            </h1>
            <p className="text-ink-muted text-base sm:text-lg leading-relaxed mb-6 max-w-2xl mx-auto md:mx-0">
              Somos una empresa familiar tucumana apasionada por lo que hacemos. 
              Nacimos con el sueño de ofrecer la mayor variedad de golosinas y snacks, 
              y gracias a la confianza de nuestros clientes, hoy somos referentes en toda la provincia.
            </p>
            <p className="text-ink-muted text-base sm:text-lg leading-relaxed max-w-2xl mx-auto md:mx-0 font-medium">
              Ya sea para tu negocio, un cumpleaños, o simplemente para darte un gusto, 
              en Todo Golosinas Famaillá encontrarás la calidad, los precios y la atención que mereces.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 w-full max-w-md md:max-w-none relative"
          >
            <div className="aspect-square rounded-[3rem] rotate-3 relative shadow-2xl overflow-hidden border-4 border-white bg-gray-100">
              <img 
                src="/family.png" 
                alt="Familia & Tradición" 
                className="w-full h-full object-cover -rotate-3 scale-[1.15]" 
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center text-white text-xl shadow-inner">
                ⭐
              </div>
              <div>
                <p className="text-xs text-ink-muted font-bold uppercase tracking-wider">Calidad</p>
                <p className="font-display font-black text-ink leading-none mt-1">Garantizada</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ Stats Section ═══════ */}
      <section className="py-20 relative z-10 -mt-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="bg-white rounded-3xl p-8 shadow-xl shadow-ink/5 border border-gray-50 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand/10 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-pink-50 text-brand flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:bg-brand group-hover:text-white transition-all duration-300">
                {stat.icon}
              </div>
              <h3 className="font-display font-black text-5xl text-ink mb-2">
                {stat.value}
              </h3>
              <p className="text-brand font-bold text-sm uppercase tracking-widest mb-4">
                {stat.label}
              </p>
              <p className="text-ink-muted text-sm leading-relaxed">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════ Final CTA ═══════ */}
      <section className="py-24 bg-gradient-to-b from-bg to-pink-50/50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display font-black text-ink text-3xl sm:text-4xl mb-6">
            ¿Querés conocer nuestros productos?
          </h2>
          <p className="text-ink-muted mb-10 max-w-xl mx-auto">
            Visitanos en cualquiera de nuestras sucursales o comprá cómodamente desde tu casa a través de nuestra tienda online.
          </p>
          <a href="#productos" onClick={() => window.scrollTo(0,0)} className="inline-block bg-brand text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg shadow-brand/30 hover:bg-brand-dark transition-all duration-200 hover:-translate-y-1 active:scale-95">
            Ir a la tienda
          </a>
        </div>
      </section>
    </div>
  );
}
