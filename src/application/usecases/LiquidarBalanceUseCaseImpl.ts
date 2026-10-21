import { LiquidarBalanceUseCase, LiquidarDeudaDTO } from '../../domain/ports/in/PanelUseCases';
import { BalanceRepository } from '../../domain/ports/out/BalanceRepository';
import { MovimientoRepository } from '../../domain/ports/out/MovimientoRepository';
import { GrupoRepository } from '../../domain/ports/out/GrupoRepository';
import { Movimiento } from '../../domain/entities/Movimiento';
import { AccesoDenegadoError, ValidacionError } from '../../domain/errors/DomainErrors';

export class LiquidarBalanceUseCaseImpl implements LiquidarBalanceUseCase {
  constructor(
    private readonly balanceRepo: BalanceRepository,
    private readonly grupoRepo: GrupoRepository,
    private readonly movimientoRepo: MovimientoRepository,
  ) {}

  async ejecutar(usuarioId: number, dto: LiquidarDeudaDTO): Promise<void> {
    const esMiembro = await this.grupoRepo.esMiembro(dto.grupoId, usuarioId);
    if (!esMiembro) {
      throw new AccesoDenegadoError('No eres miembro del grupo.');
    }

    if (usuarioId !== dto.deudorId && usuarioId !== dto.acreedorId) {
      throw new AccesoDenegadoError('Solo las partes involucradas pueden liquidar la deuda.');
    }

    if (dto.deudorId === dto.acreedorId) {
      throw new ValidacionError('El deudor y el acreedor no pueden ser la misma persona.');
    }

    await this.balanceRepo.liquidarDeudasEntreUsuarios(dto.grupoId, dto.deudorId, dto.acreedorId);
    await this.balanceRepo.recalcularBalancesGrupo(dto.grupoId);

    await this.movimientoRepo.registrar(
      new Movimiento({
        usuarioId,
        grupoId: dto.grupoId,
        tipoMovimiento: 'pago_registrado',
        descripcion: 'Liquidación de balance registrada',
      }),
    );
  }
}
