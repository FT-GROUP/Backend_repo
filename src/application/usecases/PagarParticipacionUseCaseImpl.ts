import { PagarParticipacionUseCase } from '../../domain/ports/in/GastoUseCases';
import { GastoRepository } from '../../domain/ports/out/GastoRepository';
import { GrupoRepository } from '../../domain/ports/out/GrupoRepository';
import { BalanceRepository } from '../../domain/ports/out/BalanceRepository';
import { MovimientoRepository } from '../../domain/ports/out/MovimientoRepository';
import { Movimiento } from '../../domain/entities/Movimiento';
import { AccesoDenegadoError, GastoNoEncontradoError } from '../../domain/errors/DomainErrors';

export class PagarParticipacionUseCaseImpl implements PagarParticipacionUseCase {
  constructor(
    private readonly gastoRepo: GastoRepository,
    private readonly grupoRepo: GrupoRepository,
    private readonly balanceRepo: BalanceRepository,
    private readonly movimientoRepo: MovimientoRepository,
  ) {}

  async ejecutar(usuarioId: number, gastoId: number, participanteId?: number): Promise<void> {
    const gasto = await this.gastoRepo.buscarPorId(gastoId);
    if (!gasto) {
      throw new GastoNoEncontradoError(gastoId);
    }

    const targetUser = participanteId || usuarioId;

    // Solo el propio participante o quien pagó el gasto pueden marcar como pagado
    if (targetUser !== usuarioId && gasto.pagadorId !== usuarioId) {
      throw new AccesoDenegadoError('No tienes permisos para registrar el pago de este participante.');
    }

    await this.gastoRepo.marcarParticipacionPagada(gastoId, targetUser);
    await this.balanceRepo.recalcularBalancesGrupo(gasto.grupoId);

    await this.movimientoRepo.registrar(
      new Movimiento({
        usuarioId,
        grupoId: gasto.grupoId,
        gastoId,
        tipoMovimiento: 'pago_registrado',
        descripcion: `Pago registrado para el gasto "${gasto.descripcion}"`,
      }),
    );
  }
}
