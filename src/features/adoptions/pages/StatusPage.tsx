import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  PawPrint,
  AlertCircle,
  Check,
  MessageSquare,
  ArrowRight,
  ClipboardList,
  CalendarDays,
  CalendarCheck,
  TrendingUp,
  Search,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRealtimeTable } from '../../../shared/hooks/useRealtimeTable';
import { adoptionsApi } from '../services/adoptionsApi';
import type { AdoptionRequest, AdoptionStatus, VisitSchedule } from '../types';

// ─── Types ─────────────────────────────────────────────────────────────────────

type StepState = 'completed' | 'current' | 'upcoming';

interface TimelineStep {
  id: AdoptionStatus;
  label: string;
  description: string;
  state: StepState;
}

// ─── Status configuration ──────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  AdoptionStatus,
  { label: string; description: string; nextStep: string; bg: string; fg: string; border: string }
> = {
  pending: {
    label: 'Recibida',
    description: 'Tu solicitud llegó correctamente y está en la cola de revisión de la fundación.',
    nextStep: 'Estamos procesando tu solicitud. Te notificaremos en un plazo de 3 a 5 días hábiles con el resultado.',
    bg: '#f5f5f4',
    fg: '#57534e',
    border: '#d6d3d1',
  },
  reviewing: {
    label: 'En revisión',
    description: 'El equipo de la fundación está evaluando tu solicitud y verificando la información proporcionada.',
    nextStep: 'Estamos revisando tu solicitud. Te enviaremos una notificación con el resultado en los próximos días.',
    bg: '#fef3c7',
    fg: '#92400e',
    border: '#fde68a',
  },
  approved: {
    label: 'Aprobada',
    description: '¡Felicidades! Tu solicitud fue aprobada. La fundación se pondrá en contacto contigo pronto.',
    nextStep: 'La fundación se comunicará contigo para coordinar el encuentro con el animal y los siguientes pasos del proceso.',
    bg: '#dcfce7',
    fg: '#166534',
    border: '#bbf7d0',
  },
  rejected: {
    label: 'No aprobada',
    description: 'En esta ocasión tu solicitud no pudo ser aprobada. Puedes contactar a la fundación para más detalles.',
    nextStep: 'Puedes explorar otros animales en adopción y enviar una nueva solicitud cuando te sientas listo.',
    bg: '#fee2e2',
    fg: '#991b1b',
    border: '#fecaca',
  },
  completed: {
    label: 'Completada',
    description: '¡La adopción se completó exitosamente! Gracias por darle un hogar a este animal.',
    nextStep: '¡Bienvenido a la familia adoptante! Recuerda registrar a tu nueva mascota con un veterinario.',
    bg: '#fdf3ee',
    fg: '#e85d26',
    border: '#f0c9b4',
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function buildTimeline(status: AdoptionStatus): TimelineStep[] {
  if (status === 'rejected') {
    const steps: Omit<TimelineStep, 'state'>[] = [
      { id: 'pending',   label: 'Recibida',     description: 'Tu solicitud fue recibida y registrada correctamente.' },
      { id: 'reviewing', label: 'En revisión',  description: 'El equipo de la fundación revisó tu información.' },
      { id: 'rejected',  label: 'No aprobada',  description: 'En esta ocasión la solicitud no pudo ser aprobada.' },
    ];
    return steps.map((s, i) => ({
      ...s,
      state: (i < steps.length - 1 ? 'completed' : 'current') as StepState,
    }));
  }

  const steps: Omit<TimelineStep, 'state'>[] = [
    { id: 'pending',   label: 'Recibida',    description: 'Tu solicitud fue recibida y registrada correctamente.' },
    { id: 'reviewing', label: 'En revisión', description: 'El equipo de la fundación está revisando tu información.' },
    { id: 'approved',  label: 'Aprobada',    description: 'La solicitud fue aprobada; se coordinará el encuentro con el animal.' },
    { id: 'completed', label: 'Completada',  description: 'El proceso de adopción concluyó exitosamente.' },
  ];
  const ORDER: AdoptionStatus[] = ['pending', 'reviewing', 'approved', 'completed'];
  const currentIdx = ORDER.indexOf(status);
  return steps.map((s, i) => ({
    ...s,
    state: (i < currentIdx ? 'completed' : i === currentIdx ? 'current' : 'upcoming') as StepState,
  }));
}

// ─── Animal Card ───────────────────────────────────────────────────────────────

function AnimalCard({ request }: { request: AdoptionRequest }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="w-full h-44 bg-stone-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
        {request.pet_photo ? (
          <img
            src={request.pet_photo}
            alt={request.pet_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <PawPrint className="w-12 h-12 text-stone-300 dark:text-zinc-600" strokeWidth={1.5} />
        )}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-zinc-100 leading-tight">
            {request.pet_name}
          </h2>
          <p className="text-sm text-stone-400 dark:text-zinc-500 mt-0.5">
            Solicitud #{request.id}
          </p>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-zinc-800">
          <CalendarDays className="w-4 h-4 text-stone-400 shrink-0" strokeWidth={1.75} />
          <span className="text-xs text-stone-500 dark:text-zinc-400">
            {formatDate(request.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Status Banner ─────────────────────────────────────────────────────────────

function StatusBanner({ request }: { request: AdoptionRequest }) {
  const config = STATUS_CONFIG[request.status];
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: config.bg, borderColor: config.border }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-wide mb-1"
        style={{ color: config.fg, opacity: 0.7 }}
      >
        Estado actual
      </p>
      <h2 className="text-2xl font-bold mb-2" style={{ color: config.fg }}>
        {config.label}
      </h2>
      <p className="text-sm leading-relaxed" style={{ color: config.fg }}>
        {config.description}
      </p>
      <div
        className="flex items-center gap-1.5 mt-4 pt-4 border-t"
        style={{ borderColor: config.border }}
      >
        <CalendarDays
          className="w-3.5 h-3.5 shrink-0"
          style={{ color: config.fg, opacity: 0.6 }}
          strokeWidth={1.75}
        />
        <p className="text-xs" style={{ color: config.fg, opacity: 0.7 }}>
          Última actualización: {formatDate(request.updated_at)}
        </p>
      </div>
    </div>
  );
}

// ─── Vertical Timeline ─────────────────────────────────────────────────────────

function VerticalTimeline({ steps }: { steps: TimelineStep[] }) {
  const currentIndex = steps.findIndex(s => s.state === 'current');

  return (
    <div>
      <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100 mb-5">
        Seguimiento del proceso
      </h3>
      <div>
        {steps.map((step, i) => (
          <div key={step.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 z-10"
                style={{
                  borderColor: step.state !== 'upcoming' ? 'var(--color-brand)' : '#e5e7eb',
                  background:
                    step.state === 'completed'
                      ? 'var(--color-brand)'
                      : step.state === 'current'
                        ? '#fff'
                        : '#f9fafb',
                }}
              >
                {step.state === 'completed' && (
                  <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                )}
                {step.state === 'current' && (
                  <span
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ background: 'var(--color-brand)' }}
                  />
                )}
                {step.state === 'upcoming' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-300 dark:bg-zinc-600" />
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className="w-0.5 flex-1 my-1 min-h-6"
                  style={{
                    background: i < currentIndex ? 'var(--color-brand)' : '#e5e7eb',
                  }}
                />
              )}
            </div>

            <div className={`flex-1 ${i < steps.length - 1 ? 'pb-5' : 'pb-0'}`}>
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className={`text-sm font-semibold ${
                    step.state !== 'upcoming'
                      ? 'text-stone-900 dark:text-zinc-100'
                      : 'text-stone-400 dark:text-zinc-500'
                  }`}
                >
                  {step.label}
                </span>
                {step.state === 'current' && (
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                    style={{ background: 'var(--color-brand)' }}
                  >
                    Ahora
                  </span>
                )}
              </div>
              <p
                className={`text-xs leading-relaxed ${
                  step.state !== 'upcoming'
                    ? 'text-stone-500 dark:text-zinc-400'
                    : 'text-stone-300 dark:text-zinc-600'
                }`}
              >
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Adopter Message Card ──────────────────────────────────────────────────────

function AdopterMessageCard({ message }: { message: string }) {
  if (!message.trim()) return null;
  return (
    <div className="bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-3 pb-4 border-b border-stone-100 dark:border-zinc-800 mb-4">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
          style={{ background: 'var(--color-brand-light)' }}
        >
          <MessageSquare
            className="w-4 h-4"
            style={{ color: 'var(--color-brand)' }}
            strokeWidth={1.75}
          />
        </div>
        <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">
          Tu mensaje al refugio
        </h3>
      </div>
      <p className="text-sm text-stone-600 dark:text-zinc-300 leading-relaxed">{message}</p>
    </div>
  );
}

// ─── Next Step Card ────────────────────────────────────────────────────────────

function NextStepCard({ text }: { text: string }) {
  return (
    <div
      className="rounded-2xl border p-5 flex items-start gap-4"
      style={{
        background: 'var(--color-brand-light)',
        borderColor: 'var(--color-brand-border, #e8d8c8)',
      }}
    >
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 text-white"
        style={{ background: 'var(--color-brand)' }}
      >
        <ArrowRight className="w-4 h-4" strokeWidth={2} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-stone-800 dark:text-zinc-100 mb-1">¿Qué sigue?</h3>
        <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

// ─── While You Wait Card ──────────────────────────────────────────────────────

const WAIT_TIPS = [
  'Prepara el espacio donde vivirá el animal: cama, comedero y bebedero.',
  'Investiga los cuidados específicos de su especie y raza.',
  'Habla con todos en casa para que la llegada sea una sorpresa positiva.',
  'Agenda una visita veterinaria para el primer chequeo.',
];

function WhileYouWaitCard() {
  return (
    <div
      className="rounded-2xl border p-4 space-y-3"
      style={{
        background: 'var(--color-brand-light)',
        borderColor: 'var(--color-brand-border, #e8d8c8)',
      }}
    >
      <div className="flex items-center gap-2">
        <TrendingUp
          className="w-4 h-4 shrink-0"
          style={{ color: 'var(--color-brand)' }}
          strokeWidth={1.75}
        />
        <span className="text-sm font-semibold text-stone-800 dark:text-zinc-100">
          Mientras esperas
        </span>
      </div>
      <ul className="space-y-2">
        {WAIT_TIPS.map(tip => (
          <li key={tip} className="flex items-start gap-1.5 text-xs text-stone-600 dark:text-zinc-400 leading-relaxed">
            <span className="mt-0.5 shrink-0" style={{ color: 'var(--color-brand)' }}>•</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Code Entry Phase ──────────────────────────────────────────────────────────

const _TRACKING_PREFIX = 'SOL-';

function parseTrackingCode(code: string): number | null {
  const upper = code.trim().toUpperCase();
  if (!upper.startsWith(_TRACKING_PREFIX)) return null;
  const numeric = upper.slice(_TRACKING_PREFIX.length);
  if (!numeric || !/^\d+$/.test(numeric)) return null;
  return parseInt(numeric, 10);
}

function CodeEntryPhase({ onFoundId }: { onFoundId: (id: number) => void }) {
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const adoptionId = parseTrackingCode(code);
    if (adoptionId === null) {
      setError('El código debe tener el formato SOL-00000.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const request = await adoptionsApi.getById(adoptionId);
      queryClient.setQueryData(['adoption', adoptionId], request);
      onFoundId(adoptionId);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setError('No encontramos ninguna solicitud con ese código. Verifica que sea correcto.');
      } else {
        setError('Error al consultar la solicitud. Verifica tu conexión e intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[480px] px-6 py-16 text-center">
      <div
        className="flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
        style={{ background: 'var(--color-brand-light)' }}
      >
        <ClipboardList
          className="w-8 h-8"
          style={{ color: 'var(--color-brand)' }}
          strokeWidth={1.75}
        />
      </div>

      <h1 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
        Consulta tu solicitud
      </h1>
      <p className="text-sm text-stone-500 dark:text-zinc-400 mt-2 max-w-sm leading-relaxed">
        Ingresa el código de seguimiento que recibiste al enviar tu solicitud de adopción.
      </p>

      <form onSubmit={handleSearch} className="w-full max-w-sm mt-8 space-y-3">
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="SOL-00000"
            className="font-mono tracking-widest uppercase"
            disabled={loading}
            autoFocus
          />
          <Button
            type="submit"
            disabled={loading || !code.trim()}
            className="shrink-0 px-4 gap-2 text-white"
            style={{ background: 'var(--color-brand)' }}
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
              : <Search className="w-4 h-4" strokeWidth={2} />
            }
            Buscar
          </Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-left">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" strokeWidth={1.75} />
            <p className="text-xs text-red-600 dark:text-red-400 leading-snug">{error}</p>
          </div>
        )}
      </form>

    </div>
  );
}

// ─── Loading Skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-[320px] shrink-0 md:self-start border-b md:border-b-0 md:border-r border-stone-200 dark:border-zinc-800 px-5 py-6 space-y-4">
        <div className="rounded-2xl overflow-hidden border border-stone-100 dark:border-zinc-800">
          <Skeleton className="w-full h-44" />
          <div className="p-4 space-y-3">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <Skeleton className="h-28 rounded-2xl" />
      </div>

      <div className="flex-1 px-6 py-6 space-y-6">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-36 rounded-2xl" />
        <div className="bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 rounded-2xl p-5 space-y-5">
          <Skeleton className="h-4 w-44" />
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center gap-1">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                {i < 3 && <Skeleton className="w-0.5 h-8" />}
              </div>
              <div className="flex-1 space-y-1.5 pb-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    </div>
  );
}

// ─── Not Found State ───────────────────────────────────────────────────────────

function NotFoundState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center gap-4">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/30">
        <AlertCircle className="w-7 h-7 text-red-400" strokeWidth={1.75} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-stone-900 dark:text-zinc-100">
          Solicitud no encontrada
        </h2>
        <p className="text-sm text-stone-500 dark:text-zinc-400 mt-1 max-w-xs leading-relaxed">
          No pudimos encontrar esta solicitud. Puede que no exista o no tengas acceso a ella.
        </p>
      </div>
      <Link
        to="/my-adoptions"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
      >
        <ClipboardList className="w-4 h-4" strokeWidth={1.75} />
        Mis solicitudes
      </Link>
    </div>
  );
}

// ─── Visit Schedule Panel ─────────────────────────────────────────────────────

const VISIT_STATUS_LABEL: Record<string, string> = {
  pending:   'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

function formatVisitDatetime(iso: string): string {
  const DAYS_ES   = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const d = new Date(iso);
  const dayName = DAYS_ES[d.getDay()];
  const month   = MONTHS_ES[d.getMonth()];
  const hours   = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const period  = hours >= 12 ? 'PM' : 'AM';
  const h12     = hours % 12 || 12;
  return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${d.getDate()} de ${month} de ${d.getFullYear()} · ${h12}:${minutes} ${period}`;
}

function VisitSchedulePanel({ visit }: { visit: VisitSchedule }) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: '#FEF0EB', borderColor: 'var(--color-brand-border, #f0c9b4)' }}
    >
      <div
        className="flex items-center gap-3 pb-4 border-b mb-4"
        style={{ borderColor: 'var(--color-brand-border, #f0c9b4)' }}
      >
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
          style={{ background: 'var(--color-brand)' }}
        >
          <CalendarCheck className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <h3 className="text-sm font-bold text-stone-800">Encuentro programado</h3>
      </div>
      <div className="space-y-2.5">
        <div className="flex justify-between items-start gap-4">
          <span className="text-xs text-stone-500 shrink-0">Fecha y hora</span>
          <span className="text-xs font-semibold text-stone-800 text-right">
            {formatVisitDatetime(visit.scheduled_at)}
          </span>
        </div>
        <div className="flex justify-between items-start gap-4">
          <span className="text-xs text-stone-500 shrink-0">Estado</span>
          <span className="text-xs font-semibold text-stone-800 text-right">
            {VISIT_STATUS_LABEL[visit.status] ?? visit.status}
          </span>
        </div>
        {visit.location && (
          <div className="flex justify-between items-start gap-4">
            <span className="text-xs text-stone-500 shrink-0">Lugar</span>
            <span className="text-xs font-semibold text-stone-800 text-right">{visit.location}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Found Phase ───────────────────────────────────────────────────────────────

function FoundPhase({ request, isRefetching }: { request: AdoptionRequest; isRefetching: boolean }) {
  const navigate = useNavigate();
  const timeline = buildTimeline(request.status);
  const nextStep = STATUS_CONFIG[request.status].nextStep;
  const hasVisit = !!request.visit_schedule;

  return (
    <div className="flex flex-col md:flex-row">
      <aside className="w-full md:w-[320px] shrink-0 md:sticky md:top-0 md:self-start md:max-h-screen overflow-y-auto border-b md:border-b-0 md:border-r border-stone-200 dark:border-zinc-800 px-5 py-6 space-y-4">
        <AnimalCard request={request} />
        <WhileYouWaitCard />
      </aside>

      <div className="flex-1 px-6 py-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
              Estado de tu solicitud
            </h1>
            <p className="text-sm text-stone-500 dark:text-zinc-400 mt-1">
              Aquí puedes seguir el avance de tu proceso de adopción.
            </p>
          </div>
          {isRefetching && (
            <RefreshCw
              className="w-4 h-4 text-stone-400 dark:text-zinc-500 shrink-0 mt-1 animate-spin"
              strokeWidth={1.75}
            />
          )}
        </div>

        <StatusBanner request={request} />

        {request.visit_schedule && (
          <VisitSchedulePanel visit={request.visit_schedule} />
        )}

        <div className="bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <VerticalTimeline steps={timeline} />
        </div>

        <AdopterMessageCard message={request.message} />
        <NextStepCard text={nextStep} />
        {request.status === 'approved' && !hasVisit && (
          <button
            onClick={() => navigate('/explore', { state: { navId: 'schedule' } })}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-brand)' }}
          >
            <CalendarDays className="w-4 h-4" strokeWidth={2} />
            Agendar mi encuentro
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function StatusPage({
  adoptionId,
  onFoundId,
}: {
  adoptionId?: number;
  onFoundId?: (id: number) => void;
}) {
  const hasValidId = adoptionId !== undefined && adoptionId > 0;

  const { data: request, isLoading, isError, isFetching } = useQuery({
    queryKey: ['adoption', adoptionId],
    queryFn: () => adoptionsApi.getById(adoptionId!),
    enabled: hasValidId,
  });

  useRealtimeTable('adoption_requests', [['adoption', adoptionId], ['my-adoptions']], hasValidId);
  useRealtimeTable('visit_schedules', [['adoption', adoptionId]], hasValidId);

  if (!hasValidId) return <CodeEntryPhase onFoundId={onFoundId ?? (() => {})} />;
  if (isLoading) return <LoadingSkeleton />;
  if (isError || !request) return <NotFoundState />;
  return <FoundPhase request={request} isRefetching={isFetching && !isLoading} />;
}
