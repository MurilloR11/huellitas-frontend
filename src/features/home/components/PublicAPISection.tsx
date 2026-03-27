import { Link } from 'react-router-dom';
import { CheckCircle, Key } from 'lucide-react';
import { ROUTES } from '../../../shared/constants/routes';

const FEATURES = [
  'Filtros por especie, ciudad, tamaño y estado de salud',
  'Autenticación por API key — sin OAuth complejo',
  'Endpoints de fundaciones y estadísticas por municipio',
  'Datos en tiempo real, siempre actualizados por las fundaciones',
] as const;

export function PublicAPISection() {
  return (
    <section id="api" className="bg-zinc-900 py-16 md:py-24 border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Left: Terminal mock */}
          <div className="fade-in order-2 md:order-1">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
              {/* Header bar */}
              <div className="border-b border-zinc-800 px-5 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                </div>
                <span className="text-xs text-zinc-500 font-mono">GET /api/v1/animales</span>
              </div>

              {/* Code body */}
              <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm leading-loose">
                <div>
                  <span className="text-green-400">GET</span>{' '}
                  <span className="text-zinc-200">/api/v1/animales</span>
                </div>
                <div>
                  <span className="text-zinc-500">{'  '}?especie=</span>
                  <span className="text-yellow-300">perro</span>
                </div>
                <div>
                  <span className="text-zinc-500">{'  '}&ciudad=</span>
                  <span className="text-yellow-300">ibagué</span>
                </div>
                <div>
                  <span className="text-zinc-500">{'  '}&disponible=</span>
                  <span className="text-yellow-300">true</span>
                </div>
                <div className="mt-1">
                  <span className="text-zinc-500">X-API-Key: </span>
                  <span className="text-zinc-300">hll_sk_••••••••••••</span>
                </div>

                <div className="border-t border-zinc-800 mt-3 pt-3">
                  <div><span className="text-zinc-300">{'{'}</span></div>
                  <div className="ml-4">
                    <span className="text-blue-400">"total"</span>
                    <span className="text-zinc-400">: </span>
                    <span className="text-orange-300">48</span>
                    <span className="text-zinc-400">,</span>
                  </div>
                  <div className="ml-4">
                    <span className="text-blue-400">"animales"</span>
                    <span className="text-zinc-400">: [</span>
                  </div>
                  <div className="ml-8">
                    <div><span className="text-zinc-400">{'{'}</span></div>
                    <div className="ml-4">
                      <span className="text-blue-400">"nombre"</span>
                      <span className="text-zinc-400">: </span>
                      <span className="text-green-300">"Rocky"</span>
                      <span className="text-zinc-400">,</span>
                    </div>
                    <div className="ml-4">
                      <span className="text-blue-400">"especie"</span>
                      <span className="text-zinc-400">: </span>
                      <span className="text-green-300">"perro"</span>
                      <span className="text-zinc-400">,</span>
                    </div>
                    <div className="ml-4">
                      <span className="text-blue-400">"vacunado"</span>
                      <span className="text-zinc-400">: </span>
                      <span className="text-purple-400">true</span>
                      <span className="text-zinc-400">,</span>
                    </div>
                    <div className="ml-4">
                      <span className="text-blue-400">"ciudad"</span>
                      <span className="text-zinc-400">: </span>
                      <span className="text-green-300">"Ibagué"</span>
                    </div>
                    <div><span className="text-zinc-400">{'}'}</span></div>
                  </div>
                  <div className="ml-4"><span className="text-zinc-400">]</span></div>
                  <div><span className="text-zinc-300">{'}'}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Text */}
          <div className="fade-in delay-100 order-1 md:order-2">
            <p className="text-xs uppercase tracking-widest text-brand font-semibold mb-3">Para desarrolladores</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Los datos del Tolima, listos para tu app
            </h2>
            <p className="text-zinc-400 mb-8">
              Accede a todos los animales en adopción del departamento desde una sola API.
              Filtra, busca y construye encima de nuestra infraestructura.
            </p>

            <ul className="space-y-3 mb-8">
              {FEATURES.map((feat) => (
                <li key={feat} className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                  <span className="text-zinc-300 text-sm">{feat}</span>
                </li>
              ))}
            </ul>

            <Link
              to={ROUTES.REGISTER}
              className="inline-flex items-center gap-2 border border-zinc-700 text-white font-semibold px-5 py-2.5 rounded-md hover:bg-zinc-800 transition-colors"
            >
              <Key className="w-4 h-4" />
              Obtener API key
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
