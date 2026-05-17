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
  Eye,
  EyeOff,
  AlertCircle,
  Zap,
  Clock,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { huellitasApiSpec } from '../openapi-spec';
import '../swagger-overrides.css';

// ─── Breadcrumb map ────────────────────────────────────────────────────────────

const BREADCRUMBS: Record<DevNavId, string[]> = {
  overview:  [],
  'api-keys': ['API Keys'],
  'api-docs': ['Documentación'],
  stats:     ['Estadísticas'],
};

// ─── Static data ───────────────────────────────────────────────────────────────

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsed: string | null;
  callsTotal: number;
  active: boolean;
}

const STATIC_KEYS: ApiKey[] = [
  { id: '1', name: 'App principal',    prefix: 'hll_sk_A4x2',  createdAt: '2026-04-10', lastUsed: '2026-05-16', callsTotal: 8420,  active: true  },
  { id: '2', name: 'Bot de Telegram',  prefix: 'hll_sk_B9z1',  createdAt: '2026-05-01', lastUsed: '2026-05-15', callsTotal: 312,   active: true  },
  { id: '3', name: 'Script de prueba', prefix: 'hll_sk_C0m3',  createdAt: '2026-03-22', lastUsed: null,         callsTotal: 47,    active: false },
];


interface DailyUsage {
  date: string;
  calls: number;
  errors: number;
}

const STATIC_USAGE: DailyUsage[] = [
  { date: '10 May', calls: 320,  errors: 2  },
  { date: '11 May', calls: 410,  errors: 0  },
  { date: '12 May', calls: 380,  errors: 5  },
  { date: '13 May', calls: 540,  errors: 1  },
  { date: '14 May', calls: 620,  errors: 3  },
  { date: '15 May', calls: 710,  errors: 0  },
  { date: '16 May', calls: 490,  errors: 2  },
];

// ─── Overview ──────────────────────────────────────────────────────────────────

