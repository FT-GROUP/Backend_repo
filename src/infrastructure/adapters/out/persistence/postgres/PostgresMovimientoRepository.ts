import { Pool } from 'pg';
import { Movimiento } from '../../../../../domain/entities/Movimiento';
import { MovimientoRepository } from '../../../../../domain/ports/out/MovimientoRepository';

export class PostgresMovimientoRepository implements MovimientoRepository {
  constructor(private readonly pool: Pool) {}

  async registrar(movimiento: Movimiento): Promise<Movimiento> {
    const query = `
      INSERT INTO movimiento (usuario_id, grupo_id, gasto_id, tipo_movimiento, descripcion, fecha)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, usuario_id, grupo_id, gasto_id, tipo_movimiento, descripcion, fecha
    `;
    const res = await this.pool.query(query, [
      movimiento.usuarioId,
      movimiento.grupoId,
      movimiento.gastoId,
      movimiento.tipoMovimiento,
      movimiento.descripcion,
      movimiento.fecha,
    ]);
    const r = res.rows[0];
    return new Movimiento({
      id: r.id,
      usuarioId: r.usuario_id,
      grupoId: r.grupo_id,
      gastoId: r.gasto_id,
      tipoMovimiento: r.tipo_movimiento,
      descripcion: r.descripcion,
      fecha: new Date(r.fecha),
    });
  }

  async listarPorUsuario(usuarioId: number, limite = 50): Promise<Movimiento[]> {
    const query = `
      SELECT m.id, m.usuario_id, m.grupo_id, m.gasto_id, m.tipo_movimiento, m.descripcion, m.fecha,
             u.nombre as usuario_nombre, u.email as usuario_email
      FROM movimiento m
      JOIN grupo g ON g.id = m.grupo_id
      JOIN miembro_grupo mg ON mg.grupo_id = g.id
      JOIN usuario u ON u.id = m.usuario_id
      WHERE mg.usuario_id = $1 AND mg.estado = 'activo'
      ORDER BY m.fecha DESC, m.id DESC
      LIMIT $2
    `;
    const res = await this.pool.query(query, [usuarioId, limite]);
    return res.rows.map(
      (r) =>
        new Movimiento({
          id: r.id,
          usuarioId: r.usuario_id,
          grupoId: r.grupo_id,
          gastoId: r.gasto_id,
          tipoMovimiento: r.tipo_movimiento,
          descripcion: r.descripcion,
          fecha: new Date(r.fecha),
          usuario: {
            id: r.usuario_id,
            nombre: r.usuario_nombre,
            email: r.usuario_email,
          },
        }),
    );
  }

  async listarPorGrupo(grupoId: number, limite = 50): Promise<Movimiento[]> {
    const query = `
      SELECT m.id, m.usuario_id, m.grupo_id, m.gasto_id, m.tipo_movimiento, m.descripcion, m.fecha,
             u.nombre as usuario_nombre, u.email as usuario_email
      FROM movimiento m
      JOIN usuario u ON u.id = m.usuario_id
      WHERE m.grupo_id = $1
      ORDER BY m.fecha DESC, m.id DESC
      LIMIT $2
    `;
    const res = await this.pool.query(query, [grupoId, limite]);
    return res.rows.map(
      (r) =>
        new Movimiento({
          id: r.id,
          usuarioId: r.usuario_id,
          grupoId: r.grupo_id,
          gastoId: r.gasto_id,
          tipoMovimiento: r.tipo_movimiento,
          descripcion: r.descripcion,
          fecha: new Date(r.fecha),
          usuario: {
            id: r.usuario_id,
            nombre: r.usuario_nombre,
            email: r.usuario_email,
          },
        }),
    );
  }
}
