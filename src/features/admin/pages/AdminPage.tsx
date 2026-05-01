import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid } from 'recharts';
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

const adoptionTrendData = [
  { mes: 'Nov', adopciones: 5 },
  { mes: 'Dic', adopciones: 8 },
  { mes: 'Ene', adopciones: 6 },
  { mes: 'Feb', adopciones: 11 },
  { mes: 'Mar', adopciones: 9 },
  { mes: 'Abr', adopciones: 14 },
];

const speciesChartData = [
  { species: 'Perros', count: D.dogs,  fill: '#e85d26' },
  { species: 'Gatos',  count: D.cats,  fill: '#d97706' },
  { species: 'Otros',  count: D.other, fill: '#a8a29e' },
];

const trendConfig: ChartConfig = {
  adopciones: { label: 'Adopciones', color: '#e85d26' },
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

        {/* Area — tendencia de adopciones */}
        <Card className="rounded-2xl border-stone-200 shadow-none">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-stone-800">Tendencia de adopciones</p>
            <p className="text-xs text-stone-400 mt-0.5 mb-4">Últimos 6 meses</p>

            <ChartContainer config={trendConfig} className="h-72 w-full">
              <AreaChart
                accessibilityLayer
                data={adoptionTrendData}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="adoptGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#e85d26" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#e85d26" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#f5f5f4" />
                <XAxis
                  dataKey="mes"
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
                  allowDecimals={false}
                />
                <ChartTooltip
                  cursor={{ stroke: '#e85d26', strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Area
                  type="monotone"
                  dataKey="adopciones"
                  stroke="#e85d26"
                  strokeWidth={2}
                  fill="url(#adoptGradient)"
                  dot={{ fill: '#e85d26', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </AreaChart>
            </ChartContainer>
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
