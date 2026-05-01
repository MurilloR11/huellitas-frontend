import { useQueries } from '@tanstack/react-query';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import type { LucideIcon } from 'lucide-react';
import { PawPrint, Building2, CheckCircle2, Clock, Heart } from 'lucide-react';
import { petsApi } from '../../pets/services/petsApi';
import { foundationsApi } from '../../foundations/services/foundationsApi';
import { useAuth } from '../../auth/hooks/useAuth';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// ─── Palette ───────────────────────────────────────────────────────────────────

const C = {
  brand:        '#e85d26',
  brandLight:   '#fdf3ee',
  success:      '#16a34a',
  successLight: '#f0fdf4',
  warning:      '#d97706',
  warningLight: '#fffbeb',
  stone:        '#78716c',
  stoneLight:   '#f5f5f4',
};

const CHART_FONT = 'Plus Jakarta Sans';

// ─── StatCard ──────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  loading: boolean;
}

function StatCard({ label, value, icon: Icon, iconColor, iconBg, loading }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 flex items-center gap-4">
      <div
        className="flex items-center justify-center w-11 h-11 rounded-lg shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        <Icon className="w-5 h-5" style={{ color: iconColor }} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        {loading ? (
          <div className="h-7 w-14 rounded-md bg-stone-100 animate-pulse" />
        ) : (
          <p className="text-2xl font-bold text-stone-900 leading-none tabular-nums">
            {value.toLocaleString('es-CO')}
          </p>
        )}
        <p className="text-sm text-stone-500 mt-1 truncate">{label}</p>
      </div>
    </div>
  );
}

// ─── ChartCard ─────────────────────────────────────────────────────────────────

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5">
      <p className="text-sm font-semibold text-stone-800">{title}</p>
      <p className="text-xs text-stone-400 mt-0.5 mb-4">{subtitle}</p>
      <div className="relative h-52">{children}</div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-stone-400">
      Sin datos disponibles
    </div>
  );
}

// ─── AdminPage ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user } = useAuth();

  const [
    availableQ, inProcessQ, adoptedQ,
    dogsQ, catsQ, otherQ,
    foundationsQ,
  ] = useQueries({
    queries: [
      { queryKey: ['admin', 'pets', 'available'],  queryFn: () => petsApi.list({ status: 'available',  per_page: 1 }), staleTime: 5 * 60 * 1000 },
      { queryKey: ['admin', 'pets', 'in_process'], queryFn: () => petsApi.list({ status: 'in_process', per_page: 1 }), staleTime: 5 * 60 * 1000 },
      { queryKey: ['admin', 'pets', 'adopted'],    queryFn: () => petsApi.list({ status: 'adopted',    per_page: 1 }), staleTime: 5 * 60 * 1000 },
      { queryKey: ['admin', 'pets', 'dog'],        queryFn: () => petsApi.list({ species: 'dog',       per_page: 1 }), staleTime: 5 * 60 * 1000 },
      { queryKey: ['admin', 'pets', 'cat'],        queryFn: () => petsApi.list({ species: 'cat',       per_page: 1 }), staleTime: 5 * 60 * 1000 },
      { queryKey: ['admin', 'pets', 'other'],      queryFn: () => petsApi.list({ species: 'other',     per_page: 1 }), staleTime: 5 * 60 * 1000 },
      { queryKey: ['admin', 'foundations'],        queryFn: () => foundationsApi.list(),                               staleTime: 5 * 60 * 1000 },
    ],
  });

  const isLoading = [availableQ, inProcessQ, adoptedQ, dogsQ, catsQ, otherQ, foundationsQ]
    .some(q => q.isLoading);

  const available   = availableQ.data?.total   ?? 0;
  const inProcess   = inProcessQ.data?.total   ?? 0;
  const adopted     = adoptedQ.data?.total     ?? 0;
  const total       = available + inProcess + adopted;
  const dogs        = dogsQ.data?.total        ?? 0;
  const cats        = catsQ.data?.total        ?? 0;
  const otherPets   = otherQ.data?.total       ?? 0;
  const foundations = foundationsQ.data?.total ?? 0;

  const noStatusData  = !isLoading && total === 0;
  const noSpeciesData = !isLoading && dogs + cats + otherPets === 0;

  const doughnutData = {
    labels: ['Disponibles', 'En proceso', 'Adoptadas'],
    datasets: [{
      data: [available, inProcess, adopted],
      backgroundColor: [C.success, C.warning, C.brand],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const barData = {
    labels: ['Perros', 'Gatos', 'Otros'],
    datasets: [{
      label: 'Mascotas',
      data: [dogs, cats, otherPets],
      backgroundColor: [C.brand, C.warning, C.stone],
      borderRadius: 6,
      borderSkipped: false as const,
    }],
  };

  const today = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="p-6 space-y-6 max-w-5xl">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-stone-900">
          Bienvenido, {user?.full_name ?? 'Admin'}
        </h1>
        <p className="text-sm text-stone-400 mt-0.5 capitalize">{today}</p>
      </div>

      {/* ── KPI cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Total mascotas" value={total}       icon={PawPrint}    iconColor={C.stone}   iconBg={C.stoneLight}   loading={isLoading} />
        <StatCard label="Disponibles"    value={available}   icon={CheckCircle2} iconColor={C.success} iconBg={C.successLight} loading={isLoading} />
        <StatCard label="En proceso"     value={inProcess}   icon={Clock}        iconColor={C.warning} iconBg={C.warningLight} loading={isLoading} />
        <StatCard label="Adoptadas"      value={adopted}     icon={Heart}        iconColor={C.brand}   iconBg={C.brandLight}   loading={isLoading} />
        <StatCard label="Fundaciones"    value={foundations} icon={Building2}    iconColor={C.brand}   iconBg={C.brandLight}   loading={isLoading} />
      </div>

      {/* ── Charts ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Estado de mascotas" subtitle="Distribución por estado actual">
          {noStatusData ? <EmptyChart /> : (
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '68%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 16,
                      font: { size: 12, family: CHART_FONT },
                      usePointStyle: true,
                      pointStyleWidth: 8,
                    },
                  },
                  tooltip: {
                    callbacks: { label: ctx => `  ${ctx.label}: ${ctx.parsed}` },
                  },
                },
              }}
            />
          )}
        </ChartCard>

        <ChartCard title="Mascotas por especie" subtitle="Total registrado en la plataforma">
          {noSpeciesData ? <EmptyChart /> : (
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: { label: ctx => `  ${ctx.parsed.y} mascotas` },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, font: { size: 12, family: CHART_FONT } },
                    grid: { color: '#f5f5f4' },
                    border: { display: false },
                  },
                  x: {
                    ticks: { font: { size: 12, family: CHART_FONT } },
                    grid: { display: false },
                    border: { display: false },
                  },
                },
              }}
            />
          )}
        </ChartCard>
      </div>
    </div>
  );
}
