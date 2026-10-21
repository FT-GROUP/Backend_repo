import { ListarGastosUseCase } from '../../domain/ports/in/GastoUseCases';
import { Gasto } from '../../domain/entities/Gasto';
import { GastoRepository } from '../../domain/ports/out/GastoRepository';

export class ListarGastosUseCaseImpl implements ListarGastosUseCase {
  constructor(private readonly gastoRepo: GastoRepository) {}

  async ejecutar(usuarioId: number, grupoId?: number): Promise<Gasto[]> {
    return this.gastoRepo.listarPorUsuario(usuarioId, { grupoId });
  }
}
