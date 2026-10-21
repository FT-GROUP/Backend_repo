import { AgregarMiembroDTO, AgregarMiembroGrupoUseCase } from '../../domain/ports/in/GrupoUseCases';
import { GrupoRepository } from '../../domain/ports/out/GrupoRepository';
import { UsuarioRepository } from '../../domain/ports/out/UsuarioRepository';
import { MovimientoRepository } from '../../domain/ports/out/MovimientoRepository';
import { MiembroGrupo } from '../../domain/entities/MiembroGrupo';
import { Usuario } from '../../domain/entities/Usuario';
import { Movimiento } from '../../domain/entities/Movimiento';
import { AccesoDenegadoError, GrupoNoEncontradoError, ValidacionError } from '../../domain/errors/DomainErrors';

export class AgregarMiembroGrupoUseCaseImpl implements AgregarMiembroGrupoUseCase {
  constructor(
    private readonly grupoRepo: GrupoRepository,
    private readonly usuarioRepo: UsuarioRepository,
    private readonly movimientoRepo: MovimientoRepository,
  ) {}

  async ejecutar(usuarioId: number, dto: AgregarMiembroDTO): Promise<void> {
    const grupo = await this.grupoRepo.buscarPorId(dto.grupoId);
    if (!grupo) {
      throw new GrupoNoEncontradoError(dto.grupoId);
    }

    const esMiembro = await this.grupoRepo.esMiembro(dto.grupoId, usuarioId);
    if (!esMiembro) {
      throw new AccesoDenegadoError('No eres miembro de este grupo.');
    }

    const email = dto.email.trim().toLowerCase();
    let usuarioAAgregar = await this.usuarioRepo.buscarPorEmail(email);

    if (!usuarioAAgregar) {
      const nombre = dto.nombre?.trim() || email.split('@')[0];
      usuarioAAgregar = await this.usuarioRepo.guardar(
        Usuario.crear({
          nombre: nombre.length >= 2 ? nombre : `${nombre}_user`,
          email,
          passwordHash: '$2b$12$e0MYJv0w/eXN6N0V6c0s.u/1zFkIomcTzJqV1yC/m4V1zFkIomcTz',
        }),
      );
    }

    const yaEsMiembro = await this.grupoRepo.esMiembro(dto.grupoId, usuarioAAgregar.id!);
    if (yaEsMiembro) {
      throw new ValidacionError('El usuario ya es miembro activo de este grupo.');
    }

    await this.grupoRepo.agregarMiembro(
      new MiembroGrupo({
        grupoId: dto.grupoId,
        usuarioId: usuarioAAgregar.id!,
        rol: 'miembro',
      }),
    );

    await this.movimientoRepo.registrar(
      new Movimiento({
        usuarioId,
        grupoId: dto.grupoId,
        tipoMovimiento: 'miembro_agregado',
        descripcion: `${usuarioAAgregar.nombre} se unió al grupo`,
      }),
    );
  }
}
