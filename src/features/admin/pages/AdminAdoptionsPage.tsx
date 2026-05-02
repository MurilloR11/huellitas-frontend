import { useState } from 'react';
import {
  Search, Calendar, Eye, PawPrint, Building2,
  Phone, Mail, MapPin, ChevronLeft, ChevronRight, Ban, ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

// ─── Types ─────────────────────────────────────────────────────────────────────

type Species       = 'dog' | 'cat' | 'other';
type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

interface TimelineStep {
  label: string;
  date:  string | null;
}

interface AdoptionRequest {
  id:              number;
  code:            string;
  requester_name:  string;
  requester_email: string;
  requester_phone: string;
  requester_city:  string;
  pet_code:        string;
  pet_name:        string;
  pet_species:     Species;
  foundation:      string;
  requested_at:    string;
  status:          RequestStatus;
  timeline:        TimelineStep[];
}

// ─── Static data ───────────────────────────────────────────────────────────────

const INITIAL: AdoptionRequest[] = [
  {
    id: 1, code: 'SOL-0001',
    requester_name: 'Laura Martínez', requester_email: 'laura.m@gmail.com',
    requester_phone: '310-555-0101', requester_city: 'Bogotá',
    pet_code: 'HU-0001', pet_name: 'Max', pet_species: 'dog',
    foundation: 'Fundación Vida Animal', requested_at: '2026-04-28', status: 'pending',
    timeline: [
      { label: 'Solicitud enviada',      date: '2026-04-28' },
      { label: 'Revisada por fundación', date: null         },
      { label: 'Visita programada',      date: null         },
      { label: 'Adopción finalizada',    date: null         },
    ],
  },
  {
    id: 2, code: 'SOL-0002',
    requester_name: 'Carlos Herrera', requester_email: 'c.herrera@outlook.com',
    requester_phone: '315-555-0202', requester_city: 'Medellín',
    pet_code: 'HU-0003', pet_name: 'Rocky', pet_species: 'dog',
    foundation: 'Colitas Felices', requested_at: '2026-04-29', status: 'pending',
    timeline: [
      { label: 'Solicitud enviada',      date: '2026-04-29' },
      { label: 'Revisada por fundación', date: null         },
      { label: 'Visita programada',      date: null         },
      { label: 'Adopción finalizada',    date: null         },
    ],
  },
  {
    id: 3, code: 'SOL-0003',
    requester_name: 'Valeria Torres', requester_email: 'v.torres@gmail.com',
    requester_phone: '311-555-0303', requester_city: 'Cali',
    pet_code: 'HU-0006', pet_name: 'Mía', pet_species: 'cat',
    foundation: 'Rescate Antioquia', requested_at: '2026-04-30', status: 'pending',
    timeline: [
      { label: 'Solicitud enviada',      date: '2026-04-30' },
      { label: 'Revisada por fundación', date: null         },
      { label: 'Visita programada',      date: null         },
      { label: 'Adopción finalizada',    date: null         },
    ],
  },
  {
    id: 4, code: 'SOL-0004',
    requester_name: 'Andrés Gómez', requester_email: 'andres.g@gmail.com',
    requester_phone: '320-555-0404', requester_city: 'Barranquilla',
    pet_code: 'HU-0007', pet_name: 'Simba', pet_species: 'cat',
    foundation: 'Fundación Pelaje', requested_at: '2026-05-01', status: 'pending',
    timeline: [
      { label: 'Solicitud enviada',      date: '2026-05-01' },
      { label: 'Revisada por fundación', date: null         },
      { label: 'Visita programada',      date: null         },
      { label: 'Adopción finalizada',    date: null         },
    ],
  },
  {
    id: 5, code: 'SOL-0005',
    requester_name: 'Sofía Ramírez', requester_email: 'sofia.r@hotmail.com',
    requester_phone: '312-555-0505', requester_city: 'Bogotá',
    pet_code: 'HU-0024', pet_name: 'Kira', pet_species: 'dog',
    foundation: 'Fundación Vida Animal', requested_at: '2026-05-02', status: 'pending',
    timeline: [
      { label: 'Solicitud enviada',      date: '2026-05-02' },
      { label: 'Revisada por fundación', date: null         },
      { label: 'Visita programada',      date: null         },
      { label: 'Adopción finalizada',    date: null         },
    ],
  },
  {
    id: 6, code: 'SOL-0006',
    requester_name: 'Miguel Ángel Soto', requester_email: 'm.soto@gmail.com',
    requester_phone: '316-555-0606', requester_city: 'Bogotá',
    pet_code: 'HU-0009', pet_name: 'Toby', pet_species: 'dog',
    foundation: 'Animal SOS', requested_at: '2026-03-22', status: 'approved',
    timeline: [
      { label: 'Solicitud enviada',      date: '2026-03-22' },
      { label: 'Revisada por fundación', date: '2026-03-24' },
      { label: 'Visita programada',      date: '2026-03-28' },
      { label: 'Adopción finalizada',    date: null         },
    ],
  },
  {
    id: 7, code: 'SOL-0007',
    requester_name: 'Daniela Vargas', requester_email: 'dani.v@gmail.com',
    requester_phone: '318-555-0707', requester_city: 'Medellín',
    pet_code: 'HU-0010', pet_name: 'Nala', pet_species: 'dog',
    foundation: 'Colitas Felices', requested_at: '2026-03-27', status: 'approved',
    timeline: [
      { label: 'Solicitud enviada',      date: '2026-03-27' },
      { label: 'Revisada por fundación', date: '2026-03-29' },
      { label: 'Visita programada',      date: '2026-04-02' },
      { label: 'Adopción finalizada',    date: null         },
    ],
  },
  {
    id: 8, code: 'SOL-0008',
    requester_name: 'Juliana Ospina', requester_email: 'juli.o@gmail.com',
    requester_phone: '314-555-0808', requester_city: 'Cali',
    pet_code: 'HU-0011', pet_name: 'Oliver', pet_species: 'cat',
    foundation: 'Fundación Vida Animal', requested_at: '2026-03-30', status: 'approved',
    timeline: [
      { label: 'Solicitud enviada',      date: '2026-03-30' },
      { label: 'Revisada por fundación', date: '2026-04-01' },
      { label: 'Visita programada',      date: '2026-04-05' },
      { label: 'Adopción finalizada',    date: null         },
    ],
  },
  {
    id: 9, code: 'SOL-0009',
    requester_name: 'Santiago Pérez', requester_email: 's.perez@outlook.com',
    requester_phone: '321-555-0909', requester_city: 'Pereira',
    pet_code: 'HU-0012', pet_name: 'Lola', pet_species: 'dog',
    foundation: 'Refugio Los Andes', requested_at: '2026-04-04', status: 'approved',
    timeline: [
      { label: 'Solicitud enviada',      date: '2026-04-04' },
      { label: 'Revisada por fundación', date: '2026-04-06' },
      { label: 'Visita programada',      date: null         },
      { label: 'Adopción finalizada',    date: null         },
    ],
  },
  {
    id: 10, code: 'SOL-0010',
    requester_name: 'Isabela Gómez', requester_email: 'isa.g@gmail.com',
    requester_phone: '313-555-1010', requester_city: 'Bogotá',
    pet_code: 'HU-0013', pet_name: 'Manchas', pet_species: 'dog',
    foundation: 'Animal SOS', requested_at: '2026-04-17', status: 'approved',
    timeline: [
      { label: 'Solicitud enviada',      date: '2026-04-17' },
      { label: 'Revisada por fundación', date: '2026-04-19' },
      { label: 'Visita programada',      date: null         },
      { label: 'Adopción finalizada',    date: null         },
    ],
  },
  {
    id: 11, code: 'SOL-0011',
    requester_name: 'Tomás Reyes', requester_email: 'tomas.r@gmail.com',
    requester_phone: '317-555-1111', requester_city: 'Manizales',
    pet_code: 'HU-0004', pet_name: 'Bella', pet_species: 'dog',
    foundation: 'Refugio San Francisco', requested_at: '2026-04-12', status: 'approved',
    timeline: [
      { label: 'Solicitud enviada',      date: '2026-04-12' },
      { label: 'Revisada por fundación', date: '2026-04-14' },
      { label: 'Visita programada',      date: '2026-04-18' },
      { label: 'Adopción finalizada',    date: null         },
    ],
  },
  {
    id: 12, code: 'SOL-0012',
    requester_name: 'Natalia Cruz', requester_email: 'nata.c@hotmail.com',
    requester_phone: '319-555-1212', requester_city: 'Cartagena',
    pet_code: 'HU-0008', pet_name: 'Cleo', pet_species: 'cat',
    foundation: 'Patas y Colitas', requested_at: '2026-04-20', status: 'approved',
    timeline: [
      { label: 'Solicitud enviada',      date: '2026-04-20' },
      { label: 'Revisada por fundación', date: '2026-04-22' },
      { label: 'Visita programada',      date: null         },
      { label: 'Adopción finalizada',    date: null         },
    ],
  },
  {
    id: 13, code: 'SOL-0013',
    requester_name: 'Ricardo Mora', requester_email: 'r.mora@gmail.com',
    requester_phone: '300-555-1313', requester_city: 'Bogotá',
    pet_code: 'HU-0002', pet_name: 'Luna', pet_species: 'dog',
    foundation: 'Animal SOS', requested_at: '2026-04-10', status: 'rejected',
    timeline: [
      { label: 'Solicitud enviada',      date: '2026-04-10' },
      { label: 'Revisada por fundación', date: '2026-04-12' },
      { label: 'Solicitud rechazada',    date: '2026-04-12' },
    ],
  },
  {
    id: 14, code: 'SOL-0014',
    requester_name: 'Camila Díaz', requester_email: 'cami.d@gmail.com',
    requester_phone: '305-555-1414', requester_city: 'Medellín',
    pet_code: 'HU-0005', pet_name: 'Bruno', pet_species: 'dog',
    foundation: 'Animales del Valle', requested_at: '2026-04-14', status: 'rejected',
    timeline: [
      { label: 'Solicitud enviada',      date: '2026-04-14' },
      { label: 'Revisada por fundación', date: '2026-04-16' },
      { label: 'Solicitud rechazada',    date: '2026-04-16' },
    ],
  },
  {
    id: 15, code: 'SOL-0015',
    requester_name: 'Felipe Aguilar', requester_email: 'f.aguilar@outlook.com',
    requester_phone: '308-555-1515', requester_city: 'Cali',
    pet_code: 'HU-0025', pet_name: 'Pelusa', pet_species: 'cat',
    foundation: 'Rescate Antioquia', requested_at: '2026-04-27', status: 'rejected',
    timeline: [
      { label: 'Solicitud enviada',      date: '2026-04-27' },
      { label: 'Revisada por fundación', date: '2026-04-28' },
      { label: 'Solicitud rechazada',    date: '2026-04-28' },
    ],
  },
  {
    id: 16, code: 'SOL-0016',
    requester_name: 'María Fernanda López', requester_email: 'mf.lopez@gmail.com',
    requester_phone: '302-555-1616', requester_city: 'Bucaramanga',
    pet_code: 'HU-0022', pet_name: 'Bugs', pet_species: 'other',
    foundation: 'Animal SOS', requested_at: '2026-04-22', status: 'rejected',
    timeline: [
      { label: 'Solicitud enviada',      date: '2026-04-22' },
      { label: 'Revisada por fundación', date: '2026-04-24' },
      { label: 'Solicitud rechazada',    date: '2026-04-24' },
    ],
  },
  {
    id: 17, code: 'SOL-0017',
    requester_name: 'Alejandro Silva', requester_email: 'alex.s@gmail.com',
    requester_phone: '301-555-1717', requester_city: 'Bogotá',
    pet_code: 'HU-0015', pet_name: 'Coco', pet_species: 'dog',
    foundation: 'Animales del Valle', requested_at: '2026-03-01', status: 'cancelled',
    timeline: [
      { label: 'Solicitud enviada',           date: '2026-03-01' },
      { label: 'Revisada por fundación',      date: '2026-03-03' },
      { label: 'Cancelada por administrador', date: '2026-03-10' },
    ],
  },
  {
    id: 18, code: 'SOL-0018',
    requester_name: 'Ximena Castillo', requester_email: 'xime.c@hotmail.com',
    requester_phone: '304-555-1818', requester_city: 'Pasto',
    pet_code: 'HU-0016', pet_name: 'Kitty', pet_species: 'cat',
    foundation: 'Rescate Antioquia', requested_at: '2026-02-25', status: 'cancelled',
    timeline: [
      { label: 'Solicitud enviada',           date: '2026-02-25' },
      { label: 'Cancelada por administrador', date: '2026-02-28' },
    ],
  },
  {
    id: 19, code: 'SOL-0019',
    requester_name: 'Pablo Rojas', requester_email: 'pablo.r@gmail.com',
    requester_phone: '306-555-1919', requester_city: 'Barranquilla',
    pet_code: 'HU-0019', pet_name: 'Daisy', pet_species: 'dog',
    foundation: 'Fundación Pelaje', requested_at: '2026-03-08', status: 'cancelled',
    timeline: [
      { label: 'Solicitud enviada',           date: '2026-03-08' },
      { label: 'Revisada por fundación',      date: '2026-03-10' },
      { label: 'Visita programada',           date: '2026-03-15' },
      { label: 'Cancelada por administrador', date: '2026-03-18' },
    ],
  },
  {
    id: 20, code: 'SOL-0020',
    requester_name: 'Luisa Fernanda Ruiz', requester_email: 'luisa.r@gmail.com',
    requester_phone: '309-555-2020', requester_city: 'Ibagué',
    pet_code: 'HU-0017', pet_name: 'Thor', pet_species: 'dog',
    foundation: 'Patas y Colitas', requested_at: '2026-02-15', status: 'cancelled',
    timeline: [
      { label: 'Solicitud enviada',           date: '2026-02-15' },
      { label: 'Revisada por fundación',      date: '2026-02-17' },
      { label: 'Cancelada por administrador', date: '2026-02-20' },
    ],
  },
];

// ─── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE   = 7;
const FOUNDATIONS = [...new Set(INITIAL.map(r => r.foundation))].sort();

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string, month: 'short' | 'long' = 'short') {
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month, year: 'numeric' });
}

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).map(w => w[0].toUpperCase()).slice(0, 2).join('');
}

