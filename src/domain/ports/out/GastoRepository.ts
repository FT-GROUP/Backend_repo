import { Gasto } from '../../entities/Gasto';
import { ParticipacionGasto } from '../../entities/ParticipacionGasto';

export interface GastoRepository {
  crear(gasto: Gasto, participaciones: ParticipacionGasto[]): Promise<Gasto>;
  buscarPorId(id: number): Promise<Gasto | null>;
  listarPorUsuario(usuarioId: number, filtros?: { grupoId?: number }): Promise<Gasto[]>;
  listarPorGrupo(grupoId: number): Promise<Gasto[]>;
  marcarParticipacionPagada(gastoId: number, usuarioId: number): Promise<void>;
  eliminar(id: number): Promise<void>;
}
