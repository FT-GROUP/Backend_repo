import { Response, NextFunction } from 'express';
import { RequestAutenticado } from '../middlewares/authMiddleware';
import {
  obtenerResumenPanelUseCase,
  liquidarBalanceUseCase,
  listarHistorialUseCase,
} from '../../../../config/container';

export class PanelController {
  static async resumen(req: RequestAutenticado, res: Response, next: NextFunction) {
    try {
      const resumen = await obtenerResumenPanelUseCase.ejecutar(req.usuario!.id);
      res.status(200).json(resumen);
    } catch (error) {
      next(error);
    }
  }

  static async liquidar(req: RequestAutenticado, res: Response, next: NextFunction) {
    try {
      const b = req.body;
      const deudorId = Number(b.deudor_id || b.de);
      const acreedorId = Number(b.acreedor_id || b.para);
      const grupoId = Number(b.grupo_id || b.grupoId);

      await liquidarBalanceUseCase.ejecutar(req.usuario!.id, {
        grupoId,
        deudorId,
        acreedorId,
      });

      res.status(200).json({ mensaje: 'Liquidación registrada exitosamente.' });
    } catch (error) {
      next(error);
    }
  }

  static async historial(req: RequestAutenticado, res: Response, next: NextFunction) {
    try {
      const grupoId = req.query.grupo ? Number(req.query.grupo) : undefined;
      const movimientos = await listarHistorialUseCase.ejecutar(req.usuario!.id, grupoId);
      const resultado = movimientos.map((m) => ({
        id: m.id,
        usuario_id: m.usuarioId,
        grupo_id: m.grupoId,
        gasto_id: m.gastoId,
        tipo_movimiento: m.tipoMovimiento,
        descripcion: m.descripcion,
        fecha: m.fecha,
        usuario: m.usuario,
      }));
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }
}
