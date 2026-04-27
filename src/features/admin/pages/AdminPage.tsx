import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

export default function AdminPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="p-8 flex items-center justify-between">
      <h1 className="text-2xl font-bold">Hola, admin</h1>
      <button
        onClick={handleLogout}
        className="text-sm text-zinc-500 hover:text-red-600 transition"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
