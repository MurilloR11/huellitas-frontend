import { useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck,
  Home,
  FileText,
  Check,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ─── Data ──────────────────────────────────────────────────────────────────────

const STEP_1_ITEMS = [
  'Ser mayor de 18 años',
  'Presentar documento de identidad vigente',
  'Residir en el departamento del Tolima',
  'Tener capacidad económica para cubrir gastos veterinarios básicos',
  'No tener antecedentes de maltrato animal',
] as const;

const STEP_2_ITEMS = [
  'Contar con espacio adecuado para el animal',
  'Autorización del arrendador si vives en arriendo',
  'No tener más de 3 mascotas actualmente',
  'Compromiso de no abandono ni reventa del animal',
  'Llevar al animal al veterinario dentro de los primeros 30 días',
] as const;

const STEP_3_DOCS = [
  { label: 'Cédula de ciudadanía (copia)',        note: 'Documento vigente'                    },
  { label: 'Comprobante de domicilio reciente',   note: 'Máximo 3 meses de antigüedad'         },
  { label: 'Autorización escrita del arrendador', note: 'Solo si vives en arriendo'            },
  { label: 'Formulario de solicitud',             note: 'Se genera automáticamente al avanzar' },
] as const;

const STEPS = [
  { label: '¿Quién puede adoptar?', short: 'Adoptante',  icon: UserCheck, description: 'Requisitos personales del adoptante'  },
  { label: 'Condiciones del hogar', short: 'Hogar',      icon: Home,      description: 'El entorno donde vivirá el animal'     },
  { label: 'Documentos requeridos', short: 'Documentos', icon: FileText,  description: 'Documentación que deberás presentar'   },
] as const;

// ─── BrandCheckbox ─────────────────────────────────────────────────────────────

function BrandCheckbox({ id, checked, onChange }: { id: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="relative shrink-0 w-5 h-5">
      <input id={id} type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <div
        className="w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-all duration-200"
        style={{
          borderColor:     checked ? 'var(--color-brand)' : '#d1c9c2',
          backgroundColor: checked ? 'var(--color-brand)' : 'transparent',
        }}
        aria-hidden="true"
      >
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>
    </div>
  );
}

// ─── ChecklistItem ─────────────────────────────────────────────────────────────

function ChecklistItem({ label, checked, onToggle, id }: {
  label: string; checked: boolean; onToggle: () => void; id: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border select-none transition-all duration-200',
        checked
          ? 'border-[var(--color-brand-border)] bg-[var(--color-brand-light)]'
          : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50',
      )}
    >
      <BrandCheckbox id={id} checked={checked} onChange={onToggle} />
      <span className="text-sm leading-snug text-stone-700">{label}</span>
    </label>
  );
}

// ─── DocumentItem ──────────────────────────────────────────────────────────────

function DocumentItem({ label, note }: { label: string; note: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-stone-200 bg-stone-50">
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5"
        style={{ background: 'var(--color-brand-light)' }}
      >
        <FileText className="w-4 h-4" style={{ color: 'var(--color-brand)' }} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-stone-800">{label}</p>
        <p className="text-xs text-stone-400 mt-0.5">{note}</p>
      </div>
    </div>
  );
}

// ─── StepperBar ────────────────────────────────────────────────────────────────

function StepperBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-start w-full">
      {STEPS.map((s, i) => {
        const completed = i < currentStep;
        const active    = i === currentStep;
        return (
          <Fragment key={i}>
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                style={{
                  borderColor: completed || active ? 'var(--color-brand)' : '#e5e7eb',
                  background:  completed ? 'var(--color-brand)' : '#fff',
                  color:       completed ? '#fff' : active ? 'var(--color-brand)' : '#9ca3af',
                }}
              >
                {completed
                  ? <Check className="w-4 h-4" strokeWidth={2.5} />
                  : <span className="text-sm font-bold leading-none">{i + 1}</span>
                }
              </div>
              <span className={cn(
                'text-xs text-center max-w-[72px] leading-tight',
                active      ? 'font-semibold text-stone-900'
                : completed ? 'font-medium text-stone-500'
                            : 'font-medium text-stone-400',
              )}>
                {s.short}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 mt-[18px] rounded-full overflow-hidden bg-stone-200">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: completed ? '100%' : '0%', background: 'var(--color-brand)' }}
                />
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function RequirementsPage({ onContinue }: { onContinue: () => void }) {
  const [step,     setStep]     = useState(0);
  const [step1,    setStep1]    = useState<boolean[]>(Array(STEP_1_ITEMS.length).fill(false));
  const [step2,    setStep2]    = useState<boolean[]>(Array(STEP_2_ITEMS.length).fill(false));
  const [step3Ack, setStep3Ack] = useState(false);

  const toggle1 = (i: number) => setStep1(p => p.map((v, idx) => (idx === i ? !v : v)));
  const toggle2 = (i: number) => setStep2(p => p.map((v, idx) => (idx === i ? !v : v)));

  const count1 = step1.filter(Boolean).length;
  const count2 = step2.filter(Boolean).length;

  const canProceed =
    step === 0 ? count1 === STEP_1_ITEMS.length :
    step === 1 ? count2 === STEP_2_ITEMS.length :
    step3Ack;

  const isLast = step === STEPS.length - 1;

  const summaryText =
    step === 0 ? `${count1} de ${STEP_1_ITEMS.length} confirmados` :
    step === 1 ? `${count2} de ${STEP_2_ITEMS.length} confirmados` :
    step3Ack   ? 'Documentos revisados' : 'Confirma haber revisado los documentos';

  const barProgress =
    step === 0 ? count1 / STEP_1_ITEMS.length :
    step === 1 ? count2 / STEP_2_ITEMS.length :
    step3Ack   ? 1 : 0;

  const StepIcon = STEPS[step].icon;

  return (
    <div className="px-6 sm:px-8 py-6 sm:py-8">

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
          <h1 className="text-xl font-bold text-stone-900">Requisitos de adopción</h1>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium"
            style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }}
          >
            <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
            Proceso verificado
          </span>
        </div>
        <p className="text-sm text-stone-500 leading-relaxed">
          Revisa y confirma cada requisito paso a paso antes de iniciar tu solicitud.
        </p>
      </div>

      {/* ── Stepper ──────────────────────────────────────────────────────────── */}
      <div className="pb-5 mb-6 border-b border-stone-200">

        {/* Desktop circles */}
        <div className="hidden md:block mb-4">
          <StepperBar currentStep={step} />
        </div>

        {/* Mobile dots */}
        <div className="flex md:hidden items-center gap-2 mb-4">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width:      i === step ? '22px' : '6px',
                  background: i <= step ? 'var(--color-brand)' : '#e5e7eb',
                }}
              />
            ))}
          </div>
          <span className="text-xs text-stone-400 ml-1">Paso {step + 1} de {STEPS.length}</span>
          <span className="text-xs font-semibold text-stone-700 ml-auto">{STEPS[step].short}</span>
        </div>

        {/* Progress summary */}
        <div className="flex items-center gap-3">
          <p className={cn(
            'text-xs font-medium transition-colors duration-200',
            canProceed ? 'text-green-600' : 'text-stone-400',
          )}>
            {summaryText}{canProceed && ' ✓'}
          </p>
          <div className="flex-1 h-1.5 rounded-full bg-stone-200 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width:      `${barProgress * 100}%`,
                background: canProceed ? '#16a34a' : 'var(--color-brand)',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Step heading ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
          style={{ background: 'var(--color-brand-light)' }}
        >
          <StepIcon className="w-5 h-5" style={{ color: 'var(--color-brand)' }} strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-stone-900">{STEPS[step].label}</h2>
          <p className="text-xs text-stone-400">{STEPS[step].description}</p>
        </div>
      </div>

      {/* ── Animated step content ─────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {step === 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {STEP_1_ITEMS.map((item, i) => (
                <ChecklistItem key={item} id={`s1-${i}`} label={item} checked={step1[i]} onToggle={() => toggle1(i)} />
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {STEP_2_ITEMS.map((item, i) => (
                <ChecklistItem key={item} id={`s2-${i}`} label={item} checked={step2[i]} onToggle={() => toggle2(i)} />
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STEP_3_DOCS.map(doc => (
                  <DocumentItem key={doc.label} label={doc.label} note={doc.note} />
                ))}
              </div>
              <label
                htmlFor="s3-ack"
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border select-none transition-all duration-200',
                  step3Ack
                    ? 'border-[var(--color-brand-border)] bg-[var(--color-brand-light)]'
                    : 'border-stone-200 bg-stone-50 hover:border-stone-300',
                )}
              >
                <BrandCheckbox id="s3-ack" checked={step3Ack} onChange={() => setStep3Ack(v => !v)} />
                <span className="text-sm text-stone-700 leading-snug">
                  He revisado los documentos requeridos y los tengo disponibles
                </span>
              </label>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Footer navigation ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 mt-6 pt-5 border-t border-stone-200">
        <Button
          variant="ghost"
          onClick={() => setStep(s => s - 1)}
          className={cn(
            'text-stone-500 hover:text-stone-900 transition-opacity duration-200',
            step === 0 && 'opacity-0 pointer-events-none',
          )}
        >
          ← Atrás
        </Button>

        <button
          type="button"
          disabled={!canProceed}
          onClick={() => isLast ? onContinue() : setStep(s => s + 1)}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white',
            'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            !canProceed && 'opacity-40 cursor-not-allowed',
          )}
          style={{ background: 'var(--color-brand)' }}
        >
          {isLast ? 'Continuar con la solicitud' : 'Siguiente'}
          {!isLast && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

    </div>
  );
}
