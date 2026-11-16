# HuellitasAPI — Frontend

Plataforma web para la gestión y adopción de animales en el departamento del Tolima, Colombia. Conecta fundaciones animalistas con ciudadanos comprometidos con el bienestar animal, centralizando el proceso de adopción de forma segura y eficiente.

## Probar la demo

**Demo en vivo:** [huellitas-frontend-gamma.vercel.app](https://huellitas-frontend-gamma.vercel.app)

Cada rol tiene su propio flujo y sus propias rutas. Puedes entrar con estas cuentas de prueba:

| Rol | Correo | Contraseña | Qué puedes ver |
|---|---|---|---|
| Ciudadano | `demo.ciudadano@example.com` | `Demo-3tBHLoV5!` | Explorar mascotas, requisitos y flujo de solicitud de adopción |
| Fundación | `demo.fundacion@example.com` | `Demo-aebtpxdn!` | Panel de la fundación: mascotas, solicitudes y disponibilidad de visitas |
| Administrador | `demo.admin@example.com` | `Demo-ajkD7bIA!` | Panel admin: estadísticas, usuarios, fundaciones, mascotas y actividad |
| Developer | `demo.developer@example.com` | `Demo-99bXGtt0!` | Portal de desarrolladores y documentación de la API (Swagger) |

> **Modo demo de solo lectura:** estas cuentas pueden navegar todas las pantallas, pero el backend bloquea cualquier acción que cree, edite o borre datos. En el panel admin, los correos de los usuarios reales aparecen enmascarados.
>
> El backend está en el plan gratuito de Render: si lleva un rato sin uso, la primera petición puede tardar hasta ~50 segundos mientras el servidor despierta.

## Descripción

HuellitasAPI permite a las **fundaciones animalistas** registrar animales disponibles para adopción con información completa (datos médicos, fotografías, disponibilidad), y a los **ciudadanos** buscar, filtrar y solicitar adopciones desde una sola plataforma. Además expone una **API RESTful pública** para que desarrolladores externos puedan integrar los datos en sus propias aplicaciones.

Este repositorio contiene únicamente el frontend. El backend (Flask + PostgreSQL) vive en un repositorio separado.

## Stack tecnológico

| Tecnología | Uso |
|---|---|
| React 19 | Biblioteca de interfaces de usuario |
| TypeScript | Tipado estático |
| Tailwind CSS 4 | Estilos utilitarios |
| Vite | Bundler y servidor de desarrollo |
| React Router 7 | Enrutamiento del lado del cliente |
| TanStack Query | Gestión de estado del servidor |
| Axios | Cliente HTTP |
| Zod | Validación de esquemas |
| Lucide React | Iconos de la interfaz |
| Devicon (CDN) | Iconos de tecnologías en el carrusel |

## Características de la interfaz

- **Cursor personalizado** — cursor de huella naranja en toda la aplicación.
- **Favicon personalizado** — ícono de huella naranja en la pestaña del navegador.
- **Hero con animación typewriter** — el texto de la frase principal cicla entre varias palabras ("un hogar", "una familia", "amor", "una oportunidad") con efecto de escritura y borrado, y un cursor parpadeante.
- **Carrusel infinito de tecnologías** — dos filas animadas con iconos de Devicon, implementadas con `@keyframes` CSS puros (sin JavaScript) para evitar saltos al hacer loop. Se pausa al pasar el cursor.
- **Secciones de la landing** — Hero, Nosotros, Misión y Visión (layout dividido con imágenes superpuestas), Objetivos, Tecnologías, y llamada a la acción final.
- **Navbar fija** — transparente sobre el hero, blanca al hacer scroll. El logo lleva al inicio de la página con scroll suave.

## Requisitos previos

- Node.js 18 o superior
- npm 9 o superior

## Instalación

```bash
npm install
```

## Scripts disponibles

```bash
# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Vista previa del build
npm run preview

# Linter
npm run lint

# Tests unitarios (modo watch)
npm test

# Tests unitarios (una sola pasada)
npm run test:run

# Tests con cobertura
npm run test:coverage

# Tests E2E
npm run test:e2e
```

## Estructura del proyecto

```
src/
  app/          # Configuración global: router, providers, contextos
  features/     # Módulos por dominio (auth, home, pets, foundations, adoptions)
  shared/       # Componentes, hooks y utilidades reutilizables
```

## Variables de entorno

Crea un archivo `.env.local` en la raíz con las siguientes variables:

```env
VITE_API_URL=http://localhost:5000
```
