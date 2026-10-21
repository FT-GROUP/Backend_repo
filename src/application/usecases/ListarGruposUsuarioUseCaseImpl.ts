import { ListarGruposUsuarioUseCase } from '../../domain/ports/in/GrupoUseCases';
import { GrupoConMiembros, GrupoRepository } from '../../domain/ports/out/GrupoRepository';

export class ListarGruposUsuarioUseCaseImpl implements ListarGruposUsuarioUseCase {
  constructor(private readonly grupoRepo: GrupoRepository) {}

  async ejecutar(usuarioId: number): Promise<GrupoConMiembros[]> {
    return this.grupoRepo.listarPorUsuario(usuarioId);
  }
}
