export const huellitasApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Huellitas API',
    description:
      'API pública de Huellitas para consultar mascotas en adopción y fundaciones registradas.\n\n' +
      '## Autenticación\n\n' +
      'Todos los endpoints son públicos y no requieren autenticación. Sin embargo, si incluyes tu ' +
      'API key en el header `X-API-Key`, el sistema registrará el uso y podrás ver estadísticas ' +
      'en el portal de desarrollador.\n\n' +
      '```\nX-API-Key: hll_sk_tu_clave_aqui\n```\n\n' +
      '## Flujo recomendado\n\n' +
      '1. Llama a `GET /foundations` para obtener las fundaciones activas con sus IDs.\n' +
      '2. Usa el `id` de una fundación para llamar a `GET /foundations/{id}` o `GET /foundations/{id}/availability`.\n' +
      '3. Llama a `GET /pets` para explorar mascotas disponibles — filtra por especie, ciudad, tamaño o estado.',
    version: '1.0.0',
    contact: { name: 'Soporte Huellitas', email: 'huellitasapisoporte@gmail.com' },
  },
  servers: [
    { url: 'https://huellitas-backend-7mxy.onrender.com', description: 'Producción' },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key obtenida desde el portal de desarrollador. Opcional — sin ella el endpoint sigue funcionando.',
      },
    },
    schemas: {
      ClinicalRecord: {
        type: 'object',
        properties: {
          vaccinated:   { type: 'boolean', example: true  },
          sterilized:   { type: 'boolean', example: false },
          dewormed:     { type: 'boolean', example: true  },
          microchipped: { type: 'boolean', example: false },
          health_notes: { type: 'string',  nullable: true, example: null },
        },
      },
      Pet: {
        type: 'object',
        properties: {
          id:             { type: 'integer', example: 42 },
          adoption_code:  { type: 'string',  example: 'HLL-00042', description: 'Código único legible para identificar la mascota (ej. en QR o ficha física).' },
          name:           { type: 'string',  example: 'Luna' },
          species:        { type: 'string',  enum: ['dog', 'cat', 'rabbit', 'other'], example: 'dog' },
          breed:          { type: 'string',  nullable: true, example: 'Labrador' },
          age_months:     { type: 'integer', example: 18, description: 'Edad en meses.' },
          gender:         { type: 'string',  enum: ['male', 'female'], example: 'female' },
          size:           { type: 'string',  enum: ['small', 'medium', 'large'], example: 'medium' },
          description:    { type: 'string',  example: 'Muy cariñosa, le encantan los niños.' },
          photos:         { type: 'array',   items: { type: 'string', format: 'uri' }, example: [] },
          status:         { type: 'string',  enum: ['available', 'adopted', 'reserved'], example: 'available' },
          foundation_id:  { type: 'string',  format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
          foundation_name:{ type: 'string',  example: 'Patitas Felices Bogotá' },
          city:           { type: 'string',  example: 'Bogotá' },
          created_at:     { type: 'string',  format: 'date-time', example: '2026-01-15T10:30:00Z' },
          clinical_record: { $ref: '#/components/schemas/ClinicalRecord' },
        },
      },
      Foundation: {
        type: 'object',
        properties: {
          id:                 { type: 'string',  format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
          name:               { type: 'string',  example: 'Patitas Felices Bogotá' },
          city:               { type: 'string',  example: 'Bogotá' },
          contact_email:      { type: 'string',  format: 'email', example: 'info@patitasfelices.co' },
          contact_phone:      { type: 'string',  nullable: true, example: '+57 300 123 4567' },
          active_pets_count:  { type: 'integer', example: 8,  description: 'Mascotas disponibles actualmente.' },
          adopted_pets_count: { type: 'integer', example: 34, description: 'Mascotas adoptadas históricamente.' },
          created_at:         { type: 'string',  format: 'date-time', example: '2025-03-01T08:00:00Z' },
        },
      },
      AvailabilitySlot: {
        type: 'object',
        properties: {
          available_date: { type: 'string', format: 'date',  example: '2026-06-10' },
          start_time:     { type: 'string', example: '09:00' },
          end_time:       { type: 'string', example: '17:00' },
        },
      },
      PaginatedPets: {
        type: 'object',
        properties: {
          data:     { type: 'array', items: { $ref: '#/components/schemas/Pet' } },
          total:    { type: 'integer', example: 124 },
          page:     { type: 'integer', example: 1 },
          per_page: { type: 'integer', example: 20 },
        },
      },
      PaginatedFoundations: {
        type: 'object',
        properties: {
          data:     { type: 'array', items: { $ref: '#/components/schemas/Foundation' } },
          total:    { type: 'integer', example: 31 },
          page:     { type: 'integer', example: 1 },
          per_page: { type: 'integer', example: 20 },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Pet not found' },
        },
      },
    },
  },
  security: [{ ApiKeyAuth: [] }],
  paths: {
    '/pets': {
      get: {
        tags: ['Mascotas'],
        summary: 'Listar mascotas',
        description: 'Retorna una lista paginada de mascotas. Puedes combinar varios filtros en la misma llamada.',
        parameters: [
          { name: 'species',  in: 'query', description: 'Filtrar por especie',                                   schema: { type: 'string', enum: ['dog', 'cat', 'rabbit', 'other'] } },
          { name: 'city',     in: 'query', description: 'Filtrar por ciudad (búsqueda parcial, ej. "Bogotá")',   schema: { type: 'string' } },
          { name: 'size',     in: 'query', description: 'Filtrar por tamaño',                                    schema: { type: 'string', enum: ['small', 'medium', 'large'] } },
          { name: 'status',   in: 'query', description: 'Estado de adopción. Sin filtro devuelve todas.',        schema: { type: 'string', enum: ['available', 'adopted', 'reserved'], default: 'available' } },
          { name: 'q',        in: 'query', description: 'Búsqueda por nombre (búsqueda parcial)',                schema: { type: 'string' } },
          { name: 'page',     in: 'query', description: 'Número de página',                                     schema: { type: 'integer', default: 1, minimum: 1 } },
          { name: 'per_page', in: 'query', description: 'Resultados por página (máximo 100)',                    schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 } },
        ],
        responses: {
          '200': {
            description: 'Lista paginada de mascotas',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedPets' } } },
          },
        },
      },
    },
    '/pets/by-code/{code}': {
      get: {
        tags: ['Mascotas'],
        summary: 'Buscar mascota por código',
        description:
          'Retorna el detalle de una mascota usando su código de adopción (ej. `HLL-00042`). ' +
          'Útil para integrar con lectores de QR o fichas físicas de las fundaciones.',
        parameters: [
          { name: 'code', in: 'path', required: true, description: 'Código único de la mascota (ej. HLL-00042)', schema: { type: 'string', example: 'HLL-00042' } },
        ],
        responses: {
          '200': {
            description: 'Mascota encontrada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pet' } } },
          },
          '404': {
            description: 'Código inválido o mascota no encontrada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/pets/{id}': {
      get: {
        tags: ['Mascotas'],
        summary: 'Detalle de una mascota',
        description: 'Retorna la ficha completa de una mascota incluyendo su registro clínico. Obtén el `id` desde `GET /pets`.',
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'ID numérico de la mascota', schema: { type: 'integer', example: 42 } },
        ],
        responses: {
          '200': {
            description: 'Mascota encontrada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pet' } } },
          },
          '404': {
            description: 'Mascota no encontrada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/foundations': {
      get: {
        tags: ['Fundaciones'],
        summary: 'Listar fundaciones',
        description:
          'Retorna las fundaciones activas y aprobadas en Huellitas, incluyendo su conteo de mascotas disponibles y adoptadas. ' +
          'Usa el `id` de cada resultado para consultar el detalle o los horarios de visita.',
        parameters: [
          { name: 'city', in: 'query', description: 'Filtrar por ciudad (búsqueda parcial)', schema: { type: 'string' } },
          { name: 'page', in: 'query', description: 'Número de página', schema: { type: 'integer', default: 1, minimum: 1 } },
        ],
        responses: {
          '200': {
            description: 'Lista paginada de fundaciones',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedFoundations' } } },
          },
        },
      },
    },
    '/foundations/{id}': {
      get: {
        tags: ['Fundaciones'],
        summary: 'Detalle de una fundación',
        description: 'Retorna la información pública de una fundación aprobada. Obtén el `id` desde `GET /foundations`.',
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'UUID de la fundación', schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': {
            description: 'Fundación encontrada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Foundation' } } },
          },
          '404': {
            description: 'Fundación no encontrada o no aprobada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/foundations/{id}/availability': {
      get: {
        tags: ['Fundaciones'],
        summary: 'Disponibilidad de visitas',
        description:
          'Retorna los días y horarios en que la fundación acepta visitas para conocer sus mascotas. ' +
          'Si no se indica `from_date`, devuelve disponibilidad desde hoy.',
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'UUID de la fundación', schema: { type: 'string', format: 'uuid' } },
          { name: 'from_date', in: 'query', description: 'Fecha de inicio en formato YYYY-MM-DD (por defecto: hoy)', schema: { type: 'string', format: 'date', example: '2026-06-10' } },
        ],
        responses: {
          '200': {
            description: 'Lista de slots de disponibilidad',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/AvailabilitySlot' } } } },
          },
          '400': {
            description: 'Formato de fecha inválido',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
  },
};