function Pill({ dot, text, color }: { dot: string; text: string; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-0.5 border ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {text}
    </span>
  );
}

// ─── Lookup maps ───────────────────────────────────────────────────────────────

const STATUS_PILL: Record<RequestStatus, { dot: string; text: string; color: string }> = {
  pending:   { dot: 'bg-amber-400', text: 'Pendiente',  color: 'text-amber-700 bg-amber-50 border-amber-200'  },
  approved:  { dot: 'bg-green-500', text: 'En proceso', color: 'text-green-700 bg-green-50 border-green-200'  },
  rejected:  { dot: 'bg-red-400',   text: 'Rechazada',  color: 'text-red-600 bg-red-50 border-red-200'        },
  cancelled: { dot: 'bg-stone-400', text: 'Cancelada',  color: 'text-stone-500 bg-stone-100 border-stone-200' },
};

const SPECIES_AVATAR: Record<Species, string> = {
  dog:   'bg-amber-100 text-amber-600',
  cat:   'bg-purple-100 text-purple-600',
  other: 'bg-stone-100 text-stone-500',
};

function StatusBadge({ status }: { status: RequestStatus }) {
  return <Pill {...STATUS_PILL[status]} />;
}

function stepDotClass(label: string, date: string | null): string {
  if (!date) return '';
  if (label.toLowerCase().includes('rechazada')) return 'bg-red-400';
  if (label.toLowerCase().includes('cancelada')) return 'bg-stone-400';
  return 'bg-stone-700';
}

