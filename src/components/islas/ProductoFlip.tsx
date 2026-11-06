import FlipCard from '../reactbits/FlipCard';

interface Props {
  numero: number;
  nombre: string;
  frase: string;
  detalle: string;
  foto?: string; // URL ya optimizada (la arma index.astro con getImage)
}

const fondoSinFoto = 'radial-gradient(100% 70% at 70% 10%, #c8925a55, transparent 60%), linear-gradient(200deg,#45321f,#17100b)';

/**
 * Tarjeta que se da vuelta (React Bits · FlipCard).
 * Adelante: la foto desenfocada, como si la vieras con los ojos vendados.
 * Atrás: la foto nítida y qué era.
 */
export default function ProductoFlip({ numero, nombre, frase, detalle, foto }: Props) {
  const n = String(numero).padStart(2, '0');
  return (
    <FlipCard
      width={300}
      height={480}
      radius={28}
      background="#211710"
      color="#f4ebdd"
      shadowColor="#000000"
      shadowOpacity={0.55}
      glareOpacity={0.12}
      tiltMax={8}
      className="touch-pan-x focus-visible:ring-2 focus-visible:ring-caramelo-300 focus-visible:ring-offset-4 focus-visible:ring-offset-espresso-900"
      front={
        <div className="relative flex h-full flex-col justify-between overflow-hidden p-6">
          {foto ? (
            <img src={foto} alt="" aria-hidden="true" loading="lazy" decoding="async"
              className="absolute inset-0 size-full scale-110 object-cover blur-md brightness-[0.75]" />
          ) : (
            <div className="absolute inset-0" style={{ background: fondoSinFoto }} aria-hidden="true" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-espresso-950/30 via-transparent to-espresso-950/70" aria-hidden="true" />
          <div className="relative flex items-center justify-between text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-crema-300">
            <span>¿Esta cata es de…?</span><span className="h-px w-10 bg-crema-300/60" aria-hidden="true" />
          </div>
          <div className="relative text-center">
            <span className="font-display text-[8.5rem] leading-none text-caramelo-200 drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">{n}</span>
          </div>
          <p className="relative text-center text-sm text-crema-50">TOCA PARA DESCUBRIRLA <span aria-hidden="true">↻</span></p>
        </div>
      }
      back={
        <div className="flex h-full flex-col overflow-hidden">
          <div className="relative h-[38%] shrink-0">
            {foto ? (
              <img src={foto} alt={nombre} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
            ) : (
              <div className="absolute inset-0" style={{ background: fondoSinFoto }} />
            )}
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-[#211710]" aria-hidden="true" />
          </div>
          <div className="flex flex-1 flex-col px-5 pt-2 pb-5">
            <h3 className="mt-1 font-display text-[2.1rem] leading-none text-crema-50">{nombre}</h3>
            <p className="mt-2 font-display text-lg italic leading-snug text-caramelo-200">{frase}</p>
            <p className="mt-2 text-[0.8rem] leading-relaxed text-crema-300">{detalle}</p>
          </div>
        </div>
      }
    />
  );
}
