export const huellitasApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Huellitas API',
    description:
      'API pública de solo lectura para acceder a datos de mascotas y fundaciones registradas en Huellitas.\n\n' +
      'Todos los endpoints son públicos y no requieren autenticación.',
    version: '1.0.0',
    contact: { name: 'Huellitas', email: 'api@huellitas.co' },
  },
  servers: [{ url: 'https://api.huellitas.co/v1', description: 'Producción' }],
  components: {
    schemas: {
      Pet: {
        type: 'object',
        properties: {
          id:    { type: 'string', example: 'abc123' },
          name:  { type: 'string', example: 'Buddy' },
          species:        { type: 'string',  enum: ['dog', 'cat', 'other'], example: 'dog' },
          breed:          { type: 'string',  example: 'Golden Retriever' },
          age_months:     { type: 'integer', example: 36 },
          size:           { type: 'string',  enum: ['small', 'medium', 'large'], example: 'large' },
          compatibility:  { type: 'array',   items: { type: 'string', enum: ['kids_friendly', 'pets_friendly', 'apartment_ok'] }, example: ['kids_friendly', 'pets_friendly'] },
          photos:         { type: 'array',   items: { type: 'string', format: 'uri' } },
          status:         { type: 'string',  enum: ['available', 'adopted', 'reserved'], example: 'available' },
        },
      },
      Foundation: {
        type: 'object',
        properties: {
          id:            { type: 'string',  example: 'f01' },
          name:          { type: 'string',  example: 'Huellitas Bogotá' },
          city:          { type: 'string',  example: 'Bogotá' },
          description:   { type: 'string',  example: 'Refugio sin ánimo de lucro...' },
          contact_email: { type: 'string',  format: 'email', example: 'info@huellitasbogota.com' },
          pets_count:    { type: 'integer', example: 12 },
        },
      },
    },
  },
  paths: {
    '/api/pets': {
      get: {
        tags: ['Mascotas'],
        summary: 'Listar mascotas disponibles',
        description: 'Retorna una lista paginada de mascotas disponibles para adopción.',
        parameters: [
          { name: 'species', in: 'query', description: 'Filtrar por especie', schema: { type: 'string', enum: ['dog', 'cat', 'other'] } },
          { name: 'age_min', in: 'query', description: 'Edad mínima en meses', schema: { type: 'integer', minimum: 0 } },
          { name: 'age_max', in: 'query', description: 'Edad máxima en meses', schema: { type: 'integer' } },
          { name: 'city',    in: 'query', description: 'Filtrar por ciudad', schema: { type: 'string' } },
          { name: 'size',    in: 'query', description: 'Tamaño de la mascota', schema: { type: 'string', enum: ['small', 'medium', 'large'] } },
          { name: 'page',    in: 'query', schema: { type: 'integer', default: 1, minimum: 1 } },
          { name: 'limit',   in: 'query', schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 } },
        ],
        responses: {
          '200': {
            description: 'Lista de mascotas',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Pet' } } } },
          },
        },
      },
    },
    '/api/pets/{id}': {
      get: {
        tags: ['Mascotas'],
        summary: 'Detalle de una mascota',
        parameters: [{ name: 'id', in: 'path', required: true, description: 'ID de la mascota', schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Mascota encontrada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pet' } } },
          },
          '404': { description: 'Mascota no encontrada' },
        },
      },
    },
    '/api/foundations': {
      get: {
        tags: ['Fundaciones'],
        summary: 'Listar fundaciones activas',
        parameters: [
          { name: 'city',  in: 'query', description: 'Filtrar por ciudad', schema: { type: 'string' } },
          { name: 'page',  in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          '200': {
            description: 'Lista de fundaciones',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Foundation' } } } },
          },
        },
      },
    },
    '/api/foundations/{id}': {
      get: {
        tags: ['Fundaciones'],
        summary: 'Detalle de una fundación',
        parameters: [{ name: 'id', in: 'path', required: true, description: 'ID de la fundación', schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Fundación encontrada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Foundation' } } },
          },
          '404': { description: 'Fundación no encontrada' },
        },
      },
    },
  },
};
