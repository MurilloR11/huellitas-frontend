import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-stone-50 dark:bg-zinc-950 flex flex-col items-center justify-center px-6 py-16 text-center">

      {/* Dog illustration */}
      <div className="nf-dog mb-6">
        <DogSVG className="w-52 h-52 sm:w-60 sm:h-60" />
      </div>

      {/* Badge */}
      <span className="nf-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase border border-stone-200 dark:border-zinc-800 text-stone-400 dark:text-zinc-600 mb-5">
        Error 404
      </span>

      {/* Headline */}
      <h1 className="nf-title text-3xl sm:text-[2.4rem] font-bold tracking-tight leading-tight text-stone-900 dark:text-zinc-50 max-w-xs sm:max-w-sm mb-3">
        Parece que este perrito se perdió
      </h1>

      {/* Description */}
      <p className="nf-desc text-stone-500 dark:text-zinc-400 text-[15px] leading-relaxed max-w-[40ch] mb-8">
        La página que buscas no existe, fue movida o el enlace está roto.
        Vuelve al inicio o regresa al paso anterior.
      </p>

      {/* CTAs */}
      <div className="nf-cta flex flex-wrap justify-center gap-3">
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

      {/* Footer hint */}
      <p className="nf-hint mt-10 text-xs text-stone-300 dark:text-zinc-700 tracking-wide">
        huellitas.app · página no encontrada
      </p>

      <style>{`
        .nf-dog   { animation: nf-bounce-in 0.75s cubic-bezier(0.16,1,0.3,1) 0.05s both,
                               nf-float 4.5s ease-in-out 0.8s infinite; }
        .nf-badge { animation: nf-up 0.5s cubic-bezier(0.16,1,0.3,1) 0.22s both; }
        .nf-title { animation: nf-up 0.5s cubic-bezier(0.16,1,0.3,1) 0.30s both; }
        .nf-desc  { animation: nf-up 0.5s cubic-bezier(0.16,1,0.3,1) 0.38s both; }
        .nf-cta   { animation: nf-up 0.5s cubic-bezier(0.16,1,0.3,1) 0.46s both; }
        .nf-hint  { animation: nf-up 0.4s cubic-bezier(0.16,1,0.3,1) 0.54s both; }

        @keyframes nf-bounce-in {
          0%   { opacity: 0; transform: scale(0.72) translateY(16px); }
          65%  { transform: scale(1.06) translateY(-5px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes nf-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes nf-float {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-9px); }
        }
      `}</style>
    </div>
  );
}

function DogSVG({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 230"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Ground shadow */}
      <ellipse cx="100" cy="226" rx="54" ry="7" fill="#e85d26" opacity="0.08" />

      {/* Tail — drawn first so body covers its base */}
      <path
        d="M 144 160 C 182 140 182 108 164 98"
        fill="none" stroke="#c94e1e" strokeWidth="15" strokeLinecap="round"
      />

      {/* Left ear — behind head */}
      <ellipse cx="60" cy="75" rx="21" ry="33" transform="rotate(-18 60 75)" fill="#c94e1e" />

      {/* Right ear — behind head */}
      <ellipse cx="140" cy="75" rx="21" ry="33" transform="rotate(18 140 75)" fill="#c94e1e" />

      {/* Body */}
      <ellipse cx="100" cy="176" rx="48" ry="47" fill="#e85d26" />

      {/* Head */}
      <circle cx="100" cy="92" r="45" fill="#e85d26" />

      {/* Snout area — slightly darker tint */}
      <ellipse cx="100" cy="112" rx="22" ry="17" fill="#c94e1e" opacity="0.30" />

      {/* Left eye */}
      <circle cx="82" cy="87" r="9" fill="#1c1009" />
      <circle cx="84.5" cy="84" r="3.2" fill="white" />

      {/* Right eye */}
      <circle cx="118" cy="87" r="9" fill="#1c1009" />
      <circle cx="120.5" cy="84" r="3.2" fill="white" />

      {/* Nose */}
      <ellipse cx="100" cy="106" rx="7.5" ry="6" fill="#1c1009" />

      {/* Mouth */}
      <path
        d="M 92 116 Q 100 124 108 116"
        fill="none" stroke="#1c1009" strokeWidth="2.2" strokeLinecap="round"
      />

      {/* Cheek blush left */}
      <ellipse cx="68" cy="102" rx="10" ry="7" fill="#c94e1e" opacity="0.20" />
      {/* Cheek blush right */}
      <ellipse cx="132" cy="102" rx="10" ry="7" fill="#c94e1e" opacity="0.20" />

      {/* Front left paw */}
      <ellipse cx="72" cy="214" rx="20" ry="12" fill="#e85d26" />

      {/* Front right paw */}
      <ellipse cx="128" cy="214" rx="20" ry="12" fill="#e85d26" />
    </svg>
  );
}
