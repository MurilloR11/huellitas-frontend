import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Lock,
  Bell,
  Trash2,
  Eye,
  EyeOff,
  UserRound,
  ShieldCheck,
  Camera,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { authApi } from '@/features/auth/services/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────────

type Section = 'cuenta' | 'notificaciones' | 'seguridad' | 'peligro';

const NAV_ITEMS: { id: Section; icon: typeof UserRound; label: string }[] = [
  { id: 'cuenta',         icon: UserRound,   label: 'Cuenta'          },
  { id: 'notificaciones', icon: Bell,        label: 'Notificaciones'  },
  { id: 'seguridad',      icon: ShieldCheck, label: 'Seguridad'       },
  { id: 'peligro',        icon: Trash2,      label: 'Zona de peligro' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).map(w => w[0].toUpperCase()).slice(0, 2).join('');
}

// ─── FieldRow ─────────────────────────────────────────────────────────────────

function FieldRow({
  label,
  value,
  onSave,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onSave?: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function handleSave() {
    onSave?.(draft);
    setEditing(false);
  }

  function handleCancel() {
    setDraft(value);
    setEditing(false);
  }

  return (
    <div className="flex items-start justify-between gap-6 py-4 border-b border-stone-100 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-stone-500">{label}</p>
        {editing ? (
          <div className="flex items-center gap-2 mt-2">
            <Input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              type={type}
              autoFocus
              className="h-8 text-sm max-w-xs"
              onKeyDown={e => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
            />
            <button
              type="button"
              onClick={handleSave}
              aria-label="Guardar"
              className="flex items-center justify-center w-8 h-8 rounded-md text-white transition-colors"
              style={{ background: 'var(--color-brand)' }}
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              aria-label="Cancelar"
              className="flex items-center justify-center w-8 h-8 rounded-md border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : value ? (
          <p className="text-sm font-medium text-stone-900 mt-0.5 truncate">{value}</p>
        ) : (
          <p className="text-sm text-stone-400 mt-0.5">{placeholder ?? '—'}</p>
        )}
      </div>
      {onSave && !editing && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditing(true)}
          className="shrink-0 text-xs border-stone-200 mt-0.5"
        >
          Cambiar
        </Button>
      )}
    </div>
  );
}

// ─── SwitchRow ────────────────────────────────────────────────────────────────

function SwitchRow({
  id, label, description, checked, onCheckedChange,
}: {
  id: string; label: string; description: string;
  checked: boolean; onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4 border-b border-stone-100 last:border-0">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-medium text-stone-800 cursor-pointer">
          {label}
        </Label>
        <p className="text-xs text-stone-400 mt-0.5">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} className="shrink-0" />
    </div>
  );
}

// ─── PasswordField ────────────────────────────────────────────────────────────

