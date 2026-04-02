# HuellitasAPI — Frontend

Plataforma web para la gestión y adopción de animales en el departamento del Tolima, Colombia. Conecta fundaciones animalistas con ciudadanos comprometidos con el bienestar animal, centralizando el proceso de adopción de forma segura y eficiente.

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
