import { Pool } from 'pg';
import { Grupo } from '../../../../../domain/entities/Grupo';
import { MiembroGrupo } from '../../../../../domain/entities/MiembroGrupo';
import { GrupoConMiembros, GrupoRepository } from '../../../../../domain/ports/out/GrupoRepository';

interface FilaGrupo {
  id: number;
  nombre: string;
  descripcion: string | null;
  icono: string;
  ciudad: string | null;
  lat: string | null;
  lng: string | null;
  creado_por: number;
  fecha_creacion: Date;
  estado: 'activo' | 'archivado';
}

export class PostgresGrupoRepository implements GrupoRepository {
  constructor(private readonly pool: Pool) {}

  async crear(
    grupo: Grupo,
    miembros: Array<{ usuarioId: number; rol: 'administrador' | 'miembro' }>,
  ): Promise<Grupo> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const insertGrupo = `
        INSERT INTO grupo (nombre, descripcion, icono, ciudad, lat, lng, creado_por, estado)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, nombre, descripcion, icono, ciudad, lat, lng, creado_por, fecha_creacion, estado
      `;
      const resGrupo = await client.query<FilaGrupo>(insertGrupo, [
        grupo.nombre,
        grupo.descripcion,
        grupo.icono,
        grupo.ciudad,
        grupo.lat,
        grupo.lng,
        grupo.creadoPor,
        grupo.estado,
      ]);

      const gCreado = resGrupo.rows[0];

      for (const m of miembros) {
        const insertMiembro = `
          INSERT INTO miembro_grupo (grupo_id, usuario_id, rol, estado)
          VALUES ($1, $2, $3, 'activo')
          ON CONFLICT (grupo_id, usuario_id) DO UPDATE SET estado = 'activo', rol = EXCLUDED.rol
        `;
        await client.query(insertMiembro, [gCreado.id, m.usuarioId, m.rol]);
      }

      await client.query('COMMIT');

