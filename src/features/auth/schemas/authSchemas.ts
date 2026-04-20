import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z
  .object({
    full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Correo electrónico inválido'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
      .regex(/\d/, 'Debe contener al menos un número')
      .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
    confirmPassword: z.string(),
    role: z.enum(['ciudadano', 'fundacion', 'developer'] as const),
    municipio: z.string().optional(),
    phone: z.string().optional(),
    acceptTerms: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
      });
    }

    if (!data.acceptTerms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debes aceptar los términos de uso',
        path: ['acceptTerms'],
      });
    }

    if (data.role === 'fundacion') {
      if (!data.municipio?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El municipio es requerido para fundaciones',
          path: ['municipio'],
        });
      }
      if (!data.phone?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El teléfono es requerido para fundaciones',
          path: ['phone'],
        });
      } else if (!/^[+]?[\d\s\-()]{7,15}$/.test(data.phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Formato de teléfono inválido',
          path: ['phone'],
        });
      }
    }
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