function PasswordField({
  id, label, value, onChange, show, onToggleShow, placeholder,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggleShow: () => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-stone-500 uppercase tracking-wide">
        {label}
      </Label>
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
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('cuenta');

  const initials = user ? getInitials(user.full_name) : '--';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) { toast.error('Solo se permiten imágenes'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('La imagen no puede superar los 2 MB'); return; }
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

  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [phone, setPhone]       = useState('');
  const [city, setCity]         = useState('');

  const [currentPassword,  setCurrentPassword]  = useState('');
  const [newPassword,      setNewPassword]      = useState('');
  const [confirmPassword,  setConfirmPassword]  = useState('');
  const [showPasswords,    setShowPasswords]    = useState(false);

  const [emailNotifs,      setEmailNotifs]      = useState(true);
  const [adoptionUpdates,  setAdoptionUpdates]  = useState(true);
  const [newsNotifs,       setNewsNotifs]       = useState(false);

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Completa todos los campos de contraseña'); return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden'); return;
    }
    if (newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres'); return;
    }
    toast.success('Contraseña actualizada correctamente');
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
  }

  const displayName = user?.full_name ?? 'Invitado';
  const avatarSrc   = avatarPreview ?? user?.avatar_url;

  return (
    <div className="h-screen flex flex-col bg-stone-50 dark:bg-zinc-950">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 flex items-center px-6 h-14 bg-stone-50/90 dark:bg-zinc-950/90 backdrop-blur-sm border-b border-stone-200 dark:border-zinc-800 shrink-0">
        <button
          type="button"
          onClick={() => navigate('/explore')}
          className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver</span>
        </button>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar nav ─────────────────────────────────────────────────── */}
        <aside className="hidden md:block w-52 shrink-0 border-r border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 overflow-y-auto py-6 px-3">
          <p className="px-3 mb-2 text-xs font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wider">
            Mi cuenta
          </p>
          <nav className="space-y-0.5">
            {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSection(id)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors text-left',
                  activeSection === id
                    ? 'bg-stone-200/80 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 font-medium'
                    : 'text-stone-500 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-900 hover:text-stone-900 dark:hover:text-zinc-100',
                  id === 'peligro' && activeSection !== 'peligro' && 'text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30',
                  id === 'peligro' && activeSection === 'peligro' && 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400',
                )}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile section nav */}
          <div className="md:hidden flex overflow-x-auto gap-1 px-4 py-3 border-b border-stone-200 dark:border-zinc-800 sticky top-0 bg-stone-50/90 dark:bg-zinc-950/90 backdrop-blur-sm z-10">
            {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSection(id)}
                className={cn(
                  'flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
                  activeSection === id
                    ? 'bg-stone-200 text-stone-900 dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-stone-500 hover:bg-stone-100 dark:text-zinc-400 dark:hover:bg-zinc-900',
                  id === 'peligro' && activeSection !== 'peligro' && 'text-red-400',
                  id === 'peligro' && activeSection === 'peligro' && 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400',
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                {label}
              </button>
            ))}
          </div>
          <div className="max-w-2xl w-full mx-auto px-4 sm:px-10 py-6 sm:py-8">

            {/* ── Cuenta ──────────────────────────────────────────────────── */}
            {activeSection === 'cuenta' && (
              <>
                <h1 className="text-xl font-bold text-stone-900 dark:text-zinc-100 mb-4">Cuenta</h1>
                <hr className="border-stone-200 dark:border-zinc-800 mb-6" />

                {/* Avatar row */}
                <div className="flex items-center gap-4 py-4 border-b border-stone-100 dark:border-zinc-800">
                  <div className="relative shrink-0 group">
                    <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center text-base font-bold select-none overflow-hidden">
                      {avatarSrc
                        ? <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
                        : initials
                      }
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      aria-label="Cambiar foto"
                      className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-wait"
                    >
                      {uploadingAvatar
                        ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                        : <Camera className="w-4 h-4 text-white" />
                      }
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100 truncate">{displayName}</p>
                    <p className="text-xs text-stone-400 dark:text-zinc-500 truncate mt-0.5">{user?.email}</p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="shrink-0 text-xs border-stone-200"
                  >
                    Cambiar avatar
                  </Button>
                </div>

                <FieldRow
                  label="Nombre completo"
                  value={fullName}
                  onSave={v => { setFullName(v); toast.success('Nombre actualizado'); }}
                />
                <FieldRow
                  label="Correo electrónico"
                  value={user?.email ?? ''}
                />
                <FieldRow
                  label="Teléfono"
                  value={phone}
                  placeholder="+57 300 000 0000"
                  type="tel"
                  onSave={v => { setPhone(v); toast.success('Teléfono actualizado'); }}
                />
                <FieldRow
                  label="Ciudad"
                  value={city}
                  placeholder="Tu ciudad"
                  onSave={v => { setCity(v); toast.success('Ciudad actualizada'); }}
                />
              </>
            )}

            {/* ── Notificaciones ──────────────────────────────────────────── */}
            {activeSection === 'notificaciones' && (
              <>
                <h1 className="text-xl font-bold text-stone-900 dark:text-zinc-100 mb-4">Notificaciones</h1>
                <hr className="border-stone-200 dark:border-zinc-800 mb-6" />
                <p className="text-sm text-stone-400 dark:text-zinc-500 -mt-2 mb-6">Elige qué actualizaciones quieres recibir</p>

                <SwitchRow
                  id="emailNotifs"
                  label="Notificaciones por correo"
                  description="Recibe mensajes importantes directamente en tu correo"
                  checked={emailNotifs}
                  onCheckedChange={setEmailNotifs}
                />
                <SwitchRow
                  id="adoptionUpdates"
                  label="Actualizaciones de solicitudes"
                  description="Entérate cuando cambie el estado de tu adopción"
                  checked={adoptionUpdates}
                  onCheckedChange={setAdoptionUpdates}
                />
                <SwitchRow
                  id="newsNotifs"
                  label="Novedades y noticias"
                  description="Nuevos animales disponibles y eventos del refugio"
                  checked={newsNotifs}
                  onCheckedChange={setNewsNotifs}
                />
              </>
            )}

            {/* ── Seguridad ───────────────────────────────────────────────── */}
            {activeSection === 'seguridad' && (
              <>
                <h1 className="text-xl font-bold text-stone-900 dark:text-zinc-100 mb-4">Seguridad</h1>
                <hr className="border-stone-200 dark:border-zinc-800 mb-6" />
                <p className="text-sm text-stone-400 dark:text-zinc-500 -mt-2 mb-6">Administra tu contraseña de acceso</p>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
                  <PasswordField
                    id="currentPassword"
                    label="Contraseña actual"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    show={showPasswords}
                    onToggleShow={() => setShowPasswords(v => !v)}
                  />
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
                  <Button type="submit" variant="outline" className="gap-2 border-stone-300 mt-2">
                    <Lock className="w-4 h-4" />
                    Cambiar contraseña
                  </Button>
                </form>
              </>
            )}

            {/* ── Zona de peligro ─────────────────────────────────────────── */}
            {activeSection === 'peligro' && (
              <>
                <h1 className="text-xl font-bold text-stone-900 dark:text-zinc-100 mb-4">Zona de peligro</h1>
                <hr className="border-stone-200 dark:border-zinc-800 mb-6" />
                <p className="text-sm text-stone-400 dark:text-zinc-500 -mt-2 mb-6">Acciones irreversibles sobre tu cuenta</p>

                <div className="border border-red-200 dark:border-red-900 rounded-xl p-5 flex items-start justify-between gap-6">
                  <div>
                    <p className="text-sm font-medium text-stone-900 dark:text-zinc-100">Eliminar mi cuenta</p>
                    <p className="text-xs text-stone-400 dark:text-zinc-500 mt-1">
                      Se borrarán permanentemente todos tus datos. Esta acción no se puede deshacer.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400 transition-colors"
                  >
                    Eliminar cuenta
                  </Button>
                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
