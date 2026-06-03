import { useState, useEffect } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DeveloperSidebar, type DevNavId } from '@/shared/ui/organisms/DeveloperSidebar';
import {
  ChevronRight,
  Menu,
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  X,
  AlertCircle,
  Zap,
  Clock,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { huellitasApiSpec } from '../openapi-spec';
import '../swagger-overrides.css';
import { useApiKeys, useCreateKey, useRevokeKey, useStats } from '../hooks/useApiKeys';
import type { ApiKey, CreatedApiKey } from '../services/developerApi';

// ─── Breadcrumb map ────────────────────────────────────────────────────────────

const BREADCRUMBS: Record<DevNavId, string[]> = {
  overview:  [],
  'api-keys': ['API Keys'],
  'api-docs': ['Documentación'],
  stats:     ['Errores', 'Registro'],
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}



// ─── Overview ──────────────────────────────────────────────────────────────────

function OverviewPage({ onNavigate }: { onNavigate: (id: DevNavId) => void }) {
  const { data: keys = [], isLoading: keysLoading } = useApiKeys();
  const { data: stats } = useStats();
  const activeKeys  = keys.filter((k: ApiKey) => k.active).length;
  const daily       = stats?.daily ?? [];
  const todayCalls  = daily[daily.length - 1]?.calls ?? 0;
  const todayErrors = daily[daily.length - 1]?.errors ?? 0;
  const maxCalls    = Math.max(...daily.map(d => d.calls), 1);
  const totalCalls  = stats?.total_calls_all ?? 0;

  return (
    <div className="px-6 sm:px-8 py-7 space-y-4">

      {/* ── KPI bento asimétrico ─────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-3">

        {/* Hero — llamadas hoy (2× ancho en desktop) */}
        <div className="col-span-2 md:col-span-1 relative overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 px-6 pt-5 pb-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-mono font-bold tracking-[0.12em] text-stone-400 dark:text-zinc-500 uppercase">
              Llamadas hoy
            </p>
            <Zap className="w-3.5 h-3.5 text-blue-400 shrink-0" strokeWidth={2} />
          </div>
          <p className="text-5xl font-bold tracking-tight tabular-nums text-stone-900 dark:text-zinc-100 mt-2">
            {todayCalls.toLocaleString()}
          </p>
          <p className="text-[11px] text-stone-400 dark:text-zinc-500 mt-1.5">peticiones en las últimas 24h</p>

          {/* Mini sparkline */}
          <div className="flex items-end gap-0.5 mt-4 h-9">
            {daily.map((day) => (
              <div
                key={day.date}
                className="flex-1 rounded-sm bg-brand/20 dark:bg-brand/15 hover:bg-brand/45 transition-colors duration-200"
                style={{ height: `${(day.calls / maxCalls) * 100}%` }}
                title={`${day.date}: ${day.calls}`}
              />
            ))}
          </div>

          {/* Decorative radial */}
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-blue-50 dark:bg-blue-950/20 pointer-events-none" />
        </div>

        {/* Total acumulado */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 px-5 py-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono font-bold tracking-[0.12em] text-stone-400 dark:text-zinc-500 uppercase">Total</p>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" strokeWidth={2} />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold tabular-nums text-stone-900 dark:text-zinc-100">{totalCalls.toLocaleString()}</p>
            <p className="text-[11px] text-stone-400 dark:text-zinc-500 mt-1">históricas</p>
          </div>
        </div>

        {/* Keys activas */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 px-5 py-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono font-bold tracking-[0.12em] text-stone-400 dark:text-zinc-500 uppercase">Keys</p>
            <ShieldCheck className="w-3.5 h-3.5 text-violet-400 shrink-0" strokeWidth={2} />
          </div>
          <div className="mt-4">
            {keysLoading ? (
              <div className="h-7 w-12 bg-stone-100 dark:bg-zinc-800 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold tabular-nums text-stone-900 dark:text-zinc-100">
                {activeKeys}
                <span className="text-base font-normal text-stone-300 dark:text-zinc-600">/{keys.length}</span>
              </p>
            )}
            <p className="text-[11px] text-stone-400 dark:text-zinc-500 mt-1">activas</p>
          </div>
        </div>

        {/* Errores hoy */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 px-5 py-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono font-bold tracking-[0.12em] text-stone-400 dark:text-zinc-500 uppercase">Errores</p>
            <AlertCircle className={cn('w-3.5 h-3.5 shrink-0', todayErrors > 0 ? 'text-red-400' : 'text-stone-200 dark:text-zinc-700')} strokeWidth={2} />
          </div>
          <div className="mt-4">
            <p className={cn('text-2xl font-bold tabular-nums', todayErrors > 0 ? 'text-red-500' : 'text-stone-900 dark:text-zinc-100')}>
              {todayErrors}
            </p>
            <p className="text-[11px] text-stone-400 dark:text-zinc-500 mt-1">hoy · 4xx / 5xx</p>
          </div>
        </div>
      </div>

      {/* ── Fila inferior: inicio rápido + keys ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-4">

        {/* Inicio rápido */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 px-6 py-6">
          <p className="text-[10px] font-mono font-bold tracking-[0.12em] text-stone-400 dark:text-zinc-500 uppercase mb-6">
            Inicio rápido
          </p>
          <div className="relative pl-9">
            <div className="absolute left-3 top-1 bottom-1 w-px bg-stone-100 dark:bg-zinc-800" />
            <div className="space-y-6">
              {[
                {
                  n: '1',
                  content: (
                    <>
                      Genera una{' '}
                      <button onClick={() => onNavigate('api-keys')} className="text-brand font-semibold hover:underline underline-offset-2">
                        API Key
                      </button>{' '}
                      desde el panel de keys.
                    </>
                  ),
                },
                {
                  n: '2',
                  content: (
                    <div>
                      <span className="text-stone-600 dark:text-zinc-400">Incluye el header en cada petición:</span>
                      <code className="block mt-2 text-[11px] font-mono text-brand bg-brand-light dark:bg-brand/10 px-3 py-2 rounded-lg border border-brand-border dark:border-brand/20">
                        X-API-Key: hll_sk_...
                      </code>
                    </div>
                  ),
                },
                {
                  n: '3',
                  content: (
                    <>
                      Consulta la{' '}
                      <button onClick={() => onNavigate('api-docs')} className="text-brand font-semibold hover:underline underline-offset-2">
                        documentación
                      </button>{' '}
                      para explorar todos los endpoints.
                    </>
                  ),
                },
              ].map(({ n, content }) => (
                <div key={n} className="relative flex gap-4">
                  <span className="absolute -left-9 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white text-[10px] font-bold shrink-0">
                    {n}
                  </span>
                  <p className="text-sm text-stone-600 dark:text-zinc-400 leading-relaxed">{content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mis API Keys */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 px-6 py-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[10px] font-mono font-bold tracking-[0.12em] text-stone-400 dark:text-zinc-500 uppercase">
              Mis API Keys
            </p>
            <button
              onClick={() => onNavigate('api-keys')}
              className="text-[11px] text-brand font-semibold hover:underline underline-offset-2 transition-opacity"
            >
              Gestionar
            </button>
          </div>
          <div className="space-y-4">
            {keysLoading ? (
              [1, 2].map(i => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-200 dark:bg-zinc-700 shrink-0" />
                  <div className="flex-1 h-3 bg-stone-100 dark:bg-zinc-800 rounded" />
                  <div className="h-3 w-20 bg-stone-100 dark:bg-zinc-800 rounded" />
                </div>
              ))
            ) : keys.length === 0 ? (
              <p className="text-xs text-stone-400 dark:text-zinc-500">Aún no tienes keys.</p>
            ) : (
              keys.slice(0, 3).map((key: ApiKey) => (
                <div key={key.id} className="flex items-center gap-3 group">
                  <span className={cn(
                    'w-1.5 h-1.5 rounded-full shrink-0 transition-transform duration-150 group-hover:scale-[1.6]',
                    key.active ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-zinc-600',
                  )} />
                  <span className="text-sm text-stone-700 dark:text-zinc-300 flex-1 truncate">{key.name || '(sin nombre)'}</span>
                  <span className="text-[11px] font-mono text-stone-300 dark:text-zinc-600 shrink-0">{key.prefix}•••</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Create Key Modal ──────────────────────────────────────────────────────────

function CreateKeyModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const createMutation = useCreateKey();
  const [name, setName]     = useState('');
  const [newKey, setNewKey] = useState<CreatedApiKey | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = () => {
    if (!name.trim() || createMutation.isPending) return;
    createMutation.mutate(name.trim(), {
      onSuccess: (data) => setNewKey(data),
    });
  };

  const handleCopy = () => {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey.key).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200" />
        <Dialog.Content
          onInteractOutside={(e) => { if (newKey) e.preventDefault(); }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[420px] bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-2xl focus:outline-none overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-[48%] data-[state=closed]:slide-out-to-top-[48%] duration-200"
        >
          <AnimatePresence mode="wait" initial={false}>
            {!newKey ? (
              <motion.div
                key="step-create"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="p-6"
              >
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <Dialog.Title className="text-[15px] font-bold tracking-tight text-stone-900 dark:text-zinc-100">
                      Nueva API Key
                    </Dialog.Title>
                    <Dialog.Description className="text-xs text-stone-400 dark:text-zinc-500 mt-1 leading-relaxed">
                      Dale un nombre para identificar para qué app o proyecto usarás esta clave.
                    </Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                      aria-label="Cerrar"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="space-y-1.5 mb-5">
                  <label className="block text-xs font-semibold text-stone-600 dark:text-zinc-400">
                    Nombre
                  </label>
                  <input
                    autoFocus
                    type="text"
                    placeholder="ej. App de adopción · Script de pruebas"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
                    maxLength={50}
                    className="w-full h-10 px-3.5 rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700 text-sm text-stone-900 dark:text-zinc-100 placeholder:text-stone-300 dark:placeholder:text-zinc-600 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                  />
                  {createMutation.isError && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500 pt-0.5">
                      <AlertCircle className="w-3 h-3 shrink-0" strokeWidth={2} />
                      Error al crear la key. Inténtalo de nuevo.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="h-9 px-4 rounded-xl text-sm text-stone-500 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Cancelar
                    </button>
                  </Dialog.Close>
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={!name.trim() || createMutation.isPending}
                    className="h-9 px-5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                  >
                    {createMutation.isPending ? 'Creando...' : 'Crear key'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step-reveal"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="p-6"
              >
                <div className="flex items-start gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                  </div>
                  <div>
                    <Dialog.Title className="text-[15px] font-bold tracking-tight text-stone-900 dark:text-zinc-100">
                      Tu clave está lista
                    </Dialog.Title>
                    <Dialog.Description className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">
                      Cópiala ahora — no la volveremos a mostrar.
                    </Dialog.Description>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 px-3.5 py-2.5 mb-3">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" strokeWidth={2} />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Esta es la única vez que verás la clave completa.
                  </p>
                </div>

                <div className="relative bg-zinc-950 rounded-xl px-4 py-4 mb-4">
                  <p className="text-[10px] font-mono font-bold tracking-[0.15em] text-zinc-500 uppercase mb-2">
                    x-api-key
                  </p>
                  <code className="block text-sm font-mono text-emerald-400 break-all select-all leading-relaxed pr-8">
                    {newKey.key}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopy}
                    aria-label="Copiar clave"
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.08] transition-all"
                  >
                    {copied
                      ? <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2.5} />
                      : <Copy className="w-3.5 h-3.5" strokeWidth={1.75} />
                    }
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="w-full h-10 rounded-xl bg-stone-900 dark:bg-zinc-800 text-white text-sm font-semibold hover:bg-stone-800 dark:hover:bg-zinc-700 transition-all active:scale-[0.98]"
                >
                  {copied ? 'Clave copiada — listo' : 'Listo, ya la guardé'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── API Keys ──────────────────────────────────────────────────────────────────

function ApiKeysPage() {
  const { data: keys = [], isLoading } = useApiKeys();
  const revokeMutation = useRevokeKey();
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied]       = useState<string | null>(null);

  const handleCopy = (id: string, value: string) => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="px-6 sm:px-8 py-7 space-y-6">

      <CreateKeyModal open={modalOpen} onOpenChange={setModalOpen} />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono font-bold tracking-[0.12em] text-stone-400 dark:text-zinc-500 uppercase mb-1">
            Autenticación
          </p>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            API Keys
          </h1>
          <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5 max-w-xs leading-relaxed">
            Genera y revoca claves para autenticarte en la API.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="shrink-0 flex items-center gap-1.5 h-9 px-4 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 transition-all active:scale-[0.98] shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          Nueva key
        </button>
      </div>

      {/* Keys list */}
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-4 py-3 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-zinc-800 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-28 bg-stone-100 dark:bg-zinc-800 rounded-md" />
                <div className="h-2.5 w-20 bg-stone-50 dark:bg-zinc-800/60 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : keys.length === 0 ? (
        <div className="py-16 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <Key className="w-5 h-5 text-stone-300 dark:text-zinc-600" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold text-stone-700 dark:text-zinc-300 mb-1">Sin API Keys</p>
          <p className="text-xs text-stone-400 dark:text-zinc-500 max-w-[24ch] leading-relaxed mb-5">
            Crea tu primera clave para conectar tu app a la API.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            Crear primera key
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 divide-y divide-stone-100 dark:divide-zinc-800/60 overflow-hidden">
          {keys.map((key: ApiKey) => (
            <div key={key.id} className="flex items-center gap-4 px-5 py-4">

              <div className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                key.active ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-stone-100 dark:bg-zinc-800'
              )}>
                <Key
                  className={cn('w-3.5 h-3.5', key.active ? 'text-emerald-500' : 'text-stone-300 dark:text-zinc-600')}
                  strokeWidth={1.75}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p className="text-sm font-semibold text-stone-800 dark:text-zinc-100 truncate">
                    {key.name || '(sin nombre)'}
                  </p>
                  {key.active ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Activa
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-400 dark:bg-zinc-800 dark:text-zinc-500 tracking-wide uppercase">
                      Revocada
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-stone-400 dark:text-zinc-500 mb-1">{key.prefix}•••</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1 text-[11px] text-stone-300 dark:text-zinc-600">
                    <Clock className="w-3 h-3" strokeWidth={1.5} />
                    Creada {fmtDate(key.created_at)}
                  </span>
                  {key.last_used_at && (
                    <span className="text-[11px] text-stone-300 dark:text-zinc-600">
                      · Último uso {fmtDate(key.last_used_at)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(key.id, key.prefix)}
                  className="flex items-center justify-center w-8 h-8 rounded-xl text-stone-400 dark:text-zinc-500 hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-600 dark:hover:text-zinc-300 transition-all"
                  aria-label="Copiar prefijo"
                  title="Copiar prefijo"
                >
                  {copied === key.id
                    ? <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
                    : <Copy className="w-3.5 h-3.5" strokeWidth={1.75} />
                  }
                </button>
                {key.active && (
                  <button
                    type="button"
                    onClick={() => revokeMutation.mutate(key.id)}
                    disabled={revokeMutation.isPending}
                    className="flex items-center justify-center w-8 h-8 rounded-xl text-stone-400 dark:text-zinc-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 disabled:opacity-40 transition-all"
                    aria-label="Revocar key"
                    title="Revocar key"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Auth info — terminal style */}
      <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-stone-100 dark:border-zinc-800/60">
          <p className="text-xs font-semibold text-stone-700 dark:text-zinc-300">Cómo autenticarte</p>
          <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">
            Incluye el header en cada petición a la API.
          </p>
        </div>
        <div className="bg-zinc-950 px-5 py-4">
          <code className="text-sm font-mono">
            <span className="text-stone-500">X-API-Key: </span>
            <span className="text-emerald-400">hll_sk_TU_CLAVE</span>
          </code>
        </div>
      </div>

    </div>
  );
}

// ─── API Docs ──────────────────────────────────────────────────────────────────

function ApiDocsPage() {
  useEffect(() => {
    const wrapper = document.querySelector('.swagger-wrapper');
    if (!wrapper) return;

    function applyTranslations() {
      // Modal title
      wrapper!.querySelectorAll('.modal-ux-header h4').forEach((el) => {
        if (el.textContent === 'Available authorizations') el.textContent = 'Autorizar acceso';
      });
      // Modal buttons
      wrapper!.querySelectorAll('.auth-btn-wrapper .btn').forEach((el) => {
        const t = el.textContent?.trim();
        if (t === 'Authorize') el.textContent = 'Autorizar';
        else if (t === 'Close') el.textContent = 'Cerrar';
        else if (t === 'Logout') el.textContent = 'Desconectar';
      });
      // "Value:" label
      wrapper!.querySelectorAll('.modal-ux-content label').forEach((el) => {
        if (el.textContent?.trim() === 'Value:') el.textContent = 'Valor:';
      });
      // Name: / In: info lines
      wrapper!.querySelectorAll('.auth-container p').forEach((el) => {
        const t = el.textContent ?? '';
        if (t.startsWith('Name:')) el.textContent = t.replace('Name:', 'Nombre:');
        if (t.startsWith('In:')) el.textContent = t.replace('In:', 'En:');
      });
      // Scheme-container "Authorize" button span
      wrapper!.querySelectorAll('.scheme-container .btn.authorize span').forEach((el) => {
        if (el.textContent?.trim() === 'Authorize') el.textContent = 'Autorizar';
      });
    }

    const observer = new MutationObserver(applyTranslations);
    observer.observe(wrapper, { childList: true, subtree: true });
    applyTranslations();
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col">

      {/* Header strip — asymmetric, no card */}
      <div className="px-6 sm:px-10 pt-7 pb-5">
        <div className="flex items-end justify-between gap-4 flex-wrap">

          <div className="space-y-1">
            <p className="text-[10px] font-mono font-bold tracking-widest text-brand uppercase">
              API Reference
            </p>
            <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
              Documentación
            </h2>
            <p className="text-xs text-stone-400 dark:text-zinc-500">
              API de solo lectura · v1.0.0
            </p>
          </div>

          <code className="flex items-center gap-1.5 text-[11px] font-mono text-stone-500 dark:text-zinc-400 bg-stone-100 dark:bg-zinc-800/80 px-2.5 py-1.5 rounded-md select-all self-end mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            api.huellitas.co/v1
          </code>

        </div>
      </div>

      <div className="border-t border-stone-100 dark:border-zinc-800/60 mx-6 sm:mx-10" />

      {/* Swagger UI */}
      <div className="swagger-wrapper px-4 sm:px-8 pt-2 pb-8 overflow-x-auto">
        <SwaggerUI
          spec={huellitasApiSpec}
          docExpansion="list"
          defaultModelsExpandDepth={-1}
          tryItOutEnabled={false}
          displayRequestDuration={false}
        />
      </div>

    </div>
  );
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

function statusMeta(code: number): { label: string; bg: string; text: string } {
  if (code === 429) return { label: '429', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' };
  if (code >= 500)  return { label: String(code), bg: 'bg-red-100 dark:bg-red-900/30',    text: 'text-red-700 dark:text-red-400'   };
  return               { label: String(code), bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' };
}

function StatsPage() {
  const { data: stats } = useStats();
  const daily        = stats?.daily ?? [];
  const totalCalls   = stats?.total_calls_7d ?? 0;
  const totalErrors  = stats?.total_errors_7d ?? 0;
  const errorRate    = totalCalls > 0 ? ((totalErrors / totalCalls) * 100).toFixed(1) : '0.0';
  const errors404    = stats?.errors_by_code['404'] ?? 0;
  const errors429    = stats?.errors_by_code['429'] ?? 0;
  const errors5xx    = stats?.errors_by_code['5xx'] ?? 0;
  const recentErrors = stats?.recent_errors ?? [];
  const maxErrors    = Math.max(...daily.map(d => d.errors), 1);

  return (
    <div className="px-6 sm:px-8 py-6 space-y-4">

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr] gap-3">

        {/* Hero: tasa de error */}
        <div className="col-span-2 md:col-span-1 bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 px-6 pt-5 pb-5">
          <p className="text-[10px] font-mono font-bold tracking-[0.12em] text-stone-400 dark:text-zinc-500 uppercase mb-2">
            Tasa de error — 7 días
          </p>
          <p className={cn('text-5xl font-bold tracking-tight tabular-nums', totalErrors > 0 ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400')}>
            {errorRate}%
          </p>
          <p className="text-[11px] text-stone-400 dark:text-zinc-500 mt-1.5">
            {totalErrors} errores de {totalCalls.toLocaleString()} llamadas
          </p>
          {/* Mini bar: proporción errores por día */}
          <div className="flex items-end gap-0.5 mt-4 h-8">
            {daily.map(day => (
              <div key={day.date} className="flex-1 flex flex-col justify-end gap-px">
                <div
                  className="w-full rounded-sm bg-red-400/70 dark:bg-red-500/50 transition-all"
                  style={{ height: day.errors > 0 ? `${Math.max((day.errors / maxErrors) * 100, 20)}%` : '8%' }}
                  title={`${day.date}: ${day.errors} errores`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Total errores */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 px-5 pt-4 pb-4 flex flex-col justify-between">
          <p className="text-[10px] font-mono font-bold tracking-[0.12em] text-stone-400 dark:text-zinc-500 uppercase">Total errores</p>
          <div>
            <p className="text-3xl font-bold tabular-nums text-red-500 dark:text-red-400">{totalErrors}</p>
            <p className="text-[11px] text-stone-400 dark:text-zinc-500 mt-0.5">últimos 7 días</p>
          </div>
        </div>

        {/* Distribución */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 px-5 pt-4 pb-4 flex flex-col justify-between">
          <p className="text-[10px] font-mono font-bold tracking-[0.12em] text-stone-400 dark:text-zinc-500 uppercase">Por código</p>
          <div className="space-y-1.5 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-orange-600 dark:text-orange-400">404</span>
              <span className="text-[11px] font-mono tabular-nums text-stone-500 dark:text-zinc-400">{errors404}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">429</span>
              <span className="text-[11px] font-mono tabular-nums text-stone-500 dark:text-zinc-400">{errors429}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-red-600 dark:text-red-400">5xx</span>
              <span className="text-[11px] font-mono tabular-nums text-stone-500 dark:text-zinc-400">{errors5xx}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Log de errores recientes */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-stone-100 dark:border-zinc-800">
          <p className="text-sm font-semibold text-stone-800 dark:text-zinc-100">Errores recientes</p>
          <p className="text-[11px] text-stone-400 dark:text-zinc-500 mt-0.5">Últimas {recentErrors.length} peticiones con error</p>
        </div>
        <div className="divide-y divide-stone-100 dark:divide-zinc-800">
          {recentErrors.length === 0 ? (
            <p className="px-5 py-8 text-center text-xs text-stone-400 dark:text-zinc-500">Sin errores recientes.</p>
          ) : recentErrors.map(err => {
            const meta = statusMeta(err.status);
            return (
              <div key={err.id} className="group flex items-start gap-3 px-5 py-3 hover:bg-stone-50 dark:hover:bg-zinc-800/50 transition-colors">
                <span className={cn('shrink-0 mt-0.5 inline-block rounded-md px-2 py-0.5 text-[11px] font-mono font-bold', meta.bg, meta.text)}>
                  {meta.label}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-mono text-stone-700 dark:text-zinc-300 truncate">
                    <span className="text-stone-400 dark:text-zinc-500">{err.method} </span>{err.path}
                  </p>
                </div>
                <div className="shrink-0 text-right hidden sm:block">
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400">{err.key_name}</p>
                  <p className="text-[10px] text-stone-300 dark:text-zinc-600 mt-0.5 font-mono">{fmtDateTime(err.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DeveloperPage() {
  const [activeNav, setActiveNav] = useState<DevNavId>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => { html.style.overflow = prev; };
  }, []);

  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <DeveloperSidebar
        activeNav={activeNav}
        onNavChange={setActiveNav}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden bg-stone-50 dark:bg-zinc-950">

        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center gap-2 px-4 sm:px-6 h-14 bg-stone-50/90 dark:bg-zinc-950/90 backdrop-blur-sm border-b border-stone-200 dark:border-zinc-800 shrink-0">
          <button
            className={cn(
              'md:hidden flex items-center justify-center w-9 h-9 rounded-lg',
              'text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors shrink-0',
            )}
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" strokeWidth={2} />
          </button>

          <nav aria-label="Ubicación actual">
            <ol className="flex items-center gap-1 text-sm">
              <li className="font-semibold text-stone-400 dark:text-zinc-500">Huellitas</li>
              {BREADCRUMBS[activeNav].map((crumb, i, arr) => (
                <li key={crumb} className="flex items-center gap-1">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-300 dark:text-zinc-600 shrink-0" aria-hidden="true" />
                  <span className={i === arr.length - 1 ? 'font-semibold text-stone-800 dark:text-zinc-100' : 'text-stone-400 dark:text-zinc-500'}>
                    {crumb}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {activeNav === 'overview'  && <OverviewPage onNavigate={setActiveNav} />}
          {activeNav === 'api-keys'  && <ApiKeysPage />}
          {activeNav === 'api-docs'  && <ApiDocsPage />}
          {activeNav === 'stats'     && <StatsPage />}
        </div>

      </div>
    </SidebarProvider>
  );
}
