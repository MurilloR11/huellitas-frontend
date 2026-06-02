import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const LAST_UPDATED = '2 de junio de 2025';

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-stone-50/90 dark:bg-zinc-950/90 backdrop-blur border-b border-stone-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <span className="text-stone-300 dark:text-zinc-700">|</span>
          <span className="text-sm font-medium text-stone-700 dark:text-zinc-300">Términos de uso</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-10">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 mb-4">
            Documento legal
          </div>
          <h1 className="text-3xl font-bold text-stone-900 dark:text-zinc-50 mb-3">
            Términos de uso
          </h1>
          <p className="text-sm text-stone-400 dark:text-zinc-500">
            Última actualización: {LAST_UPDATED}
          </p>
        </div>

        <div className="space-y-10 text-stone-700 dark:text-zinc-300 leading-relaxed">

          {/* Intro */}
          <p className="text-base">
            Al acceder o utilizar la plataforma <strong className="text-stone-900 dark:text-zinc-100">Huellitas</strong>, aceptas
            quedar vinculado por estos Términos de Uso. Si no estás de acuerdo con alguna de las condiciones
            aquí establecidas, debes abstenerte de utilizar el servicio.
          </p>

          <Section number="1" title="Descripción del servicio">
            <p>
              Huellitas es una plataforma digital que conecta a personas interesadas en adoptar mascotas con
              fundaciones y organizaciones de rescate animal legalmente constituidas en Colombia. La plataforma
              facilita el proceso de adopción responsable mediante la publicación de perfiles de animales,
              gestión de solicitudes de adopción, verificación de identidad y comunicación entre adoptantes y
              fundaciones.
            </p>
            <p className="mt-3">
              Huellitas actúa como intermediario tecnológico y <strong className="text-stone-900 dark:text-zinc-100">no es
              propietaria de los animales</strong> publicados en la plataforma. La responsabilidad sobre el
              proceso de adopción, la salud de los animales y el cumplimiento de los requisitos legales
              corresponde a cada fundación registrada.
            </p>
          </Section>

          <Section number="2" title="Requisitos para el uso">
            <ul className="space-y-2 list-none">
              <Li>Debes tener al menos <strong className="text-stone-900 dark:text-zinc-100">18 años de edad</strong> para crear una cuenta como adoptante.</Li>
              <Li>Debes proporcionar información veraz, completa y actualizada en el proceso de registro.</Li>
              <Li>Eres responsable de mantener la confidencialidad de tus credenciales de acceso.</Li>
              <Li>Una persona solo puede tener una cuenta activa como adoptante en la plataforma.</Li>
            </ul>
          </Section>

          <Section number="3" title="Responsabilidades del adoptante">
            <p>Al utilizar Huellitas como ciudadano adoptante, te comprometes a:</p>
            <ul className="mt-3 space-y-2 list-none">
              <Li>Proporcionar información honesta en el formulario de solicitud de adopción.</Li>
              <Li>Asistir a las visitas de conocimiento programadas con la fundación.</Li>
              <Li>Brindar condiciones de vida dignas, alimentación adecuada y atención veterinaria al animal adoptado.</Li>
              <Li>No transferir, vender ni ceder el animal adoptado a terceros sin autorización expresa de la fundación.</Li>
              <Li>Cumplir con la legislación colombiana de protección animal, en particular la <strong className="text-stone-900 dark:text-zinc-100">Ley 84 de 1989</strong> y la <strong className="text-stone-900 dark:text-zinc-100">Ley 1774 de 2016</strong>.</Li>
            </ul>
          </Section>

          <Section number="4" title="Responsabilidades de las fundaciones">
            <p>Las fundaciones registradas en Huellitas declaran y garantizan que:</p>
            <ul className="mt-3 space-y-2 list-none">
              <Li>La información publicada sobre cada animal es veraz y está actualizada.</Li>
              <Li>Los animales han recibido atención veterinaria básica (vacunación, desparasitación) antes de ser publicados.</Li>
              <Li>El proceso de evaluación de solicitudes se realiza de manera objetiva y sin discriminación.</Li>
              <Li>Cumplen con los requisitos legales para operar como organización de rescate o protección animal en Colombia.</Li>
            </ul>
          </Section>

          <Section number="5" title="Usos prohibidos">
            <p>Está expresamente prohibido utilizar Huellitas para:</p>
            <ul className="mt-3 space-y-2 list-none">
              <Li>Publicar información falsa o engañosa sobre animales o personas.</Li>
              <Li>Comercializar animales bajo apariencia de adopción (adopciones con compensación económica).</Li>
              <Li>Acceder sin autorización a cuentas de otros usuarios.</Li>
              <Li>Realizar actividades de spam, phishing o cualquier forma de fraude.</Li>
              <Li>Utilizar el servicio con fines distintos a la adopción responsable de animales.</Li>
              <Li>Cargar contenido que infrinja derechos de autor, sea ilegal o atente contra la dignidad de personas o animales.</Li>
            </ul>
          </Section>

          <Section number="6" title="Contenido del usuario">
            <p>
              Al subir fotografías u otro contenido a la plataforma, otorgas a Huellitas una licencia no
              exclusiva, gratuita y revocable para mostrar dicho contenido dentro del servicio con el único
              fin de facilitar el proceso de adopción. No reclamamos propiedad sobre tu contenido.
            </p>
            <p className="mt-3">
              Eres el único responsable del contenido que publicas. Huellitas se reserva el derecho de eliminar
              contenido que viole estos términos o la legislación colombiana aplicable.
            </p>
          </Section>

          <Section number="7" title="Limitación de responsabilidad">
            <p>
              Huellitas no se responsabiliza por el comportamiento de los animales adoptados, el incumplimiento
              de acuerdos entre fundaciones y adoptantes, ni por daños derivados del uso o imposibilidad de
              uso del servicio, incluyendo fallas técnicas, interrupciones o pérdida de datos.
            </p>
            <p className="mt-3">
              El servicio se presta "tal cual" y "según disponibilidad". No garantizamos que la plataforma
              esté libre de errores o disponible de manera ininterrumpida.
            </p>
          </Section>

          <Section number="8" title="Modificaciones a los términos">
            <p>
              Huellitas puede modificar estos Términos en cualquier momento. Los cambios materiales se
              notificarán con al menos 15 días de anticipación mediante un aviso en la plataforma o correo
              electrónico. El uso continuado del servicio después de la fecha de vigencia de los cambios
              implica la aceptación de los nuevos términos.
            </p>
          </Section>

          <Section number="9" title="Suspensión y terminación">
            <p>
              Huellitas puede suspender o cancelar una cuenta de manera inmediata si se detecta una violación
              de estos Términos, actividad fraudulenta o cualquier uso que ponga en riesgo la integridad de
              la plataforma o el bienestar de los animales. El usuario puede eliminar su cuenta en cualquier
              momento desde la configuración de su perfil.
            </p>
          </Section>

          <Section number="10" title="Ley aplicable y jurisdicción">
            <p>
              Estos Términos se rigen por las leyes de la <strong className="text-stone-900 dark:text-zinc-100">República de Colombia</strong>.
              Cualquier controversia derivada del uso de Huellitas se someterá a la jurisdicción de los jueces
              competentes en Colombia, salvo que la ley exija otra jurisdicción aplicable al usuario.
            </p>
          </Section>

          <Section number="11" title="Contacto">
            <p>
              Si tienes preguntas sobre estos Términos de Uso, puedes comunicarte con nosotros a través del
              correo electrónico:{' '}
              <a
                href="mailto:soporte@huellitas.app"
                className="font-medium underline underline-offset-2"
                style={{ color: 'var(--color-brand)' }}
              >
                soporte@huellitas.app
              </a>
            </p>
          </Section>

        </div>
      </div>
    </div>
  );
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <span
          className="flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold text-white shrink-0"
          style={{ background: 'var(--color-brand)' }}
        >
          {number}
        </span>
        <h2 className="text-lg font-semibold text-stone-900 dark:text-zinc-100">{title}</h2>
      </div>
      <div className="pl-10 text-sm leading-7">{children}</div>
    </section>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--color-brand)' }} />
      <span>{children}</span>
    </li>
  );
}
