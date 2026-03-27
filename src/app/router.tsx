import { createBrowserRouter } from 'react-router-dom';

// Placeholder pages — will be replaced with real implementations
const Home = () => <div className="p-8 text-2xl font-bold">Inicio — Huellitas</div>;
const PetsList = () => <div className="p-8">Mascotas en adopción</div>;
const PetDetail = () => <div className="p-8">Detalle de mascota</div>;
const FoundationsList = () => <div className="p-8">Fundaciones</div>;
const FoundationDetail = () => <div className="p-8">Detalle de fundación</div>;
const AdoptionRequest = () => <div className="p-8">Solicitar adopción</div>;
const MyAdoptions = () => <div className="p-8">Mis adopciones</div>;
const Login = () => <div className="p-8">Login</div>;
const Register = () => <div className="p-8">Registro</div>;
const FoundationDashboard = () => <div className="p-8">Dashboard Fundación</div>;
const NotFound = () => <div className="p-8 text-red-500">404 — Página no encontrada</div>;

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/pets', element: <PetsList /> },
  { path: '/pets/:id', element: <PetDetail /> },
  { path: '/foundations', element: <FoundationsList /> },
  { path: '/foundations/:id', element: <FoundationDetail /> },
  { path: '/adopt/:petId', element: <AdoptionRequest /> },
  { path: '/my-adoptions', element: <MyAdoptions /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/foundation/dashboard', element: <FoundationDashboard /> },
  { path: '*', element: <NotFound /> },
]);
