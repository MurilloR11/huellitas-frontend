import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

// Fallback mientras se descarga el chunk de una página cargada con lazy().
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
