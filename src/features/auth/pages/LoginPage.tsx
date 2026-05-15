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
  Timer,
  Smartphone,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCooldown, formatCooldown } from '@/shared/hooks/useCooldown';
import { ROUTES } from '../../../shared/constants/routes';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../services/authApi';
import { securityApi } from '../services/securityApi';
import type { AuthUser } from '../types';
import apiClient from '../../../shared/lib/apiClient';
import { loginSchema } from '../schemas/authSchemas';
import { supabase } from '../../../shared/lib/supabaseClient';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);
  const resendCooldown = useCooldown(60);

  useEffect(() => {
    if (step !== 'code') return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) { clearInterval(id); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [step, timerKey]);

  function formatTime(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  const codeExpired = step === 'code' && timeLeft <= 0;

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

  async function handleSendCode() {
    if (!emailVal.trim()) { setError('Ingresa tu correo'); return; }
    setError('');
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: emailVal.trim().toLowerCase() });
      setTimeLeft(600);
      setTimerKey(k => k + 1);
      resendCooldown.start();
      setStep('code');
    } catch {
      setError('No se pudo enviar el código. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (timeLeft <= 0) { setError('El código ha expirado. Solicita uno nuevo.'); return; }
    const otp = digits.join('');
    if (otp.length < 4) { setError('Ingresa el código completo'); return; }
    setError('');
    setIsLoading(true);
    try {
      const { data } = await apiClient.post<{ reset_token: string }>('/auth/verify-otp', {
        email: emailVal.trim().toLowerCase(),
        otp,
      });
      setResetToken(data.reset_token);
      setStep('password');
    } catch {
      setError('Código inválido o expirado.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResetPassword() {
    if (newPass.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }
    if (newPass !== confirmPass) { setError('Las contraseñas no coinciden'); return; }
    setError('');
    setIsLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        email: emailVal.trim().toLowerCase(),
        reset_token: resetToken,
        new_password: newPass,
      });
      toast.success('Contraseña actualizada exitosamente');
      onClose();
    } catch {
      setError('No se pudo actualizar la contraseña. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

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

              {error && step === 'email' && (
                <p className="text-xs text-red-500 text-center">{error}</p>
              )}

              <button
                type="button"
                onClick={handleSendCode}
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar código'}
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

              {/* Countdown timer */}
              <div className="flex justify-center">
                {codeExpired ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                    <Timer className="w-3 h-3" />
                    Código expirado
                  </div>
                ) : (
                  <div className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
                    timeLeft > 120
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : timeLeft > 30
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-red-50 text-red-600 border-red-200',
                  )}>
                    <Timer className="w-3 h-3" />
                    {formatTime(timeLeft)}
                  </div>
                )}
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
                    disabled={codeExpired}
                    onChange={e => handleDigit(i, e.target.value)}
                    onKeyDown={e => handleDigitKey(i, e)}
                    className={cn(
                      'w-14 h-14 rounded-xl border-2 text-center text-2xl font-bold text-zinc-900 caret-brand',
                      'focus:outline-none transition-colors',
                      codeExpired
                        ? 'border-zinc-200 bg-zinc-50 text-zinc-400 cursor-not-allowed'
                        : d
                          ? 'border-brand bg-brand/5'
                          : 'border-zinc-200 bg-white focus:border-brand focus:bg-brand/5',
                    )}
                  />
                ))}
              </div>

              {error && step === 'code' && (
                <p className="text-xs text-red-500 text-center">{error}</p>
              )}

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isLoading || codeExpired}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verificar código'}
              </button>

              <p className="text-center text-xs text-zinc-400">
                {codeExpired ? 'El código expiró. ' : '¿No recibiste el código? '}
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isLoading || resendCooldown.isOnCooldown}
                  className="font-medium text-brand hover:text-brand-dark transition disabled:opacity-50"
                >
                  {resendCooldown.isOnCooldown
                    ? `Reenviar en ${formatCooldown(resendCooldown.remaining)}`
                    : codeExpired ? 'Solicitar uno nuevo' : 'Reenviar'
                  }
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

              {error && step === 'password' && (
                <p className="text-xs text-red-500 text-center">{error}</p>
              )}

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cambiar contraseña'}
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
  const { login, commitLogin } = useAuth();

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // MFA challenge state
  const [loginStep, setLoginStep] = useState<'form' | 'mfa' | 'keyfile'>('form');
  const [mfaMode, setMfaMode] = useState<'totp' | 'backup'>('totp');
  const [mfaFactorId, setMfaFactorId] = useState('');
  const [pendingUser, setPendingUser] = useState<AuthUser | null>(null);
  const [mfaDigits, setMfaDigits] = useState(['', '', '', '', '', '']);
  const [mfaError, setMfaError] = useState('');
  const [isMfaSubmitting, setIsMfaSubmitting] = useState(false);
  const mfaRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [backupCode, setBackupCode] = useState('');

  // Keyfile login state
  const [isKeyfileSubmitting, setIsKeyfileSubmitting] = useState(false);
  const [keyfileError, setKeyfileError] = useState('');
  const keyfileInputRef = useRef<HTMLInputElement>(null);

  function formatBackupCode(raw: string): string {
    const clean = raw.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 12);
    return clean.match(/.{1,4}/g)?.join('-') ?? clean;
  }

  function switchMfaMode(mode: 'totp' | 'backup') {
    setMfaMode(mode);
    setMfaError('');
    setMfaDigits(['', '', '', '', '', '']);
    setBackupCode('');
  }

  function navigateAfterLogin(user: AuthUser) {
    const firstName = user.full_name.split(' ')[0];
    const label = user.role === 'admin' ? `Bienvenido, ${firstName} Admin` : `Bienvenido, ${firstName}`;
    toast.success(label, { duration: 4000 });
    if (user.role === 'admin') navigate(ROUTES.ADMIN);
    else if (user.role === 'developer') navigate(ROUTES.DEVELOPER_DASHBOARD);
    else if (user.role === 'fundacion') {
      if (user.status === 'pending') navigate(ROUTES.PENDING);
      else if (user.status === 'rejected') navigate(ROUTES.REJECTED);
      else navigate(ROUTES.FOUNDATION_DASHBOARD);
    } else {
      navigate('/explore');
    }
  }

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

      const mfaStatus = await authApi.getMFAStatus();
      if (mfaStatus.required && mfaStatus.factorId) {
        setPendingUser(user);
        setMfaFactorId(mfaStatus.factorId);
        setLoginStep('mfa');
        return;
      }

      // No MFA — safe to commit the user to context now.
      commitLogin(user);
      navigateAfterLogin(user);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleMfaDigit(i: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...mfaDigits];
    next[i] = val.slice(-1);
    setMfaDigits(next);
    if (val && i < 5) mfaRefs.current[i + 1]?.focus();
  }

  function handleMfaKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !mfaDigits[i] && i > 0) mfaRefs.current[i - 1]?.focus();
  }

  function handleMfaPaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setMfaDigits(pasted.split(''));
      mfaRefs.current[5]?.focus();
      e.preventDefault();
    }
  }

  async function handleMFAVerify() {
    const code = mfaDigits.join('');
    if (code.length < 6) { setMfaError('Ingresa el código completo'); return; }
    setMfaError('');
    setIsMfaSubmitting(true);
    try {
      await authApi.completeMFAChallenge(mfaFactorId, code);
      if (pendingUser) {
        commitLogin(pendingUser);
        navigateAfterLogin(pendingUser);
      }
    } catch (err) {
      setMfaError(err instanceof Error ? err.message : 'Código incorrecto');
      setMfaDigits(['', '', '', '', '', '']);
      mfaRefs.current[0]?.focus();
    } finally {
      setIsMfaSubmitting(false);
    }
  }

  async function handleBackupVerify() {
    if (backupCode.length < 14) { setMfaError('Ingresa el código completo (xxxx-xxxx-xxxx)'); return; }
    setMfaError('');
    setIsMfaSubmitting(true);
    try {
      await securityApi.verifyBackupCode(backupCode);
      if (pendingUser) {
        commitLogin(pendingUser);
        navigateAfterLogin(pendingUser);
      }
    } catch {
      setMfaError('Código inválido o ya utilizado');
      setBackupCode('');
    } finally {
      setIsMfaSubmitting(false);
    }
  }

  async function handleMFACancel() {
    await authApi.logout();
    setLoginStep('form');
    setMfaMode('totp');
    setMfaDigits(['', '', '', '', '', '']);
    setMfaError('');
    setBackupCode('');
    setPendingUser(null);
  }

  async function handleKeyFileLogin(file: File) {
    setKeyfileError('');
    setIsKeyfileSubmitting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed.service !== 'huellitas' || !parsed.user_id || !parsed.key) {
        setKeyfileError('Archivo inválido. Asegúrate de usar el archivo generado por Huellitas.');
        return;
      }
      const { hashed_token } = await securityApi.loginWithAccessKey(parsed.user_id, parsed.key);
      const { data, error } = await supabase.auth.verifyOtp({ token_hash: hashed_token, type: 'magiclink' });
      if (error || !data.session) {
        setKeyfileError('No se pudo verificar la llave. Intenta de nuevo.');
        return;
      }
      const { data: profile } = await apiClient.get<AuthUser>('/auth/me');
      commitLogin(profile);
      navigateAfterLogin(profile);
    } catch {
      setKeyfileError('Llave inválida o revocada.');
    } finally {
      setIsKeyfileSubmitting(false);
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

        <AnimatePresence mode="wait">
          {/* ── Login form ── */}
          {loginStep === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
              className="w-full max-w-sm my-auto"
            >
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

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => { setLoginStep('keyfile'); setKeyfileError(''); }}
                  className="text-xs text-zinc-400 hover:text-zinc-600 transition"
                >
                  ¿Tienes una llave de acceso?
                </button>
              </div>

              <div className="mt-4 sm:mt-6 text-center">
                <Link
                  to={ROUTES.HOME}
                  className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al inicio
                </Link>
              </div>
            </motion.div>
          )}

          {/* ── Keyfile login ── */}
          {loginStep === 'keyfile' && (
            <motion.div
              key="keyfile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.22 }}
              className="w-full max-w-sm my-auto"
            >
              <button
                type="button"
                onClick={() => { setLoginStep('form'); setKeyfileError(''); }}
                className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>

              <div className="flex justify-center mb-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10">
                  <KeyRound className="w-7 h-7 text-brand" strokeWidth={1.5} />
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 text-center">
                Llave de acceso
              </h2>
              <p className="text-sm text-zinc-500 mt-1 mb-8 text-center leading-relaxed">
                Selecciona el archivo{' '}
                <span className="font-mono text-xs bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-700">
                  huellitas-llave-acceso.json
                </span>{' '}
                que guardaste al configurar tu llave.
              </p>

              {keyfileError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 mb-5">
                  <p className="text-sm text-red-700">{keyfileError}</p>
                </div>
              )}

              <input
                id="keyfile-input"
                ref={keyfileInputRef}
                type="file"
                accept=".json,application/json"
                className="sr-only"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleKeyFileLogin(file);
                  e.target.value = '';
                }}
              />

              <label
                htmlFor="keyfile-input"
                className={cn(
                  'w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-10 transition group',
                  isKeyfileSubmitting
                    ? 'border-zinc-200 opacity-60 cursor-not-allowed pointer-events-none'
                    : 'border-zinc-200 hover:border-brand hover:bg-brand/5 cursor-pointer',
                )}
              >
                {isKeyfileSubmitting
                  ? <Loader2 className="w-8 h-8 text-brand animate-spin" />
                  : <Upload className="w-8 h-8 text-zinc-300 group-hover:text-brand transition" />
                }
                <span className="text-sm font-medium text-zinc-400 group-hover:text-brand transition">
                  {isKeyfileSubmitting ? 'Verificando llave…' : 'Elegir archivo .json'}
                </span>
              </label>
            </motion.div>
          )}

          {/* ── MFA challenge ── */}
          {loginStep === 'mfa' && (
            <motion.div
              key="mfa"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.22 }}
              className="w-full max-w-sm my-auto"
            >
              <div className="flex justify-center mb-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10">
                  <Smartphone className="w-7 h-7 text-brand" strokeWidth={1.5} />
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 text-center">
                Verificación en dos pasos
              </h2>
              <p className="text-sm text-zinc-500 mt-1 mb-8 text-center leading-relaxed">
                {mfaMode === 'totp'
                  ? 'Abre tu app autenticadora e ingresa el código de 6 dígitos'
                  : 'Ingresa uno de tus códigos de respaldo de 12 caracteres'}
              </p>

              <AnimatePresence mode="wait">
                {mfaMode === 'totp' ? (
                  <motion.div
                    key="totp"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="flex justify-center mb-6">
                      <div className="flex gap-2">
                        {[0, 1, 2, 3, 4, 5].map(i => (
                          <input
                            key={i}
                            ref={el => { mfaRefs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={mfaDigits[i]}
                            disabled={isMfaSubmitting}
                            onChange={e => handleMfaDigit(i, e.target.value)}
                            onKeyDown={e => handleMfaKey(i, e)}
                            onPaste={i === 0 ? handleMfaPaste : undefined}
                            className={cn(
                              'w-11 h-13 rounded-xl border-2 text-center text-xl font-bold text-zinc-900 caret-brand',
                              'focus:outline-none transition-colors',
                              isMfaSubmitting
                                ? 'border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed'
                                : mfaDigits[i]
                                  ? 'border-brand bg-brand/5'
                                  : 'border-zinc-200 bg-white focus:border-brand focus:bg-brand/5',
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    {mfaError && (
                      <p className="text-xs text-red-500 text-center mb-4">{mfaError}</p>
                    )}

                    <button
                      type="button"
                      onClick={handleMFAVerify}
                      disabled={isMfaSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 sm:py-3 text-sm font-medium text-white hover:bg-brand-dark transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isMfaSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      {isMfaSubmitting ? 'Verificando…' : 'Verificar'}
                    </button>

                    <p className="text-center text-xs text-zinc-400 mt-4">
                      ¿No tienes acceso a tu autenticador?{' '}
                      <button
                        type="button"
                        onClick={() => switchMfaMode('backup')}
                        className="font-medium text-brand hover:text-brand-dark transition"
                      >
                        Usar código de respaldo
                      </button>
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="backup"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="mb-6">
                      <input
                        type="text"
                        value={backupCode}
                        placeholder="xxxx-xxxx-xxxx"
                        autoFocus
                        disabled={isMfaSubmitting}
                        onChange={e => setBackupCode(formatBackupCode(e.target.value))}
                        onKeyDown={e => { if (e.key === 'Enter') handleBackupVerify(); }}
                        className={cn(
                          'w-full rounded-xl border-2 text-center text-base font-mono font-medium text-zinc-900 py-3 px-4 caret-brand tracking-widest',
                          'focus:outline-none transition-colors',
                          isMfaSubmitting
                            ? 'border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed'
                            : backupCode
                              ? 'border-brand bg-brand/5'
                              : 'border-zinc-200 bg-white focus:border-brand focus:bg-brand/5',
                        )}
                      />
                    </div>

                    {mfaError && (
                      <p className="text-xs text-red-500 text-center mb-4">{mfaError}</p>
                    )}

                    <button
                      type="button"
                      onClick={handleBackupVerify}
                      disabled={isMfaSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 sm:py-3 text-sm font-medium text-white hover:bg-brand-dark transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isMfaSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                      {isMfaSubmitting ? 'Verificando…' : 'Usar código de respaldo'}
                    </button>

                    <p className="text-center text-xs text-zinc-400 mt-4">
                      ¿Tienes tu autenticador disponible?{' '}
                      <button
                        type="button"
                        onClick={() => switchMfaMode('totp')}
                        className="font-medium text-brand hover:text-brand-dark transition"
                      >
                        Usar código TOTP
                      </button>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={handleMFACancel}
                  className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al inicio de sesión
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </>
  );
}
