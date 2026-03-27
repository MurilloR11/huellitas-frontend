import {
  Building2, Search, Heart,
  FileText, ImageIcon, CircleDot,
  SlidersHorizontal, Send,
  CheckCircle, Bell, Phone,
} from 'lucide-react';

export function HowItWorksSection() {
  return (
    <section id="adoptar" className="bg-white py-16 md:py-24 border-b border-zinc-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="fade-in text-center mb-14">
          <p className="text-xs uppercase tracking-widest text-brand font-semibold mb-3">De punta a punta</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mb-4">Del animal al hogar</h2>
          <p className="text-zinc-500 max-w-lg mx-auto">
            Tres pasos que conectan fundaciones con familias. Sin WhatsApp, sin grupos de Facebook.
          </p>
        </div>

        {/* Step 1 */}
        <div className="fade-in flex gap-4 sm:gap-8 md:gap-12 items-start">
          <div className="flex flex-col items-center shrink-0">
            <div className="w-10 h-10 rounded-full border-2 border-brand bg-white text-brand font-extrabold text-sm flex items-center justify-center">
              1
            </div>
            <div className="w-px bg-zinc-200 flex-1 min-h-16 mt-2" />
          </div>
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 sm:p-6 mb-6 flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg border border-zinc-200 bg-white flex items-center justify-center">
                <Building2 className="w-5 h-5 text-zinc-600" />
              </div>
              <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Fundación</p>
            </div>
            <h3 className="font-bold text-zinc-900 mb-2">La fundación registra al animal con ficha completa</h3>
            <p className="text-sm text-zinc-500 mb-4">Vacunas, historial médico, comportamiento y fotos en un solo lugar estructurado.</p>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: FileText,    label: 'Ficha clínica' },
                { icon: ImageIcon,   label: 'Fotos' },
                { icon: CircleDot,   label: 'Disponibilidad' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1 text-xs text-zinc-500 bg-white border border-zinc-200 rounded px-2 py-1">
                  <Icon className="w-3 h-3" />{label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="fade-in delay-75 flex gap-4 sm:gap-8 md:gap-12 items-start">
          <div className="flex flex-col items-center shrink-0">
            <div className="w-10 h-10 rounded-full border-2 border-brand bg-white text-brand font-extrabold text-sm flex items-center justify-center">
              2
            </div>
            <div className="w-px bg-zinc-200 flex-1 min-h-16 mt-2" />
          </div>
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 sm:p-6 mb-6 flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg border border-zinc-200 bg-white flex items-center justify-center">
                <Search className="w-5 h-5 text-zinc-600" />
              </div>
              <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Ciudadano</p>
            </div>
            <h3 className="font-bold text-zinc-900 mb-2">El ciudadano busca, filtra y solicita</h3>
            <p className="text-sm text-zinc-500 mb-4">Filtra por especie, ciudad, tamaño y salud. Formulario sencillo para solicitar la adopción.</p>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: SlidersHorizontal, label: 'Filtros avanzados' },
                { icon: Send,              label: 'Solicitud en línea' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1 text-xs text-zinc-500 bg-white border border-zinc-200 rounded px-2 py-1">
                  <Icon className="w-3 h-3" />{label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="fade-in delay-150 flex gap-4 sm:gap-8 md:gap-12 items-start">
          <div className="shrink-0">
            <div className="w-10 h-10 rounded-full bg-brand text-white font-extrabold text-sm flex items-center justify-center">
              3
            </div>
          </div>
          <div className="bg-brand-light border border-brand-border rounded-xl p-4 sm:p-6 flex-1 shadow-[0_1px_8px_0_rgb(232_93_38/0.07)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs uppercase tracking-widest text-brand-dark font-semibold">Plataforma</p>
            </div>
            <h3 className="font-bold text-zinc-900 mb-2">La plataforma notifica al adoptante automáticamente</h3>
            <p className="text-sm text-zinc-500 mb-4">La fundación revisa y aprueba. El adoptante recibe los datos de contacto de forma automática.</p>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: CheckCircle, label: 'Aprobación' },
                { icon: Bell,        label: 'Notificación automática' },
                { icon: Phone,       label: 'Contacto directo' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1 text-xs text-zinc-600 bg-white border border-brand-border rounded px-2 py-1">
                  <Icon className="w-3 h-3 text-brand" />{label}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
