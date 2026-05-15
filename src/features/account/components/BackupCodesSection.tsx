import { useState, useEffect } from 'react';
import { ShieldAlert, Loader2, Copy, RefreshCw, AlertTriangle, Check, X, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import { securityApi } from '@/features/auth/services/securityApi';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCooldown, formatCooldown } from '@/shared/hooks/useCooldown';

// ─── PDF generator ─────────────────────────────────────────────────────────────

function generatePDF(codes: string[]) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();

  // — Brand header bar —
  doc.setFillColor(234, 88, 12); // brand orange
  doc.rect(0, 0, W, 38, 'F');

  // Paw icon placeholder: simple circle + dots
  doc.setFillColor(255, 255, 255);
  doc.circle(22, 19, 10, 'F');
  doc.setFillColor(234, 88, 12);
  doc.circle(22, 19, 5, 'F');

  // Title in header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('Huellitas', 38, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(255, 220, 180);
  doc.text('Códigos de respaldo · Acceso de emergencia', 38, 24);

  // Date on top-right
  const dateStr = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFontSize(8);
  doc.setTextColor(255, 200, 160);
  doc.text(dateStr, W - 14, 24, { align: 'right' });

  // — Warning box —
  const warnY = 50;
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(253, 186, 116);
  doc.roundedRect(14, warnY, W - 28, 22, 3, 3, 'FD');

  // Triangle icon (drawn manually)
  doc.setFillColor(245, 158, 11);
  doc.triangle(22, warnY + 15, 19, warnY + 15, 20.5, warnY + 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(146, 64, 14);
  doc.text('Guarda estos códigos en un lugar seguro', 28, warnY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 90, 20);
  doc.text('Cada código funciona una sola vez. Sin ellos, podrías perder acceso a tu cuenta.', 28, warnY + 17);

  // — Section title —
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(28, 25, 23);
  doc.text('Tus 10 códigos de emergencia', 14, 84);

  // — Codes grid (2 columns × 5 rows) —
  const colW = (W - 28 - 6) / 2;
  const rowH = 14;
  const startX = [14, 14 + colW + 6];
  let row = 0, col = 0;

  codes.forEach((code, i) => {
    const x = startX[col];
    const y = 88 + row * (rowH + 3);

    // Card background
    doc.setFillColor(250, 250, 249);
    doc.setDrawColor(214, 211, 209);
    doc.roundedRect(x, y, colW, rowH, 2, 2, 'FD');

    // Index badge
    doc.setFillColor(234, 88, 12);
    doc.roundedRect(x + colW - 10, y + 2, 8, 6, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(255, 255, 255);
    doc.text(String(i + 1), x + colW - 6, y + 6.5, { align: 'center' });

    // Code text
    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(41, 37, 36);
    doc.text(code, x + 4, y + 9);

    col++;
    if (col === 2) { col = 0; row++; }
  });

  // — Divider —
  const divY = 88 + 5 * (rowH + 3) + 6;
  doc.setDrawColor(214, 211, 209);
  doc.line(14, divY, W - 14, divY);

  // — Instructions —
  const instrY = divY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(28, 25, 23);
  doc.text('¿Cómo usar estos códigos?', 14, instrY);

  const steps = [
    '1. Inicia sesión con tu correo y contraseña.',
    '2. En el paso de verificación en dos pasos, elige "Usar código de respaldo".',
    '3. Ingresa uno de los códigos de esta lista.',
    '4. Ese código queda inutilizable. Táchalo para llevar el registro.',
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(68, 64, 60);
  steps.forEach((s, i) => doc.text(s, 14, instrY + 8 + i * 7));

  // — Footer —
  const footY = 272;
  doc.setFillColor(245, 245, 244);
  doc.rect(0, footY, W, 25, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 113, 108);
  doc.setFont('helvetica', 'normal');
  doc.text('Este documento contiene información confidencial. No lo compartas con nadie.', W / 2, footY + 9, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(234, 88, 12);
  doc.text('huellitas.app', W / 2, footY + 17, { align: 'center' });

  doc.save('huellitas-codigos-respaldo.pdf');
}

// ─── Codes modal ───────────────────────────────────────────────────────────────

function CodesModal({
  codes,
  onClose,
}: {
  codes: string[];
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleCopyAll() {
    navigator.clipboard.writeText(codes.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 leading-tight">Guarda tus códigos de respaldo</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Solo se muestran una vez.</p>
            </div>
          </div>

          {/* Warning banner */}
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Cada código funciona una sola vez. Si los pierdes y no puedes acceder a tu autenticador, quedarás bloqueado de tu cuenta.
            </p>
          </div>

          {/* Codes grid */}
          <div className="grid grid-cols-2 gap-1.5">
            {codes.map((code, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5"
              >
                <span className="text-[11px] font-mono font-semibold text-stone-700 tracking-wide">{code}</span>
                <span className="text-[10px] text-stone-400 shrink-0 tabular-nums">{i + 1}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopyAll}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition',
                copied
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-800',
              )}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiados' : 'Copiar todos'}
            </button>
            <button
              type="button"
              onClick={() => generatePDF(codes)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-800 transition"
            >
              <FileDown className="w-3.5 h-3.5" />
              Descargar PDF
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition"
          >
            Ya los guardé
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── BackupCodesSection ────────────────────────────────────────────────────────

export function BackupCodesSection() {
  const [status, setStatus]             = useState<{ total: number; remaining: number } | null>(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [codes, setCodes]               = useState<string[]>([]);
  const [showModal, setShowModal]       = useState(false);
  const cooldown = useCooldown(60);

  async function loadStatus() {
    setIsLoading(true);
    try {
      setStatus(await securityApi.getBackupCodesStatus());
    } catch {
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadStatus(); }, []);

  async function handleGenerate(regenerate = false) {
    setIsGenerating(true);
    try {
      const result = regenerate
        ? await securityApi.regenerateBackupCodes()
        : await securityApi.generateBackupCodes();
      setCodes(result);
      setShowModal(true);
      cooldown.start();
      await loadStatus();
    } catch {
      toast.error('No se pudieron generar los códigos. Inténtalo de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  }

  const hasExisting = (status?.total ?? 0) > 0;
  const remaining   = status?.remaining ?? 0;
  const isLow       = hasExisting && remaining <= 2;

  function statusText() {
    if (!hasExisting) return 'No tienes códigos de respaldo configurados.';
    if (remaining === 0) return 'Todos tus códigos han sido utilizados. Genera nuevos.';
    return `${remaining} de 10 códigos disponibles.`;
  }

  return (
    <>
      <AnimatePresence>
        {showModal && (
          <CodesModal codes={codes} onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between gap-6 py-4 border-b border-stone-100 last:border-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-stone-800">Códigos de respaldo</p>
            {!isLoading && hasExisting && remaining > 0 && (
              <span className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
                isLow
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-green-50 text-green-700 border-green-200',
              )}>
                {isLow && <AlertTriangle className="w-3 h-3" />}
                {remaining} restantes
              </span>
            )}
            {!isLoading && hasExisting && remaining === 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                Agotados
              </span>
            )}
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            {isLoading ? 'Verificando...' : statusText()}
          </p>
        </div>

        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-stone-400 mt-0.5 shrink-0" />
        ) : hasExisting ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleGenerate(true)}
            disabled={isGenerating || cooldown.isOnCooldown}
            className="shrink-0 text-xs border-stone-200 gap-1.5"
          >
            {isGenerating
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <RefreshCw className="w-3 h-3" />
            }
            {cooldown.isOnCooldown ? formatCooldown(cooldown.remaining) : 'Regenerar'}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleGenerate(false)}
            disabled={isGenerating || cooldown.isOnCooldown}
            className="shrink-0 text-xs border-stone-200"
          >
            {isGenerating
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : cooldown.isOnCooldown
                ? formatCooldown(cooldown.remaining)
                : 'Generar'
            }
          </Button>
        )}
      </div>
    </>
  );
}
