import { GrupoConMiembros } from '../out/GrupoRepository';
import { LiquidacionDetalle } from '../out/BalanceRepository';
import { Movimiento } from '../../entities/Movimiento';

export interface ResumenPanelDTO {
  grupos: GrupoConMiembros[];
  teDeben: number;
  debes: number;
  balance: number;
  liquidaciones: LiquidacionDetalle[];
  demo?: boolean;
}

export interface LiquidarDeudaDTO {
  grupoId: number;
  deudorId: number;
  acreedorId: number;
}

export interface ObtenerResumenPanelUseCase {
  ejecutar(usuarioId: number): Promise<ResumenPanelDTO>;
}

export interface LiquidarBalanceUseCase {
  ejecutar(usuarioId: number, dto: LiquidarDeudaDTO): Promise<void>;
}

export interface ListarHistorialUseCase {
  ejecutar(usuarioId: number, grupoId?: number): Promise<Movimiento[]>;
}
