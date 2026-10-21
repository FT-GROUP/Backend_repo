import { Gasto, TipoDivision, OrigenRegistro } from '../../entities/Gasto';

export interface RegistrarGastoDTO {
  grupoId: number;
  pagadorId: number;
  descripcion: string;
  montoTotal: number;
  fechaGasto: string;
  categoria: string;
  tipoDivision: TipoDivision;
  origenRegistro?: OrigenRegistro;
  comprobanteUrl?: string | null;
  divisiones?: Array<{ usuarioId: number; montoAsignado?: number }>;
}

export interface RegistrarGastoUseCase {
  ejecutar(usuarioId: number, dto: RegistrarGastoDTO): Promise<Gasto>;
}

export interface ListarGastosUseCase {
  ejecutar(usuarioId: number, grupoId?: number): Promise<Gasto[]>;
}

export interface EliminarGastoUseCase {
  ejecutar(usuarioId: number, gastoId: number): Promise<void>;
}

export interface PagarParticipacionUseCase {
  ejecutar(usuarioId: number, gastoId: number, participanteId?: number): Promise<void>;
}
