import { Heart, Globe, Users } from 'lucide-react';

const PILLARS = [
  {
    Icon: Heart,
    label: 'Propósito',
    desc: 'Reducir el abandono animal digitalizando el proceso de adopción en el Tolima.',
  },
  {
    Icon: Globe,
    label: 'Alcance',
    desc: 'Conectamos fundaciones, adoptantes y desarrolladores en una sola plataforma.',
  },
  {
    Icon: Users,
    label: 'Comunidad',
    desc: 'Una red de personas comprometidas con el bienestar y la tenencia responsable.',
  },
] as const;

export function AboutProjectSection() {
  return (
    <section id="nosotros" className="bg-white py-20 md:py-28 border-b border-zinc-100 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-16 md:gap-20 items-center">

          {/* ── Imagen con bloque de acento desplazado ── */}
          <div className="fade-in relative pb-6 pr-4 md:pr-8">
            {/* Bloque decorativo detrás de la imagen */}
            <div className="absolute top-8 left-0 w-[85%] h-[90%] bg-brand/10 rounded-2xl" />

            <img
              src="https://images.pexels.com/photos/1633522/pexels-photo-1633522.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Persona adoptando un animal"
              className="relative z-10 w-full h-[420px] object-cover rounded-2xl shadow-lg ml-auto"
              style={{ maxWidth: 'calc(100% - 1rem)' }}
            />

            {/* Badge flotante */}
            <div className="absolute z-20 -bottom-2 right-0 bg-white shadow-xl border border-zinc-100 rounded-2xl px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 text-brand" fill="currentColor" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 leading-none mb-1">Animales ayudados</p>
                <p className="text-lg font-extrabold text-zinc-900 leading-none">+500</p>
              </div>
            </div>
          </div>

          {/* ── Texto ── */}
          <div className="fade-in delay-100">
            <p className="text-brand font-semibold text-xs uppercase tracking-widest mb-4">
              Nosotros
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mb-5 leading-tight">
              Tecnología al servicio<br className="hidden sm:block" /> del bienestar animal
            </h2>
            <p className="text-zinc-500 leading-relaxed mb-3">
              Huellitas nació de la necesidad de digitalizar un proceso que hoy depende de
              redes sociales y comunicación informal. Nuestra plataforma centraliza la
              información de animales disponibles, automatiza las solicitudes de adopción
              y expone una API pública para que desarrolladores integren estos datos donde
              más se necesiten.
            </p>
            <p className="text-zinc-400 leading-relaxed mb-10">
              Un proyecto académico con impacto real, construido para el departamento del
              Tolima pero con visión de crecimiento nacional.
            </p>

            {/* Pilares */}
            <div className="space-y-6">
              {PILLARS.map(({ Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-brand-light flex items-center justify-center mt-0.5">
                    <Icon className="w-4 h-4 text-brand" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-800 mb-0.5">{label}</p>
                    <p className="text-sm text-zinc-500 leading-snug">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
