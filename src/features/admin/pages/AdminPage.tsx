import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { LucideIcon } from 'lucide-react';
import { PawPrint, Building2, CheckCircle2, Clock, Heart } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
}

function StatCard({ label, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tabular-nums">
          {value.toLocaleString('es-CO')}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
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
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Bienvenido, {user?.full_name ?? 'Admin'}
          </h1>
          <p className="text-sm text-muted-foreground capitalize mt-0.5">{today}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm shadow-sm">
          <Building2 className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          <span className="font-semibold text-stone-700">{D.foundations}</span>
          <span className="text-muted-foreground">fundaciones</span>
        </div>
      </div>

      {/* ── KPI cards ──────────────────────────────────────────────────── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total mascotas"
          value={total}
          icon={PawPrint}
          description={`${D.available} disponibles para adopción`}
        />
        <StatCard
          label="Disponibles"
          value={D.available}
          icon={CheckCircle2}
          description="Listas para ser adoptadas"
        />
        <StatCard
          label="En proceso"
          value={D.inProcess}
          icon={Clock}
          description="Con solicitud activa"
        />
        <StatCard
          label="Adoptadas"
          value={D.adopted}
          icon={Heart}
          description="Han encontrado hogar"
        />
      </div>

      {/* ── Charts ─────────────────────────────────────────────────────── */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">

        {/* Donut — estado */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de mascotas</CardTitle>
            <CardDescription>Distribución por estado actual</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={statusConfig}
              className="mx-auto aspect-square max-h-65"
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

            <div className="flex justify-center gap-5 mt-2">
              {statusChartData.map(item => (
                <div key={item.key} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className="text-xs font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bar — especie */}
        <Card>
          <CardHeader>
            <CardTitle>Mascotas por especie</CardTitle>
            <CardDescription>Total registrado en la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={speciesConfig} className="h-75 w-full">
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
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={{ fill: '#f5f5f4' }}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={64}>
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
