import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  PawPrint,
  Building2,
  MapPin,
  Clock,
  CalendarDays,
  CalendarOff,
  CalendarCheck,
  Check,
  ExternalLink,
  CalendarPlus,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRealtimeTable } from '../../../shared/hooks/useRealtimeTable';
import { adoptionsApi } from '../services/adoptionsApi';
import { foundationsApi } from '../../foundations/services/foundationsApi';
import type { AdoptionRequest, VisitSchedule } from '../types';
import type { AvailabilityDay } from '../../foundations/types';
import type { NavId } from '@/shared/ui/organisms/CitizenSidebar';

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

// All possible time slots (24-h values for range filtering)
const ALL_SLOTS: { label: string; hour: number; minute: number }[] = [
  { label: '9:00 AM',  hour: 9,  minute: 0  },
  { label: '10:30 AM', hour: 10, minute: 30 },
  { label: '12:00 PM', hour: 12, minute: 0  },
  { label: '2:00 PM',  hour: 14, minute: 0  },
  { label: '3:30 PM',  hour: 15, minute: 30 },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDateEs(date: Date): string {
  const dayName = DAYS_ES[date.getDay()];
  const dayNum = date.getDate();
  const monthName = MONTHS_ES[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${dayNum} de ${monthName} de ${year}`;
}

function formatVisitDate(iso: string): string {
  const d = new Date(iso);
  const dayName = DAYS_ES[d.getDay()];
  const day = d.getDate();
  const month = MONTHS_ES[d.getMonth()];
  const year = d.getFullYear();
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${day} de ${month} de ${year} · ${h12}:${minutes} ${period}`;
}

function buildScheduledAt(date: Date, slot: { hour: number; minute: number }): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(slot.hour).padStart(2, '0');
  const mm = String(slot.minute).padStart(2, '0');
  return `${y}-${m}-${d}T${hh}:${mm}:00`;
}

function buildAppointmentCode(adoption: AdoptionRequest): string {
  return `CIT-${String(adoption.id).padStart(5, '0')}`;
}

function getSlotsForDay(availabilityMap: Map<string, AvailabilityDay>, dateKey: string) {
  const entry = availabilityMap.get(dateKey);
  if (!entry) return [];
  const [startH, startM] = entry.start_time.split(':').map(Number);
  const [endH, endM] = entry.end_time.split(':').map(Number);
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;
  return ALL_SLOTS.filter(s => {
    const t = s.hour * 60 + s.minute;
    return t >= startTotal && t < endTotal;
  });
}

// ─── Guard loading ─────────────────────────────────────────────────────────────

function GuardLoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-120 px-6 py-16">
      <Loader2
        className="w-8 h-8 animate-spin"
        style={{ color: 'var(--color-brand)' }}
        strokeWidth={1.75}
      />
    </div>
  );
}

// ─── No approved state ─────────────────────────────────────────────────────────

function NoApprovedState({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-120 px-6 py-16 text-center">
      <div
        className="flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
        style={{ background: 'var(--color-brand-light)' }}
      >
        <CalendarOff
          className="w-8 h-8"
          style={{ color: 'var(--color-brand)' }}
          strokeWidth={1.75}
        />
      </div>

      <h1 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
        Aún no puedes agendar un encuentro
      </h1>
      <p className="text-sm text-stone-500 dark:text-zinc-400 mt-2 max-w-sm leading-relaxed">
        Para agendar una visita al refugio, tu solicitud de adopción debe haber sido
        aprobada por la fundación. Una vez aprobada, podrás elegir fecha y horario aquí.
      </p>

      {onBrowse && (
        <div className="mt-8">
          <button
            onClick={onBrowse}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <PawPrint className="w-4 h-4" strokeWidth={1.75} />
            Explorar mascotas
          </button>
        </div>
      )}
    </div>
  );
}

// ─── No availability state ─────────────────────────────────────────────────────

function NoAvailabilityState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-90 px-6 py-16 text-center">
      <div
        className="flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
        style={{ background: 'var(--color-brand-light)' }}
      >
        <CalendarDays
          className="w-7 h-7"
          style={{ color: 'var(--color-brand)' }}
          strokeWidth={1.75}
        />
      </div>
      <h2 className="text-base font-bold text-stone-900 dark:text-zinc-100">
        Sin horarios disponibles
      </h2>
      <p className="text-sm text-stone-500 dark:text-zinc-400 mt-2 max-w-xs leading-relaxed">
        La fundación aún no ha publicado horarios para esta semana.
        Vuelve pronto para ver los días disponibles.
      </p>
    </div>
  );
}

// ─── Already scheduled state ───────────────────────────────────────────────────

