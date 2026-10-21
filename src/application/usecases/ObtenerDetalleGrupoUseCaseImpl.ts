import { ObtenerDetalleGrupoUseCase } from '../../domain/ports/in/GrupoUseCases';
import { GrupoConMiembros, GrupoRepository } from '../../domain/ports/out/GrupoRepository';
import { GrupoNoEncontradoError, AccesoDenegadoError } from '../../domain/errors/DomainErrors';

export class ObtenerDetalleGrupoUseCaseImpl implements ObtenerDetalleGrupoUseCase {
  constructor(private readonly grupoRepo: GrupoRepository) {}

  async ejecutar(usuarioId: number, grupoId: number): Promise<GrupoConMiembros> {
    const esMiembro = await this.grupoRepo.esMiembro(grupoId, usuarioId);
    if (!esMiembro) {
      throw new AccesoDenegadoError('No tienes permiso para ver este grupo o no eres miembro activo.');
    }

    const detalle = await this.grupoRepo.obtenerDetalle(grupoId, usuarioId);
    if (!detalle) {
      throw new GrupoNoEncontradoError(grupoId);
    }

    return detalle;
  }
}
