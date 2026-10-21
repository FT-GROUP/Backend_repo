import { ObtenerResumenPanelUseCase, ResumenPanelDTO } from '../../domain/ports/in/PanelUseCases';
import { GrupoRepository } from '../../domain/ports/out/GrupoRepository';
import { BalanceRepository } from '../../domain/ports/out/BalanceRepository';

export class ObtenerResumenPanelUseCaseImpl implements ObtenerResumenPanelUseCase {
  constructor(
    private readonly grupoRepo: GrupoRepository,
    private readonly balanceRepo: BalanceRepository,
  ) {}

  async ejecutar(usuarioId: number): Promise<ResumenPanelDTO> {
    const grupos = await this.grupoRepo.listarPorUsuario(usuarioId);
    const liquidaciones = await this.balanceRepo.obtenerLiquidacionesPorUsuario(usuarioId);

    let teDeben = 0;
    let debes = 0;

    for (const l of liquidaciones) {
      if (l.para === usuarioId) teDeben += l.monto;
      if (l.de === usuarioId) debes += l.monto;
    }

    return {
      grupos,
      teDeben: Math.round(teDeben),
      debes: Math.round(debes),
      balance: Math.round(teDeben - debes),
      liquidaciones,
      demo: false,
    };
  }
}