function stepLabelClass(label: string, date: string | null): string {
  if (!date) return 'text-stone-300';
  if (label.toLowerCase().includes('rechazada')) return 'text-red-500';
  if (label.toLowerCase().includes('cancelada')) return 'text-stone-400';
  return 'text-stone-700';
}

// ─── RequestModal ──────────────────────────────────────────────────────────────

function RequestModal({
  request,
  open,
  onClose,
  onCancel,
}: {
  request:  AdoptionRequest | null;
  open:     boolean;
  onClose:  () => void;
  onCancel: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!request) return null;

  const isCancelled = request.status === 'cancelled';

  function handleOpenChange(v: boolean) {
    if (!v) {
      setConfirming(false);
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white border border-stone-200 shadow-xl">

        {/* Header */}
        <div className="bg-stone-50 px-6 pt-6 pb-5 border-b border-stone-100">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-sm">
              <ClipboardList className="w-5 h-5 text-stone-500" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <DialogTitle className="text-base text-stone-900 font-mono">{request.code}</DialogTitle>
                <DialogDescription className="sr-only">Detalles de la solicitud de adopción</DialogDescription>
                <StatusBadge status={request.status} />
              </div>
              <p className="text-xs text-stone-400 mt-1 flex items-center gap-1.5">
                <Building2 className="w-3 h-3 shrink-0" />
                {request.foundation}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">

          {/* Solicitante */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Solicitante</p>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center text-xs font-bold shrink-0 select-none">
                {getInitials(request.requester_name)}
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-stone-800">{request.requester_name}</p>
                <p className="text-xs text-stone-400 flex items-center gap-1.5">
                  <Mail className="w-3 h-3 shrink-0" />
                  {request.requester_email}
                </p>
                <p className="text-xs text-stone-400 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 shrink-0" />
                  {request.requester_phone}
                </p>
                <p className="text-xs text-stone-400 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {request.requester_city}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-100" />

          {/* Mascota */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Mascota</p>
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${SPECIES_AVATAR[request.pet_species]}`}>
                <PawPrint className="w-4.5 h-4.5" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-stone-800">{request.pet_name}</p>
                <p className="text-xs text-stone-400 font-mono">{request.pet_code}</p>
                <p className="text-xs text-stone-400 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3 h-3 shrink-0" />
                  Solicitado el {formatDate(request.requested_at, 'long')}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-100" />

          {/* Timeline */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Proceso</p>
            <div className="space-y-2.5">
              {request.timeline.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  {step.date ? (
                    <div className={`w-2 h-2 rounded-full shrink-0 ${stepDotClass(step.label, step.date)}`} />
                  ) : (
                    <div className="w-2 h-2 rounded-full shrink-0 border-2 border-stone-200" />
                  )}
                  <div className="flex-1 flex items-center justify-between gap-3">
                    <span className={`text-sm ${stepLabelClass(step.label, step.date)}`}>
                      {step.label}
                    </span>
                    <span className={`text-xs shrink-0 ${step.date ? 'text-stone-400' : 'text-stone-300'}`}>
                      {step.date ? formatDate(step.date) : 'Pendiente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between gap-3">
          {isCancelled ? (
            <span className="text-xs text-stone-400">Esta solicitud fue cancelada.</span>
          ) : confirming ? (
            <>
              <span className="text-xs text-stone-500 font-medium">¿Confirmar cancelación?</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => { onCancel(); setConfirming(false); }}
                  className="h-7 px-3 text-xs bg-red-500 hover:bg-red-600 text-white"
                >
                  Confirmar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirming(false)}
                  className="h-7 px-3 text-xs text-stone-400 hover:text-stone-600 hover:bg-stone-50"
                >
                  No, volver
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                size="sm"
                onClick={() => setConfirming(true)}
                className="h-7 px-3 text-xs bg-red-500 hover:bg-red-600 text-white"
              >
                <Ban className="w-3.5 h-3.5 mr-1.5" />
                Cancelar solicitud
              </Button>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-3 text-xs text-stone-400 hover:text-stone-600 hover:bg-stone-50"
                >
                  Cerrar
                </Button>
              </DialogClose>
            </>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}

// ─── AdminAdoptionsPage ────────────────────────────────────────────────────────

export default function AdminAdoptionsPage() {
  const [requests, setRequests]             = useState<AdoptionRequest[]>(INITIAL);
  const [search, setSearch]                 = useState('');
  const [statusFilter, setStatusFilter]     = useState<RequestStatus | 'all'>('all');
  const [foundationFilter, setFoundationFilter] = useState<string>('all');
  const [selected, setSelected]             = useState<AdoptionRequest | null>(null);
  const [page, setPage]                     = useState(1);

  const filtered = requests.filter(r => {
    const matchesSearch     = r.pet_code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus     = statusFilter === 'all' || r.status === statusFilter;
    const matchesFoundation = foundationFilter === 'all' || r.foundation === foundationFilter;
    return matchesSearch && matchesStatus && matchesFoundation;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function cancelRequest(id: number) {
    setRequests(prev => prev.map(r =>
      r.id === id
        ? {
            ...r,
            status: 'cancelled' as const,
            timeline: [
              ...r.timeline.filter(s => s.date !== null),
              { label: 'Cancelada por administrador', date: new Date().toISOString().slice(0, 10) },
            ],
          }
        : r
    ));
    setSelected(null);
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">

      {/* ── Filtros ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Buscar por código (HU-0001)..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-9 text-sm border-stone-200 bg-white"
          />
        </div>

        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v as RequestStatus | 'all'); setPage(1); }}>
          <SelectTrigger className="w-44 h-9 text-sm border-stone-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="approved">En proceso</SelectItem>
            <SelectItem value="rejected">Rechazadas</SelectItem>
            <SelectItem value="cancelled">Canceladas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={foundationFilter} onValueChange={v => { setFoundationFilter(v); setPage(1); }}>
          <SelectTrigger className="w-52 h-9 text-sm border-stone-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las fundaciones</SelectItem>
            {FOUNDATIONS.map(f => (
              <SelectItem key={f} value={f}>{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Tabla ──────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-stone-400">Sin resultados para los filtros aplicados.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-stone-200 hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 pl-0">Solicitante</TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 hidden sm:table-cell">Mascota</TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 hidden lg:table-cell">Fundación</TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 hidden md:table-cell">Fecha</TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9">Estado</TableHead>
              <TableHead className="text-xs font-semibold text-stone-400 uppercase tracking-wide h-9 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map(r => (
              <TableRow
                key={r.id}
                className={`border-stone-100 hover:bg-stone-50/60 ${r.status === 'cancelled' ? 'opacity-60' : ''}`}
              >

                <TableCell className="pl-0 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center text-xs font-bold shrink-0 select-none">
                      {getInitials(r.requester_name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-stone-800 truncate">{r.requester_name}</p>
                      <p className="text-xs text-stone-400 truncate">{r.requester_email}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4 hidden sm:table-cell">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${SPECIES_AVATAR[r.pet_species]}`}>
                      <PawPrint className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-stone-700 truncate">{r.pet_name}</p>
                      <p className="text-xs text-stone-400 font-mono truncate">{r.pet_code}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4 hidden lg:table-cell">
                  <span className="flex items-center gap-1.5 text-stone-500 text-sm">
                    <Building2 className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                    {r.foundation}
                  </span>
                </TableCell>

                <TableCell className="py-4 hidden md:table-cell">
                  <span className="flex items-center gap-1.5 text-stone-400 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                    {formatDate(r.requested_at)}
                  </span>
                </TableCell>

                <TableCell className="py-4">
                  <StatusBadge status={r.status} />
                </TableCell>

                <TableCell className="py-4 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelected(r)}
                    className="h-7 px-3 text-xs border-stone-200 text-stone-600 hover:bg-stone-50"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Ver
                  </Button>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* ── Paginación ─────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center pt-2">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
              className="h-8 w-8 p-0 border-stone-200 text-stone-500 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <Button
                key={n}
                variant={n === page ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPage(n)}
                className={`h-8 w-8 p-0 text-xs ${
                  n === page
                    ? 'bg-stone-800 hover:bg-stone-700 text-white'
                    : 'text-stone-500 hover:bg-stone-100'
                }`}
              >
                {n}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page === totalPages}
              className="h-8 w-8 p-0 border-stone-200 text-stone-500 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <RequestModal
        request={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onCancel={() => selected && cancelRequest(selected.id)}
      />

    </div>
  );
}
