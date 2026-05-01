import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { LucideIcon } from 'lucide-react';
import { PawPrint, Building2, CheckCircle2, Clock, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useAuth } from '../../auth/hooks/useAuth';

// ─── Static placeholder data ───────────────────────────────────────────────────

const D = {
  available:   24,
  inProcess:    8,
  adopted:     47,
  dogs:        45,
  cats:        28,
  other:        6,
  foundations: 12,
};

const total = D.available + D.inProcess + D.adopted;

const statusChartData = [
  { key: 'available', label: 'Disponibles', value: D.available, fill: '#16a34a' },
  { key: 'inProcess', label: 'En proceso',  value: D.inProcess, fill: '#d97706' },
  { key: 'adopted',   label: 'Adoptadas',   value: D.adopted,   fill: '#e85d26' },
];

const speciesChartData = [
  { species: 'Perros', count: D.dogs,  fill: '#e85d26' },
  { species: 'Gatos',  count: D.cats,  fill: '#d97706' },
  { species: 'Otros',  count: D.other, fill: '#a8a29e' },
];

const statusConfig: ChartConfig = {
  available: { label: 'Disponibles', color: '#16a34a' },
  inProcess: { label: 'En proceso',  color: '#d97706' },
  adopted:   { label: 'Adoptadas',   color: '#e85d26' },
};

const speciesConfig: ChartConfig = {
  count: { label: 'Mascotas', color: '#e85d26' },
};

// ─── StatCard ──────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  description: string;
  color: string;
  colorBg: string;
}

function StatCard({ label, value, icon: Icon, description, color, colorBg }: StatCardProps) {
  return (
    <Card className="rounded-2xl border-stone-200 shadow-none">
      <CardContent className="p-5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: colorBg }}
        >
          <Icon className="w-4 h-4" style={{ color }} strokeWidth={1.75} />
        </div>
        <p className="text-3xl font-bold tabular-nums mt-4 leading-none" style={{ color }}>
          {value.toLocaleString('es-CO')}
        </p>
        <p className="text-sm font-medium text-stone-700 mt-1.5">{label}</p>
        <p className="text-xs text-stone-400 mt-0.5">{description}</p>
      </CardContent>
    </Card>
  );
}

// ─── AdminPage ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user } = useAuth();

  const today = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="p-6 space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900">
            Bienvenido, {user?.full_name ?? 'Admin'}
          </h1>
          <p className="text-sm text-stone-400 capitalize mt-0.5">{today}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm">
          <Building2 className="h-4 w-4 text-stone-400" strokeWidth={1.75} />
          <span className="font-semibold text-stone-700">{D.foundations}</span>
          <span className="text-stone-400">fundaciones</span>
        </div>
      </div>

      {/* ── KPI cards ──────────────────────────────────────────────────── */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total mascotas"
          value={total}
          icon={PawPrint}
          description={`${D.available} disponibles ahora`}
          color="#44403c"
          colorBg="#f5f5f4"
        />
        <StatCard
          label="Disponibles"
          value={D.available}
          icon={CheckCircle2}
          description="Listas para adopción"
          color="#16a34a"
          colorBg="#f0fdf4"
        />
        <StatCard
          label="En proceso"
          value={D.inProcess}
          icon={Clock}
          description="Con solicitud activa"
          color="#d97706"
          colorBg="#fffbeb"
        />
        <StatCard
          label="Adoptadas"
          value={D.adopted}
          icon={Heart}
          description="Han encontrado hogar"
          color="#e85d26"
          colorBg="#fdf3ee"
        />
      </div>

      {/* ── Charts ─────────────────────────────────────────────────────── */}
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2">

        {/* Donut — estado */}
        <Card className="rounded-2xl border-stone-200 shadow-none">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-stone-800">Estado de mascotas</p>
            <p className="text-xs text-stone-400 mt-0.5 mb-4">Distribución por estado actual</p>

            <ChartContainer
              config={statusConfig}
              className="mx-auto aspect-square max-h-60"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="label" />}
                />
                <Pie
                  data={statusChartData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius="55%"
                  outerRadius="80%"
                  strokeWidth={0}
                  paddingAngle={2}
                >
                  {statusChartData.map(entry => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="flex justify-center gap-5 mt-4">
              {statusChartData.map(item => (
                <div key={item.key} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-xs text-stone-500">{item.label}</span>
                  <span className="text-xs font-semibold text-stone-700">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bar — especie */}
        <Card className="rounded-2xl border-stone-200 shadow-none">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-stone-800">Mascotas por especie</p>
            <p className="text-xs text-stone-400 mt-0.5 mb-4">Total registrado en la plataforma</p>

            <ChartContainer config={speciesConfig} className="h-72 w-full">
              <BarChart
                accessibilityLayer
                data={speciesChartData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#f5f5f4" />
                <XAxis
                  dataKey="species"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tick={{ fontSize: 12, fill: '#a8a29e' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12, fill: '#a8a29e' }}
                />
                <ChartTooltip
                  cursor={{ fill: '#f5f5f4' }}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={56}>
                  {speciesChartData.map(entry => (
                    <Cell key={entry.species} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
