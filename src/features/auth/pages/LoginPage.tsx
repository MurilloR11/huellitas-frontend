import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
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
  X,
  KeyRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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

// ─── Forgot password modal ─────────────────────────────────────────────────────

type ForgotStep = 'email' | 'code' | 'password';

function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<ForgotStep>('email');
  const [emailVal, setEmailVal] = useState('');
  const [digits, setDigits] = useState(['', '', '', '']);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleDigit = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val.slice(-1);
    setDigits(next);
    if (val && i < 3) digitRefs.current[i + 1]?.focus();
  };

  const handleDigitKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      digitRefs.current[i - 1]?.focus();
    }
  };

  const stepIndex = step === 'email' ? 0 : step === 'code' ? 1 : 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          <X className="w-4 h-4" strokeWidth={2} />
        </button>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 pt-8">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === stepIndex
                  ? 'w-6 bg-brand'
                  : i < stepIndex
                    ? 'w-4 bg-brand/40'
                    : 'w-4 bg-zinc-200',
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: email ── */}
          {step === 'email' && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="px-8 pt-6 pb-8 space-y-5"
            >
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-brand/10">
                  <Mail className="w-6 h-6 text-brand" strokeWidth={1.5} />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-bold text-zinc-900">¿Olvidaste tu contraseña?</h3>
                <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                  Ingresa tu correo y te enviaremos un código de verificación de 4 dígitos
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="fp-email" className="text-xs font-medium text-zinc-700">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    id="fp-email"
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    value={emailVal}
                    onChange={e => setEmailVal(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep('code')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark transition"
              >
                Enviar código
              </button>
            </motion.div>
          )}

          {/* ── Step 2: OTP code ── */}
          {step === 'code' && (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="px-8 pt-6 pb-8 space-y-5"
            >
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-brand/10">
                  <KeyRound className="w-6 h-6 text-brand" strokeWidth={1.5} />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-bold text-zinc-900">Ingresa el código</h3>
                <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                  Enviamos un código a{' '}
                  <span className="font-medium text-zinc-700">{emailVal || 'tu correo'}</span>
                </p>
              </div>

              {/* OTP inputs */}
              <div className="flex justify-center gap-3">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={el => { digitRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleDigit(i, e.target.value)}
                    onKeyDown={e => handleDigitKey(i, e)}
                    className={cn(
                      'w-14 h-14 rounded-xl border-2 text-center text-2xl font-bold text-zinc-900 caret-brand',
                      'focus:outline-none transition-colors',
                      d
                        ? 'border-brand bg-brand/5'
                        : 'border-zinc-200 bg-white focus:border-brand focus:bg-brand/5',
                    )}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setStep('password')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark transition"
              >
                Verificar código
              </button>

              <p className="text-center text-xs text-zinc-400">
                ¿No recibiste el código?{' '}
                <button
                  type="button"
                  className="font-medium text-brand hover:text-brand-dark transition"
                >
                  Reenviar
                </button>
              </p>
            </motion.div>
          )}

          {/* ── Step 3: new password ── */}
          {step === 'password' && (
            <motion.div
              key="password"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="px-8 pt-6 pb-8 space-y-5"
            >
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-brand/10">
                  <Lock className="w-6 h-6 text-brand" strokeWidth={1.5} />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-bold text-zinc-900">Nueva contraseña</h3>
                <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                  Elige una contraseña segura para tu cuenta
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fp-new" className="text-xs font-medium text-zinc-700">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      id="fp-new"
                      type={showNew ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={newPass}
                      onChange={e => setNewPass(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-9 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(v => !v)}
                      aria-label={showNew ? 'Ocultar' : 'Mostrar'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fp-confirm" className="text-xs font-medium text-zinc-700">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      id="fp-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPass}
                      onChange={e => setConfirmPass(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-9 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      aria-label={showConfirm ? 'Ocultar' : 'Mostrar'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { toast.success('Contraseña actualizada exitosamente'); onClose(); }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark transition"
              >
                Cambiar contraseña
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1">{message}</p>;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showForgotPassword, setShowForgotPassword] = useState(false);
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
    <>
    <AnimatePresence>
      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}
    </AnimatePresence>
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
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs font-medium text-brand hover:text-brand-dark transition"
                >
                  ¿Olvidaste tu contraseña?
                </button>
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
    </>
  );
}