function AlreadyScheduledState({ visit, adoption }: { visit: VisitSchedule; adoption: AdoptionRequest }) {
  const VISIT_STATUS_LABEL: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    completed: 'Completada',
    cancelled: 'Cancelada',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-120 px-6 py-16 text-center">
      <div
        className="flex items-center justify-center w-16 h-16 rounded-full mb-6 shadow-lg"
        style={{ background: 'var(--color-brand)' }}
      >
        <CalendarCheck className="w-8 h-8 text-white" strokeWidth={2} />
      </div>
      <h2 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
        Encuentro programado
      </h2>
      <p className="text-sm text-stone-500 dark:text-zinc-400 mt-2 max-w-xs">
        Tu visita con {adoption.pet_name} ya está agendada.
      </p>

      <div
        className="mt-6 w-full max-w-sm rounded-2xl border p-5 text-left"
        style={{ background: '#FEF0EB', borderColor: 'var(--color-brand-border, #f0c9b4)' }}
      >
        <div className="space-y-2.5">
          {[
            { label: 'Animal',  value: adoption.pet_name },
            { label: 'Fecha',   value: formatVisitDate(visit.scheduled_at) },
            { label: 'Estado',  value: VISIT_STATUS_LABEL[visit.status] ?? visit.status },
            ...(visit.location ? [{ label: 'Lugar', value: visit.location }] : []),
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-start gap-4">
              <span className="text-xs text-stone-500 shrink-0">{label}</span>
              <span className="text-xs font-semibold text-stone-800 text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Context Card (left column) ────────────────────────────────────────────────

function ContextCard({ adoption }: { adoption: AdoptionRequest }) {
  return (
    <>
      <div className="bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Image with name overlay */}
        <div className="relative w-full h-40 bg-stone-100 dark:bg-zinc-800">
          {adoption.pet_photo ? (
            <img
              src={adoption.pet_photo}
              alt={adoption.pet_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PawPrint className="w-12 h-12 text-stone-300 dark:text-zinc-600" strokeWidth={1.5} />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 px-4 pb-3">
            <h2 className="text-base font-bold text-white leading-tight drop-shadow">
              {adoption.pet_name}
            </h2>
          </div>
        </div>

        {/* Info rows */}
        <div className="p-4 space-y-2.5">
          {adoption.foundation_name && (
            <div className="flex items-center gap-2.5">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{ background: 'var(--color-brand-light)' }}
              >
                <Building2 className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} strokeWidth={1.75} />
              </div>
              <span className="text-xs font-medium text-stone-700 dark:text-zinc-300 leading-relaxed">
                {adoption.foundation_name}
              </span>
            </div>
          )}
          {adoption.foundation_address && (
            <div className="flex items-center gap-2.5">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{ background: 'var(--color-brand-light)' }}
              >
                <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} strokeWidth={1.75} />
              </div>
              <span className="text-xs font-medium text-stone-700 dark:text-zinc-300 leading-relaxed">
                {adoption.foundation_address}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2.5">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
              style={{ background: 'var(--color-brand-light)' }}
            >
              <Clock className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} strokeWidth={1.75} />
            </div>
            <span className="text-xs font-medium text-stone-700 dark:text-zinc-300">
              ~45 min de duración
            </span>
          </div>

          {adoption.foundation_address && (
            <div className="pt-0.5">
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
          )}
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

function MobileBanner({ adoption }: { adoption: AdoptionRequest }) {
  return (
    <div className="flex md:hidden items-center gap-3 px-4 py-3 bg-white dark:bg-zinc-900 border-b border-stone-200 dark:border-zinc-800 shrink-0">
      {adoption.pet_photo ? (
        <img
          src={adoption.pet_photo}
          alt={adoption.pet_name}
          className="w-12 h-12 rounded-xl object-cover shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
          <PawPrint className="w-6 h-6 text-stone-300" strokeWidth={1.5} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-stone-900 dark:text-zinc-100 truncate">
          {adoption.pet_name}
        </p>
        <p className="text-xs text-stone-500 dark:text-zinc-400 truncate">
          {adoption.foundation_name || 'Fundación'}
        </p>
      </div>
      <div className="flex items-center gap-1 text-xs text-stone-400 shrink-0">
        <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
        ~45 min
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
  availableDates,
}: {
  monthOffset: number;
  onMonthChange: (offset: number) => void;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  availableDates: string[];
}) {
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = base.getFullYear();
  const month = base.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const canGoPrev = monthOffset > 0;
  const canGoNext = monthOffset < 2;

  const todayStr = new Date().toDateString();
  const availableSet = new Set(availableDates);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
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

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} className="h-11" />;

            const cellDate = new Date(year, month, day);
            const dateKey = toDateKey(cellDate);
            const isAvailable = availableSet.has(dateKey);
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
  slots,
  selectedTime,
  onSelectTime,
}: {
  slots: { label: string; hour: number; minute: number }[];
  selectedTime: string | null;
  onSelectTime: (label: string) => void;
}) {
  const morningSlots   = slots.filter(s => s.hour < 12);
  const afternoonSlots = slots.filter(s => s.hour >= 12);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 shrink-0" style={{ color: 'var(--color-brand)' }} strokeWidth={1.75} />
        <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">Horario disponible</h3>
      </div>

      {[
        { label: 'Mañana', group: morningSlots },
        { label: 'Tarde',  group: afternoonSlots },
      ].filter(({ group }) => group.length > 0).map(({ label, group }) => (
        <div key={label}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500 mb-2.5">
            {label}
          </p>
          <div className="flex flex-wrap gap-2">
            {group.map(slot => {
              const isSelected = selectedTime === slot.label;
              const [time, period] = slot.label.split(' ');
              return (
                <button
                  key={slot.label}
                  onClick={() => onSelectTime(slot.label)}
                  className={cn(
                    'flex flex-col items-center px-5 py-3 rounded-xl border-2 transition-all',
                    isSelected
                      ? 'text-white shadow-md'
                      : 'bg-white dark:bg-zinc-900 hover:scale-105 active:scale-95',
                  )}
                  style={
                    isSelected
                      ? { background: 'var(--color-brand)', borderColor: 'var(--color-brand)' }
                      : { borderColor: 'var(--color-brand)', color: 'var(--color-brand)' }
                  }
                >
                  <span className="text-sm font-bold leading-none">{time}</span>
                  <span className="text-[10px] font-semibold mt-0.5 opacity-75">{period}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Appointment Summary ───────────────────────────────────────────────────────

function AppointmentSummary({
  date,
  time,
  adoption,
}: {
  date: Date;
  time: string;
  adoption: AdoptionRequest;
}) {
  const rows = [
    { label: 'Animal',   value: adoption.pet_name },
    { label: 'Fecha',    value: formatDateEs(date) },
    { label: 'Hora',     value: time               },
    { label: 'Lugar',    value: adoption.foundation_address || adoption.foundation_name || '—' },
    { label: 'Duración', value: '~45 minutos'      },
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
  isSaving,
  onConfirm,
}: {
  canConfirm: boolean;
  isSaving: boolean;
  onConfirm: () => void;
}) {
  return (
    <div className="space-y-2 pb-2">
      <button
        disabled={!canConfirm || isSaving}
        onClick={onConfirm}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all',
          canConfirm && !isSaving
            ? 'text-white hover:opacity-90'
            : 'text-stone-400 dark:text-zinc-600 bg-stone-100 dark:bg-zinc-800 cursor-not-allowed',
        )}
        style={canConfirm && !isSaving ? { background: 'var(--color-brand)' } : {}}
      >
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
        ) : (
          <CalendarDays className="w-4 h-4" strokeWidth={2} />
        )}
        {isSaving ? 'Confirmando…' : 'Confirmar encuentro'}
      </button>
      {!canConfirm && !isSaving && (
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
  adoption,
  onReset,
}: {
  date: Date;
  time: string;
  adoption: AdoptionRequest;
  onReset: () => void;
}) {
  const appointmentCode = buildAppointmentCode(adoption);
  const rows = [
    { label: 'Animal',  value: adoption.pet_name                          },
    { label: 'Fecha',   value: formatDateEs(date)                         },
    { label: 'Hora',    value: time                                        },
    { label: 'Refugio', value: adoption.foundation_name || 'Fundación'    },
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
          Tu encuentro con {adoption.pet_name} ha sido agendado. Guarda tu código de reserva.
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
          {appointmentCode}
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

interface SchedulePageProps {
  onNavChange?: (id: NavId) => void;
}

export default function SchedulePage({ onNavChange }: SchedulePageProps) {
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<Phase>('scheduling');
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: adoptions = [], isLoading: loadingAdoptions, isError: adoptionsError } = useQuery({
    queryKey: ['my-adoptions'],
    queryFn: () => adoptionsApi.myAdoptions(),
  });

  const approvedAdoption = adoptions.find(a => a.status === 'approved') ?? null;

  useRealtimeTable('adoption_requests', [['my-adoptions']]);
  useRealtimeTable('visit_schedules', [['my-adoptions']]);

  const { data: availability = [], isLoading: loadingAvailability } = useQuery({
    queryKey: ['foundation-availability', approvedAdoption?.foundation_id],
    queryFn: () => foundationsApi.getAvailability(approvedAdoption!.foundation_id),
    enabled: approvedAdoption !== null,
  });

  const availabilityMap = new Map(availability.map(a => [a.available_date, a]));
  const availableDates = availability.map(a => a.available_date);

  const selectedDateKey = selectedDate ? toDateKey(selectedDate) : null;
  const slotsForDay = selectedDateKey ? getSlotsForDay(availabilityMap, selectedDateKey) : [];

  const selectedSlot = slotsForDay.find(s => s.label === selectedTime) ?? null;
  const canConfirm = selectedDate !== null && selectedSlot !== null;

  function handleSelectDate(date: Date) {
    setSelectedDate(date);
    setSelectedTime(null);
  }

  async function handleConfirm() {
    if (!approvedAdoption || !selectedDate || !selectedSlot) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const scheduledAt = buildScheduledAt(selectedDate, selectedSlot);
      const updated = await adoptionsApi.scheduleVisit(approvedAdoption.id, scheduledAt);
      queryClient.setQueryData(['my-adoptions'], (old: typeof adoptions) =>
        old.map(a => (a.id === updated.id ? updated : a))
      );
      setPhase('success');
    } catch {
      setSaveError('No pudimos confirmar tu cita. Verifica tu conexión e intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleReset() {
    setPhase('scheduling');
    setSelectedDate(null);
    setSelectedTime(null);
    setMonthOffset(0);
    setSaveError(null);
  }

  if (loadingAdoptions) return <GuardLoadingSkeleton />;

  if (adoptionsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-120 px-6 py-16 text-center">
        <div
          className="flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
          style={{ background: 'var(--color-brand-light)' }}
        >
          <CalendarOff
            className="w-8 h-8"
            style={{ color: 'var(--color-brand)' }}
            strokeWidth={1.75}
          />
        </div>
        <h1 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
          No pudimos cargar tus adopciones
        </h1>
        <p className="text-sm text-stone-500 dark:text-zinc-400 mt-2 max-w-sm leading-relaxed">
          Hubo un problema al conectar con el servidor. Verifica tu conexión e intenta de nuevo.
        </p>
        <div className="mt-8">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!approvedAdoption) {
    return <NoApprovedState onBrowse={onNavChange ? () => onNavChange('browse') : undefined} />;
  }

  const adoption = approvedAdoption;

  // If already scheduled, show read-only state
  if (adoption.visit_schedule && phase !== 'success') {
    return (
      <div className="flex flex-col md:flex-row">
        <MobileBanner adoption={adoption} />
        <aside className="hidden md:flex flex-col w-[320px] shrink-0 sticky top-0 self-start max-h-screen overflow-y-auto border-r border-stone-200 dark:border-zinc-800 px-5 py-6 space-y-4">
          <ContextCard adoption={adoption} />
        </aside>
        <div className="flex-1">
          <AlreadyScheduledState visit={adoption.visit_schedule} adoption={adoption} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row">
      <MobileBanner adoption={adoption} />

      <aside className="hidden md:flex flex-col w-[320px] shrink-0 sticky top-0 self-start max-h-screen overflow-y-auto border-r border-stone-200 dark:border-zinc-800 px-5 py-6 space-y-4">
        <ContextCard adoption={adoption} />
      </aside>

      <div className="flex-1">
        {phase === 'success' ? (
          <SuccessScreen
            date={selectedDate!}
            time={selectedTime!}
            adoption={adoption}
            onReset={handleReset}
          />
        ) : (
          <div className="px-6 py-6 space-y-6">
            <div>
              <h1 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
                Agendar encuentro
              </h1>
              <p className="text-sm text-stone-500 dark:text-zinc-400 mt-1">
                Elige el día y horario para conocer a {adoption.pet_name} en el refugio.
              </p>
            </div>

            {loadingAvailability ? (
              <div className="flex items-center justify-center py-16">
                <Loader2
                  className="w-6 h-6 animate-spin"
                  style={{ color: 'var(--color-brand)' }}
                  strokeWidth={1.75}
                />
              </div>
            ) : availableDates.length === 0 ? (
              <NoAvailabilityState />
            ) : (
              <>
                <MonthCalendar
                  monthOffset={monthOffset}
                  onMonthChange={setMonthOffset}
                  selectedDate={selectedDate}
                  onSelectDate={handleSelectDate}
                  availableDates={availableDates}
                />

                <AnimatePresence>
                  {selectedDate && slotsForDay.length > 0 && (
                    <motion.div
                      key="timeslots"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      <TimeSlotPicker
                        slots={slotsForDay}
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
                      <AppointmentSummary date={selectedDate} time={selectedTime} adoption={adoption} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {saveError && (
                  <p className="text-sm text-red-500 text-center">{saveError}</p>
                )}

                <ConfirmButton canConfirm={canConfirm} isSaving={isSaving} onConfirm={handleConfirm} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
