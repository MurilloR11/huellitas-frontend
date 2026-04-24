import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Save,
  Lock,
  Bell,
  Trash2,
  Eye,
  EyeOff,
  UserRound,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Camera,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { authApi } from '@/features/auth/services/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).map(w => w[0].toUpperCase()).slice(0, 2).join('');
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-light shrink-0">
            <Icon className="w-4 h-4 text-brand" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
            <p className="text-xs text-stone-400 mt-0.5">{description}</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-medium text-stone-500 uppercase tracking-wide">
        {label}
      </Label>
      {children}
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggleShow,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  placeholder?: string;
}) {
  return (
    <Field label={label} htmlFor={id}>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? '••••••••'}
          className="pr-10"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </Field>
  );
}

function SwitchRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-medium text-stone-800 cursor-pointer">
          {label}
        </Label>
        <p className="text-xs text-stone-400 mt-0.5">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const initials = user ? getInitials(user.full_name) : '--';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 2 MB');
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);
    try {
      await authApi.uploadAvatar(user.id, file);
      toast.success('Foto de perfil actualizada');
    } catch {
      toast.error('No se pudo subir la imagen');
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  }

  // Personal info
  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // Notifications
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [adoptionUpdates, setAdoptionUpdates] = useState(true);
  const [newsNotifs, setNewsNotifs] = useState(false);

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    toast.success('Perfil actualizado correctamente');
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Completa todos los campos de contraseña');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    toast.success('Contraseña actualizada correctamente');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 flex items-center px-6 h-14 bg-stone-50/90 backdrop-blur-sm border-b border-stone-200 shrink-0">
        <button
          type="button"
          onClick={() => navigate('/explore')}
          className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver</span>
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-stone-300 mx-1.5" aria-hidden="true" />
        <span className="text-sm font-semibold text-stone-800">Mi cuenta</span>
      </header>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* Profile hero */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center gap-5">

            {/* Avatar with upload overlay */}
            <div className="relative shrink-0 group">
              <div className="w-16 h-16 rounded-full bg-brand text-white flex items-center justify-center text-xl font-bold select-none overflow-hidden">
                {avatarPreview || user?.avatar_url ? (
                  <img
                    src={avatarPreview ?? user?.avatar_url}
                    alt={user?.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              {/* Hover overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                aria-label="Cambiar foto de perfil"
                className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-wait"
              >
                {uploadingAvatar
                  ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                  : <Camera className="w-5 h-5 text-white" />
                }
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-stone-900 truncate">{user?.full_name}</h1>
              <p className="text-sm text-stone-400 truncate mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <Badge
                  className="text-xs font-medium px-2 py-0.5"
                  style={{ background: 'var(--color-brand-light)', color: 'var(--color-brand-dark)', border: '1px solid var(--color-brand-border)' }}
                >
                  Adoptante
                </Badge>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="text-xs text-stone-400 hover:text-brand transition-colors disabled:opacity-50"
                >
                  Cambiar foto
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Información personal */}
        <SectionCard icon={UserRound} title="Información personal" description="Actualiza tus datos de contacto y perfil">
          <form onSubmit={handleSaveProfile}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nombre completo" htmlFor="fullName">
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="pl-9"
                    placeholder="Tu nombre completo"
                  />
                </div>
              </Field>

              <Field label="Correo electrónico" htmlFor="email">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                  <Input
                    id="email"
                    value={user?.email ?? ''}
                    disabled
                    className="pl-9 opacity-60 cursor-not-allowed"
                  />
                </div>
              </Field>

              <Field label="Teléfono" htmlFor="phone">
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                  <Input
                    id="phone"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="pl-9"
                    placeholder="+57 300 000 0000"
                    type="tel"
                  />
                </div>
              </Field>

              <Field label="Ciudad" htmlFor="city">
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                  <Input
                    id="city"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="pl-9"
                    placeholder="Ibagué, Tolima"
                  />
                </div>
              </Field>
            </div>

            <div className="flex justify-end pt-2 mt-1">
              <Button
                type="submit"
                className="gap-2 text-white"
                style={{ background: 'var(--color-brand)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-brand-dark)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-brand)')}
              >
                <Save className="w-4 h-4" />
                Guardar cambios
              </Button>
            </div>
          </form>
        </SectionCard>

        {/* Seguridad */}
        <SectionCard icon={ShieldCheck} title="Seguridad" description="Administra tu contraseña de acceso">
          <form onSubmit={handleChangePassword}>
            <div className="space-y-4">
              <PasswordField
                id="currentPassword"
                label="Contraseña actual"
                value={currentPassword}
                onChange={setCurrentPassword}
                show={showPasswords}
                onToggleShow={() => setShowPasswords(v => !v)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PasswordField
                  id="newPassword"
                  label="Nueva contraseña"
                  value={newPassword}
                  onChange={setNewPassword}
                  show={showPasswords}
                  onToggleShow={() => setShowPasswords(v => !v)}
                  placeholder="Mínimo 8 caracteres"
                />
                <PasswordField
                  id="confirmPassword"
                  label="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  show={showPasswords}
                  onToggleShow={() => setShowPasswords(v => !v)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 mt-1">
              <Button type="submit" variant="outline" className="gap-2 border-stone-300">
                <Lock className="w-4 h-4" />
                Cambiar contraseña
              </Button>
            </div>
          </form>
        </SectionCard>

        {/* Notificaciones */}
        <SectionCard icon={Bell} title="Notificaciones" description="Elige qué actualizaciones quieres recibir">
          <div className="space-y-5">
            <SwitchRow
              id="emailNotifs"
              label="Notificaciones por correo"
              description="Recibe mensajes importantes directamente en tu correo"
              checked={emailNotifs}
              onCheckedChange={setEmailNotifs}
            />
            <Separator className="bg-stone-100" />
            <SwitchRow
              id="adoptionUpdates"
              label="Actualizaciones de solicitudes"
              description="Entérate cuando cambie el estado de tu adopción"
              checked={adoptionUpdates}
              onCheckedChange={setAdoptionUpdates}
            />
            <Separator className="bg-stone-100" />
            <SwitchRow
              id="newsNotifs"
              label="Novedades y noticias"
              description="Nuevos animales disponibles y eventos del refugio"
              checked={newsNotifs}
              onCheckedChange={setNewsNotifs}
            />
          </div>
        </SectionCard>

        {/* Zona de peligro */}
        <div className="bg-white rounded-2xl border border-red-200">
          <div className="px-6 py-5 border-b border-red-100">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 shrink-0">
                <Trash2 className="w-4 h-4 text-red-500" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-red-700">Zona de peligro</h2>
                <p className="text-xs text-stone-400 mt-0.5">Acciones irreversibles sobre tu cuenta</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-stone-800">Eliminar mi cuenta</p>
              <p className="text-xs text-stone-400 mt-0.5">
                Se borrarán permanentemente todos tus datos. Esta acción no se puede deshacer.
              </p>
            </div>
            <Button
              variant="outline"
              className="shrink-0 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400 transition-colors"
            >
              Eliminar cuenta
            </Button>
          </div>
        </div>

        <div className="pb-4" />
      </main>
    </div>
  );
}
