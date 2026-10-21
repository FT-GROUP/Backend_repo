import { ArchivarGrupoUseCase } from '../../domain/ports/in/GrupoUseCases';
import { GrupoRepository } from '../../domain/ports/out/GrupoRepository';
import { AccesoDenegadoError, GrupoNoEncontradoError } from '../../domain/errors/DomainErrors';

export class ArchivarGrupoUseCaseImpl implements ArchivarGrupoUseCase {
  constructor(private readonly grupoRepo: GrupoRepository) {}

  async ejecutar(usuarioId: number, grupoId: number): Promise<void> {
    const grupo = await this.grupoRepo.buscarPorId(grupoId);
    if (!grupo) {
      throw new GrupoNoEncontradoError(grupoId);
    }

    const rol = await this.grupoRepo.obtenerRol(grupoId, usuarioId);
    if (rol !== 'administrador') {
      throw new AccesoDenegadoError('Solo el administrador del grupo puede archivarlo.');
    }

    await this.grupoRepo.archivarGrupo(grupoId);
  }
}
