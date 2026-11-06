import { useEffect, useState } from 'react';
import Grainient from '../reactbits/Grainient';

/** Fondo animado del hero: gradiente con grano en tonos café (React Bits · Grainient).
 *  Sólo se carga en pantallas grandes (client:media); en celulares queda el fondo CSS .fondo-calido. */
export default function FondoHero() {
  const [quieto, setQuieto] = useState(false);
  useEffect(() => {
    setQuieto(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);
  return (
    <Grainient
      className="h-full w-full"
      color1="#1a0f09"
      color2="#a8733f"
      color3="#2e1b10"
      timeSpeed={quieto ? 0 : 0.12}
      warpStrength={0.9}
      warpAmplitude={40}
      grainAmount={0.015}
      contrast={1.4}
      saturation={0.9}
      zoom={1.1}
      centerY={-0.15}
    />
  );
}
