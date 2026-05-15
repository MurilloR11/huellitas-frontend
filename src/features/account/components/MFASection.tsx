import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Loader2, QrCode, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '@/features/auth/services/authApi';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EnrollStep = 'qr' | 'verify' | 'success';

// ─── 6-digit TOTP input ────────────────────────────────────────────────────────

function TotpInput({
  value,
  onChange,
  disabled,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(i: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...value];
    next[i] = val.slice(-1);
    onChange(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      onChange(pasted.split(''));
      refs.current[5]?.focus();
      e.preventDefault();
    }
  }

  return (
    <div className="flex gap-2">
      {[0, 1, 2, 3, 4, 5].map(i => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i]}
          disabled={disabled}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          className={cn(
            'w-10 h-12 rounded-xl border-2 text-center text-xl font-bold text-stone-900 caret-brand',
            'focus:outline-none transition-colors',
            disabled
              ? 'border-stone-100 bg-stone-50 text-stone-300 cursor-not-allowed'
              : value[i]
                ? 'border-brand bg-brand/5'
                : 'border-stone-200 bg-white focus:border-brand focus:bg-brand/5',
          )}
        />
      ))}
    </div>
  );
}

// ─── Enrollment modal ──────────────────────────────────────────────────────────

function EnrollModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep]         = useState<EnrollStep>('qr');
  const [factorId, setFactorId] = useState('');
  const [qrCode, setQrCode]     = useState('');
  const [secret, setSecret]     = useState('');
  const [digits, setDigits]     = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState('');
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    authApi.enrollMFA()
      .then(({ factorId, qrCode, secret }) => {
        if (cancelled) return;
        setFactorId(factorId);
        setQrCode(qrCode);
        setSecret(secret);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : 'Error al iniciar la activación');
          onClose();
        }
      });
    return () => { cancelled = true; };
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleVerify() {
    const code = digits.join('');
    if (code.length < 6) { setError('Ingresa el código completo'); return; }
    setError('');
    setIsLoading(true);
    try {
      await authApi.verifyMFAEnrollment(factorId, code);
      setStep('success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Código incorrecto');
    } finally {
      setIsLoading(false);
    }
  }

  const formattedSecret = secret.match(/.{1,4}/g)?.join(' ') ?? secret;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
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
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <AnimatePresence mode="wait">
          {/* ── Step: QR ── */}
          {step === 'qr' && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="px-8 pt-8 pb-8 space-y-5"
            >
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-brand/10">
                  <QrCode className="w-6 h-6 text-brand" strokeWidth={1.5} />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-bold text-zinc-900">Activar autenticación MFA</h3>
                <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                  Escanea este código con Google Authenticator o Authy
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-brand" />
                </div>
              ) : (
                <>
                  <div className="flex justify-center">
                    <div className="p-3 rounded-xl border border-stone-200 bg-white">
                      <img
                        src={qrCode.startsWith('data:') ? qrCode : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrCode)}`}
                        alt="QR Code MFA"
                        className="w-40 h-40"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-stone-100 bg-stone-50 p-3">
                    <p className="text-xs text-stone-500 mb-1">¿No puedes escanear? Clave manual:</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-mono font-medium text-stone-800 tracking-wider break-all">
                        {showSecret ? formattedSecret : '•'.repeat(Math.min(formattedSecret.length, 32))}
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowSecret(v => !v)}
                        className="shrink-0 text-xs text-brand hover:text-brand-dark font-medium transition"
                      >
                        {showSecret ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={() => setStep('verify')}
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark transition disabled:opacity-60"
              >
                Continuar
              </button>
            </motion.div>
          )}

          {/* ── Step: Verify ── */}
          {step === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="px-8 pt-8 pb-8 space-y-5"
            >
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-brand/10">
                  <ShieldCheck className="w-6 h-6 text-brand" strokeWidth={1.5} />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-bold text-zinc-900">Confirma que funciona</h3>
                <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                  Ingresa el código de 6 dígitos de tu app autenticadora
                </p>
              </div>

              <div className="flex justify-center">
                <TotpInput value={digits} onChange={setDigits} disabled={isLoading} />
              </div>

              {error && <p className="text-xs text-red-500 text-center">{error}</p>}

              <button
                type="button"
                onClick={handleVerify}
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark transition disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verificar y activar'}
              </button>

              <button
                type="button"
                onClick={() => setStep('qr')}
                className="w-full text-xs text-stone-400 hover:text-stone-600 transition"
              >
                ← Volver al QR
              </button>
            </motion.div>
          )}

          {/* ── Step: Success ── */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="px-8 pt-8 pb-8 space-y-5 text-center"
            >
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                  <Check className="w-7 h-7 text-green-600" strokeWidth={2.5} />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-zinc-900">MFA activado</h3>
                <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                  Tu cuenta ahora tiene una capa extra de protección. La próxima vez que
                  inicies sesión, se te pedirá el código de tu app autenticadora.
                </p>
              </div>

              <button
                type="button"
                onClick={() => { onSuccess(); onClose(); }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark transition"
              >
                Listo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ─── MFASection ────────────────────────────────────────────────────────────────

export function MFASection() {
  const [factors, setFactors]     = useState<Array<{ id: string; status: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEnroll, setShowEnroll] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);

  async function loadFactors() {
    setIsLoading(true);
    try {
      setFactors(await authApi.listMFAFactors());
    } catch {
      setFactors([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadFactors(); }, []);

  const activeFactor = factors.find(f => f.status === 'verified');

  async function handleUnenroll() {
    if (!activeFactor) return;
    setUnenrolling(true);
    try {
      await authApi.unenrollMFA(activeFactor.id);
      toast.success('MFA desactivado');
      loadFactors();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al desactivar MFA');
    } finally {
      setUnenrolling(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {showEnroll && (
          <EnrollModal
            onClose={() => setShowEnroll(false)}
            onSuccess={() => { loadFactors(); toast.success('MFA activado exitosamente'); }}
          />
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between gap-6 py-4 border-b border-stone-100 last:border-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-stone-800">
              Autenticación de dos factores (MFA)
            </p>
            {!isLoading && activeFactor && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                <Check className="w-3 h-3" />
                Activo
              </span>
            )}
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            {isLoading
              ? 'Verificando...'
              : activeFactor
                ? 'Tu cuenta está protegida con autenticación de dos factores.'
                : 'Añade una capa extra de seguridad con Google Authenticator o Authy.'}
          </p>
        </div>

        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-stone-400 mt-0.5 shrink-0" />
        ) : activeFactor ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleUnenroll}
            disabled={unenrolling}
            className="shrink-0 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
          >
            {unenrolling ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Desactivar'}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEnroll(true)}
            className="shrink-0 text-xs border-stone-200"
          >
            Activar
          </Button>
        )}
      </div>
    </>
  );
}
