import { useParams } from 'react-router-dom';

export default function FoundationDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Fundación #{id}</h1>
      <p className="mt-2 text-gray-500">Próximamente: perfil y animales disponibles</p>
    </div>
  );
}
