import { useState, useEffect, useCallback } from 'react';

const slides = [
  { src: '/carousel/promo-100mil.jpg', alt: '7% de descuento con compras de 100 mil' },
  { src: '/carousel/promo-30mil.jpg',  alt: '3% de descuento con compras de 30 mil' },
  { src: '/carousel/promo-50mil.jpg',  alt: '5% de descuento con compras de 50 mil' },
];

export default function PromoCarousel() {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const len = slides.length;

  const next = useCallback(() => setCurrent(i => (i + 1) % len), [len]);
  const prev = useCallback(() => setCurrent(i => (i - 1 + len) % len), [len]);

  // Auto-play every 5 seconds, pauses on hover
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, isHovered]);

  return (
    <section id="promo-carousel" className="py-16 bg-gradient-to-b from-purple/5 to-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="mb-10 text-center">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-brand mb-2">Aprovechá nuestras promos</p>
          <h2 className="font-display font-black text-ink leading-none tracking-tight" style={{fontSize:'clamp(2rem,5.5vw,3.8rem)'}}>
            PROMOCIONES <span className="text-brand">ESPECIALES</span>
          </h2>
          <p className="mt-3 text-ink-muted text-sm max-w-md mx-auto">
            Cuanto más comprás, más ahorrás. ¡Mirá nuestros descuentos exclusivos!
          </p>
        </div>

        {/* Carousel */}
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl shadow-brand/10 border border-gray-100 group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Slides wrapper */}
          <div className="relative w-full bg-gradient-to-br from-red-700 via-red-600 to-yellow-500" style={{ aspectRatio: '16 / 9' }}>
            {slides.map((slide, i) => (
              <img
                key={i}
                src={slide.src}
                alt={slide.alt}
                className="absolute inset-0 w-full h-full object-contain transition-all duration-700 ease-in-out"
                style={{
                  opacity: i === current ? 1 : 0,
                  transform: i === current ? 'scale(1)' : 'scale(1.04)',
                }}
              />
            ))}
          </div>

          {/* Prev / Next buttons */}
          <button
            id="carousel-prev"
            onClick={prev}
            aria-label="Anterior"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-sm text-ink flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            id="carousel-next"
            onClick={next}
            aria-label="Siguiente"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-sm text-ink flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2.5">
            {slides.map((_, i) => (
              <button
                key={i}
                id={`carousel-dot-${i}`}
                onClick={() => setCurrent(i)}
                aria-label={`Ir a slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-8 h-3 bg-white shadow-md'
                    : 'w-3 h-3 bg-white/60 hover:bg-white/90'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
