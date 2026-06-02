import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const LAST_UPDATED = '2 de junio de 2025';

export default function PrivacyPage() {
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
          <span className="text-sm font-medium text-stone-700 dark:text-zinc-300">Política de privacidad</span>
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
            Política de privacidad
          </h1>
          <p className="text-sm text-stone-400 dark:text-zinc-500">
            Última actualización: {LAST_UPDATED}
          </p>
        </div>

        <div className="space-y-10 text-stone-700 dark:text-zinc-300 leading-relaxed">

          {/* Intro */}
          <p className="text-base">
            En <strong className="text-stone-900 dark:text-zinc-100">Huellitas</strong> nos tomamos en serio la
            privacidad de nuestros usuarios. Esta Política describe cómo recopilamos, usamos, almacenamos y
            protegemos tu información personal, en cumplimiento de la{' '}
            <strong className="text-stone-900 dark:text-zinc-100">Ley 1581 de 2012</strong> (Ley de Habeas Data),
            el <strong className="text-stone-900 dark:text-zinc-100">Decreto 1377 de 2013</strong> y demás normas
            concordantes de la República de Colombia.
          </p>

          <Section number="1" title="Responsable del tratamiento">
            <p>
              El responsable del tratamiento de datos personales es <strong className="text-stone-900 dark:text-zinc-100">Huellitas</strong>,
              plataforma de adopción responsable de mascotas operada en Colombia. Para cualquier consulta
              relacionada con el tratamiento de tus datos puedes contactarnos en:{' '}
              <a
                href="mailto:privacidad@huellitas.app"
                className="font-medium underline underline-offset-2"
                style={{ color: 'var(--color-brand)' }}
              >
                privacidad@huellitas.app
              </a>
            </p>
          </Section>

          <Section number="2" title="Datos que recopilamos">
            <p>Dependiendo del tipo de cuenta y las funciones que utilices, podemos recopilar:</p>
            <div className="mt-4 space-y-4">
              <DataGroup title="Datos de identidad y contacto">
                Nombre completo, dirección de correo electrónico, número de teléfono y ciudad de residencia.
              </DataGroup>
              <DataGroup title="Datos del formulario de adopción">
                Tipo de vivienda, régimen de tenencia (propietario/arrendatario), número de residentes,
                presencia de niños y mascotas actuales o anteriores. Esta información es necesaria para
                que las fundaciones evalúen la idoneidad del hogar adoptante.
              </DataGroup>
              <DataGroup title="Documentos de identidad">
                Fotografías del documento de identidad, comprobante de domicilio y, cuando aplique,
                autorización del arrendador. Estos documentos se almacenan de forma cifrada y son
                accesibles únicamente por la fundación correspondiente.
              </DataGroup>
              <DataGroup title="Fotografías de mascotas">
                Las fundaciones pueden subir imágenes de los animales en adopción. Estas imágenes son
                de carácter público dentro de la plataforma.
              </DataGroup>
              <DataGroup title="Datos de uso">
                Información técnica como dirección IP, tipo de navegador, páginas visitadas y tiempos
                de sesión, utilizados exclusivamente para mejorar el servicio y detectar problemas de seguridad.
              </DataGroup>
            </div>
          </Section>

          <Section number="3" title="Finalidad del tratamiento">
            <p>Tus datos personales se utilizan exclusivamente para:</p>
            <ul className="mt-3 space-y-2 list-none">
              <Li>Gestionar tu cuenta y autenticar tu identidad en la plataforma.</Li>
              <Li>Facilitar el proceso de solicitud y seguimiento de adopción de mascotas.</Li>
              <Li>Permitir a las fundaciones evaluar la idoneidad del hogar adoptante.</Li>
              <Li>Enviar notificaciones sobre el estado de tu solicitud de adopción.</Li>
              <Li>Mejorar la funcionalidad, seguridad y experiencia de la plataforma.</Li>
              <Li>Cumplir con obligaciones legales aplicables en Colombia.</Li>
            </ul>
            <p className="mt-4">
              <strong className="text-stone-900 dark:text-zinc-100">No utilizamos tus datos para publicidad de terceros</strong> ni
              los vendemos bajo ninguna circunstancia.
            </p>
          </Section>

          <Section number="4" title="Compartición de datos">
            <p>Tus datos pueden ser compartidos únicamente en los siguientes casos:</p>
            <ul className="mt-3 space-y-2 list-none">
              <Li>
                <strong className="text-stone-900 dark:text-zinc-100">Con la fundación receptora de tu solicitud:</strong>{' '}
                el nombre, datos de contacto e información del formulario de adopción son visibles para
                la fundación a la que aplicaste.
              </Li>
              <Li>
                <strong className="text-stone-900 dark:text-zinc-100">Con Supabase (proveedor de infraestructura):</strong>{' '}
                los datos se almacenan en servidores de Supabase, con cifrado en tránsito (TLS) y en reposo.
                Supabase no accede a tus datos con fines propios.
              </Li>
              <Li>
                <strong className="text-stone-900 dark:text-zinc-100">Por requerimiento legal:</strong>{' '}
                cuando una autoridad competente colombiana lo exija mediante orden judicial o administrativa.
              </Li>
            </ul>
          </Section>

          <Section number="5" title="Derechos del titular (Ley 1581 de 2012)">
            <p>
              Como titular de los datos personales, tienes los siguientes derechos reconocidos por la
              legislación colombiana:
            </p>
            <ul className="mt-3 space-y-2 list-none">
              <Li><strong className="text-stone-900 dark:text-zinc-100">Acceso:</strong> conocer qué datos personales tenemos sobre ti.</Li>
              <Li><strong className="text-stone-900 dark:text-zinc-100">Corrección:</strong> solicitar la actualización o rectificación de datos inexactos.</Li>
              <Li><strong className="text-stone-900 dark:text-zinc-100">Supresión:</strong> pedir la eliminación de tus datos cuando no exista un deber legal de conservarlos.</Li>
              <Li><strong className="text-stone-900 dark:text-zinc-100">Revocación:</strong> retirar el consentimiento para el tratamiento de tus datos.</Li>
              <Li><strong className="text-stone-900 dark:text-zinc-100">Queja:</strong> presentar quejas ante la Superintendencia de Industria y Comercio (SIC) si consideras que tus derechos han sido vulnerados.</Li>
            </ul>
            <p className="mt-4">
              Para ejercer cualquiera de estos derechos, escríbenos a{' '}
              <a
                href="mailto:privacidad@huellitas.app"
                className="font-medium underline underline-offset-2"
                style={{ color: 'var(--color-brand)' }}
              >
                privacidad@huellitas.app
              </a>{' '}
              con el asunto "Ejercicio de derechos – Ley 1581". Responderemos en un plazo máximo de{' '}
              <strong className="text-stone-900 dark:text-zinc-100">10 días hábiles</strong>.
            </p>
          </Section>

          <Section number="6" title="Seguridad de los datos">
            <p>
              Implementamos medidas técnicas y organizativas razonables para proteger tu información:
            </p>
            <ul className="mt-3 space-y-2 list-none">
              <Li>Transmisión cifrada mediante HTTPS/TLS en todas las comunicaciones.</Li>
              <Li>Almacenamiento cifrado en reposo en la infraestructura de Supabase.</Li>
              <Li>Acceso a datos sensibles (documentos) restringido exclusivamente a la fundación correspondiente.</Li>
              <Li>Autenticación segura con tokens JWT de corta duración.</Li>
            </ul>
            <p className="mt-4">
              Sin perjuicio de lo anterior, ningún sistema de transmisión por internet es 100 % seguro.
              En caso de una brecha de seguridad que afecte tus datos, te notificaremos dentro de los
              plazos establecidos por la normativa colombiana.
            </p>
          </Section>

          <Section number="7" title="Retención de datos">
            <p>
              Conservamos tus datos personales mientras tu cuenta esté activa o mientras sea necesario
              para prestarte el servicio. Si eliminas tu cuenta:
            </p>
            <ul className="mt-3 space-y-2 list-none">
              <Li>Los datos de perfil se eliminan en un plazo de 30 días.</Li>
              <Li>Los documentos subidos se eliminan del almacenamiento en un plazo de 60 días.</Li>
              <Li>Registros históricos de adopciones completadas pueden conservarse por hasta 5 años por obligaciones legales.</Li>
            </ul>
          </Section>

          <Section number="8" title="Menores de edad">
            <p>
              Huellitas no está dirigido a menores de 18 años. No recopilamos intencionalmente datos de
              personas menores de edad. Si identificamos que un menor ha proporcionado sus datos, los
              eliminaremos de inmediato. Si eres padre o tutor y crees que tu hijo registró una cuenta,
              contáctanos en{' '}
              <a
                href="mailto:privacidad@huellitas.app"
                className="font-medium underline underline-offset-2"
                style={{ color: 'var(--color-brand)' }}
              >
                privacidad@huellitas.app
              </a>
              .
            </p>
          </Section>

          <Section number="9" title="Cambios a esta política">
            <p>
              Podemos actualizar esta Política periódicamente para reflejar cambios en el servicio o en la
              legislación aplicable. Cuando los cambios sean relevantes, te notificaremos por correo
              electrónico o mediante un aviso destacado en la plataforma con al menos 15 días de
              anticipación. La fecha de "Última actualización" al inicio de este documento indica cuándo
              entró en vigor la versión vigente.
            </p>
          </Section>

          <Section number="10" title="Contacto y quejas">
            <p>
              Para cualquier consulta, solicitud o queja relacionada con el tratamiento de tus datos
              personales, puedes contactarnos en:
            </p>
            <div className="mt-4 p-4 rounded-xl bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-sm space-y-1">
              <p><span className="text-stone-500 dark:text-zinc-400">Correo:</span>{' '}
                <a href="mailto:privacidad@huellitas.app" className="font-medium underline underline-offset-2" style={{ color: 'var(--color-brand)' }}>
                  privacidad@huellitas.app
                </a>
              </p>
              <p><span className="text-stone-500 dark:text-zinc-400">Asunto:</span> <span className="text-stone-800 dark:text-zinc-200">"Protección de datos personales"</span></p>
              <p className="text-stone-500 dark:text-zinc-400 pt-1">
                También puedes presentar una queja directamente ante la{' '}
                <strong className="text-stone-700 dark:text-zinc-300">Superintendencia de Industria y Comercio (SIC)</strong>{' '}
                en <span className="text-stone-700 dark:text-zinc-300">www.sic.gov.co</span>.
              </p>
            </div>
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

function DataGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pl-3 border-l-2" style={{ borderColor: 'var(--color-brand)' }}>
      <p className="font-medium text-stone-800 dark:text-zinc-200 mb-0.5">{title}</p>
      <p className="text-stone-600 dark:text-zinc-400">{children}</p>
    </div>
  );
}
