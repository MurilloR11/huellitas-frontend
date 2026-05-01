import { useState } from 'react';
import { Building2, Mail, MapPin, PawPrint, Check, X, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ─── Types ─────────────────────────────────────────────────────────────────────

type Status = 'pending' | 'approved' | 'rejected';

interface AdminFoundation {
  id: number;
  name: string;
  city: string;
  contact_email: string;
  active_pets_count: number;
  adopted_pets_count: number;
  created_at: string;
  status: Status;
}

// ─── Static data ───────────────────────────────────────────────────────────────

const INITIAL: AdminFoundation[] = [
  {
    id: 1,
    name: 'Patitas Felices',
    city: 'Bogotá',
    contact_email: 'info@patitasfelices.com',
    active_pets_count: 0,
    adopted_pets_count: 0,
    created_at: '2026-04-20',
    status: 'pending',
  },
  {
    id: 2,
    name: 'Huellas de Amor',
    city: 'Medellín',
    contact_email: 'contacto@huellasdeamor.com',
    active_pets_count: 0,
    adopted_pets_count: 0,
    created_at: '2026-04-27',
    status: 'pending',
  },
  {
    id: 3,
    name: 'Refugio San Francisco',
    city: 'Cali',
    contact_email: 'refugio@sanfrancisco.com',
    active_pets_count: 8,
    adopted_pets_count: 21,
    created_at: '2026-01-10',
    status: 'approved',
  },
  {
    id: 4,
    name: 'Animales del Valle',
    city: 'Cali',
    contact_email: 'info@animalesvalle.com',
    active_pets_count: 15,
    adopted_pets_count: 45,
    created_at: '2026-02-05',
    status: 'approved',
  },
  {
    id: 5,
    name: 'Patas y Colitas',
    city: 'Barranquilla',
    contact_email: 'contacto@patascolitas.com',
    active_pets_count: 5,
    adopted_pets_count: 12,
    created_at: '2026-03-01',
    status: 'approved',
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ─── PendingRow ────────────────────────────────────────────────────────────────

function PendingRow({
  foundation,
  onApprove,
  onReject,
}: {
  foundation: AdminFoundation;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-stone-100 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
        <Building2 className="w-4 h-4 text-amber-600" strokeWidth={1.75} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-stone-800 truncate">{foundation.name}</p>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-stone-400">
            <MapPin className="w-3 h-3" />
            {foundation.city}
          </span>
          <span className="flex items-center gap-1 text-xs text-stone-400">
            <Mail className="w-3 h-3" />
            {foundation.contact_email}
          </span>
          <span className="flex items-center gap-1 text-xs text-stone-400">
            <Calendar className="w-3 h-3" />
            Solicitó el {formatDate(foundation.created_at)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant="outline"
          onClick={onReject}
          className="h-8 px-3 text-xs border-stone-200 text-stone-500 hover:border-red-200 hover:text-red-600 hover:bg-red-50"
        >
          <X className="w-3.5 h-3.5 mr-1" />
          Rechazar
        </Button>
        <Button
          size="sm"
          onClick={onApprove}
          className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 text-white"
        >
          <Check className="w-3.5 h-3.5 mr-1" />
          Aprobar
        </Button>
      </div>
    </div>
  );
}

// ─── ApprovedRow ───────────────────────────────────────────────────────────────

function ApprovedRow({ foundation }: { foundation: AdminFoundation }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-stone-100 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
        <Building2 className="w-4 h-4 text-green-600" strokeWidth={1.75} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-stone-800 truncate">{foundation.name}</p>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-stone-400">
            <MapPin className="w-3 h-3" />
            {foundation.city}
          </span>
          <span className="flex items-center gap-1 text-xs text-stone-400">
            <Mail className="w-3 h-3" />
            {foundation.contact_email}
          </span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-5 shrink-0">
        <div className="text-right">
          <p className="text-sm font-bold text-stone-800 tabular-nums">{foundation.active_pets_count}</p>
          <p className="text-xs text-stone-400 flex items-center gap-0.5 justify-end">
            <PawPrint className="w-3 h-3" /> Activas
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-stone-800 tabular-nums">{foundation.adopted_pets_count}</p>
          <p className="text-xs text-stone-400">Adoptadas</p>
        </div>
      </div>

      <Badge className="shrink-0 bg-green-50 text-green-700 border border-green-200 hover:bg-green-50 text-xs font-medium shadow-none">
        Aprobada
      </Badge>
    </div>
  );
}

// ─── AdminFoundationsPage ──────────────────────────────────────────────────────

export default function AdminFoundationsPage() {
  const [foundations, setFoundations] = useState<AdminFoundation[]>(INITIAL);

  const pending  = foundations.filter(f => f.status === 'pending');
  const approved = foundations.filter(f => f.status === 'approved');

  function setStatus(id: number, status: Status) {
    setFoundations(prev => prev.map(f => f.id === id ? { ...f, status } : f));
  }

  return (
    <div className="p-6 space-y-5 max-w-4xl">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-stone-900">Fundaciones</h1>
        <p className="text-sm text-stone-400 mt-0.5">
          {approved.length} aprobadas · {pending.length} pendientes de revisión
        </p>
      </div>

      {/* ── Pendientes ─────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm font-semibold text-stone-700">Pendientes de aprobación</p>
          <span className="text-xs font-semibold bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">
            {pending.length}
          </span>
        </div>

        {pending.length > 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-white overflow-hidden">
            {pending.map(f => (
              <PendingRow
                key={f.id}
                foundation={f}
                onApprove={() => setStatus(f.id, 'approved')}
                onReject={()  => setStatus(f.id, 'rejected')}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-stone-200 bg-white px-5 py-8 text-center">
            <Check className="w-7 h-7 text-green-500 mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-sm font-medium text-stone-600">Sin solicitudes pendientes</p>
            <p className="text-xs text-stone-400 mt-0.5">Todas las fundaciones han sido revisadas.</p>
          </div>
        )}
      </section>

      {/* ── Aprobadas ──────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm font-semibold text-stone-700">Aprobadas</p>
          <span className="text-xs font-semibold bg-green-100 text-green-700 rounded-full px-2 py-0.5">
            {approved.length}
          </span>
        </div>

        {approved.length > 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
            {approved.map(f => (
              <ApprovedRow key={f.id} foundation={f} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-stone-200 bg-white px-5 py-8 text-center">
            <p className="text-sm text-stone-400">Aún no hay fundaciones aprobadas.</p>
          </div>
        )}
      </section>

    </div>
  );
}
