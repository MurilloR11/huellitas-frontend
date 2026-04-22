import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Heart,
  Terminal,
  ShieldCheck,
  Lock as LockIcon,
  Zap,
  User,
  MapPin,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Info,
  ArrowLeft,
  LogIn,
  Check,
  ChevronsUpDown,
  Loader2,
} from 'lucide-react';
import { ROUTES } from '../../../shared/constants/routes';
import { authApi } from '../services/authApi';
import { registerSchema } from '../schemas/authSchemas';

/* ─── Types ─── */
type AccountType = 'ciudadano' | 'fundacion' | 'developer';

/* ─── Constants ─── */
const MUNICIPIOS = [
  'Ibagué',
  'Espinal',
  'Honda',
  'Melgar',
  'Chaparral',
  'Líbano',
  'Mariquita',
  'Lérida',
  'Armero',
  'Natagaima',
  'Purificación',
  'Flandes',
  'Guamo',
  'Otro',
];

const roleCards = [
  { icon: Building2, title: 'Fundaciones', description: 'Publica animales con ficha clínica completa' },
  { icon: Heart, title: 'Ciudadanos', description: 'Busca y adopta en tu municipio del Tolima' },
  { icon: Terminal, title: 'Desarrolladores', description: 'Obtén tu API key y consume datos en JSON' },
];

const trustBadges = [
  { icon: ShieldCheck, label: 'Fundaciones verificadas' },
  { icon: LockIcon, label: 'Datos protegidos' },
  { icon: Zap, label: 'Gratis' },
];

const accountTypes: { key: AccountType; icon: typeof User; label: string; description: string }[] = [
  { key: 'ciudadano', icon: User, label: 'Ciudadano', description: 'Adopta una mascota' },
  { key: 'fundacion', icon: Building2, label: 'Fundación', description: 'Publica animales' },
  { key: 'developer', icon: Terminal, label: 'Developer', description: 'Consume la API' },
];

const nameConfig: Record<AccountType, { label: string; placeholder: string }> = {
  ciudadano: { label: 'Nombre completo', placeholder: 'Tu nombre completo' },
  fundacion: { label: 'Nombre de la fundación', placeholder: 'Nombre de tu fundación' },
  developer: { label: 'Nombre completo o alias', placeholder: 'Tu nombre o alias' },
};

const submitLabel: Record<AccountType, string> = {
  ciudadano: 'Crear cuenta como ciudadano',
  fundacion: 'Registrar fundación',
  developer: 'Crear cuenta de desarrollador',
};

/* ─── Password strength ─── */
function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: 'Débil', color: 'bg-red-500' },
    { label: 'Regular', color: 'bg-orange-500' },
    { label: 'Buena', color: 'bg-yellow-500' },
    { label: 'Fuerte', color: 'bg-green-500' },
  ] as const;

  return { score, ...(score > 0 ? levels[score - 1] : { label: '', color: '' }) };
}

