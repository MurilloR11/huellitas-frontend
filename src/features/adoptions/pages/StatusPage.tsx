import { useState } from 'react';
import {
  Search,
  PawPrint,
  AlertCircle,
  Check,
  Clock,
  Building2,
  MessageSquare,
  ArrowRight,
  ClipboardList,
  CalendarDays,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Types ─────────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'loading' | 'found' | 'not_found';
type RequestStatus = 'recibida' | 'en_revision' | 'aprobada' | 'rechazada' | 'completada';
type StepState = 'completed' | 'current' | 'upcoming';

interface TimelineStep {
  id: RequestStatus;
  label: string;
  date?: string;
  description: string;
  state: StepState;
}

interface MockRequest {
  requestNumber: string;
  animal: {
    name: string;
    species: string;
    breed: string;
    age: string;
    photo: string;
    shelter: string;
  };
  currentStatus: RequestStatus;
  updatedAt: string;
  timeline: TimelineStep[];
  shelterMessage: {
    shelter: string;
    text: string;
    date: string;
  };
  nextStep: string;
}

// ─── Status configuration ──────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; description: string; bg: string; fg: string; border: string }
> = {
  recibida: {
    label: 'Recibida',
    description:
      'Tu solicitud llegó correctamente y está en la cola de revisión del refugio.',
    bg: '#f5f5f4',
    fg: '#57534e',
    border: '#d6d3d1',
  },
  en_revision: {
    label: 'En revisión',
    description:
      'El equipo del refugio está evaluando tu solicitud y verificando la información proporcionada.',
    bg: '#fef3c7',
    fg: '#92400e',
    border: '#fde68a',
  },
  aprobada: {
    label: 'Aprobada',
    description:
      '¡Felicidades! Tu solicitud fue aprobada. El refugio se pondrá en contacto contigo pronto.',
    bg: '#dcfce7',
    fg: '#166534',
    border: '#bbf7d0',
  },
  rechazada: {
    label: 'No aprobada',
    description:
      'En esta ocasión tu solicitud no pudo ser aprobada. Puedes contactar al refugio para más detalles.',
    bg: '#fee2e2',
    fg: '#991b1b',
    border: '#fecaca',
  },
  completada: {
    label: 'Completada',
    description:
      '¡La adopción se completó exitosamente! Gracias por darle un hogar a este animal.',
    bg: '#fdf3ee',
    fg: '#e85d26',
    border: '#f0c9b4',
  },
};

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_REQUEST: MockRequest = {
  requestNumber: 'SOL-2024-0312',
  animal: {
    name: 'Luna',
    species: 'Gata',
    breed: 'Doméstica mixta',
    age: '2 años',
    photo: 'https://loremflickr.com/400/300/cat,tabby/all?lock=42',
    shelter: 'Refugio Huellitas Ibagué',
  },
  currentStatus: 'en_revision',
  updatedAt: '12 de marzo de 2024, 10:30 a.m.',
  timeline: [
    {
      id: 'recibida',
      label: 'Recibida',
      date: '10 de marzo de 2024',
      description: 'Tu solicitud fue recibida y registrada correctamente en nuestro sistema.',
      state: 'completed',
    },
    {
      id: 'en_revision',
      label: 'En revisión',
      date: '11 de marzo de 2024',
      description:
        'El equipo del refugio está revisando tu información, perfil y documentos adjuntos.',
      state: 'current',
    },
    {
      id: 'aprobada',
      label: 'Aprobada',
      description:
        'La solicitud es aprobada y se agenda el encuentro con el animal en el refugio.',
      state: 'upcoming',
    },
    {
      id: 'completada',
      label: 'Completada',
      description:
        'El proceso de adopción concluye y el animal llega a su nuevo hogar contigo.',
      state: 'upcoming',
    },
  ],
  shelterMessage: {
    shelter: 'Refugio Huellitas Ibagué',
    text: 'Hola, hemos recibido tu solicitud para adoptar a Luna. Estamos revisando la información que nos proporcionaste y nos comunicaremos contigo en los próximos días con el resultado. ¡Gracias por considerar la adopción responsable!',
    date: '12 de marzo de 2024',
  },
  nextStep:
    'Estamos revisando tu solicitud. Te enviaremos un correo a la dirección registrada en un plazo de 3 a 5 días hábiles con el resultado del proceso.',
};

// ─── Lookup Card ───────────────────────────────────────────────────────────────

function LookupCard({
  phase,
  requestNumber,
  onChange,
  onSubmit,
}: {
  phase: Phase;
  requestNumber: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col items-center text-center mb-8">
        <div
          className="flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
          style={{ background: 'var(--color-brand-light)' }}
        >
          <ClipboardList
            className="w-7 h-7"
            style={{ color: 'var(--color-brand)' }}
            strokeWidth={1.75}
          />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-zinc-100 mb-2">
          Estado de mi solicitud
        </h1>
        <p className="text-sm text-stone-500 dark:text-zinc-400 leading-relaxed max-w-sm">
          Consulta el avance de tu proceso de adopción ingresando el número que recibiste
          al completar tu solicitud.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <Label
          htmlFor="request-number"
          className="text-xs font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wide mb-2 block"
        >
          Número de solicitud
        </Label>
        <div className="flex gap-2">
          <Input
            id="request-number"
            value={requestNumber}
            onChange={e => onChange(e.target.value.toUpperCase())}
            placeholder="Ej. SOL-2024-0312"
            className="font-mono tracking-widest text-stone-800 dark:text-zinc-100 placeholder:font-sans placeholder:tracking-normal"
            onKeyDown={e => e.key === 'Enter' && onSubmit()}
          />
          <Button
            onClick={onSubmit}
            disabled={!requestNumber.trim()}
            className="shrink-0 gap-1.5 text-white hover:opacity-90"
            style={{ background: 'var(--color-brand)' }}
          >
            <Search className="w-4 h-4" />
            <span>Buscar</span>
          </Button>
        </div>

        {phase === 'not_found' && (
          <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" strokeWidth={1.75} />
            <p className="text-xs text-red-600 dark:text-red-400 leading-snug">
              No encontramos una solicitud con ese número. Verifica e intenta de nuevo.
            </p>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-stone-400 dark:text-zinc-500 mt-4">
        Ingresa el número que recibiste al completar tu solicitud
      </p>
    </div>
  );
}

// ─── Animal Card (left sidebar) ─────────────────────────────────────────────────

function AnimalCard({ request }: { request: MockRequest }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
      <img
        src={request.animal.photo}
        alt={`${request.animal.name} — ${request.animal.breed}`}
        className="w-full h-44 object-cover"
      />
      <div className="p-4 space-y-3">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-zinc-100 leading-tight">
            {request.animal.name}
          </h2>
          <p className="text-sm text-stone-500 dark:text-zinc-400">{request.animal.breed}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-zinc-800 text-xs text-stone-600 dark:text-zinc-300 font-medium">
            <PawPrint className="w-3.5 h-3.5" strokeWidth={1.75} />
            {request.animal.species}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-zinc-800 text-xs text-stone-600 dark:text-zinc-300 font-medium">
            <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
            {request.animal.age}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-zinc-800">
          <Building2 className="w-4 h-4 text-stone-400 shrink-0" strokeWidth={1.75} />
          <span className="text-xs text-stone-500 dark:text-zinc-400 truncate">
            {request.animal.shelter}
          </span>
        </div>

        <div>
          <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-zinc-800 font-mono text-xs text-stone-400 dark:text-zinc-500 tracking-widest">
            {request.requestNumber}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Status Banner ─────────────────────────────────────────────────────────────

function StatusBanner({ request }: { request: MockRequest }) {
  const config = STATUS_CONFIG[request.currentStatus];
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
          Última actualización: {request.updatedAt}
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
            {/* Indicator column */}
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 z-10"
                style={{
                  borderColor:
                    step.state !== 'upcoming' ? 'var(--color-brand)' : '#e5e7eb',
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
                  className="w-0.5 flex-1 my-1 min-h-[1.5rem]"
                  style={{
                    background: i < currentIndex ? 'var(--color-brand)' : '#e5e7eb',
                  }}
                />
              )}
            </div>

            {/* Content */}
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
              {step.date && (
                <p className="text-[11px] text-stone-400 dark:text-zinc-500 mb-1">
                  {step.date}
                </p>
              )}
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

// ─── Shelter Message Card ──────────────────────────────────────────────────────

function ShelterMessageCard({ message }: { message: MockRequest['shelterMessage'] }) {
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
        <div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">
            Mensaje del refugio
          </h3>
          <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">{message.date}</p>
        </div>
      </div>

      <p className="text-sm text-stone-600 dark:text-zinc-300 leading-relaxed">{message.text}</p>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-stone-100 dark:border-zinc-800">
        <Building2 className="w-3.5 h-3.5 text-stone-400 shrink-0" strokeWidth={1.75} />
        <span className="text-xs text-stone-400 dark:text-zinc-500 font-medium">
          {message.shelter}
        </span>
      </div>
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

// ─── While You Wait Card (sidebar) ────────────────────────────────────────────

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

// ─── Shelter Contact Card (sidebar) ────────────────────────────────────────────

function ShelterContactCard({ shelter }: { shelter: string }) {
  return (
    <div
      className="rounded-2xl border p-4 space-y-3"
      style={{
        background: 'var(--color-brand-light)',
        borderColor: 'var(--color-brand-border, #e8d8c8)',
      }}
    >
      <div className="flex items-center gap-2">
        <Building2
          className="w-4 h-4 shrink-0"
          style={{ color: 'var(--color-brand)' }}
          strokeWidth={1.75}
        />
        <span className="text-sm font-semibold text-stone-800 dark:text-zinc-100 leading-snug">
          {shelter}
        </span>
      </div>

      <ul className="space-y-1.5">
        <li className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-zinc-400">
          <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-brand)' }} strokeWidth={1.75} />
          Calle 42 # 5-28, Ibagué
        </li>
        <li className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-zinc-400">
          <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-brand)' }} strokeWidth={1.75} />
          +57 315 234 5678
        </li>
        <li className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-zinc-400">
          <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-brand)' }} strokeWidth={1.75} />
          contacto@huellitas.org
        </li>
      </ul>

      <p className="text-xs text-stone-500 dark:text-zinc-400 leading-relaxed">
        ¿Tienes preguntas sobre tu solicitud? Contáctanos directamente.
      </p>
    </div>
  );
}

// ─── Loading Skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex">
      <div className="w-[320px] shrink-0 self-start border-r border-stone-200 dark:border-zinc-800 px-5 py-6 space-y-4">
        <div className="rounded-2xl overflow-hidden border border-stone-100 dark:border-zinc-800">
          <Skeleton className="w-full h-44" />
          <div className="p-4 space-y-3">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-14 rounded-full" />
              <Skeleton className="h-6 w-18 rounded-full" />
            </div>
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-28 rounded" />
          </div>
        </div>
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
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    </div>
  );
}

// ─── Found Phase ───────────────────────────────────────────────────────────────

function FoundPhase({ request }: { request: MockRequest }) {
  return (
    <div className="flex">
      <aside className="w-[320px] shrink-0 sticky top-0 self-start max-h-screen overflow-y-auto border-r border-stone-200 dark:border-zinc-800 px-5 py-6 space-y-4">
        <AnimalCard request={request} />
        <WhileYouWaitCard />
        <ShelterContactCard shelter={request.animal.shelter} />
      </aside>

      <div className="flex-1 px-6 py-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
            Estado de tu solicitud
          </h1>
          <p className="text-sm text-stone-500 dark:text-zinc-400 mt-1">
            Aquí puedes seguir el avance de tu proceso de adopción.
          </p>
        </div>

        <StatusBanner request={request} />

        <div className="bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <VerticalTimeline steps={request.timeline} />
        </div>

        <ShelterMessageCard message={request.shelterMessage} />

        <NextStepCard text={request.nextStep} />
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function StatusPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [requestNumber, setRequestNumber] = useState('');
  const [request, setRequest] = useState<MockRequest | null>(null);

  function handleLookup() {
    if (!requestNumber.trim()) return;
    setPhase('loading');
    setTimeout(() => {
      if (requestNumber.trim() === 'SOL-2024-0312') {
        setRequest(MOCK_REQUEST);
        setPhase('found');
      } else {
        setPhase('not_found');
      }
    }, 1200);
  }

  if (phase === 'idle' || phase === 'not_found') {
    return (
      <div className="flex items-center justify-center px-6 py-24">
        <LookupCard
          phase={phase}
          requestNumber={requestNumber}
          onChange={setRequestNumber}
          onSubmit={handleLookup}
        />
      </div>
    );
  }

  if (phase === 'loading') return <LoadingSkeleton />;

  return <FoundPhase request={request!} />;
}
