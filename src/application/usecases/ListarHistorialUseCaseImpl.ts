import { ListarHistorialUseCase } from '../../domain/ports/in/PanelUseCases';
import { Movimiento } from '../../domain/entities/Movimiento';
import { MovimientoRepository } from '../../domain/ports/out/MovimientoRepository';

export class ListarHistorialUseCaseImpl implements ListarHistorialUseCase {
  constructor(private readonly movimientoRepo: MovimientoRepository) {}

  async ejecutar(usuarioId: number, grupoId?: number): Promise<Movimiento[]> {
    if (grupoId) {
      return this.movimientoRepo.listarPorGrupo(grupoId);
    }
    return this.movimientoRepo.listarPorUsuario(usuarioId);
  }
}
