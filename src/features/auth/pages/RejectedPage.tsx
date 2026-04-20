import { XCircle, LogOut, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function RejectedPage() {
  const { logout, user } = useAuth();
  const reason = (user as { rejection_reason?: string } | null)?.rejection_reason;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md text-center">
        <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
          <XCircle className="w-8 h-8 text-red-600" />
        </span>

        <h1 className="text-2xl font-bold text-zinc-900 mb-2">
          Tu solicitud fue rechazada
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed mb-6">
          Lamentablemente tu solicitud de registro como fundación no pudo ser
          aprobada en este momento.
        </p>

        {reason && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 mb-6 text-left">
            <p className="text-xs font-semibold text-red-700 mb-1 uppercase tracking-wide">
              Motivo
            </p>
            <p className="text-sm text-red-700">{reason}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="mailto:soporte@huellitasapi.com"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark transition"
          >
            <Mail className="w-4 h-4" />
            Contactar soporte
          </a>

          <button
            onClick={logout}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
