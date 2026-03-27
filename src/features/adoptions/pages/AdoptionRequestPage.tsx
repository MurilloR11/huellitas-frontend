import { useParams } from 'react-router-dom';

export default function AdoptionRequestPage() {
  const { petId } = useParams<{ petId: string }>();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Solicitar adopción</h1>
      <p className="mt-2 text-gray-500">Mascota #{petId} — Formulario próximamente</p>
    </div>
  );
}
