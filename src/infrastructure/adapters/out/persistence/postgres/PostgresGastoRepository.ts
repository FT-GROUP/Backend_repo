import { Pool } from 'pg';
import { Gasto } from '../../../../../domain/entities/Gasto';
import { ParticipacionGasto } from '../../../../../domain/entities/ParticipacionGasto';
import { GastoRepository } from '../../../../../domain/ports/out/GastoRepository';

interface FilaGasto {
  id: number;
  grupo_id: number;
  pagador_id: number;
  descripcion: string;
  monto_total: string;
  fecha_gasto: string;
  categoria: string;
  tipo_division: 'equitativa' | 'personalizada';
  comprobante_url: string | null;
  origen_registro: 'manual' | 'ocr';
  fecha_registro: Date;
  pagador_nombre?: string;
  pagador_email?: string;
  grupo_nombre?: string;
}

export class PostgresGastoRepository implements GastoRepository {
  constructor(private readonly pool: Pool) {}

  async crear(gasto: Gasto, participaciones: ParticipacionGasto[]): Promise<Gasto> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const insertGasto = `
        INSERT INTO gasto (grupo_id, pagador_id, descripcion, monto_total, fecha_gasto, categoria, tipo_division, comprobante_url, origen_registro)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, grupo_id, pagador_id, descripcion, monto_total, fecha_gasto, categoria, tipo_division, comprobante_url, origen_registro, fecha_registro
      `;
      const resGasto = await client.query<FilaGasto>(insertGasto, [
        gasto.grupoId,
        gasto.pagadorId,
        gasto.descripcion,
        gasto.montoTotal,
        gasto.fechaGasto,
        gasto.categoria,
        gasto.tipoDivision,
        gasto.comprobanteUrl,
        gasto.origenRegistro,
      ]);

      const gCreado = resGasto.rows[0];

      for (const p of participaciones) {
        const insertPart = `
          INSERT INTO participacion_gasto (gasto_id, usuario_id, monto_asignado, estado_pago, fecha_pago)
          VALUES ($1, $2, $3, $4, $5)
        `;
        await client.query(insertPart, [
          gCreado.id,
          p.usuarioId,
          p.montoAsignado,
          p.estadoPago,
          p.fechaPago,
        ]);
      }

      await client.query('COMMIT');

      return this.buscarPorId(gCreado.id) as Promise<Gasto>;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async buscarPorId(id: number): Promise<Gasto | null> {
    const query = `
      SELECT g.id, g.grupo_id, g.pagador_id, g.descripcion, g.monto_total, g.fecha_gasto::text, 
             g.categoria, g.tipo_division, g.comprobante_url, g.origen_registro, g.fecha_registro,
             u.nombre as pagador_nombre, u.email as pagador_email,
             gr.nombre as grupo_nombre
      FROM gasto g
      JOIN usuario u ON u.id = g.pagador_id
      JOIN grupo gr ON gr.id = g.grupo_id
      WHERE g.id = $1
      LIMIT 1
    `;
    const res = await this.pool.query<FilaGasto>(query, [id]);
    if (res.rowCount === 0) return null;
    const fila = res.rows[0];

    const queryDivs = `
      SELECT p.id, p.gasto_id, p.usuario_id, p.monto_asignado, p.estado_pago, p.fecha_pago,
             u.nombre, u.email
      FROM participacion_gasto p
      JOIN usuario u ON u.id = p.usuario_id
      WHERE p.gasto_id = $1
    `;
    const resDivs = await this.pool.query(queryDivs, [id]);

    const divisiones = resDivs.rows.map((d) => ({
      id: d.id,
      usuarioId: d.usuario_id,
      montoAsignado: Number(d.monto_asignado),
      estadoPago: d.estado_pago as 'pendiente' | 'pagado',
      fechaPago: d.fecha_pago ? new Date(d.fecha_pago) : null,
      usuario: {
        id: d.usuario_id,
        nombre: d.nombre,
        email: d.email,
      },
    }));

    return new Gasto({
      id: fila.id,
      grupoId: fila.grupo_id,
      pagadorId: fila.pagador_id,
      descripcion: fila.descripcion,
      montoTotal: Number(fila.monto_total),
      fechaGasto: fila.fecha_gasto,
      categoria: fila.categoria,
      tipoDivision: fila.tipo_division,
      comprobanteUrl: fila.comprobante_url,
      origenRegistro: fila.origen_registro,
      fechaRegistro: new Date(fila.fecha_registro),
      pagador: {
        id: fila.pagador_id,
        nombre: fila.pagador_nombre || '',
        email: fila.pagador_email || '',
      },
      grupo: {
        id: fila.grupo_id,
        nombre: fila.grupo_nombre || '',
      },
      divisiones,
    });
  }

  async listarPorUsuario(usuarioId: number, filtros?: { grupoId?: number }): Promise<Gasto[]> {
    let query = `
      SELECT DISTINCT g.id
      FROM gasto g
      JOIN miembro_grupo mg ON mg.grupo_id = g.grupo_id
      WHERE mg.usuario_id = $1 AND mg.estado = 'activo'
    `;
    const params: unknown[] = [usuarioId];

    if (filtros?.grupoId) {
      params.push(filtros.grupoId);
      query += ` AND g.grupo_id = $${params.length}`;
    }

    query += ` ORDER BY g.id DESC`;

    const res = await this.pool.query<{ id: number }>(query, params);
    const lista: Gasto[] = [];
    for (const r of res.rows) {
      const g = await this.buscarPorId(r.id);
      if (g) lista.push(g);
    }
    return lista;
  }

  async listarPorGrupo(grupoId: number): Promise<Gasto[]> {
    const query = `SELECT id FROM gasto WHERE grupo_id = $1 ORDER BY fecha_gasto DESC, id DESC`;
    const res = await this.pool.query<{ id: number }>(query, [grupoId]);
    const lista: Gasto[] = [];
    for (const r of res.rows) {
      const g = await this.buscarPorId(r.id);
      if (g) lista.push(g);
    }
    return lista;
  }

  async marcarParticipacionPagada(gastoId: number, usuarioId: number): Promise<void> {
    const query = `
      UPDATE participacion_gasto
      SET estado_pago = 'pagado', fecha_pago = NOW()
      WHERE gasto_id = $1 AND usuario_id = $2
    `;
    await this.pool.query(query, [gastoId, usuarioId]);
  }

  async eliminar(id: number): Promise<void> {
    await this.pool.query(`DELETE FROM gasto WHERE id = $1`, [id]);
  }
}
