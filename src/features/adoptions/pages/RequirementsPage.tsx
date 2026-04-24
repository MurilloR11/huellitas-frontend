import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ShieldCheck,
  UserCheck,
  Home,
  FileText,
  CheckCircle2,
} from 'lucide-react';

// ─── Data ──────────────────────────────────────────────────────────────────────

const APPLICANT_REQUIREMENTS = [
  'Ser mayor de 18 años',
  'Presentar documento de identidad vigente',
  'Residir en el departamento del Tolima',
  'Tener capacidad económica para cubrir gastos veterinarios básicos',
  'No tener antecedentes de maltrato animal',
] as const;

const HOME_REQUIREMENTS = [
  'Contar con espacio adecuado para el animal',
  'Autorización del arrendador si vives en arriendo',
  'No tener más de 3 mascotas actualmente',
  'Compromiso de no abandono ni reventa del animal',
  'Llevar al animal al veterinario dentro de los primeros 30 días',
] as const;

const DOCUMENTS = [
  'Cédula de ciudadanía (copia)',
  'Comprobante de domicilio reciente',
  'Autorización escrita del arrendador (si aplica)',
  'Formulario de solicitud (se genera al avanzar)',
] as const;

const TOTAL_CHECKS = APPLICANT_REQUIREMENTS.length + HOME_REQUIREMENTS.length;

// ─── Section card ──────────────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
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
            <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
            <p className="text-xs text-stone-400 mt-0.5">{description}</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ─── Checklist item ────────────────────────────────────────────────────────────

function ChecklistItem({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
      style={checked ? { background: 'rgb(240 253 244)' } : undefined}
    >
      {checked ? (
        <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" strokeWidth={2} />
      ) : (
        <Checkbox
          checked={false}
          onCheckedChange={onToggle}
          className="shrink-0"
          aria-label={label}
        />
      )}
      <span
        className="text-sm leading-snug"
        style={{ color: checked ? 'rgb(22 101 52)' : 'rgb(41 37 36)' }}
        onClick={onToggle}
      >
        {label}
      </span>
    </label>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function RequirementsPage({ onContinue }: { onContinue: () => void }) {
  const [applicantChecked, setApplicantChecked] = useState<boolean[]>(
    () => Array(APPLICANT_REQUIREMENTS.length).fill(false),
  );
  const [homeChecked, setHomeChecked] = useState<boolean[]>(
    () => Array(HOME_REQUIREMENTS.length).fill(false),
  );

  const confirmedCount =
    applicantChecked.filter(Boolean).length + homeChecked.filter(Boolean).length;
  const allConfirmed = confirmedCount === TOTAL_CHECKS;

  const toggleApplicant = (i: number) =>
    setApplicantChecked(prev => prev.map((v, idx) => (idx === i ? !v : v)));

  const toggleHome = (i: number) =>
    setHomeChecked(prev => prev.map((v, idx) => (idx === i ? !v : v)));

  return (
    <div className="px-6 py-8">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Hero intro */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-stone-900">Requisitos de adopción</h1>
            <Badge
              variant="outline"
              className="flex items-center gap-1.5 border-green-200 text-green-700 bg-green-50 text-xs font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
              Proceso verificado
            </Badge>
          </div>
          <p className="text-sm text-stone-500 leading-relaxed max-w-lg">
            Antes de iniciar tu solicitud, revisa y confirma que cumples con todos
            los requisitos. Esto garantiza que el proceso sea transparente y que
            el animal encuentre un hogar responsable.
          </p>
        </div>

        {/* ¿Quién puede adoptar? */}
        <SectionCard
          icon={UserCheck}
          title="¿Quién puede adoptar?"
          description="Requisitos personales del adoptante"
        >
          <div className="space-y-1">
            {APPLICANT_REQUIREMENTS.map((req, i) => (
              <ChecklistItem
                key={req}
                label={req}
                checked={applicantChecked[i]}
                onToggle={() => toggleApplicant(i)}
              />
            ))}
          </div>
        </SectionCard>

        {/* Condiciones del hogar */}
        <SectionCard
          icon={Home}
          title="Condiciones del hogar"
          description="El entorno donde vivirá el animal"
        >
          <div className="space-y-1">
            {HOME_REQUIREMENTS.map((req, i) => (
              <ChecklistItem
                key={req}
                label={req}
                checked={homeChecked[i]}
                onToggle={() => toggleHome(i)}
              />
            ))}
          </div>
        </SectionCard>

        {/* Documentos requeridos */}
        <SectionCard
          icon={FileText}
          title="Documentos requeridos"
          description="Documentación que deberás presentar"
        >
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DOCUMENTS.map((doc) => (
              <li
                key={doc}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-stone-100 bg-stone-50"
              >
                <FileText className="w-4 h-4 shrink-0 text-stone-400" strokeWidth={1.5} />
                <span className="text-sm text-stone-700 leading-snug">{doc}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* CTA */}
        <div
          className="rounded-2xl border p-6 space-y-4"
          style={{
            background: 'var(--color-brand-light)',
            borderColor: 'var(--color-brand-border)',
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-stone-900">
                Requisitos confirmados
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                {confirmedCount} de {TOTAL_CHECKS} completados
              </p>
            </div>

            {/* Progress bar */}
            <div className="flex-1 max-w-[180px]">
              <div className="h-2 w-full rounded-full bg-white/60 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(confirmedCount / TOTAL_CHECKS) * 100}%`,
                    background: allConfirmed ? 'rgb(22 163 74)' : 'var(--color-brand)',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Button
              disabled={!allConfirmed}
              onClick={onContinue}
              className="text-sm font-semibold"
              style={allConfirmed ? {
                background: 'var(--color-brand)',
                color: '#fff',
              } : undefined}
            >
              Continuar con la solicitud
            </Button>
            {!allConfirmed && (
              <p className="text-xs text-stone-500">
                Confirma todos los requisitos para continuar
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
