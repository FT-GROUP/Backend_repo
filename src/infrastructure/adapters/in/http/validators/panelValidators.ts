import { z } from 'zod';

export const liquidarBalanceSchema = z.object({
  grupo_id: z.coerce.number().int().positive(),
  deudor_id: z.coerce.number().int().positive().optional(),
  acreedor_id: z.coerce.number().int().positive().optional(),
  de: z.coerce.number().int().positive().optional(),
  para: z.coerce.number().int().positive().optional(),
});
