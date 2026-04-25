import { useState } from 'react';
import {
  Search,
  PawPrint,
  AlertCircle,
  CheckCircle2,
  Info,
  Cake,
  Building2,
  UserRound,
  Home,
  Heart,
  FileText,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─── Types ─────────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'loading' | 'resolved' | 'not_found';

interface MockAnimal {
  code: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  shelter: string;
  photo: string;
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_ANIMAL: MockAnimal = {
  code: 'HLL-2024-047',
  name: 'Buddy',
  species: 'Perro',
  breed: 'Golden Retriever',
  age: '3 años',
  shelter: 'Refugio Huellitas Ibagué',
  photo: 'https://loremflickr.com/400/300/golden,retriever,dog/all?lock=1',
};

// ─── Lookup Card ───────────────────────────────────────────────────────────────

function LookupCard({
  phase,
  code,
  onCodeChange,
  onSubmit,
}: {
  phase: Phase;
  code: string;
  onCodeChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col items-center text-center mb-8">
        <div
          className="flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
          style={{ background: 'var(--color-brand-light)' }}
        >
          <PawPrint
            className="w-7 h-7"
            style={{ color: 'var(--color-brand)' }}
            strokeWidth={1.75}
          />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-zinc-100 mb-2">
          Solicitar adopción
        </h1>
        <p className="text-sm text-stone-500 dark:text-zinc-400 leading-relaxed max-w-sm">
          Ingresa el código único del animal. Lo encontrarás en su ficha o
          te lo habrá proporcionado el refugio.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <Label
          htmlFor="animal-code"
          className="text-xs font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wide mb-2 block"
        >
          Código del animal
        </Label>
        <div className="flex gap-2">
          <Input
            id="animal-code"
            value={code}
            onChange={e => onCodeChange(e.target.value.toUpperCase())}
            placeholder="Ej. HLL-2024-047"
            className="font-mono tracking-widest text-stone-800 dark:text-zinc-100 placeholder:font-sans placeholder:tracking-normal"
            onKeyDown={e => e.key === 'Enter' && onSubmit()}
          />
          <Button
            onClick={onSubmit}
            disabled={!code.trim()}
            className="shrink-0 gap-1.5 text-white hover:opacity-90"
            style={{ background: 'var(--color-brand)' }}
          >
            <Search className="w-4 h-4" />
            <span>Buscar</span>
          </Button>
        </div>

        {phase === 'not_found' && (
          <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
            <AlertCircle
              className="w-4 h-4 text-red-500 shrink-0 mt-0.5"
              strokeWidth={1.75}
            />
            <p className="text-xs text-red-600 dark:text-red-400 leading-snug">
              No encontramos ningún animal con ese código. Verifica que esté
              escrito correctamente o consulta al refugio.
            </p>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-stone-400 dark:text-zinc-500 mt-4">
        ¿No tienes el código?{' '}
        <button
          type="button"
          className="underline underline-offset-2 hover:text-stone-600 dark:hover:text-zinc-300 transition-colors"
        >
          Explora los animales disponibles
        </button>
      </p>
    </div>
  );
}

// ─── Animal Summary Card ────────────────────────────────────────────────────────

function AnimalSummaryCard({ animal }: { animal: MockAnimal }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="relative">
        <img
          src={animal.photo}
          alt={`${animal.name} — ${animal.breed}`}
          className="w-full h-44 object-cover"
        />
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500 text-white shadow-sm">
            <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
            Disponible
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-zinc-100 leading-tight">
            {animal.name}
          </h2>
          <p className="text-sm text-stone-500 dark:text-zinc-400">{animal.breed}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-zinc-800 text-xs text-stone-600 dark:text-zinc-300 font-medium">
            <PawPrint className="w-3.5 h-3.5" strokeWidth={1.75} />
            {animal.species}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-zinc-800 text-xs text-stone-600 dark:text-zinc-300 font-medium">
            <Cake className="w-3.5 h-3.5" strokeWidth={1.75} />
            {animal.age}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-zinc-800">
          <Building2 className="w-4 h-4 text-stone-400 shrink-0" strokeWidth={1.75} />
          <span className="text-xs text-stone-500 dark:text-zinc-400 truncate">
            {animal.shelter}
          </span>
        </div>

        <div>
          <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-zinc-800 font-mono text-xs text-stone-400 dark:text-zinc-500 tracking-widest">
            {animal.code}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Tip Card ──────────────────────────────────────────────────────────────────

function TipCard() {
  return (
    <div
      className="rounded-2xl border p-4 space-y-2.5"
      style={{
        background: 'var(--color-brand-light)',
        borderColor: 'var(--color-brand-border, #e8d8c8)',
      }}
    >
      <div className="flex items-center gap-2">
        <Info
          className="w-4 h-4 shrink-0"
          style={{ color: 'var(--color-brand)' }}
          strokeWidth={1.75}
        />
        <span className="text-sm font-semibold text-stone-800 dark:text-zinc-100">
          Proceso guiado
        </span>
      </div>
      <ul className="space-y-1.5 text-xs text-stone-600 dark:text-zinc-400 leading-relaxed">
        {[
          'Tu solicitud es revisada en 3–5 días hábiles.',
          'Recibirás un correo con el resultado del proceso.',
          'Si es aprobada, el refugio coordinará el encuentro contigo.',
        ].map(tip => (
          <li key={tip} className="flex items-start gap-1.5">
            <span className="mt-0.5 shrink-0" style={{ color: 'var(--color-brand)' }}>•</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Form Section Header ────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Home;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-center gap-3 pb-4 border-b border-stone-100 dark:border-zinc-800">
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
        style={{ background: 'var(--color-brand-light)' }}
      >
        <Icon
          className="w-4 h-4"
          style={{ color: 'var(--color-brand)' }}
          strokeWidth={1.75}
        />
      </div>
      <div>
        <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">{title}</h3>
        {description && (
          <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

// ─── Form Field ────────────────────────────────────────────────────────────────

function FormField({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-stone-500 dark:text-zinc-400">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

// ─── File Upload Field ─────────────────────────────────────────────────────────

function FileUploadField({
  id,
  label,
  hint,
  required,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <FormField id={id} label={label} required={required}>
      <label
        htmlFor={id}
        className="flex flex-col items-center justify-center gap-2 h-24 rounded-xl border-2 border-dashed border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-900/50 hover:border-stone-300 dark:hover:border-zinc-600 hover:bg-stone-100/60 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors text-center px-4"
      >
        <Upload className="w-5 h-5 text-stone-300 dark:text-zinc-600" strokeWidth={1.5} />
        <div>
          <span className="text-xs font-medium text-stone-500 dark:text-zinc-400">
            Haz clic para adjuntar
          </span>
          {hint && (
            <p className="text-[11px] text-stone-400 dark:text-zinc-500 mt-0.5">{hint}</p>
          )}
        </div>
        <input id={id} type="file" className="sr-only" />
      </label>
    </FormField>
  );
}

// ─── Adoption Form ─────────────────────────────────────────────────────────────

function AdoptionForm() {
  return (
    <form className="space-y-8">

      {/* ── Personal info ─────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader
          icon={UserRound}
          title="Información personal"
          description="Datos del solicitante principal"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField id="full-name" label="Nombre completo" required>
            <Input id="full-name" placeholder="Tu nombre completo" />
          </FormField>
          <FormField id="email" label="Correo electrónico" required>
            <Input id="email" type="email" placeholder="correo@ejemplo.com" />
          </FormField>
          <FormField id="phone" label="Teléfono de contacto" required>
            <Input id="phone" type="tel" placeholder="+57 300 000 0000" />
          </FormField>
          <FormField id="city" label="Ciudad de residencia" required>
            <Input id="city" placeholder="Tu ciudad" />
          </FormField>
        </div>
      </section>

      {/* ── Home info ─────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader
          icon={Home}
          title="Información del hogar"
          description="El entorno donde vivirá el animal"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField id="housing-type" label="Tipo de vivienda" required>
            <Select>
              <SelectTrigger id="housing-type">
                <SelectValue placeholder="Selecciona…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="house">Casa</SelectItem>
                <SelectItem value="apartment">Apartamento</SelectItem>
                <SelectItem value="rural">Finca / Predio rural</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="ownership" label="Condición de tenencia" required>
            <Select>
              <SelectTrigger id="ownership">
                <SelectValue placeholder="Selecciona…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Propietario</SelectItem>
                <SelectItem value="renter">Arrendatario</SelectItem>
                <SelectItem value="family">Vivienda familiar</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="outdoor" label="Espacio exterior" required>
            <Select>
              <SelectTrigger id="outdoor">
                <SelectValue placeholder="Selecciona…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="large">Sí, amplio (jardín / patio)</SelectItem>
                <SelectItem value="small">Sí, pequeño (balcón)</SelectItem>
                <SelectItem value="none">No</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="residents" label="Personas en el hogar" required>
            <Select>
              <SelectTrigger id="residents">
                <SelectValue placeholder="Selecciona…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 persona</SelectItem>
                <SelectItem value="2">2 personas</SelectItem>
                <SelectItem value="3-4">3–4 personas</SelectItem>
                <SelectItem value="5+">5 o más</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="children" label="Niños menores de 12 años" required>
            <Select>
              <SelectTrigger id="children">
                <SelectValue placeholder="Selecciona…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No hay</SelectItem>
                <SelectItem value="1">Sí, 1</SelectItem>
                <SelectItem value="2+">Sí, 2 o más</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="current-pets" label="Mascotas actuales" required>
            <Select>
              <SelectTrigger id="current-pets">
                <SelectValue placeholder="Selecciona…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguna</SelectItem>
                <SelectItem value="1-dog">1 perro</SelectItem>
                <SelectItem value="1-cat">1 gato</SelectItem>
                <SelectItem value="multi">2 o más mascotas</SelectItem>
                <SelectItem value="other">Otra especie</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </section>

      {/* ── Experience ────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader
          icon={Heart}
          title="Experiencia y motivación"
          description="Cuéntanos sobre tu relación con los animales"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField id="prev-pets" label="¿Has tenido mascotas antes?" required>
            <Select>
              <SelectTrigger id="prev-pets">
                <SelectValue placeholder="Selecciona…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Sí</SelectItem>
                <SelectItem value="no">No, sería mi primera mascota</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <div className="sm:col-span-2">
            <FormField id="reason" label="Razón para adoptar" required>
              <textarea
                id="reason"
                rows={4}
                placeholder="Cuéntanos por qué quieres adoptar a este animal y cómo sería su vida en tu hogar…"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </FormField>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="household-agreement"
              className="flex items-start gap-3 p-4 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-900/50 cursor-pointer hover:border-stone-300 dark:hover:border-zinc-600 transition-colors"
            >
              <input
                id="household-agreement"
                type="checkbox"
                className="mt-0.5 shrink-0 w-4 h-4 rounded accent-[var(--color-brand)]"
              />
              <div>
                <p className="text-sm font-medium text-stone-800 dark:text-zinc-200">
                  Acuerdo del hogar
                </p>
                <p className="text-xs text-stone-400 dark:text-zinc-500 mt-1 leading-relaxed">
                  Confirmo que todos los convivientes están de acuerdo con la adopción
                  y se comprometen a brindar los cuidados necesarios al animal.
                </p>
              </div>
            </label>
          </div>
        </div>
      </section>

      {/* ── Documents ─────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader
          icon={FileText}
          title="Documentos requeridos"
          description="Adjunta los archivos en formato PDF o imagen"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FileUploadField
            id="doc-id"
            label="Copia de cédula de ciudadanía"
            hint="PDF, JPG o PNG · máx. 5 MB"
            required
          />
          <FileUploadField
            id="doc-address"
            label="Comprobante de domicilio"
            hint="Máx. 3 meses de antigüedad"
            required
          />
          <FileUploadField
            id="doc-landlord"
            label="Autorización del arrendador"
            hint="Solo si vives en arriendo"
          />
        </div>
      </section>

      {/* ── Submit ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-stone-100 dark:border-zinc-800">
        <p className="text-xs text-stone-400 dark:text-zinc-500 leading-relaxed">
          Al enviar aceptas nuestra{' '}
          <button
            type="button"
            className="underline underline-offset-2 hover:text-stone-600 dark:hover:text-zinc-300 transition-colors"
          >
            política de privacidad
          </button>
          .
        </p>
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{ background: 'var(--color-brand)' }}
        >
          <PawPrint className="w-4 h-4" strokeWidth={2} />
          Enviar solicitud
        </button>
      </div>

    </form>
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
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-6 w-28 rounded" />
          </div>
        </div>
        <Skeleton className="h-28 rounded-2xl" />
      </div>

      <div className="flex-1 px-6 py-6 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-72" />
        </div>
        {[0, 1, 2].map(i => (
          <div key={i} className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-100 dark:border-zinc-800">
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[0, 1, 2, 3].map(j => (
                <div key={j} className="space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-10 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Resolved Phase ────────────────────────────────────────────────────────────

function ResolvedPhase({ animal }: { animal: MockAnimal }) {
  return (
    <div className="flex">
      {/* Left panel — natural height, no scroll, stays at top */}
      <aside className="w-[320px] shrink-0 self-start border-r border-stone-200 dark:border-zinc-800 px-5 py-6 space-y-4">
        <AnimalSummaryCard animal={animal} />
        <TipCard />
      </aside>

      {/* Right panel — form, scrolls with parent */}
      <div className="flex-1 px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
            Solicitud de adopción
          </h1>
          <p className="text-sm text-stone-500 dark:text-zinc-400 mt-1">
            Completa el formulario con información real. La fundación la revisará
            y se pondrá en contacto contigo.
          </p>
        </div>
        <AdoptionForm />
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ApplyPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [code, setCode] = useState('');
  const [animal, setAnimal] = useState<MockAnimal | null>(null);

  function handleLookup() {
    if (!code.trim()) return;
    setPhase('loading');
    setTimeout(() => {
      if (code.trim() === 'HLL-2024-047') {
        setAnimal(MOCK_ANIMAL);
        setPhase('resolved');
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
          code={code}
          onCodeChange={setCode}
          onSubmit={handleLookup}
        />
      </div>
    );
  }

  if (phase === 'loading') return <LoadingSkeleton />;

  return <ResolvedPhase animal={animal!} />;
}
