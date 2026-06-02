import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
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
  ArrowLeft,
  Search,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { petsApi } from '../../pets/services/petsApi';
import { adoptionsApi } from '../services/adoptionsApi';
import type { Pet } from '../../pets/types';
import type { AdoptionRequest, AdoptionFormData } from '../types';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatAge(months: number): string {
  if (months < 1) return 'Menos de 1 mes';
  if (months < 12) return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} ${years === 1 ? 'año' : 'años'}`;
  return `${years} ${years === 1 ? 'año' : 'años'} y ${rem} ${rem === 1 ? 'mes' : 'meses'}`;
}

const SPECIES_LABEL: Record<string, string> = {
  dog: 'Perro',
  cat: 'Gato',
  rabbit: 'Conejo',
  other: 'Otro',
};

// ─── Animal Summary Card ────────────────────────────────────────────────────────

function AnimalSummaryCard({ pet }: { pet: Pet }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="relative">
        {pet.photos[0] ? (
          <img
            src={pet.photos[0]}
            alt={`${pet.name}${pet.breed ? ` — ${pet.breed}` : ''}`}
            className="w-full h-44 object-cover"
          />
        ) : (
          <div className="w-full h-44 bg-stone-100 dark:bg-zinc-800 flex items-center justify-center">
            <PawPrint className="w-12 h-12 text-stone-300 dark:text-zinc-600" strokeWidth={1.5} />
          </div>
        )}
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
            {pet.name}
          </h2>
          <p className="text-sm text-stone-500 dark:text-zinc-400">{pet.breed ?? 'Raza desconocida'}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-zinc-800 text-xs text-stone-600 dark:text-zinc-300 font-medium">
            <PawPrint className="w-3.5 h-3.5" strokeWidth={1.75} />
            {SPECIES_LABEL[pet.species] ?? pet.species}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-zinc-800 text-xs text-stone-600 dark:text-zinc-300 font-medium">
            <Cake className="w-3.5 h-3.5" strokeWidth={1.75} />
            {formatAge(pet.age_months)}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-zinc-800">
          <Building2 className="w-4 h-4 text-stone-400 shrink-0" strokeWidth={1.75} />
          <span className="text-xs text-stone-500 dark:text-zinc-400 truncate">
            {pet.foundation_name}
          </span>
        </div>

        <div>
          <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-zinc-800 font-mono text-xs text-stone-400 dark:text-zinc-500">
            #{pet.id}
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
  file,
  onFileChange,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  file: File | null;
  onFileChange: (file: File | null) => void;
}) {
  return (
    <FormField id={id} label={label} required={required}>
      <label
        htmlFor={id}
        className="relative flex flex-col items-center justify-center gap-2 h-24 rounded-xl border-2 border-dashed border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-900/50 hover:border-stone-300 dark:hover:border-zinc-600 hover:bg-stone-100/60 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors text-center px-4 overflow-hidden"
      >
        {file ? (
          <>
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" strokeWidth={1.75} />
            <span className="text-xs font-medium text-stone-600 dark:text-zinc-300 truncate max-w-full">
              {file.name}
            </span>
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 text-stone-300 dark:text-zinc-600" strokeWidth={1.5} />
            <div>
              <span className="text-xs font-medium text-stone-500 dark:text-zinc-400">
                Haz clic para adjuntar
              </span>
              {hint && (
                <p className="text-[11px] text-stone-400 dark:text-zinc-500 mt-0.5">{hint}</p>
              )}
            </div>
          </>
        )}
        <input
          id={id}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          onChange={(e) => {
            onFileChange(e.target.files?.[0] ?? null);
            e.target.value = '';
          }}
        />
      </label>
    </FormField>
  );
}

// ─── Success State ─────────────────────────────────────────────────────────────

function SuccessState({ pet, adoption }: { pet: Pet; adoption: AdoptionRequest }) {
  const [copied, setCopied] = useState(false);
  const trackingCode = adoption.tracking_code ?? `SOL-${String(adoption.id).padStart(5, '0')}`;

  function handleCopy() {
    navigator.clipboard.writeText(trackingCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center gap-6 max-w-md mx-auto">
      <div
        className="flex items-center justify-center w-16 h-16 rounded-2xl"
        style={{ background: 'var(--color-brand-light)' }}
      >
        <CheckCircle2
          className="w-8 h-8"
          style={{ color: 'var(--color-brand)' }}
          strokeWidth={1.75}
        />
      </div>

      <div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
          ¡Solicitud enviada!
        </h2>
        <p className="text-sm text-stone-500 dark:text-zinc-400 mt-2 leading-relaxed">
          Tu solicitud para adoptar a{' '}
          <span className="font-semibold text-stone-700 dark:text-zinc-200">{pet.name}</span>{' '}
          fue enviada a{' '}
          <span className="font-semibold text-stone-700 dark:text-zinc-200">{pet.foundation_name}</span>.
        </p>
      </div>

      {/* Tracking code block */}
      <div
        className="w-full rounded-2xl border p-5 space-y-3"
        style={{ background: 'var(--color-brand-light)', borderColor: 'var(--color-brand-border, #e8d8c8)' }}
      >
        <p className="text-xs font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wide">
          Código de seguimiento
        </p>
        <div className="flex items-center justify-between gap-3">
          <span
            className="font-mono text-2xl font-bold tracking-widest"
            style={{ color: 'var(--color-brand)' }}
          >
            {trackingCode}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors shrink-0"
            style={{
              borderColor: 'var(--color-brand-border, #e8d8c8)',
              color: 'var(--color-brand)',
            }}
          >
            {copied
              ? <><Check className="w-3.5 h-3.5" strokeWidth={2.5} />¡Copiado!</>
              : <><Copy className="w-3.5 h-3.5" strokeWidth={1.75} />Copiar</>
            }
          </button>
        </div>
        <p className="text-xs text-stone-500 dark:text-zinc-400 leading-relaxed">
          Guarda este código para consultar el estado de tu solicitud en cualquier momento.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Link
          to={`/adoptions/${adoption.id}`}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--color-brand)' }}
        >
          Ver estado de mi solicitud
        </Link>
        <Link
          to="/explore"
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a explorar
        </Link>
      </div>
    </div>
  );
}

// ─── Code Entry Phase ──────────────────────────────────────────────────────────

function CodeEntryPhase({ onFound }: { onFound: (pet: Pet) => void }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const pet = await petsApi.getByCode(trimmed);
      onFound(pet);
    } catch {
      setError('No encontramos ninguna mascota con ese código. Verifica que sea correcto.');
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
        <PawPrint className="w-8 h-8" style={{ color: 'var(--color-brand)' }} strokeWidth={1.75} />
      </div>

      <h1 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
        Ingresa el código de adopción
      </h1>
      <p className="text-sm text-stone-500 dark:text-zinc-400 mt-2 max-w-sm leading-relaxed">
        Cada mascota tiene un código único. Encuéntralo en su ficha al explorar los
        animales disponibles para adopción.
      </p>

      <form onSubmit={handleSearch} className="w-full max-w-sm mt-8 space-y-3">
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="HLL-00000"
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

// ─── Resolved Phase ────────────────────────────────────────────────────────────

function ResolvedPhase({
  pet,
  onSubmit,
  submitting,
  submitError,
}: {
  pet: Pet;
  onSubmit: (message: string, formData: AdoptionFormData, files: Record<string, File>) => void;
  submitting: boolean;
  submitError: boolean;
}) {
  const [message, setMessage]         = useState('');
  const [phone, setPhone]             = useState('');
  const [city, setCity]               = useState('');
  const [housingType, setHousingType] = useState('');
  const [ownership, setOwnership]     = useState('');
  const [outdoor, setOutdoor]         = useState('');
  const [residents, setResidents]     = useState('');
  const [children, setChildren]       = useState('');
  const [currentPets, setCurrentPets] = useState('');
  const [prevPets, setPrevPets]       = useState('');
  const [docId, setDocId]             = useState<File | null>(null);
  const [docAddress, setDocAddress]   = useState<File | null>(null);
  const [docLandlord, setDocLandlord] = useState<File | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData: AdoptionFormData = {
      phone:         phone.trim() || undefined,
      city:          city.trim() || undefined,
      housing_type:  housingType || undefined,
      ownership:     ownership || undefined,
      outdoor_space: outdoor || undefined,
      residents:     residents || undefined,
      children:      children || undefined,
      current_pets:  currentPets || undefined,
      prev_pets:     prevPets || undefined,
    };
    const files: Record<string, File> = {};
    if (docId)       files['doc_id']       = docId;
    if (docAddress)  files['doc_address']  = docAddress;
    if (docLandlord) files['doc_landlord'] = docLandlord;
    onSubmit(message, formData, files);
  }

  return (
    <form onSubmit={handleSubmit} className="min-h-full">

      {/* ── Two-column: animal card │ personal + home info ─────────────────── */}
      <div className="flex flex-col md:flex-row">
        <aside className="w-full md:w-[320px] shrink-0 md:self-start border-b md:border-b-0 md:border-r border-stone-200 dark:border-zinc-800 px-5 py-6 space-y-4">
          <AnimalSummaryCard pet={pet} />
          <TipCard />
        </aside>

        <div className="flex-1 px-6 py-6 space-y-8">
          <div>
            <h1 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
              Solicitud de adopción
            </h1>
            <p className="text-sm text-stone-500 dark:text-zinc-400 mt-1">
              Completa el formulario con información real. La fundación la revisará
              y se pondrá en contacto contigo.
            </p>
          </div>

          {/* Personal info */}
          <section className="space-y-4">
            <SectionHeader icon={UserRound} title="Información personal" description="Datos del solicitante principal" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField id="full-name" label="Nombre completo" required>
                <Input id="full-name" placeholder="Tu nombre completo" />
              </FormField>
              <FormField id="email" label="Correo electrónico" required>
                <Input id="email" type="email" placeholder="correo@ejemplo.com" />
              </FormField>
              <FormField id="phone" label="Teléfono de contacto" required>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+57 300 000 0000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </FormField>
              <FormField id="city" label="Ciudad de residencia" required>
                <Input
                  id="city"
                  placeholder="Tu ciudad"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                />
              </FormField>
            </div>
          </section>

          {/* Home info */}
          <section className="space-y-4">
            <SectionHeader icon={Home} title="Información del hogar" description="El entorno donde vivirá el animal" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField id="housing-type" label="Tipo de vivienda" required>
                <Select value={housingType} onValueChange={setHousingType}>
                  <SelectTrigger id="housing-type"><SelectValue placeholder="Selecciona…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">Casa</SelectItem>
                    <SelectItem value="apartment">Apartamento</SelectItem>
                    <SelectItem value="rural">Finca / Predio rural</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField id="ownership" label="Condición de tenencia" required>
                <Select value={ownership} onValueChange={setOwnership}>
                  <SelectTrigger id="ownership"><SelectValue placeholder="Selecciona…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Propietario</SelectItem>
                    <SelectItem value="renter">Arrendatario</SelectItem>
                    <SelectItem value="family">Vivienda familiar</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField id="outdoor" label="Espacio exterior" required>
                <Select value={outdoor} onValueChange={setOutdoor}>
                  <SelectTrigger id="outdoor"><SelectValue placeholder="Selecciona…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="large">Sí, amplio (jardín / patio)</SelectItem>
                    <SelectItem value="small">Sí, pequeño (balcón)</SelectItem>
                    <SelectItem value="none">No</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField id="residents" label="Personas en el hogar" required>
                <Select value={residents} onValueChange={setResidents}>
                  <SelectTrigger id="residents"><SelectValue placeholder="Selecciona…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 persona</SelectItem>
                    <SelectItem value="2">2 personas</SelectItem>
                    <SelectItem value="3-4">3–4 personas</SelectItem>
                    <SelectItem value="5+">5 o más</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField id="children" label="Niños menores de 12 años" required>
                <Select value={children} onValueChange={setChildren}>
                  <SelectTrigger id="children"><SelectValue placeholder="Selecciona…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No hay</SelectItem>
                    <SelectItem value="1">Sí, 1</SelectItem>
                    <SelectItem value="2+">Sí, 2 o más</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField id="current-pets" label="Mascotas actuales" required>
                <Select value={currentPets} onValueChange={setCurrentPets}>
                  <SelectTrigger id="current-pets"><SelectValue placeholder="Selecciona…" /></SelectTrigger>
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
        </div>
      </div>

      {/* ── Full-width: experience + documents + submit ─────────────────────── */}
      <div className="px-6 py-6 border-t border-stone-200 dark:border-zinc-800 space-y-8">

        {/* Experience */}
        <section className="space-y-4">
          <SectionHeader icon={Heart} title="Experiencia y motivación" description="Cuéntanos sobre tu relación con los animales" />
          <div className="space-y-4">
            <div className="max-w-sm">
              <FormField id="prev-pets" label="¿Has tenido mascotas antes?" required>
                <Select value={prevPets} onValueChange={setPrevPets}>
                  <SelectTrigger id="prev-pets"><SelectValue placeholder="Selecciona…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Sí</SelectItem>
                    <SelectItem value="no">No, sería mi primera mascota</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <FormField id="reason" label="Razón para adoptar" required>
              <textarea
                id="reason"
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Cuéntanos por qué quieres adoptar a este animal y cómo sería su vida en tu hogar…"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </FormField>
            <label
              htmlFor="household-agreement"
              className="flex items-start gap-3 p-4 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-900/50 cursor-pointer hover:border-stone-300 dark:hover:border-zinc-600 transition-colors"
            >
              <input id="household-agreement" type="checkbox" className="mt-0.5 shrink-0 w-4 h-4 rounded accent-[var(--color-brand)]" />
              <div>
                <p className="text-sm font-medium text-stone-800 dark:text-zinc-200">Acuerdo del hogar</p>
                <p className="text-xs text-stone-400 dark:text-zinc-500 mt-1 leading-relaxed">
                  Confirmo que todos los convivientes están de acuerdo con la adopción
                  y se comprometen a brindar los cuidados necesarios al animal.
                </p>
              </div>
            </label>
          </div>
        </section>

        {/* Documents */}
        <section className="space-y-4">
          <SectionHeader icon={FileText} title="Documentos requeridos" description="Adjunta los archivos en formato PDF o imagen" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FileUploadField
              id="doc-id"
              label="Copia de cédula de ciudadanía"
              hint="PDF, JPG o PNG · máx. 5 MB"
              required
              file={docId}
              onFileChange={setDocId}
            />
            <FileUploadField
              id="doc-address"
              label="Comprobante de domicilio"
              hint="Máx. 3 meses de antigüedad"
              required
              file={docAddress}
              onFileChange={setDocAddress}
            />
            <FileUploadField
              id="doc-landlord"
              label="Autorización del arrendador"
              hint="Solo si vives en arriendo"
              file={docLandlord}
              onFileChange={setDocLandlord}
            />
          </div>
        </section>

        {/* Submit error */}
        {submitError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" strokeWidth={1.75} />
            <p className="text-xs text-red-600 dark:text-red-400 leading-snug">
              Ocurrió un error al enviar tu solicitud. Intenta de nuevo en unos momentos.
            </p>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-stone-100 dark:border-zinc-800">
          <p className="text-xs text-stone-400 dark:text-zinc-500 leading-relaxed">
            Al enviar aceptas nuestra{' '}
            <Link to="/privacidad" target="_blank" className="underline underline-offset-2 hover:text-stone-600 dark:hover:text-zinc-300 transition-colors">
              política de privacidad
            </Link>
            .
          </p>
          <Button
            type="submit"
            disabled={submitting || !message.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0 transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-brand)' }}
          >
            <PawPrint className="w-4 h-4" strokeWidth={2} />
            {submitting ? 'Enviando…' : 'Enviar solicitud'}
          </Button>
        </div>

      </div>
    </form>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ApplyPage() {
  const qc = useQueryClient();
  const [step, setStep] = useState<'code-entry' | 'form' | 'submitting' | 'submitted'>('code-entry');
  const [pet, setPet] = useState<Pet | null>(null);
  const [adoption, setAdoption] = useState<AdoptionRequest | null>(null);
  const [submitError, setSubmitError] = useState(false);

  const createMutation = useMutation({
    mutationFn: adoptionsApi.create,
    onSuccess: () => {
      // Invalidate so MyAdoptionsPage and SchedulePage see the new request immediately
      qc.invalidateQueries({ queryKey: ['my-adoptions'] });
    },
  });

  async function handleSubmit(message: string, formData: AdoptionFormData, files: Record<string, File>) {
    if (!pet) return;
    setStep('submitting');
    setSubmitError(false);
    try {
      const result = await createMutation.mutateAsync({ pet_id: pet.id, message, form_data: formData });
      // Upload documents after adoption is created — failures are non-fatal
      for (const [docType, file] of Object.entries(files)) {
        try {
          await adoptionsApi.uploadDocument(result.id, docType, file);
        } catch { /* non-fatal */ }
      }
      setAdoption(result);
      setStep('submitted');
    } catch {
      setSubmitError(true);
      setStep('form');
    }
  }

  if (step === 'submitted') return <SuccessState pet={pet!} adoption={adoption!} />;
  if (step === 'code-entry') {
    return <CodeEntryPhase onFound={(p) => { setPet(p); setStep('form'); }} />;
  }

  return (
    <ResolvedPhase
      pet={pet!}
      onSubmit={handleSubmit}
      submitting={step === 'submitting'}
      submitError={submitError}
    />
  );
}
