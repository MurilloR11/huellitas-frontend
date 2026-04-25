import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  PawPrint,
  Building2,
  MapPin,
  Clock,
  CalendarDays,
  Check,
  ExternalLink,
  CalendarPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────────

type Phase = 'scheduling' | 'success';

// ─── Constants ─────────────────────────────────────────────────────────────────

const MONTHS_ES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre',
];

const MONTHS_ES_CAP = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

const DAYS_ES = [
  'domingo','lunes','martes','miércoles','jueves','viernes','sábado',
];

const DAY_HEADERS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

const AVAILABLE_DAYS: Record<number, number[]> = {
  0: [3, 7, 10, 14, 17, 21, 24, 28],
  1: [2, 5, 9, 12, 16, 20, 23, 27],
};

const TIME_SLOTS = ['9:00 AM', '10:30 AM', '12:00 PM', '2:00 PM', '3:30 PM'];

const APPOINTMENT_CODE = 'CIT-2024-089';

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_ANIMAL = {
  name: 'Luna',
  species: 'Gata',
  breed: 'Doméstica mixta',
  photo: 'https://loremflickr.com/400/300/cat,tabby/all?lock=42',
  shelter: 'Refugio Huellitas Ibagué',
  address: 'Calle 42 # 5-28, Ibagué, Tolima',
  duration: '~45 minutos',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateEs(date: Date): string {
  const dayName = DAYS_ES[date.getDay()];
  const dayNum = date.getDate();
  const monthName = MONTHS_ES[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${dayNum} de ${monthName} de ${year}`;
}

// ─── Context Card (left column) ────────────────────────────────────────────────

function ContextCard() {
  return (
    <>
      <div className="bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <img
          src={MOCK_ANIMAL.photo}
          alt={`${MOCK_ANIMAL.name} — ${MOCK_ANIMAL.breed}`}
          className="w-full h-44 object-cover"
        />
        <div className="p-4 space-y-3">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-zinc-100 leading-tight">
              {MOCK_ANIMAL.name}
            </h2>
            <p className="text-sm text-stone-500 dark:text-zinc-400">{MOCK_ANIMAL.breed}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-zinc-800 text-xs text-stone-600 dark:text-zinc-300 font-medium">
              <PawPrint className="w-3.5 h-3.5" strokeWidth={1.75} />
              {MOCK_ANIMAL.species}
            </span>
          </div>

          <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-zinc-800">
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" strokeWidth={1.75} />
              <span className="text-xs text-stone-500 dark:text-zinc-400 leading-relaxed">
                {MOCK_ANIMAL.shelter}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" strokeWidth={1.75} />
              <span className="text-xs text-stone-500 dark:text-zinc-400 leading-relaxed">
                {MOCK_ANIMAL.address}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-400 shrink-0" strokeWidth={1.75} />
              <span className="text-xs text-stone-500 dark:text-zinc-400">
                Duración estimada: {MOCK_ANIMAL.duration}
              </span>
            </div>
          </div>

          <a
            href="#"
            className="inline-flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-80"
            style={{ color: 'var(--color-brand)' }}
            onClick={e => e.preventDefault()}
          >
            <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
            Ver en Google Maps
          </a>
        </div>
      </div>

      <div
        className="rounded-2xl border p-4 space-y-3"
        style={{
          background: 'var(--color-brand-light)',
          borderColor: 'var(--color-brand-border, #e8d8c8)',
        }}
      >
        <div className="flex items-center gap-2">
          <CalendarDays
            className="w-4 h-4 shrink-0"
            style={{ color: 'var(--color-brand)' }}
            strokeWidth={1.75}
          />
          <span className="text-sm font-semibold text-stone-800 dark:text-zinc-100">
            ¿Cómo funciona?
          </span>
        </div>
        <ul className="space-y-1.5 text-xs text-stone-600 dark:text-zinc-400 leading-relaxed">
          {[
            'Elige un día disponible en el calendario.',
            'Selecciona el horario que más te convenga.',
            'Confirma y recibe tu código de reserva.',
            'Preséntate al refugio el día acordado.',
          ].map(tip => (
            <li key={tip} className="flex items-start gap-1.5">
              <span className="mt-0.5 shrink-0" style={{ color: 'var(--color-brand)' }}>•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

// ─── Mobile Banner ─────────────────────────────────────────────────────────────

function MobileBanner() {
  return (
    <div className="flex md:hidden items-center gap-3 px-4 py-3 bg-white dark:bg-zinc-900 border-b border-stone-200 dark:border-zinc-800 shrink-0">
      <img
        src={MOCK_ANIMAL.photo}
        alt={MOCK_ANIMAL.name}
        className="w-12 h-12 rounded-xl object-cover shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-stone-900 dark:text-zinc-100 truncate">
          {MOCK_ANIMAL.name}
        </p>
        <p className="text-xs text-stone-500 dark:text-zinc-400 truncate">{MOCK_ANIMAL.shelter}</p>
      </div>
      <div className="flex items-center gap-1 text-xs text-stone-400 shrink-0">
        <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
        {MOCK_ANIMAL.duration}
      </div>
    </div>
  );
}

// ─── Month Calendar ────────────────────────────────────────────────────────────

function MonthCalendar({
  monthOffset,
  onMonthChange,
  selectedDate,
  onSelectDate,
}: {
  monthOffset: number;
  onMonthChange: (offset: number) => void;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}) {
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = base.getFullYear();
  const month = base.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const available = AVAILABLE_DAYS[monthOffset] ?? [];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const canGoPrev = monthOffset > 0;
  const canGoNext = monthOffset < 2;

  const todayStr = new Date().toDateString();

  return (
    <div className="bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
      {/* Colored header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ background: 'var(--color-brand-light)' }}
      >
        <button
          disabled={!canGoPrev}
          onClick={() => canGoPrev && onMonthChange(monthOffset - 1)}
          aria-label="Mes anterior"
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-lg transition-all',
            canGoPrev
              ? 'hover:bg-white/70 text-stone-600 dark:text-zinc-300'
              : 'opacity-30 cursor-not-allowed text-stone-400',
          )}
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
        </button>

        <div className="text-center">
          <p className="text-base font-bold text-stone-900 dark:text-zinc-100 leading-tight">
            {MONTHS_ES_CAP[month]}
          </p>
          <p className="text-xs text-stone-500 dark:text-zinc-400">{year}</p>
        </div>

        <button
          disabled={!canGoNext}
          onClick={() => canGoNext && onMonthChange(monthOffset + 1)}
          aria-label="Mes siguiente"
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-lg transition-all',
            canGoNext
              ? 'hover:bg-white/70 text-stone-600 dark:text-zinc-300'
              : 'opacity-30 cursor-not-allowed text-stone-400',
          )}
        >
          <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>

      <div className="px-4 pt-4 pb-5">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_HEADERS.map((d, i) => (
            <div
              key={d}
              className={cn(
                'text-center text-[11px] font-bold uppercase tracking-wide py-1',
                i === 0 || i === 6
                  ? 'text-stone-300 dark:text-zinc-600'
                  : 'text-stone-400 dark:text-zinc-500',
              )}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} className="h-11" />;

            const cellDate = new Date(year, month, day);
            const isAvailable = available.includes(day);
            const isSelected = selectedDate?.toDateString() === cellDate.toDateString();
            const isToday = todayStr === cellDate.toDateString();

            if (isSelected) {
              return (
                <button
                  key={day}
                  onClick={() => onSelectDate(cellDate)}
                  className="h-11 w-full flex items-center justify-center rounded-xl text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95"
                  style={{ background: 'var(--color-brand)' }}
                >
                  {day}
                </button>
              );
            }

            if (isAvailable) {
              return (
                <button
                  key={day}
                  onClick={() => onSelectDate(cellDate)}
                  className="h-11 w-full flex flex-col items-center justify-center rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: 'rgba(232, 87, 42, 0.09)',
                    color: 'var(--color-brand)',
                  }}
                >
                  <span className="leading-none">{day}</span>
                  <span
                    className="w-1 h-1 rounded-full mt-0.5"
                    style={{ background: 'var(--color-brand)' }}
                  />
                </button>
              );
            }

            return (
              <div
                key={day}
                className={cn(
                  'h-11 w-full flex items-center justify-center rounded-xl text-sm select-none',
                  isToday
                    ? 'font-bold text-stone-500 dark:text-zinc-400 ring-1 ring-stone-300 dark:ring-zinc-600'
                    : 'text-stone-300 dark:text-zinc-600',
                )}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-5 mt-4 pt-3 border-t border-stone-100 dark:border-zinc-800">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: 'rgba(232, 87, 42, 0.15)' }} />
            <span className="text-[11px] text-stone-400 dark:text-zinc-500">Disponible</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: 'var(--color-brand)' }} />
            <span className="text-[11px] text-stone-400 dark:text-zinc-500">Seleccionado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded ring-1 ring-stone-300 dark:ring-zinc-600" />
            <span className="text-[11px] text-stone-400 dark:text-zinc-500">Hoy</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Time Slot Picker ──────────────────────────────────────────────────────────

function TimeSlotPicker({
  selectedTime,
  onSelectTime,
}: {
  selectedTime: string | null;
  onSelectTime: (t: string) => void;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-3 pb-4 border-b border-stone-100 dark:border-zinc-800 mb-4">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
          style={{ background: 'var(--color-brand-light)' }}
        >
          <Clock
            className="w-4 h-4"
            style={{ color: 'var(--color-brand)' }}
            strokeWidth={1.75}
          />
        </div>
        <div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">
            Horario disponible
          </h3>
          <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">
            Elige el horario que mejor te convenga
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TIME_SLOTS.map(slot => {
          const isSelected = selectedTime === slot;
          return (
            <button
              key={slot}
              onClick={() => onSelectTime(slot)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all',
                !isSelected && 'bg-white dark:bg-zinc-900',
              )}
              style={
                isSelected
                  ? { background: 'var(--color-brand)', borderColor: 'var(--color-brand)', color: '#fff' }
                  : { borderColor: 'var(--color-brand)', color: 'var(--color-brand)' }
              }
            >
              {slot}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Appointment Summary ───────────────────────────────────────────────────────

function AppointmentSummary({ date, time }: { date: Date; time: string }) {
  const rows = [
    { label: 'Animal',   value: MOCK_ANIMAL.name     },
    { label: 'Fecha',    value: formatDateEs(date)   },
    { label: 'Hora',     value: time                 },
    { label: 'Lugar',    value: MOCK_ANIMAL.address  },
    { label: 'Duración', value: MOCK_ANIMAL.duration },
  ];

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
          <CalendarDays className="w-4 h-4 text-white" strokeWidth={1.75} />
        </div>
        <h3 className="text-sm font-bold text-stone-800">Resumen de tu cita</h3>
      </div>

      <div className="space-y-2.5">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex justify-between items-start gap-4">
            <span className="text-xs text-stone-500 shrink-0">{label}</span>
            <span className="text-xs font-semibold text-stone-800 text-right">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Confirm Button ────────────────────────────────────────────────────────────

function ConfirmButton({
  canConfirm,
  onConfirm,
}: {
  canConfirm: boolean;
  onConfirm: () => void;
}) {
  return (
    <div className="space-y-2 pb-2">
      <button
        disabled={!canConfirm}
        onClick={onConfirm}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all',
          canConfirm
            ? 'text-white hover:opacity-90'
            : 'text-stone-400 dark:text-zinc-600 bg-stone-100 dark:bg-zinc-800 cursor-not-allowed',
        )}
        style={canConfirm ? { background: 'var(--color-brand)' } : {}}
      >
        <CalendarDays className="w-4 h-4" strokeWidth={2} />
        Confirmar encuentro
      </button>
      {!canConfirm && (
        <p className="text-center text-xs text-stone-400 dark:text-zinc-500">
          Selecciona una fecha y horario para continuar
        </p>
      )}
    </div>
  );
}

// ─── Success Screen ────────────────────────────────────────────────────────────

function SuccessScreen({
  date,
  time,
  onReset,
}: {
  date: Date;
  time: string;
  onReset: () => void;
}) {
  const rows = [
    { label: 'Animal',  value: MOCK_ANIMAL.name    },
    { label: 'Fecha',   value: formatDateEs(date)  },
    { label: 'Hora',    value: time                },
    { label: 'Refugio', value: MOCK_ANIMAL.shelter },
  ];

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg"
        style={{ background: 'var(--color-brand)' }}
      >
        <Check className="w-10 h-10 text-white" strokeWidth={2.5} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.2, ease: 'easeOut' }}
        className="mb-6 space-y-1"
      >
        <h2 className="text-2xl font-bold text-stone-900 dark:text-zinc-100">
          ¡Cita confirmada!
        </h2>
        <p className="text-sm text-stone-500 dark:text-zinc-400 max-w-xs">
          Tu encuentro con {MOCK_ANIMAL.name} ha sido agendado. Guarda tu código de reserva.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-sm rounded-2xl border p-5 mb-6"
        style={{ background: '#FEF0EB', borderColor: 'var(--color-brand-border, #f0c9b4)' }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">
          Código de reserva
        </p>
        <p
          className="font-mono text-2xl font-bold tracking-widest mb-4"
          style={{ color: 'var(--color-brand)' }}
        >
          {APPOINTMENT_CODE}
        </p>

        <div className="space-y-2 text-left">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex justify-between items-start gap-4">
              <span className="text-xs text-stone-500 shrink-0">{label}</span>
              <span className="text-xs font-semibold text-stone-800 text-right">{value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.2, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <button
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--color-brand)' }}
        >
          <CalendarPlus className="w-4 h-4" strokeWidth={2} />
          Agregar al calendario
        </button>
        <button
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Volver al inicio
        </button>
      </motion.div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const [phase, setPhase] = useState<Phase>('scheduling');
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const canConfirm = selectedDate !== null && selectedTime !== null;

  function handleSelectDate(date: Date) {
    setSelectedDate(date);
    setSelectedTime(null);
  }

  function handleReset() {
    setPhase('scheduling');
    setSelectedDate(null);
    setSelectedTime(null);
    setMonthOffset(0);
  }

  return (
    <div className="flex flex-col md:flex-row">
      <MobileBanner />

      <aside className="hidden md:flex flex-col w-[320px] shrink-0 sticky top-0 self-start max-h-screen overflow-y-auto border-r border-stone-200 dark:border-zinc-800 px-5 py-6 space-y-4">
        <ContextCard />
      </aside>

      <div className="flex-1">
        {phase === 'success' ? (
          <SuccessScreen
            date={selectedDate!}
            time={selectedTime!}
            onReset={handleReset}
          />
        ) : (
          <div className="px-6 py-6 space-y-6">
            <div>
              <h1 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
                Agendar encuentro
              </h1>
              <p className="text-sm text-stone-500 dark:text-zinc-400 mt-1">
                Elige el día y horario para conocer a {MOCK_ANIMAL.name} en el refugio.
              </p>
            </div>

            <MonthCalendar
              monthOffset={monthOffset}
              onMonthChange={setMonthOffset}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
            />

            <AnimatePresence>
              {selectedDate && (
                <motion.div
                  key="timeslots"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <TimeSlotPicker
                    selectedTime={selectedTime}
                    onSelectTime={setSelectedTime}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {selectedDate && selectedTime && (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <AppointmentSummary date={selectedDate} time={selectedTime} />
                </motion.div>
              )}
            </AnimatePresence>

            <ConfirmButton canConfirm={canConfirm} onConfirm={() => setPhase('success')} />
          </div>
        )}
      </div>
    </div>
  );
}
