import { Pool } from 'pg';
import { Balance } from '../../../../../domain/entities/Balance';
import { BalanceRepository, LiquidacionDetalle } from '../../../../../domain/ports/out/BalanceRepository';

export class PostgresBalanceRepository implements BalanceRepository {
  constructor(private readonly pool: Pool) {}

  async recalcularBalancesGrupo(grupoId: number): Promise<Balance[]> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Obtener todas las deudas pendientes directas en el grupo
      const queryDeudas = `
        SELECT 
          pg.usuario_id as deudor_id,
          g.pagador_id as acreedor_id,
          COALESCE(SUM(pg.monto_asignado), 0) as total_debido
        FROM participacion_gasto pg
        JOIN gasto g ON g.id = pg.gasto_id
        WHERE g.grupo_id = $1 
          AND pg.estado_pago = 'pendiente' 
          AND pg.usuario_id <> g.pagador_id
        GROUP BY pg.usuario_id, g.pagador_id
      `;
      const res = await client.query<{
        deudor_id: number;
        acreedor_id: number;
        total_debido: string;
      }>(queryDeudas, [grupoId]);

      // Mapear deudas directas
      const matriz: Record<string, number> = {};
      const key = (a: number, b: number) => `${a}->${b}`;

      for (const r of res.rows) {
        matriz[key(r.deudor_id, r.acreedor_id)] = Number(r.total_debido);
      }

      // Calcular saldos netos por cada par de usuarios
      const participantes = new Set<number>();
      for (const r of res.rows) {
        participantes.add(r.deudor_id);
        participantes.add(r.acreedor_id);
      }

      const arr = Array.from(participantes);
      const balancesCalculados: Array<{ deudorId: number; acreedorId: number; monto: number }> = [];

      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const u1 = arr[i];
          const u2 = arr[j];
          const u1DebeU2 = matriz[key(u1, u2)] || 0;
          const u2DebeU1 = matriz[key(u2, u1)] || 0;
          const diff = u1DebeU2 - u2DebeU1;

          if (diff > 0.001) {
            balancesCalculados.push({ deudorId: u1, acreedorId: u2, monto: Math.round(diff * 100) / 100 });
          } else if (diff < -0.001) {
            balancesCalculados.push({ deudorId: u2, acreedorId: u1, monto: Math.round(Math.abs(diff) * 100) / 100 });
          }
        }
      }

      // 2. Limpiar balances previos del grupo y persistir los nuevos
      await client.query(`DELETE FROM balance WHERE grupo_id = $1`, [grupoId]);

      const listaRetorno: Balance[] = [];
      for (const b of balancesCalculados) {
        const insert = `
          INSERT INTO balance (grupo_id, deudor_id, acreedor_id, monto, fecha_actualizacion)
          VALUES ($1, $2, $3, $4, NOW())
          RETURNING id, grupo_id, deudor_id, acreedor_id, monto, fecha_actualizacion
        `;
        const resIns = await client.query(insert, [grupoId, b.deudorId, b.acreedorId, b.monto]);
        const r = resIns.rows[0];
        listaRetorno.push(
          new Balance({
            id: r.id,
            grupoId: r.grupo_id,
            deudorId: r.deudor_id,
            acreedorId: r.acreedor_id,
            monto: Number(r.monto),
            fechaActualizacion: new Date(r.fecha_actualizacion),
          }),
        );
      }

      await client.query('COMMIT');
      return listaRetorno;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async obtenerBalancesPorGrupo(grupoId: number): Promise<Balance[]> {
    const query = `
      SELECT b.id, b.grupo_id, b.deudor_id, b.acreedor_id, b.monto, b.fecha_actualizacion,
             ud.nombre as deudor_nombre, ud.email as deudor_email,
             ua.nombre as acreedor_nombre, ua.email as acreedor_email
      FROM balance b
      JOIN usuario ud ON ud.id = b.deudor_id
      JOIN usuario ua ON ua.id = b.acreedor_id
      WHERE b.grupo_id = $1
    `;
    const res = await this.pool.query(query, [grupoId]);
    return res.rows.map(
      (r) =>
        new Balance({
          id: r.id,
          grupoId: r.grupo_id,
          deudorId: r.deudor_id,
          acreedorId: r.acreedor_id,
          monto: Number(r.monto),
          fechaActualizacion: new Date(r.fecha_actualizacion),
          deudor: { id: r.deudor_id, nombre: r.deudor_nombre, email: r.deudor_email },
          acreedor: { id: r.acreedor_id, nombre: r.acreedor_nombre, email: r.acreedor_email },
        }),
    );
  }

  async obtenerLiquidacionesPorUsuario(usuarioId: number): Promise<LiquidacionDetalle[]> {
    const query = `
      SELECT b.deudor_id, b.acreedor_id, b.monto, b.grupo_id, g.nombre as grupo_nombre,
             ud.nombre as deudor_nombre, ud.email as deudor_email,
             ua.nombre as acreedor_nombre, ua.email as acreedor_email
      FROM balance b
      JOIN grupo g ON g.id = b.grupo_id
      JOIN miembro_grupo mg ON mg.grupo_id = g.id
      JOIN usuario ud ON ud.id = b.deudor_id
      JOIN usuario ua ON ua.id = b.acreedor_id
      WHERE mg.usuario_id = $1 AND mg.estado = 'activo' AND g.estado = 'activo'
      ORDER BY b.monto DESC
    `;
    const res = await this.pool.query(query, [usuarioId]);
    return res.rows.map((r) => ({
      de: r.deudor_id,
      para: r.acreedor_id,
      monto: Number(r.monto),
      grupoId: r.grupo_id,
      grupoNombre: r.grupo_nombre,
      deUsuario: { id: r.deudor_id, nombre: r.deudor_nombre, email: r.deudor_email },
      paraUsuario: { id: r.acreedor_id, nombre: r.acreedor_nombre, email: r.acreedor_email },
    }));
  }

  async liquidarDeudasEntreUsuarios(grupoId: number, deudorId: number, acreedorId: number): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Marcar como pagadas las participaciones cruzadas entre ambos usuarios en ese grupo
      const queryUpdate1 = `
        UPDATE participacion_gasto pg
        SET estado_pago = 'pagado', fecha_pago = NOW()
        FROM gasto g
        WHERE pg.gasto_id = g.id
          AND g.grupo_id = $1
          AND g.pagador_id = $2
          AND pg.usuario_id = $3
          AND pg.estado_pago = 'pendiente'
      `;
      await client.query(queryUpdate1, [grupoId, acreedorId, deudorId]);

      const queryUpdate2 = `
        UPDATE participacion_gasto pg
        SET estado_pago = 'pagado', fecha_pago = NOW()
        FROM gasto g
        WHERE pg.gasto_id = g.id
          AND g.grupo_id = $1
          AND g.pagador_id = $3
          AND pg.usuario_id = $2
          AND pg.estado_pago = 'pendiente'
      `;
      await client.query(queryUpdate2, [grupoId, acreedorId, deudorId]);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
