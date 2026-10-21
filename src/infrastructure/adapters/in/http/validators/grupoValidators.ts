import { z } from 'zod';

export const crearGrupoSchema = z.object({
  nombre: z.string().min(1, 'El nombre del grupo es obligatorio').max(120),
  descripcion: z.string().max(500).optional().nullable(),
  icono: z.string().max(30).optional().nullable(),
  ciudad: z.string().max(80).optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  integrantes: z
    .array(
      z.object({
        nombre: z.string().min(1, 'El nombre del integrante es obligatorio'),
        email: z.string().email('Correo electrónico no válido').optional().nullable().or(z.literal('')),
      }),
    )
    .optional(),
});

export const agregarMiembroSchema = z.object({
  email: z.string().email('Correo electrónico no válido'),
  nombre: z.string().min(1).optional(),
});