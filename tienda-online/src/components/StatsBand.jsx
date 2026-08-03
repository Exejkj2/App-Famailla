export default function StatsBand() {
  return (
    <section className="bg-purple py-10 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[{v:'+5.000',l:'Clientes satisfechos'},{v:'200+',l:'Productos disponibles'},{v:'24hs',l:'Despacho garantizado'},{v:'15 anos',l:'En el mercado'}].map(({v,l}) => (
          <div key={l}>
            <div className="font-display font-black text-accent leading-none" style={{fontSize:'clamp(2.2rem,5vw,3.2rem)'}}>{v}</div>
            <div className="mt-1 text-xs text-white/80 font-semibold tracking-wide">{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
