import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-stone-50 dark:bg-zinc-950 flex items-center overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-20">

        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-10 md:gap-0 items-center">

          {/* ── Left: content ── */}
          <div className="flex flex-col">

            {/* Pill label */}
            <span className="nf-pill self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase border border-stone-200 dark:border-zinc-800 text-stone-400 dark:text-zinc-600 mb-6">
              Error 404
            </span>

            {/* Decorative number — sits behind headline */}
            <div className="nf-num select-none font-black text-[7rem] sm:text-[9rem] md:text-[10rem] leading-none tracking-tighter text-stone-200 dark:text-zinc-800 -ml-1">
              404
            </div>

            {/* Headline overlapping the number */}
            <div className="nf-text -mt-6 md:-mt-8 space-y-3 max-w-[52ch]">
              <h1 className="text-3xl md:text-[2.6rem] font-bold tracking-tight leading-tight text-stone-900 dark:text-zinc-50">
                Esta huella no lleva a ningún lado
              </h1>
              <p className="text-stone-500 dark:text-zinc-400 text-[15px] leading-relaxed">
                La página que buscas no existe, fue movida, o el enlace
                está roto. Regresa al inicio o al paso anterior.
              </p>
            </div>

            {/* CTAs */}
            <div className="nf-cta flex flex-wrap gap-3 mt-8">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{ background: 'var(--color-brand)' }}
              >
                <Home className="w-4 h-4" />
                Ir al inicio
              </button>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-stone-600 dark:text-zinc-400 border border-stone-200 dark:border-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-900 transition-colors duration-200 active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver atrás
              </button>
            </div>

            {/* Breadcrumb hint */}
            <p className="nf-hint mt-10 text-xs text-stone-300 dark:text-zinc-700 tracking-wide">
              huellitas.app · página no encontrada
            </p>
          </div>

          {/* ── Right: paw illustration ── */}
          <div className="nf-paw hidden md:flex items-center justify-end">
            <div className="nf-float relative">
              {/* Outer glow ring */}
              <div
                className="absolute inset-0 rounded-full blur-3xl opacity-20 scale-90"
                style={{ background: 'var(--color-brand)' }}
              />
              <PawSVG className="relative w-72 h-72 lg:w-80 lg:h-80" />
            </div>
          </div>

        </div>
      </div>

      <style>{`
        /* ── Entry stagger ── */
        .nf-pill { animation: nf-up 0.55s cubic-bezier(0.16,1,0.3,1) 0.04s both; }
        .nf-num  { animation: nf-up 0.60s cubic-bezier(0.16,1,0.3,1) 0.10s both; }
        .nf-text { animation: nf-up 0.60s cubic-bezier(0.16,1,0.3,1) 0.20s both; }
        .nf-cta  { animation: nf-up 0.60s cubic-bezier(0.16,1,0.3,1) 0.32s both; }
        .nf-hint { animation: nf-up 0.50s cubic-bezier(0.16,1,0.3,1) 0.42s both; }
        .nf-paw  { animation: nf-in 0.80s cubic-bezier(0.16,1,0.3,1) 0.15s both; }

        @keyframes nf-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes nf-in {
          from { opacity: 0; transform: translateX(28px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* ── Perpetual float for the paw ── */
        .nf-float {
          animation: nf-float 7s ease-in-out infinite;
          will-change: transform;
        }
        @keyframes nf-float {
          0%,100% { transform: translateY(0)    rotate(-10deg); }
          50%     { transform: translateY(-16px) rotate(-10deg); }
        }
      `}</style>
    </div>
  );
}

function PawSVG({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Palm pad */}
      <ellipse
        cx="60" cy="79" rx="23" ry="27"
        fill="var(--color-brand)" fillOpacity="0.10"
        stroke="var(--color-brand)" strokeWidth="1.5" strokeOpacity="0.25"
      />
      {/* Top-left toe */}
      <ellipse
        cx="33" cy="51" rx="9.5" ry="12"
        transform="rotate(-22 33 51)"
        fill="var(--color-brand)" fillOpacity="0.10"
        stroke="var(--color-brand)" strokeWidth="1.5" strokeOpacity="0.25"
      />
      {/* Top-center-left toe */}
      <ellipse
        cx="49" cy="41" rx="9.5" ry="12"
        transform="rotate(-7 49 41)"
        fill="var(--color-brand)" fillOpacity="0.10"
        stroke="var(--color-brand)" strokeWidth="1.5" strokeOpacity="0.25"
      />
      {/* Top-center-right toe */}
      <ellipse
        cx="71" cy="41" rx="9.5" ry="12"
        transform="rotate(7 71 41)"
        fill="var(--color-brand)" fillOpacity="0.10"
        stroke="var(--color-brand)" strokeWidth="1.5" strokeOpacity="0.25"
      />
      {/* Top-right toe */}
      <ellipse
        cx="87" cy="51" rx="9.5" ry="12"
        transform="rotate(22 87 51)"
        fill="var(--color-brand)" fillOpacity="0.10"
        stroke="var(--color-brand)" strokeWidth="1.5" strokeOpacity="0.25"
      />
    </svg>
  );
}
