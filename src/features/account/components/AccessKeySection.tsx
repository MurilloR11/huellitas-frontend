import { useState, useEffect } from 'react';
import { KeyRound, Loader2, RefreshCw, Trash2, X, ShieldAlert, AlertTriangle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { securityApi } from '@/features/auth/services/securityApi';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCooldown, formatCooldown } from '@/shared/hooks/useCooldown';

// ─── Key modal (shown once after generating) ───────────────────────────────────

function KeyModal({
  userId,
  plainKey,
  onClose,
}: {
  userId: string;
  plainKey: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function buildFileContent() {
    return JSON.stringify(
      { service: 'huellitas', version: '1', user_id: userId, key: plainKey },
      null,
      2,
    );
  }

  function handleDownload() {
    const blob = new Blob([buildFileContent()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'huellitas-llave-acceso.json';
    a.click();
    URL.revokeObjectURL(url);
  }

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
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 flex items-center justify-center w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="px-5 pt-5 pb-5 space-y-3.5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand/10 shrink-0">
              <KeyRound className="w-5 h-5 text-brand" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 leading-tight">Llave de acceso generada</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Guárdala en un lugar seguro.</p>
            </div>
          </div>

          {/* Warning banner */}
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-700 leading-relaxed">
              Este archivo da acceso completo a tu cuenta. Trátalo como una contraseña. Si lo pierdes tendrás que generar uno nuevo.
            </p>
          </div>

          {/* File preview */}
          <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5">
            <p className="text-[10px] font-mono text-stone-400 leading-relaxed break-all">
              huellitas-llave-acceso<span className="text-stone-500">.json</span>
            </p>
            <p className="text-[11px] font-mono text-stone-600 mt-1 leading-relaxed break-all">
              key: {plainKey.slice(0, 16)}…
            </p>
          </div>

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-stone-200 px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-800 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Descargar llave de acceso
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition"
          >
            Ya la guardé
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Revoke confirmation dialog ────────────────────────────────────────────────

function RevokeDialog({ onConfirm, onCancel, isRevoking }: {
  onConfirm: () => void;
  onCancel: () => void;
  isRevoking: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-xs rounded-2xl bg-white shadow-2xl p-5 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-50 shrink-0">
            <ShieldAlert className="w-4.5 h-4.5 text-red-500" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900">¿Revocar llave de acceso?</p>
            <p className="text-xs text-zinc-400 mt-0.5">Esta acción no se puede deshacer.</p>
          </div>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">
          El archivo de llave que tienes guardado dejará de funcionar para iniciar sesión.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isRevoking}
            className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isRevoking}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 transition disabled:opacity-50"
          >
            {isRevoking ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            Revocar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── AccessKeySection ──────────────────────────────────────────────────────────

export function AccessKeySection() {
  const { user } = useAuth();
  const [status, setStatus]             = useState<{ has_key: boolean; created_at: string | null } | null>(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevoking, setIsRevoking]     = useState(false);
  const [plainKey, setPlainKey]         = useState('');
  const [showModal, setShowModal]       = useState(false);
  const [showRevoke, setShowRevoke]     = useState(false);
  const generateCooldown = useCooldown(300);
  const revokeCooldown   = useCooldown(30);

  async function loadStatus() {
    setIsLoading(true);
    try {
      setStatus(await securityApi.getAccessKeyStatus());
    } catch {
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadStatus(); }, []);

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const key = await securityApi.generateAccessKey();
      setPlainKey(key);

      // Auto-download
      const content = JSON.stringify(
        { service: 'huellitas', version: '1', user_id: user!.id, key },
        null, 2,
      );
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'huellitas-llave-acceso.json';
      a.click();
      URL.revokeObjectURL(url);

      setShowModal(true);
      generateCooldown.start();
      await loadStatus();
    } catch {
      toast.error('No se pudo generar la llave. Inténtalo de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleRevoke() {
    setIsRevoking(true);
    try {
      await securityApi.revokeAccessKey();
      toast.success('Llave de acceso revocada');
      setShowRevoke(false);
      revokeCooldown.start();
      await loadStatus();
    } catch {
      toast.error('No se pudo revocar la llave.');
    } finally {
      setIsRevoking(false);
    }
  }

  const hasKey    = status?.has_key ?? false;
  const createdAt = status?.created_at ?? null;

  function formattedDate() {
    if (!createdAt) return '';
    return new Intl.DateTimeFormat('es-CO', {
      day: 'numeric', month: 'short', year: 'numeric',
    }).format(new Date(createdAt));
  }

  return (
    <>
      <AnimatePresence>
        {showModal && user && (
          <KeyModal
            userId={user.id}
            plainKey={plainKey}
            onClose={() => setShowModal(false)}
          />
        )}
        {showRevoke && (
          <RevokeDialog
            onConfirm={handleRevoke}
            onCancel={() => setShowRevoke(false)}
            isRevoking={isRevoking}
          />
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between gap-6 py-4 border-b border-stone-100 last:border-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-stone-800">Llave de acceso</p>
            {!isLoading && (
              <span className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                hasKey
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-stone-100 text-stone-500 border-stone-200',
              )}>
                {hasKey ? 'Activa' : 'No configurada'}
              </span>
            )}
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            {isLoading
              ? 'Verificando...'
              : hasKey
                ? `Generada el ${formattedDate()}. Úsala como acceso de emergencia.`
                : 'Archivo de emergencia si pierdes acceso a tu contraseña y autenticador.'}
          </p>
        </div>

        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-stone-400 mt-0.5 shrink-0" />
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            {hasKey && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRevoke(true)}
                disabled={isGenerating || isRevoking || revokeCooldown.isOnCooldown}
                className="text-xs border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300 gap-1.5"
              >
                <Trash2 className="w-3 h-3" />
                {revokeCooldown.isOnCooldown ? formatCooldown(revokeCooldown.remaining) : 'Revocar'}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={isGenerating || generateCooldown.isOnCooldown}
              className="text-xs border-stone-200 gap-1.5"
            >
              {isGenerating
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : hasKey
                  ? <RefreshCw className="w-3 h-3" />
                  : <KeyRound className="w-3 h-3" />
              }
              {generateCooldown.isOnCooldown
                ? formatCooldown(generateCooldown.remaining)
                : hasKey ? 'Regenerar' : 'Generar'
              }
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
