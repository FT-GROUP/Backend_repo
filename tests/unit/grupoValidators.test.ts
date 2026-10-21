import { describe, expect, it } from '@jest/globals';
import { registrarGastoSchema } from '../../src/infrastructure/adapters/in/http/validators/gastoValidators';
import { crearGrupoSchema } from '../../src/infrastructure/adapters/in/http/validators/grupoValidators';

describe('validación de esquemas Zod de grupos y gastos', () => {
  it('valida creación de grupo correctamente', () => {
    const res = crearGrupoSchema.safeParse({
      nombre: 'Apartamento 402',
      descripcion: 'Gastos de arriendo',
      ciudad: 'Medellín',
      icono: 'building',
      integrantes: [{ nombre: 'Ana', email: 'ana@example.com' }],
    });
    expect(res.success).toBe(true);
  });

  it('valida registro de gastos correctamente', () => {
    const resultado = registrarGastoSchema.safeParse({
      grupo_id: 1,
      pagador_id: 2,
      descripcion: 'Cena de bienvenida',
      monto_total: 150000,
      fecha_gasto: '2026-10-06',
      categoria: 'Alimentación',
      tipo_division: 'equitativa',
    });

    expect(resultado.success).toBe(true);
  });
});