import { Response, NextFunction } from 'express';
import { RequestAutenticado } from '../middlewares/authMiddleware';
import {
  registrarGastoUseCase,
  listarGastosUseCase,
  eliminarGastoUseCase,
  pagarParticipacionUseCase,
} from '../../../../config/container';

export class GastoController {
  static async listar(req: RequestAutenticado, res: Response, next: NextFunction) {
    try {
      const grupoId = req.query.grupo ? Number(req.query.grupo) : undefined;
      const gastos = await listarGastosUseCase.ejecutar(req.usuario!.id, grupoId);
      const userId = req.usuario!.id;

      const resultado = gastos.map((g) => {
        const divs = g.divisiones || [];
        const mia = divs.find((d) => d.usuarioId === userId);
        const pendientesOtros =
          g.pagadorId === userId
            ? divs
                .filter((d) => d.usuarioId !== userId && d.estadoPago === 'pendiente')
                .reduce((s, d) => s + d.montoAsignado, 0)
            : 0;

        return {
          id: g.id,
          grupo_id: g.grupoId,
          pagador_id: g.pagadorId,
          descripcion: g.descripcion,
          monto_total: g.montoTotal,
          fecha_gasto: g.fechaGasto,
          categoria: g.categoria,
          tipo_division: g.tipoDivision,
          origen_registro: g.origenRegistro,
          fecha_registro: g.fechaRegistro,
          comprobante_url: g.comprobanteUrl,
          grupo: g.grupo,
          pagador: g.pagador,
          personas: divs.length,
          divisiones: divs.map((d) => ({
            id: d.id,
            gasto_id: g.id,
            usuario_id: d.usuarioId,
            monto_asignado: d.montoAsignado,
            estado_pago: d.estadoPago,
            fecha_pago: d.fechaPago,
            usuario: d.usuario,
          })),
          mi_parte: mia?.montoAsignado || 0,
          mi_estado: !mia ? 'no_participa' : g.pagadorId === userId ? 'pagador' : mia.estadoPago,
          me_deben: pendientesOtros,
        };
      });

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  static async crear(req: RequestAutenticado, res: Response, next: NextFunction) {
    try {
      const b = req.body;
      const gasto = await registrarGastoUseCase.ejecutar(req.usuario!.id, {
        grupoId: Number(b.grupo_id || b.grupoId),
        pagadorId: Number(b.pagador_id || b.pagadorId || req.usuario!.id),
        descripcion: b.descripcion,
        montoTotal: Number(b.monto_total || b.montoTotal),
        fechaGasto: b.fecha_gasto || b.fechaGasto,
        categoria: b.categoria,
        tipoDivision: b.tipo_division || b.tipoDivision || 'equitativa',
        origenRegistro: b.origen_registro || b.origenRegistro || 'manual',
        comprobanteUrl: b.comprobante_url || b.comprobanteUrl || null,
        divisiones: b.divisiones?.map((d: any) => ({
          usuarioId: Number(d.usuario_id || d.usuarioId),
          montoAsignado: d.monto_asignado !== undefined ? Number(d.monto_asignado) : undefined,
        })),
      });

      res.status(201).json({ id: gasto.id, mensaje: 'Gasto registrado exitosamente.', gasto });
    } catch (error) {
      next(error);
    }
  }

  static async eliminar(req: RequestAutenticado, res: Response, next: NextFunction) {
    try {
      const gastoId = Number(req.params.id);
      await eliminarGastoUseCase.ejecutar(req.usuario!.id, gastoId);
      res.status(200).json({ mensaje: 'Gasto eliminado exitosamente.' });
    } catch (error) {
      next(error);
    }
  }

  static async pagarParte(req: RequestAutenticado, res: Response, next: NextFunction) {
    try {
      const gastoId = Number(req.params.id);
      const usuarioId = req.body.usuario_id ? Number(req.body.usuario_id) : req.usuario!.id;
      await pagarParticipacionUseCase.ejecutar(req.usuario!.id, gastoId, usuarioId);
      res.status(200).json({ mensaje: 'Pago registrado exitosamente.' });
    } catch (error) {
      next(error);
    }
  }
}
