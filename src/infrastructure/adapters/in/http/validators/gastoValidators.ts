import { z } from 'zod';

export const registrarGastoSchema = z.object({
  grupo_id: z.coerce.number().int().positive('Identificador de grupo no válido'),
  pagador_id: z.coerce.number().int().positive('Identificador de pagador no válido'),
  descripcion: z.string().min(1, 'La descripción es obligatoria').max(255),
  monto_total: z.coerce.number().positive('El monto debe ser mayor que cero'),
  fecha_gasto: z.string().min(4, 'Fecha del gasto requerida'),
  categoria: z.string().min(1, 'La categoría es requerida').max(60),
  tipo_division: z.enum(['equitativa', 'personalizada']).default('equitativa'),
  comprobante_url: z.string().max(500).optional().nullable(),
  origen_registro: z.enum(['manual', 'ocr']).optional().default('manual'),
  divisiones: z
    .array(
      z.object({
        usuario_id: z.coerce.number().int().positive(),
        monto_asignado: z.coerce.number().nonnegative().optional(),
      }),
    )
    .optional(),
});
