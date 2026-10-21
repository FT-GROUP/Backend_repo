import { CrearGrupoDTO, CrearGrupoUseCase } from '../../domain/ports/in/GrupoUseCases';
import { GrupoConMiembros, GrupoRepository } from '../../domain/ports/out/GrupoRepository';
import { UsuarioRepository } from '../../domain/ports/out/UsuarioRepository';
import { MovimientoRepository } from '../../domain/ports/out/MovimientoRepository';
import { Grupo } from '../../domain/entities/Grupo';
import { Usuario } from '../../domain/entities/Usuario';
import { Movimiento } from '../../domain/entities/Movimiento';
import { ValidacionError } from '../../domain/errors/DomainErrors';

export class CrearGrupoUseCaseImpl implements CrearGrupoUseCase {
  constructor(
    private readonly grupoRepo: GrupoRepository,
    private readonly usuarioRepo: UsuarioRepository,
    private readonly movimientoRepo: MovimientoRepository,
  ) {}

  async ejecutar(usuarioId: number, dto: CrearGrupoDTO): Promise<GrupoConMiembros> {
    if (!dto.nombre || dto.nombre.trim().length === 0) {
      throw new ValidacionError('El nombre del grupo es obligatorio.');
    }

    const creador = await this.usuarioRepo.buscarPorId(usuarioId);
    if (!creador) {
      throw new ValidacionError('Usuario no encontrado.');
    }

    const grupoEntidad = new Grupo({
      nombre: dto.nombre.trim(),
      descripcion: dto.descripcion?.trim() || null,
      icono: dto.icono || 'building',
      ciudad: dto.ciudad || null,
      lat: dto.lat ?? null,
      lng: dto.lng ?? null,
      creadoPor: usuarioId,
    });

    const miembrosParaGuardar: Array<{ usuarioId: number; rol: 'administrador' | 'miembro' }> = [
      { usuarioId, rol: 'administrador' },
    ];

    if (dto.integrantes && Array.isArray(dto.integrantes)) {
      for (const inv of dto.integrantes) {
        if (!inv.nombre || inv.nombre.trim().length === 0) continue;
        const email = inv.email ? inv.email.trim().toLowerCase() : null;
        let u: Usuario | null = null;
        if (email) {
          u = await this.usuarioRepo.buscarPorEmail(email);
        }
        if (!u) {
          // Crear un usuario base invitado
          const tempEmail = email || `invitado_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@ftgroup.local`;
          u = await this.usuarioRepo.guardar(
            Usuario.crear({
              nombre: inv.nombre.trim(),
              email: tempEmail,
              passwordHash: '$2b$12$e0MYJv0w/eXN6N0V6c0s.u/1zFkIomcTzJqV1yC/m4V1zFkIomcTz',
            }),
          );
        }

        if (u.id && u.id !== usuarioId && !miembrosParaGuardar.some((m) => m.usuarioId === u!.id)) {
          miembrosParaGuardar.push({ usuarioId: u.id, rol: 'miembro' });
        }
      }
    }

    const grupoCreado = await this.grupoRepo.crear(grupoEntidad, miembrosParaGuardar);

    if (grupoCreado.id) {
      await this.movimientoRepo.registrar(
        new Movimiento({
          usuarioId,
          grupoId: grupoCreado.id,
          tipoMovimiento: 'miembro_agregado',
          descripcion: `${creador.nombre} creó el grupo "${grupoCreado.nombre}"`,
        }),
      );
    }

    const detalle = await this.grupoRepo.obtenerDetalle(grupoCreado.id!, usuarioId);
    if (!detalle) {
      throw new Error('Error al recuperar los datos del grupo recién creado.');
    }
    return detalle;
  }
}