/* ─── Combobox ─── */
function MunicipioCombobox({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = useMemo(
    () => MUNICIPIOS.filter((m) => m.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-[18px] sm:h-[18px] text-zinc-400" />
        <input
          type="text"
          placeholder="Buscar municipio…"
          value={open ? query : value}
          onChange={(e) => { setQuery(e.target.value); if (!open) setOpen(true); }}
          onFocus={() => { setOpen(true); setQuery(''); }}
          className={`w-full rounded-lg border bg-white py-2 sm:py-2.5 pl-9 sm:pl-10 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition ${hasError ? 'border-red-400' : 'border-zinc-300'}`}
        />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
        >
          <ChevronsUpDown className="w-4 h-4" />
        </button>
      </div>

      {open && (
        <ul className="absolute z-20 mt-1 max-h-40 sm:max-h-48 w-full overflow-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-zinc-400">Sin resultados</li>
          ) : (
            filtered.map((m) => (
              <li key={m}>
                <button
                  type="button"
                  onClick={() => { onChange(m); setQuery(m); setOpen(false); }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 transition ${value === m ? 'text-brand font-medium' : 'text-zinc-700'}`}
                >
                  {value === m && <Check className="w-4 h-4 text-brand" />}
                  {m}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1">{message}</p>;
}

/* ═══════════════════════════════════════════
   RegisterPage
   ═══════════════════════════════════════════ */
export default function RegisterPage() {
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState<AccountType>('ciudadano');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');

    const result = registerSchema.safeParse({
      full_name: name,
      email,
      password,
      confirmPassword,
      role: accountType,
      municipio: accountType === 'fundacion' ? municipio : undefined,
      phone: accountType === 'fundacion' ? phone : undefined,
      acceptTerms,
    });

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
      const { full_name, email: e, password: p, role, municipio: m, phone: ph } = result.data;
      await authApi.register({ full_name, email: e, password: p, role, municipio: m, phone: ph });

      if (role === 'fundacion') {
        navigate(ROUTES.PENDING);
      } else {
        navigate(ROUTES.LOGIN);
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al crear la cuenta');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex h-screen">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[44%] flex-col justify-between bg-zinc-900 p-8 lg:p-10 xl:p-14">
        <div>
          <div className="flex items-center gap-1.5 mb-6">
            <span className="text-xl font-bold text-white tracking-tight">Huellitas</span>
            <span className="text-xl font-bold text-brand tracking-tight">API</span>
          </div>

          <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 mb-3">
            Únete a la plataforma
          </p>

          <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight mb-2">
            El Tolima tiene su plataforma.
          </h1>

          <p className="text-sm leading-relaxed text-zinc-400 max-w-xs mb-5">
            Regístrate como ciudadano, fundación o desarrollador y únete a la
            red de adopción animal más completa del departamento.
          </p>

          <ul className="space-y-2">
            {roleCards.map(({ icon: Icon, title, description }) => (
              <li
                key={title}
                className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.04] p-3"
              >
                <span className="flex shrink-0 items-center justify-center w-10 h-10 rounded-lg bg-brand/[0.15]">
                  <Icon className="w-5 h-5 text-brand" />
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="text-[13px] text-zinc-400">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center flex-col lg:flex-row gap-3 lg:gap-6 pt-4">
          {trustBadges.map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-1.5 text-xs text-zinc-600">
              <Icon className="w-3.5 h-3.5" />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col items-center overflow-y-auto bg-white px-4 sm:px-6 py-8 sm:py-12">
        <div className="lg:hidden flex items-center gap-1.5 mb-6 sm:mb-10">
          <span className="text-xl font-bold text-zinc-900 tracking-tight">Huellitas</span>
          <span className="text-xl font-bold text-brand tracking-tight">API</span>
        </div>

        <div className="w-full max-w-sm my-auto">
          <h2 className="text-2xl font-bold text-zinc-900">Crear una cuenta</h2>
          <p className="text-sm text-zinc-500 mt-1 mb-8">Elige tu tipo de cuenta para comenzar</p>

          {/* ── Account type toggle ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
            {accountTypes.map(({ key, icon: Icon, label, description }) => {
              const active = accountType === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setAccountType(key); setErrors({}); }}
                  className={`flex items-start gap-2 sm:gap-3 sm:flex-col sm:items-center sm:text-center rounded-xl border p-2.5 sm:p-3.5 transition cursor-pointer ${active ? 'border-brand bg-brand/10' : 'border-zinc-200 bg-white hover:bg-zinc-50'}`}
                >
                  <span className={`flex shrink-0 items-center justify-center w-9 h-9 rounded-lg transition ${active ? 'bg-brand/15' : 'bg-zinc-100'}`}>
                    <Icon className={`w-[18px] h-[18px] transition ${active ? 'text-brand' : 'text-zinc-500'}`} />
                  </span>
                  <div className="sm:mt-1">
                    <p className={`text-sm font-semibold ${active ? 'text-zinc-900' : 'text-zinc-700'}`}>{label}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Fundación notice ── */}
          {accountType === 'fundacion' && (
            <div className="flex gap-2 sm:gap-3 rounded-lg border border-brand-border bg-brand-light p-2.5 sm:p-3.5 mb-6">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-brand shrink-0 mt-0.5" />
              <p className="text-[13px] leading-relaxed text-zinc-700">
                Las fundaciones requieren verificación manual por el administrador
                antes de poder publicar animales.
              </p>
            </div>
          )}

          {serverError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 mb-5">
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
          )}

          {/* ── Form ── */}
          <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs sm:text-sm font-medium text-zinc-700">
                {nameConfig[accountType].label}
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-[18px] sm:h-[18px] text-zinc-400" />
                <input
                  id="name"
                  type="text"
                  placeholder={nameConfig[accountType].placeholder}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full rounded-lg border bg-white py-2 sm:py-2.5 pl-9 sm:pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition ${errors.full_name ? 'border-red-400' : 'border-zinc-300'}`}
                />
              </div>
              <FieldError message={errors.full_name} />
            </div>

            {/* Fundación-only fields */}
            {accountType === 'fundacion' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs sm:text-sm font-medium text-zinc-700">Municipio</label>
                  <MunicipioCombobox
                    value={municipio}
                    onChange={setMunicipio}
                    hasError={!!errors.municipio}
                  />
                  <FieldError message={errors.municipio} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="text-xs sm:text-sm font-medium text-zinc-700">
                    Teléfono de contacto
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-[18px] sm:h-[18px] text-zinc-400" />
                    <input
                      id="phone"
                      type="tel"
                      placeholder="+57 300 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full rounded-lg border bg-white py-2 sm:py-2.5 pl-9 sm:pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition ${errors.phone ? 'border-red-400' : 'border-zinc-300'}`}
                    />
                  </div>
                  <FieldError message={errors.phone} />
                </div>
              </>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-email" className="text-xs sm:text-sm font-medium text-zinc-700">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-[18px] sm:h-[18px] text-zinc-400" />
                <input
                  id="reg-email"
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
              <label htmlFor="reg-password" className="text-xs sm:text-sm font-medium text-zinc-700">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-[18px] sm:h-[18px] text-zinc-400" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
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

              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition ${level <= strength.score ? strength.color : 'bg-zinc-200'}`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-1">
                    Seguridad: {strength.label}
                  </p>
                </div>
              )}
              <FieldError message={errors.password} />
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirm-password" className="text-xs sm:text-sm font-medium text-zinc-700">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-[18px] sm:h-[18px] text-zinc-400" />
                <input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full rounded-lg border bg-white py-2 sm:py-2.5 pl-9 sm:pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition ${errors.confirmPassword ? 'border-red-400' : 'border-zinc-300'}`}
                />
              </div>
              <FieldError message={errors.confirmPassword} />
            </div>

            {/* Terms checkbox */}
            <div>
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-brand accent-brand focus:ring-brand"
                />
                <span className="text-sm text-zinc-600">
                  Acepto los{' '}
                  <Link to="#" className="text-brand hover:text-brand-dark underline">
                    términos de uso
                  </Link>{' '}
                  y la{' '}
                  <Link to="#" className="text-brand hover:text-brand-dark underline">
                    política de privacidad
                  </Link>
                </span>
              </label>
              <FieldError message={errors.acceptTerms} />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 sm:py-3 text-sm font-medium text-white hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creando cuenta…
                </>
              ) : (
                submitLabel[accountType]
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-zinc-500">¿Ya tienes cuenta?</span>
            </div>
          </div>

          <Link
            to={ROUTES.LOGIN}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 transition"
          >
            <LogIn className="w-4 h-4" />
            Iniciar sesión
          </Link>

          <div className="mt-6 sm:mt-8 text-center">
            <Link
              to={ROUTES.HOME}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-zinc-500 hover:text-zinc-700 transition"
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
