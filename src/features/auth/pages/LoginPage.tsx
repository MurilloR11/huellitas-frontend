import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ShieldCheck,
  FileText,
  Bell,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { ROUTES } from '../../../shared/constants/routes';
import { useAuth } from '../hooks/useAuth';
import { loginSchema } from '../schemas/authSchemas';

const features = [
  {
    icon: ShieldCheck,
    title: 'Fundaciones verificadas',
    description: 'Solo refugios reales y activos del departamento',
  },
  {
    icon: FileText,
    title: 'Fichas clínicas digitales',
    description: 'Vacunas, historial y comportamiento en un solo lugar',
  },
  {
    icon: Bell,
    title: 'Notificaciones automáticas',
    description: 'Al aprobar, el adoptante recibe los datos al instante',
  },
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1">{message}</p>;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? '');
        if (key && !errs[key]) errs[key] = issue.message;
      }
      setErrors(errs);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const user = await login(result.data);

      const firstName = user.full_name.split(' ')[0];
      toast.success(`Bienvenido, ${firstName}`, { duration: 4000 });

      if (user.role === 'admin') {
        navigate(ROUTES.ADMIN);
      } else if (user.role === 'fundacion') {
        if (user.status === 'pending') navigate(ROUTES.PENDING);
        else if (user.status === 'rejected') navigate(ROUTES.REJECTED);
        else navigate(ROUTES.FOUNDATION_DASHBOARD);
      } else {
        navigate('/explore');
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex h-screen">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[44%] flex-col justify-between bg-zinc-900 p-10 xl:p-14">
        <div>
          <div className="flex items-center gap-1.5 mb-10">
            <span className="text-xl font-bold text-white tracking-tight">Huellitas</span>
            <span className="text-xl font-bold text-brand tracking-tight">API</span>
          </div>

          <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 mb-4">
            Plataforma de adopción del Tolima
          </p>

          <h1 className="text-3xl font-bold text-white leading-tight mb-3">
            El Tolima adopta diferente.
          </h1>

          <p className="text-sm leading-relaxed text-zinc-400 max-w-xs mb-8">
            Conectamos fundaciones verificadas del departamento con personas que
            quieren darle un hogar a quien más lo necesita.
          </p>

          <ul className="space-y-5">
            {features.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="flex shrink-0 items-center justify-center w-10 h-10 rounded-lg bg-white/[0.08] border border-white/[0.10]">
                  <Icon className="w-5 h-5 text-white" />
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="text-[13px] text-zinc-400">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-zinc-600">
          © {new Date().getFullYear()} HuellitasAPI — Tolima, Colombia
        </p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col items-center overflow-y-auto bg-white px-4 sm:px-6 py-8 sm:py-12">
        <div className="lg:hidden flex items-center gap-1.5 mb-6 sm:mb-10">
          <span className="text-xl font-bold text-zinc-900 tracking-tight">Huellitas</span>
          <span className="text-xl font-bold text-brand tracking-tight">API</span>
        </div>

        <div className="w-full max-w-sm my-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
            Bienvenido de nuevo
          </h2>
          <p className="text-sm text-zinc-500 mt-1 mb-8">
            Ingresa a tu cuenta para continuar
          </p>

          {serverError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 mb-5">
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
          )}

          <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs sm:text-sm font-medium text-zinc-700">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-[18px] sm:h-[18px] text-zinc-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-lg border bg-white py-2 sm:py-2.5 pl-9 sm:pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition ${errors.email ? 'border-red-400' : 'border-zinc-300'}`}
                />
              </div>
              <FieldError message={errors.email} />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs sm:text-sm font-medium text-zinc-700">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-[18px] sm:h-[18px] text-zinc-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-lg border bg-white py-2 sm:py-2.5 pl-9 sm:pl-10 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition ${errors.password ? 'border-red-400' : 'border-zinc-300'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  )}
                </button>
              </div>
              <FieldError message={errors.password} />
              <div className="flex justify-end mt-0.5">
                <Link
                  to="#"
                  className="text-xs font-medium text-brand hover:text-brand-dark transition"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            {/* Keep session */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-300 text-brand accent-brand focus:ring-brand"
              />
              <span className="text-sm text-zinc-600">Mantener sesión iniciada</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 sm:py-3 text-sm font-medium text-white hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-zinc-500">¿No tienes cuenta?</span>
            </div>
          </div>

          <Link
            to={ROUTES.REGISTER}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 transition"
          >
            <UserPlus className="w-4 h-4" />
            Crear una cuenta
          </Link>

          <div className="mt-6 sm:mt-8 text-center">
            <Link
              to={ROUTES.HOME}
              className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
