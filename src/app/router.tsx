/* eslint-disable react-refresh/only-export-components */
import { lazy, useEffect } from 'react';
import { createBrowserRouter, Navigate, useNavigate, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { HomePage } from '../features/home/pages/HomePage';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import PendingApprovalPage from '../features/auth/pages/PendingApprovalPage';
import RejectedPage from '../features/auth/pages/RejectedPage';
import { useAuth } from '../features/auth/hooks/useAuth';
import type { Role } from '../features/auth/types';
import NotFoundPage from '../shared/pages/NotFoundPage';

// Páginas pesadas o de un solo rol: se cargan bajo demanda (code splitting).
// La landing, el login y el registro se mantienen en el bundle inicial.
const AIPage = lazy(() => import('../features/ai/pages/AIPage'));
const ExplorePage = lazy(() => import('../features/pets/pages/ExplorePage'));
const AccountPage = lazy(() => import('../features/account/pages/AccountPage'));
const AdminLayout = lazy(() => import('../features/admin/pages/AdminLayout'));
const AdminPage = lazy(() => import('../features/admin/pages/AdminPage'));
const AdminFoundationsPage = lazy(() => import('../features/admin/pages/AdminFoundationsPage'));
const AdminUsersPage = lazy(() => import('../features/admin/pages/AdminUsersPage'));
const AdminPetsPage = lazy(() => import('../features/admin/pages/AdminPetsPage'));
const AdminAdoptionsPage = lazy(() => import('../features/admin/pages/AdminAdoptionsPage'));
const AdminActivityPage = lazy(() => import('../features/admin/pages/AdminActivityPage'));
const FoundationPage = lazy(() => import('../features/foundations/pages/FoundationPage'));
const DeveloperPage = lazy(() => import('../features/developer/pages/DeveloperPage'));
const ApplyPage = lazy(() => import('../features/adoptions/pages/ApplyPage'));
const MyAdoptionsPage = lazy(() => import('../features/adoptions/pages/MyAdoptionsPage'));
const TermsPage = lazy(() => import('../features/legal/pages/TermsPage'));
const PrivacyPage = lazy(() => import('../features/legal/pages/PrivacyPage'));
const NotificationsPage = lazy(() =>
  import('../features/notifications/pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })),
);

const PetsList = () => <div className="p-8">Mascotas en adopción</div>;
const PetDetail = () => <div className="p-8">Detalle de mascota</div>;
const FoundationsList = () => <div className="p-8">Fundaciones</div>;
const FoundationDetail = () => <div className="p-8">Detalle de fundación</div>;

const Spinner = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
  </div>
);

function TrackAdoptionRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to="/explore" state={{ navId: 'track', adoptionId: Number(id) }} replace />;
}

function LogoutRoute() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    logout().then(() => navigate('/login', { replace: true }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <Spinner />;
}

function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;

  if (user?.role === 'fundacion') {
    if (user.status === 'pending') return <Navigate to="/pending" replace />;
    if (user.status === 'rejected') return <Navigate to="/rejected" replace />;
  }

  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <>{children}</>;

  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'developer') return <Navigate to="/developer/dashboard" replace />;
  if (user?.role === 'fundacion') {
    if (user.status === 'pending') return <Navigate to="/pending" replace />;
    if (user.status === 'rejected') return <Navigate to="/rejected" replace />;
    return <Navigate to="/foundation/dashboard" replace />;
  }
  return <Navigate to="/explore" replace />;
}

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/pets', element: <PetsList /> },
  {
    path: '/explore',
    element: <ProtectedRoute roles={['ciudadano']}><ExplorePage /></ProtectedRoute>,
  },
  { path: '/pets/:id', element: <PetDetail /> },
  { path: '/foundations', element: <FoundationsList /> },
  { path: '/foundations/:id', element: <FoundationDetail /> },
  { path: '/ai', element: <AIPage /> },
  {
    path: '/login',
    element: <PublicOnlyRoute><LoginPage /></PublicOnlyRoute>,
  },
  {
    path: '/register',
    element: <PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>,
  },
  { path: '/logout', element: <LogoutRoute /> },
  { path: '/pending', element: <PendingApprovalPage /> },
  { path: '/rejected', element: <RejectedPage /> },
  {
    path: '/my-adoptions',
    element: <ProtectedRoute roles={['ciudadano']}><MyAdoptionsPage /></ProtectedRoute>,
  },
  {
    path: '/adoptions',
    element: <ProtectedRoute roles={['ciudadano']}><Navigate to="/explore" state={{ navId: 'track' }} replace /></ProtectedRoute>,
  },
  {
    path: '/adoptions/:id',
    element: <ProtectedRoute roles={['ciudadano']}><TrackAdoptionRedirect /></ProtectedRoute>,
  },
  {
    path: '/adopt',
    element: <ProtectedRoute roles={['ciudadano']}><ApplyPage /></ProtectedRoute>,
  },
  {
    path: '/foundation/dashboard',
    element: <ProtectedRoute roles={['fundacion']}><FoundationPage /></ProtectedRoute>,
  },
  {
    path: '/admin',
    element: <ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true,              element: <AdminPage />            },
      { path: 'fundaciones',      element: <AdminFoundationsPage /> },
      { path: 'usuarios',         element: <AdminUsersPage />       },
      { path: 'mascotas',         element: <AdminPetsPage />        },
      { path: 'solicitudes',      element: <AdminAdoptionsPage />   },
      { path: 'actividad',        element: <AdminActivityPage />    },
    ],
  },
  {
    path: '/developer/dashboard',
    element: <ProtectedRoute roles={['developer']}><DeveloperPage /></ProtectedRoute>,
  },
  {
    path: '/account',
    element: <ProtectedRoute roles={['ciudadano']}><AccountPage /></ProtectedRoute>,
  },
  {
    path: '/notifications',
    element: <ProtectedRoute roles={['ciudadano', 'fundacion']}><NotificationsPage /></ProtectedRoute>,
  },
  { path: '/terminos', element: <TermsPage /> },
  { path: '/privacidad', element: <PrivacyPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
