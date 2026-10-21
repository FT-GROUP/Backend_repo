import { RegistrarGastoDTO, RegistrarGastoUseCase } from '../../domain/ports/in/GastoUseCases';
import { GastoRepository } from '../../domain/ports/out/GastoRepository';
import { GrupoRepository } from '../../domain/ports/out/GrupoRepository';
import { BalanceRepository } from '../../domain/ports/out/BalanceRepository';
import { MovimientoRepository } from '../../domain/ports/out/MovimientoRepository';
import { Gasto } from '../../domain/entities/Gasto';
import { ParticipacionGasto } from '../../domain/entities/ParticipacionGasto';
import { Movimiento } from '../../domain/entities/Movimiento';
import { AccesoDenegadoError, GrupoNoEncontradoError, ValidacionError } from '../../domain/errors/DomainErrors';
import { dividirEquitativamente, validarDistribucionPersonalizada } from '../../domain/services/distribucionGasto';

export class RegistrarGastoUseCaseImpl implements RegistrarGastoUseCase {
  constructor(
    private readonly gastoRepo: GastoRepository,
    private readonly grupoRepo: GrupoRepository,
    private readonly balanceRepo: BalanceRepository,
    private readonly movimientoRepo: MovimientoRepository,
  ) {}

  async ejecutar(usuarioId: number, dto: RegistrarGastoDTO): Promise<Gasto> {
    const grupo = await this.grupoRepo.buscarPorId(dto.grupoId);
    if (!grupo) {
      throw new GrupoNoEncontradoError(dto.grupoId);
    }

    const esMiembro = await this.grupoRepo.esMiembro(dto.grupoId, usuarioId);
    if (!esMiembro) {
      throw new AccesoDenegadoError('No eres miembro activo de este grupo.');
    }

    if (dto.montoTotal <= 0) {
      throw new ValidacionError('El monto total debe ser mayor a 0.');
    }

    if (!dto.descripcion || dto.descripcion.trim().length === 0) {
      throw new ValidacionError('La descripción del gasto es obligatoria.');
    }

    // Obtener miembros del grupo
    const detalleGrupo = await this.grupoRepo.obtenerDetalle(dto.grupoId);
    const miembrosIds = detalleGrupo?.miembros.map((m) => m.usuarioId) || [];

    let participacionesCalculadas: Array<{ usuarioId: number; montoAsignado: number }> = [];

    if (dto.tipoDivision === 'equitativa') {
      const participantes = dto.divisiones && dto.divisiones.length > 0
        ? dto.divisiones.map((d) => d.usuarioId)
        : miembrosIds;
      participacionesCalculadas = dividirEquitativamente(dto.montoTotal, participantes);
    } else {
      if (!dto.divisiones || dto.divisiones.length === 0) {
        throw new ValidacionError('Se requiere especificar la división personalizada por participante.');
      }
      const partesValidas = dto.divisiones
        .filter((d) => (d.montoAsignado || 0) > 0)
        .map((d) => ({
          usuarioId: d.usuarioId,
          montoAsignado: d.montoAsignado!,
        }));
      participacionesCalculadas = validarDistribucionPersonalizada(dto.montoTotal, partesValidas);
    }

    const gastoEntidad = new Gasto({
      grupoId: dto.grupoId,
      pagadorId: dto.pagadorId,
      descripcion: dto.descripcion.trim(),
      montoTotal: dto.montoTotal,
      fechaGasto: dto.fechaGasto,
      categoria: dto.categoria,
      tipoDivision: dto.tipoDivision,
      comprobanteUrl: dto.comprobanteUrl ?? null,
      origenRegistro: dto.origenRegistro ?? 'manual',
    });

    const participacionesEntidades = participacionesCalculadas.map(
      (p) =>
        new ParticipacionGasto({
          gastoId: 0,
          usuarioId: p.usuarioId,
          montoAsignado: p.montoAsignado,
          estadoPago: p.usuarioId === dto.pagadorId ? 'pagado' : 'pendiente',
          fechaPago: p.usuarioId === dto.pagadorId ? new Date() : null,
        }),
    );

    const gastoGuardado = await this.gastoRepo.crear(gastoEntidad, participacionesEntidades);

    // Recalcular balances
    await this.balanceRepo.recalcularBalancesGrupo(dto.grupoId);

    // Registrar en auditoría / movimiento
    await this.movimientoRepo.registrar(
      new Movimiento({
        usuarioId,
        grupoId: dto.grupoId,
        gastoId: gastoGuardado.id,
        tipoMovimiento: 'gasto_creado',
        descripcion: `Gasto "${gastoGuardado.descripcion}" registrado por $${gastoGuardado.montoTotal}`,
      }),
    );

    return gastoGuardado;
  }
}