function OverviewPage({ onNavigate }: { onNavigate: (id: DevNavId) => void }) {
  const totalCalls  = STATIC_KEYS.reduce((s, k) => s + k.callsTotal, 0);
  const activeKeys  = STATIC_KEYS.filter(k => k.active).length;
  const todayCalls  = STATIC_USAGE[STATIC_USAGE.length - 1].calls;
  const todayErrors = STATIC_USAGE[STATIC_USAGE.length - 1].errors;

  return (
    <div className="px-6 sm:px-8 py-6 space-y-5">

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wider">Llamadas hoy</p>
            <Zap className="w-4 h-4 text-blue-400 shrink-0" strokeWidth={2} />
          </div>
          <p className="text-3xl font-bold tabular-nums text-stone-900 dark:text-zinc-100">{todayCalls.toLocaleString()}</p>
          <p className="text-xs text-stone-400 dark:text-zinc-500 mt-1.5">peticiones en las últimas 24h</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wider">Total acumulado</p>
            <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={2} />
          </div>
          <p className="text-3xl font-bold tabular-nums text-stone-900 dark:text-zinc-100">{totalCalls.toLocaleString()}</p>
          <p className="text-xs text-stone-400 dark:text-zinc-500 mt-1.5">peticiones históricas</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wider">Keys activas</p>
            <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0" strokeWidth={2} />
          </div>
          <p className="text-3xl font-bold tabular-nums text-stone-900 dark:text-zinc-100">{activeKeys}</p>
          <p className="text-xs text-stone-400 dark:text-zinc-500 mt-1.5">de {STATIC_KEYS.length} keys totales</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wider">Errores hoy</p>
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" strokeWidth={2} />
          </div>
          <p className={cn('text-3xl font-bold tabular-nums', todayErrors > 0 ? 'text-red-500' : 'text-stone-900 dark:text-zinc-100')}>
            {todayErrors}
          </p>
          <p className="text-xs text-stone-400 dark:text-zinc-500 mt-1.5">respuestas 4xx / 5xx</p>
        </div>
      </div>

      {/* Quick start */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 p-5">
        <p className="text-sm font-semibold text-stone-800 dark:text-zinc-100 mb-3">Inicio rápido</p>
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-white text-[10px] font-bold">1</span>
            <p className="text-sm text-stone-600 dark:text-zinc-400">
              Genera una <button onClick={() => onNavigate('api-keys')} className="text-brand font-medium hover:underline underline-offset-2">API Key</button> desde el panel de keys.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-white text-[10px] font-bold">2</span>
            <p className="text-sm text-stone-600 dark:text-zinc-400">
              Incluye el header <code className="text-xs bg-stone-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono">X-API-Key: hll_sk_...</code> en cada petición.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-white text-[10px] font-bold">3</span>
            <p className="text-sm text-stone-600 dark:text-zinc-400">
              Consulta la <button onClick={() => onNavigate('api-docs')} className="text-brand font-medium hover:underline underline-offset-2">documentación</button> para ver todos los endpoints disponibles.
            </p>
          </div>
        </div>
      </div>

      {/* Recent keys */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-stone-800 dark:text-zinc-100">Mis API Keys</p>
          <button onClick={() => onNavigate('api-keys')} className="text-xs text-brand font-medium hover:underline underline-offset-2">
            Gestionar
          </button>
        </div>
        <div className="space-y-2.5">
          {STATIC_KEYS.map(key => (
            <div key={key.id} className="flex items-center gap-3">
              <span className={cn('w-2 h-2 rounded-full shrink-0', key.active ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-zinc-600')} />
              <span className="text-sm text-stone-700 dark:text-zinc-300 flex-1 truncate">{key.name}</span>
              <span className="text-xs font-mono text-stone-400 dark:text-zinc-500 shrink-0">{key.prefix}•••</span>
              <span className="text-xs tabular-nums text-stone-400 dark:text-zinc-500 shrink-0 hidden sm:block">
                {key.callsTotal.toLocaleString()} calls
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─── API Keys ──────────────────────────────────────────────────────────────────

function ApiKeysPage() {
  const [keys, setKeys]           = useState<ApiKey[]>(STATIC_KEYS);
  const [revealed, setRevealed]   = useState<Set<string>>(new Set());
  const [copied, setCopied]       = useState<string | null>(null);
  const [creating, setCreating]   = useState(false);
  const [newName, setNewName]     = useState('');

  const toggleReveal = (id: string) =>
    setRevealed(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleCopy = (id: string, value: string) => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = String(Date.now());
    setKeys(prev => [...prev, {
      id,
      name: newName.trim(),
      prefix: 'hll_sk_' + Math.random().toString(36).slice(2, 6).toUpperCase(),
      createdAt: new Date().toISOString().slice(0, 10),
      lastUsed: null,
      callsTotal: 0,
      active: true,
    }]);
    setNewName('');
    setCreating(false);
  };

  const handleRevoke = (id: string) =>
    setKeys(prev => prev.map(k => k.id === id ? { ...k, active: false } : k));

  return (
    <div className="px-6 sm:px-8 py-6 space-y-4">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-stone-900 dark:text-zinc-100">API Keys</h1>
          <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">Genera y revoca claves para autenticarte en la API.</p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          Nueva key
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 p-4 flex items-center gap-3">
          <Key className="w-4 h-4 text-stone-400 dark:text-zinc-500 shrink-0" strokeWidth={1.75} />
          <input
            autoFocus
            type="text"
            placeholder="Nombre de la key (ej. App de adopción)"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
            className="flex-1 bg-transparent text-sm text-stone-800 dark:text-zinc-100 placeholder:text-stone-300 dark:placeholder:text-zinc-600 outline-none"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={!newName.trim()}
            className="h-7 px-3 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Crear
          </button>
          <button
            type="button"
            onClick={() => { setCreating(false); setNewName(''); }}
            className="h-7 px-2 rounded-lg text-xs text-stone-400 hover:text-stone-600 dark:hover:text-zinc-300 transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Keys list */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 overflow-hidden">
        <div className="divide-y divide-stone-50 dark:divide-zinc-800/60">
          {keys.map(key => (
            <div key={key.id} className="flex items-center gap-4 px-5 py-4">
              <span className={cn('w-2 h-2 rounded-full shrink-0', key.active ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-zinc-600')} />

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-stone-800 dark:text-zinc-100">{key.name}</p>
                  {!key.active && (
                    <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-400 dark:bg-zinc-800 dark:text-zinc-500">
                      Revocada
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-stone-400 dark:text-zinc-500">
                  {revealed.has(key.id) ? `${key.prefix}••••••••••••••••••••` : `${key.prefix}•••`}
                </p>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] text-stone-300 dark:text-zinc-600">
                    <Clock className="w-3 h-3" strokeWidth={1.5} />
                    Creada {key.createdAt}
                  </span>
                  {key.lastUsed && (
                    <span className="text-[11px] text-stone-300 dark:text-zinc-600">
                      · Último uso {key.lastUsed}
                    </span>
                  )}
                  <span className="text-[11px] text-stone-300 dark:text-zinc-600">
                    · {key.callsTotal.toLocaleString()} calls
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleReveal(key.id)}
                  className="flex items-center justify-center w-7 h-7 rounded-lg text-stone-400 dark:text-zinc-500 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label={revealed.has(key.id) ? 'Ocultar' : 'Mostrar'}
                >
                  {revealed.has(key.id) ? <EyeOff className="w-3.5 h-3.5" strokeWidth={1.75} /> : <Eye className="w-3.5 h-3.5" strokeWidth={1.75} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(key.id, `${key.prefix}...`)}
                  className="flex items-center justify-center w-7 h-7 rounded-lg text-stone-400 dark:text-zinc-500 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Copiar"
                >
                  {copied === key.id ? <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} /> : <Copy className="w-3.5 h-3.5" strokeWidth={1.75} />}
                </button>
                {key.active && (
                  <button
                    type="button"
                    onClick={() => handleRevoke(key.id)}
                    className="flex items-center justify-center w-7 h-7 rounded-lg text-stone-400 dark:text-zinc-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                    aria-label="Revocar"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auth info */}
      <div className="bg-stone-50 dark:bg-zinc-900/50 border border-stone-200 dark:border-zinc-800 rounded-xl px-5 py-4 space-y-1.5">
        <p className="text-xs font-semibold text-stone-500 dark:text-zinc-400">Cómo autenticarte</p>
        <p className="text-xs text-stone-400 dark:text-zinc-500">Incluye el header en cada petición a la API:</p>
        <code className="block text-xs font-mono text-brand bg-brand-light dark:bg-brand/10 rounded px-3 py-2">
          X-API-Key: hll_sk_TU_CLAVE
        </code>
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

function StatsPage() {
  const maxCalls = Math.max(...STATIC_USAGE.map(d => d.calls));
  const totalCalls  = STATIC_USAGE.reduce((s, d) => s + d.calls, 0);
  const totalErrors = STATIC_USAGE.reduce((s, d) => s + d.errors, 0);
  const avgCalls    = Math.round(totalCalls / STATIC_USAGE.length);

  return (
    <div className="px-6 sm:px-8 py-6 space-y-5">

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 px-5 py-4">
          <p className="text-2xl font-bold tabular-nums text-stone-900 dark:text-zinc-100">{totalCalls.toLocaleString()}</p>
          <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">llamadas — 7 días</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 px-5 py-4">
          <p className="text-2xl font-bold tabular-nums text-stone-900 dark:text-zinc-100">{avgCalls.toLocaleString()}</p>
          <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">promedio diario</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 px-5 py-4">
          <p className={cn('text-2xl font-bold tabular-nums', totalErrors > 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400')}>
            {totalErrors}
          </p>
          <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">errores — 7 días</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 p-5">
        <p className="text-sm font-semibold text-stone-800 dark:text-zinc-100 mb-4">Llamadas por día</p>
        <div className="flex items-end gap-2 h-36">
          {STATIC_USAGE.map(day => {
            const heightPct = (day.calls / maxCalls) * 100;
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 group">
                <span className="text-[10px] tabular-nums text-stone-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {day.calls}
                </span>
                <div
                  className="w-full rounded-t-md bg-brand/20 dark:bg-brand/30 group-hover:bg-brand/40 transition-colors relative"
                  style={{ height: `${heightPct}%` }}
                >
                  {day.errors > 0 && (
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded-t-md bg-red-400/60 dark:bg-red-500/40"
                      style={{ height: `${(day.errors / day.calls) * 100}%` }}
                    />
                  )}
                </div>
                <span className="text-[10px] text-stone-300 dark:text-zinc-600 whitespace-nowrap">{day.date.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-stone-100 dark:border-zinc-800">
          <span className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-zinc-500">
            <span className="w-2.5 h-2.5 rounded-sm bg-brand/30 shrink-0" />Llamadas
          </span>
          <span className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-zinc-500">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-400/60 shrink-0" />Errores
          </span>
        </div>
      </div>

      {/* Per-key usage */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 p-5">
        <p className="text-sm font-semibold text-stone-800 dark:text-zinc-100 mb-4">Uso por API Key</p>
        <div className="space-y-3">
          {STATIC_KEYS.map(key => {
            const maxKey = Math.max(...STATIC_KEYS.map(k => k.callsTotal));
            const pct = (key.callsTotal / maxKey) * 100;
            return (
              <div key={key.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-700 dark:text-zinc-300">{key.name}</span>
                  <span className="text-xs tabular-nums font-mono text-stone-400 dark:text-zinc-500">{key.callsTotal.toLocaleString()}</span>
                </div>
                <div className="h-1.5 rounded-full bg-stone-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-full bg-brand/50 dark:bg-brand/40" style={{ width: `${pct}%` }} />
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
