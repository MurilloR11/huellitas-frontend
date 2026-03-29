/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from 'react-router-dom';
import { LandingPage } from '../features/home/pages/LandingPage';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';

const PetsList = () => <div className="p-8">Mascotas en adopción</div>;
const PetDetail = () => <div className="p-8">Detalle de mascota</div>;
const FoundationsList = () => <div className="p-8">Fundaciones</div>;
const FoundationDetail = () => <div className="p-8">Detalle de fundación</div>;
const AdoptionRequest = () => <div className="p-8">Solicitar adopción</div>;
const MyAdoptions = () => <div className="p-8">Mis adopciones</div>;
const FoundationDashboard = () => <div className="p-8">Dashboard Fundación</div>;
const NotFound = () => <div className="p-8 text-red-500">404 — Página no encontrada</div>;

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/pets', element: <PetsList /> },
  { path: '/pets/:id', element: <PetDetail /> },
  { path: '/foundations', element: <FoundationsList /> },
  { path: '/foundations/:id', element: <FoundationDetail /> },
  { path: '/adopt/:petId', element: <AdoptionRequest /> },
  { path: '/my-adoptions', element: <MyAdoptions /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/foundation/dashboard', element: <FoundationDashboard /> },
  { path: '*', element: <NotFound /> },
]);
