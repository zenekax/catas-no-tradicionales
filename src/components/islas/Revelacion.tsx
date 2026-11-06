import DecryptedText from '../reactbits/DecryptedText';

/** Texto que se "desencripta" al entrar en pantalla: la marca oculta que se revela (React Bits · DecryptedText). */
export default function Revelacion({ texto, className = '' }: { texto: string; className?: string }) {
  return (
    <DecryptedText
      text={texto}
      animateOn="view"
      sequential
      revealDirection="start"
      speed={55}
      characters="█▓▒░?¿#*"
      parentClassName={className}
      className="text-caramelo-300"
      encryptedClassName="text-crema-500"
    />
  );
}
