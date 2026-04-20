import { Clock, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function PendingApprovalPage() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md text-center">
        <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-6">
          <Clock className="w-8 h-8 text-amber-600" />
        </span>

        <h1 className="text-2xl font-bold text-zinc-900 mb-2">
          Tu cuenta está en revisión
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed mb-8">
          Recibimos tu solicitud de registro como fundación. Nuestro equipo
          revisará los datos que proporcionaste y te notificará por correo
          electrónico cuando tu cuenta sea aprobada.
        </p>

        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-8">
          <p className="text-sm text-amber-700">
            Este proceso suele tomar entre 24 y 48 horas hábiles.
          </p>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
