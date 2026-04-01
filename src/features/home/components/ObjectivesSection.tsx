import { Target } from 'lucide-react';

const SPECIFIC_OBJECTIVES = [
  'Implementar un módulo de registro y gestión de perfiles de animales que permita a las fundaciones animalistas del Tolima publicar información completa, incluyendo datos médicos, fotografías y estado de disponibilidad.',
  'Diseñar una interfaz de usuario intuitiva y responsiva que facilite a los ciudadanos la búsqueda, el filtrado y la solicitud de adopción de animales según criterios como especie, ubicación y características.',
  'Proveer una API RESTful pública y documentada que permita a desarrolladores externos acceder a los datos de animales en adopción para integrarlos en aplicaciones o servicios de terceros.',
  'Crear un sistema de notificaciones automáticas que informe a las fundaciones sobre nuevas solicitudes de adopción y a los adoptantes sobre el estado de sus solicitudes en tiempo real.',
] as const;

const DELAY_CLASSES = ['', 'delay-75', 'delay-100', 'delay-150'] as const;

export function ObjectivesSection() {
  return (
    <section id="objetivos" className="bg-white py-16 md:py-24 border-b border-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="fade-in text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900">
            Objetivos del Proyecto
          </h2>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto mt-4">
            Metas claras que guían el desarrollo de Huellitas
          </p>
        </div>

        {/* General Objective */}
        <div className="fade-in bg-brand-light rounded-2xl p-8 border border-brand-border mb-10">
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="bg-brand/10 rounded-xl w-12 h-12 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6 text-brand" />
            </div>

            <div>
              <p className="text-brand font-semibold text-sm uppercase tracking-wider mb-2">
                Objetivo General
              </p>
              <p className="text-zinc-700 text-lg leading-relaxed">
                Desarrollar una plataforma web que facilite la gestión y el proceso de adopción
                de animales en el departamento del Tolima, permitiendo a las fundaciones
                animalistas registrar animales disponibles y a los ciudadanos buscar, filtrar y
                solicitar adopciones de manera centralizada, segura y eficiente.
              </p>
            </div>
          </div>
        </div>

        {/* Specific Objectives */}
        <div className="grid md:grid-cols-2 gap-6">
          {SPECIFIC_OBJECTIVES.map((text, i) => (
            <div
              key={i}
              className={`fade-in ${DELAY_CLASSES[i]} bg-white rounded-xl p-6 border border-zinc-200 shadow-sm`}
            >
              <div className="bg-brand text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-4">
                {i + 1}
              </div>
              <p className="text-zinc-700 leading-relaxed">
                {text}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
