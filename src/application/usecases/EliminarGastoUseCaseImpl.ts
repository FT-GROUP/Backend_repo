import { EliminarGastoUseCase } from '../../domain/ports/in/GastoUseCases';
import { GastoRepository } from '../../domain/ports/out/GastoRepository';
import { GrupoRepository } from '../../domain/ports/out/GrupoRepository';
import { BalanceRepository } from '../../domain/ports/out/BalanceRepository';
import { MovimientoRepository } from '../../domain/ports/out/MovimientoRepository';
import { Movimiento } from '../../domain/entities/Movimiento';
import { AccesoDenegadoError, GastoNoEncontradoError } from '../../domain/errors/DomainErrors';

export class EliminarGastoUseCaseImpl implements EliminarGastoUseCase {
  constructor(
    private readonly gastoRepo: GastoRepository,
    private readonly grupoRepo: GrupoRepository,
    private readonly balanceRepo: BalanceRepository,
    private readonly movimientoRepo: MovimientoRepository,
  ) {}

  async ejecutar(usuarioId: number, gastoId: number): Promise<void> {
    const gasto = await this.gastoRepo.buscarPorId(gastoId);
    if (!gasto) {
      throw new GastoNoEncontradoError(gastoId);
    }

    const rol = await this.grupoRepo.obtenerRol(gasto.grupoId, usuarioId);
    if (gasto.pagadorId !== usuarioId && rol !== 'administrador') {
      throw new AccesoDenegadoError('Solo quien pagó el gasto o el administrador pueden eliminarlo.');
    }

    await this.gastoRepo.eliminar(gastoId);
    await this.balanceRepo.recalcularBalancesGrupo(gasto.grupoId);

    await this.movimientoRepo.registrar(
      new Movimiento({
        usuarioId,
        grupoId: gasto.grupoId,
        tipoMovimiento: 'gasto_eliminado',
        descripcion: `Gasto "${gasto.descripcion}" eliminado`,
      }),
    );
  }
}