      return new Grupo({
        id: gCreado.id,
        nombre: gCreado.nombre,
        descripcion: gCreado.descripcion,
        icono: gCreado.icono,
        ciudad: gCreado.ciudad,
        lat: gCreado.lat ? Number(gCreado.lat) : null,
        lng: gCreado.lng ? Number(gCreado.lng) : null,
        creadoPor: gCreado.creado_por,
        fechaCreacion: new Date(gCreado.fecha_creacion),
        estado: gCreado.estado,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async buscarPorId(id: number): Promise<Grupo | null> {
    const query = `
      SELECT id, nombre, descripcion, icono, ciudad, lat, lng, creado_por, fecha_creacion, estado
      FROM grupo
      WHERE id = $1
      LIMIT 1
    `;
    const res = await this.pool.query<FilaGrupo>(query, [id]);
    if (res.rowCount === 0) return null;
    const g = res.rows[0];
    return new Grupo({
      id: g.id,
      nombre: g.nombre,
      descripcion: g.descripcion,
      icono: g.icono,
      ciudad: g.ciudad,
      lat: g.lat ? Number(g.lat) : null,
      lng: g.lng ? Number(g.lng) : null,
      creadoPor: g.creado_por,
      fechaCreacion: new Date(g.fecha_creacion),
      estado: g.estado,
    });
  }

  async obtenerDetalle(id: number, usuarioId?: number): Promise<GrupoConMiembros | null> {
    const grupo = await this.buscarPorId(id);
    if (!grupo) return null;

    const queryMiembros = `
      SELECT mg.id, mg.grupo_id, mg.usuario_id, mg.rol, mg.fecha_union, mg.estado,
             u.nombre, u.email
      FROM miembro_grupo mg
      JOIN usuario u ON u.id = mg.usuario_id
      WHERE mg.grupo_id = $1 AND mg.estado = 'activo'
      ORDER BY mg.id ASC
    `;
    const resMiembros = await this.pool.query(queryMiembros, [id]);
    const miembros = resMiembros.rows.map(
      (r) =>
        new MiembroGrupo({
          id: r.id,
          grupoId: r.grupo_id,
          usuarioId: r.usuario_id,
          rol: r.rol,
          fechaUnion: new Date(r.fecha_union),
          estado: r.estado,
          usuario: {
            id: r.usuario_id,
            nombre: r.nombre,
            email: r.email,
          },
        }),
    );

    const queryStats = `
      SELECT 
        COALESCE(SUM(monto_total), 0) as total_gastos,
        COUNT(id) as num_gastos
      FROM gasto
      WHERE grupo_id = $1
    `;
    const resStats = await this.pool.query(queryStats, [id]);
    const totalGastos = Number(resStats.rows[0]?.total_gastos || 0);
    const numGastos = Number(resStats.rows[0]?.num_gastos || 0);

    let miBalance = 0;
    if (usuarioId) {
      // Balance neto del usuario en el grupo
      const queryBalance = `
        SELECT 
          COALESCE((SELECT SUM(monto) FROM balance WHERE grupo_id = $1 AND acreedor_id = $2), 0) -
          COALESCE((SELECT SUM(monto) FROM balance WHERE grupo_id = $1 AND deudor_id = $2), 0) as neto
      `;
      const resBal = await this.pool.query(queryBalance, [id, usuarioId]);
      miBalance = Math.round(Number(resBal.rows[0]?.neto || 0));
    }

    const miMiembro = usuarioId ? miembros.find((m) => m.usuarioId === usuarioId) : undefined;

    return {
      ...grupo,
      miembros,
      rol: miMiembro?.rol,
      totalGastos,
      numGastos,
      miBalance,
    };
  }

  async listarPorUsuario(usuarioId: number): Promise<GrupoConMiembros[]> {
    const queryGrupos = `
      SELECT g.id
      FROM grupo g
      JOIN miembro_grupo mg ON mg.grupo_id = g.id
      WHERE mg.usuario_id = $1 AND mg.estado = 'activo' AND g.estado = 'activo'
      ORDER BY g.fecha_creacion DESC
    `;
    const res = await this.pool.query<{ id: number }>(queryGrupos, [usuarioId]);
    const lista: GrupoConMiembros[] = [];
    for (const row of res.rows) {
      const detalle = await this.obtenerDetalle(row.id, usuarioId);
      if (detalle) lista.push(detalle);
    }
    return lista;
  }

  async esMiembro(grupoId: number, usuarioId: number): Promise<boolean> {
    const query = `
      SELECT 1 FROM miembro_grupo
      WHERE grupo_id = $1 AND usuario_id = $2 AND estado = 'activo'
      LIMIT 1
    `;
    const res = await this.pool.query(query, [grupoId, usuarioId]);
    return (res.rowCount ?? 0) > 0;
  }

  async obtenerRol(grupoId: number, usuarioId: number): Promise<'administrador' | 'miembro' | null> {
    const query = `
      SELECT rol FROM miembro_grupo
      WHERE grupo_id = $1 AND usuario_id = $2 AND estado = 'activo'
      LIMIT 1
    `;
    const res = await this.pool.query(query, [grupoId, usuarioId]);
    if (res.rowCount === 0) return null;
    return res.rows[0].rol;
  }

  async agregarMiembro(miembro: MiembroGrupo): Promise<MiembroGrupo> {
    const query = `
      INSERT INTO miembro_grupo (grupo_id, usuario_id, rol, estado)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (grupo_id, usuario_id) DO UPDATE SET estado = 'activo', rol = EXCLUDED.rol
      RETURNING id, grupo_id, usuario_id, rol, fecha_union, estado
    `;
    const res = await this.pool.query(query, [
      miembro.grupoId,
      miembro.usuarioId,
      miembro.rol,
      miembro.estado,
    ]);
    const r = res.rows[0];
    return new MiembroGrupo({
      id: r.id,
      grupoId: r.grupo_id,
      usuarioId: r.usuario_id,
      rol: r.rol,
      fechaUnion: new Date(r.fecha_union),
      estado: r.estado,
    });
  }

  async cambiarEstadoMiembro(
    grupoId: number,
    usuarioId: number,
    estado: 'activo' | 'expulsado' | 'salido',
  ): Promise<void> {
    const query = `
      UPDATE miembro_grupo
      SET estado = $1
      WHERE grupo_id = $2 AND usuario_id = $3
    `;
    await this.pool.query(query, [estado, grupoId, usuarioId]);
  }

  async archivarGrupo(id: number): Promise<void> {
    const query = `UPDATE grupo SET estado = 'archivado' WHERE id = $1`;
    await this.pool.query(query, [id]);
  }
}
