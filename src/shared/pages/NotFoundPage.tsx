import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 flex items-center justify-center px-6">
      <div className="relative flex flex-col items-center text-center max-w-md w-full animate-in">

        {/* Decorative paw — background layer */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden="true">
          <PawSVG className="w-80 h-80 text-stone-200 dark:text-zinc-800" />
        </div>

        {/* 404 number */}
        <span
          className="relative text-[9rem] font-black leading-none tracking-tighter select-none"
          style={{ color: 'var(--color-brand)', opacity: 0.15 }}
        >
          404
        </span>

        {/* Main content — sits over the number */}
        <div className="relative -mt-6 space-y-3">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-zinc-50">
            Esta huella no lleva a ningún lado
          </h1>
          <p className="text-sm text-stone-500 dark:text-zinc-400 leading-relaxed">
            La página que buscas no existe o fue movida.<br />
            Puede que el enlace esté roto o que hayas escrito la dirección incorrectamente.
          </p>
        </div>

        {/* CTAs */}
        <div className="relative mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-95"
            style={{ background: 'var(--color-brand)' }}
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-medium text-stone-600 dark:text-zinc-400 border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver atrás
          </button>
        </div>

        {/* Footer hint */}
        <p className="relative mt-10 text-xs text-stone-400 dark:text-zinc-600">
          Error 404 — Página no encontrada
        </p>
      </div>

      <style>{`
        .animate-in {
          animation: fadeSlideUp 0.4s ease both;
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function PawSVG({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Palm pad */}
      <ellipse cx="50" cy="62" rx="18" ry="22" />
      {/* Top-left toe */}
      <ellipse cx="28" cy="40" rx="8" ry="10" transform="rotate(-20 28 40)" />
      {/* Top-center-left toe */}
      <ellipse cx="41" cy="33" rx="8" ry="10" transform="rotate(-8 41 33)" />
      {/* Top-center-right toe */}
      <ellipse cx="59" cy="33" rx="8" ry="10" transform="rotate(8 59 33)" />
      {/* Top-right toe */}
      <ellipse cx="72" cy="40" rx="8" ry="10" transform="rotate(20 72 40)" />
    </svg>
  );
}
