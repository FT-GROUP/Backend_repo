import { Balance } from '../../entities/Balance';

export interface LiquidacionDetalle {
  de: number;
  para: number;
  monto: number;
  grupoId: number;
  grupoNombre: string;
  deUsuario?: { id: number; nombre: string; email: string };
  paraUsuario?: { id: number; nombre: string; email: string };
}

export interface BalanceRepository {
  recalcularBalancesGrupo(grupoId: number): Promise<Balance[]>;
  obtenerBalancesPorGrupo(grupoId: number): Promise<Balance[]>;
  obtenerLiquidacionesPorUsuario(usuarioId: number): Promise<LiquidacionDetalle[]>;
  liquidarDeudasEntreUsuarios(grupoId: number, deudorId: number, acreedorId: number): Promise<void>;
}
