import { Check } from 'lucide-react';

const MISSION_ITEMS = [
  'Conectar fundaciones animalistas con ciudadanos comprometidos',
  'Digitalizar y simplificar el proceso de adopción animal',
  'Construir una comunidad consciente del bienestar animal',
] as const;

const VISION_ITEMS = [
  'Ser la plataforma de referencia para adopción en el Tolima',
  'Expandir nuestro impacto a otras regiones de Colombia',
  'Contribuir a la reducción del abandono animal con tecnología',
] as const;

function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center mt-0.5">
        <Check className="w-3 h-3 text-white" strokeWidth={3} />
      </span>
      <span className="text-zinc-600 text-sm leading-relaxed">{text}</span>
    </li>
  );
}

function ImagePair({
  primary,
  secondary,
  alt,
}: {
  primary: string;
  secondary: string;
  alt: string;
}) {
  return (
    <div className="relative h-72 sm:h-80 md:h-[420px] mb-8 mr-8">
      <img
        src={primary}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover rounded-2xl shadow-md"
      />
      <div className="absolute -bottom-6 -right-6 w-2/5 aspect-[4/3] rounded-xl overflow-hidden border-4 border-white shadow-xl">
        <img src={secondary} alt="" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}

export function MissionVisionSection() {
  return (
    <section id="mision-vision" className="bg-zinc-50 py-20 md:py-28 border-y border-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-20 md:space-y-28">

        {/* ── Misión: texto izquierda, imágenes derecha ── */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Text */}
          <div className="fade-in">
            <p className="text-brand font-semibold text-xs uppercase tracking-widest mb-4">
              Misión
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mb-5 leading-tight">
              Nuestro propósito
            </h2>
            <p className="text-zinc-500 leading-relaxed mb-8">
              Facilitar el proceso de adopción animal en el departamento del Tolima mediante
              una plataforma web que conecte a fundaciones animalistas con ciudadanos,
              promoviendo la tenencia responsable y reduciendo el número de animales en
              situación de abandono.
            </p>
            <ul className="space-y-4">
              {MISSION_ITEMS.map((item) => (
                <CheckItem key={item} text={item} />
              ))}
            </ul>
          </div>

          {/* Images */}
          <div className="fade-in delay-100 pl-0 md:pl-4">
            <ImagePair
              primary="https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=700"
              secondary="https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=400"
              alt="Perro esperando ser adoptado"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-zinc-100" />

        {/* ── Visión: imágenes izquierda, texto derecha ── */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Images — on mobile goes below text */}
          <div className="fade-in pl-0 md:pl-4 order-2 md:order-1">
            <ImagePair
              primary="https://images.pexels.com/photos/551628/pexels-photo-551628.jpeg?auto=compress&cs=tinysrgb&w=700"
              secondary="https://images.pexels.com/photos/2023384/pexels-photo-2023384.jpeg?auto=compress&cs=tinysrgb&w=400"
              alt="Animal siendo cuidado"
            />
          </div>

          {/* Text */}
          <div className="fade-in delay-100 order-1 md:order-2">
            <p className="text-brand font-semibold text-xs uppercase tracking-widest mb-4">
              Visión
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mb-5 leading-tight">
              Hacia dónde vamos
            </h2>
            <p className="text-zinc-500 leading-relaxed mb-8">
              Consolidar a Huellitas como la plataforma de referencia para la adopción
              de animales en el Tolima, reconocida por su impacto social, la calidad de
              sus datos abiertos y su contribución a una comunidad más comprometida con
              el bienestar animal.
            </p>
            <ul className="space-y-4">
              {VISION_ITEMS.map((item) => (
                <CheckItem key={item} text={item} />
              ))}
            </ul>
          </div>
        </div>

      </div>
    </section>
  );
}
