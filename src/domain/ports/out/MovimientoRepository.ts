import { Movimiento } from '../../entities/Movimiento';

export interface MovimientoRepository {
  registrar(movimiento: Movimiento): Promise<Movimiento>;
  listarPorUsuario(usuarioId: number, limite?: number): Promise<Movimiento[]>;
  listarPorGrupo(grupoId: number, limite?: number): Promise<Movimiento[]>;
}
