import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, ArrowDown } from 'lucide-react';
import { ROUTES } from '../../../shared/constants/routes';

const HERO_VIDEO_URL =
  'https://videos.pexels.com/video-files/853936/853936-hd_1920_1080_25fps.mp4';

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <section className="relative overflow-hidden bg-zinc-900 min-h-[100svh] flex items-center justify-center">
      {/* Video background — hidden on mobile, visible on md+ */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        onCanPlay={() => setVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover block transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
        src={HERO_VIDEO_URL}
      />

      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Subtle gradient at the bottom for smooth transition to next section */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-900/80 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 md:pt-20 md:pb-28">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="fade-in inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-semibold px-4 py-2 rounded-full mb-8">
            <PawPrint className="w-4 h-4 text-brand" />
            Proyecto de desarrollo web — Tolima, Colombia
          </div>

          {/* Title */}
          <h1 className="fade-in text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6 drop-shadow-lg">
            Huellitas
            <span className="text-brand">API</span>
          </h1>

          {/* Subtitle */}
          <p className="fade-in delay-75 text-lg sm:text-xl md:text-2xl font-medium text-white/90 mb-4">
            Plataforma web para la adopción de animales
          </p>

          {/* Description */}
          <p className="fade-in delay-100 text-base sm:text-lg text-white/60 leading-relaxed max-w-2xl mx-auto mb-10">
            Una solución tecnológica que centraliza el proceso de adopción animal
            en el departamento del Tolima, conectando fundaciones animalistas con
            ciudadanos comprometidos con el bienestar animal.
          </p>

          {/* CTA buttons */}
          <div className="fade-in delay-150 flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link
              to={ROUTES.REGISTER}
              className="inline-flex items-center gap-2 bg-brand text-white font-semibold px-6 py-3 rounded-lg hover:bg-brand-dark transition-colors shadow-lg shadow-brand/30"
            >
              <PawPrint className="w-4 h-4" />
              Explorar animales
            </Link>
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              Iniciar sesión
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="fade-in delay-150 flex flex-col items-center gap-2 text-white/50">
            <span className="text-xs font-medium uppercase tracking-widest">
              Conoce el proyecto
            </span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
