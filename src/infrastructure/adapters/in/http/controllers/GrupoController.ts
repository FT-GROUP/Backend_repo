import { Response, NextFunction } from 'express';
import { RequestAutenticado } from '../middlewares/authMiddleware';
import {
  crearGrupoUseCase,
  listarGruposUsuarioUseCase,
  obtenerDetalleGrupoUseCase,
  archivarGrupoUseCase,
  agregarMiembroGrupoUseCase,
} from '../../../../config/container';

export class GrupoController {
  static async listar(req: RequestAutenticado, res: Response, next: NextFunction) {
    try {
      const grupos = await listarGruposUsuarioUseCase.ejecutar(req.usuario!.id);
      const resultado = grupos.map((g) => ({
        id: g.id,
        nombre: g.nombre,
        descripcion: g.descripcion,
        icono: g.icono,
        ciudad: g.ciudad,
        lat: g.lat,
        lng: g.lng,
        creado_por: g.creadoPor,
        fecha_creacion: g.fechaCreacion,
        estado: g.estado,
        rol: g.rol,
        total_gastos: g.totalGastos ?? 0,
        num_gastos: g.numGastos ?? 0,
        mi_balance: g.miBalance ?? 0,
        miembros: g.miembros.map((m) => ({
          id: m.usuarioId,
          nombre: m.usuario?.nombre || 'Miembro',
          email: m.usuario?.email || '',
          rol: m.rol,
        })),
      }));
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  static async obtenerPorId(req: RequestAutenticado, res: Response, next: NextFunction) {
    try {
      const grupoId = Number(req.params.id);
      const g = await obtenerDetalleGrupoUseCase.ejecutar(req.usuario!.id, grupoId);
      res.status(200).json({
        id: g.id,
        nombre: g.nombre,
        descripcion: g.descripcion,
        icono: g.icono,
        ciudad: g.ciudad,
        lat: g.lat,
        lng: g.lng,
        creado_por: g.creadoPor,
        fecha_creacion: g.fechaCreacion,
        estado: g.estado,
        rol: g.rol,
        total_gastos: g.totalGastos ?? 0,
        num_gastos: g.numGastos ?? 0,
        mi_balance: g.miBalance ?? 0,
        miembros: g.miembros.map((m) => ({
          id: m.usuarioId,
          nombre: m.usuario?.nombre || 'Miembro',
          email: m.usuario?.email || '',
          rol: m.rol,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  static async crear(req: RequestAutenticado, res: Response, next: NextFunction) {
    try {
      const g = await crearGrupoUseCase.ejecutar(req.usuario!.id, req.body);
      res.status(201).json({
        id: g.id,
        nombre: g.nombre,
        descripcion: g.descripcion,
        icono: g.icono,
        ciudad: g.ciudad,
        lat: g.lat,
        lng: g.lng,
        creado_por: g.creadoPor,
        fecha_creacion: g.fechaCreacion,
        estado: g.estado,
        rol: g.rol || 'administrador',
        total_gastos: g.totalGastos ?? 0,
        num_gastos: g.numGastos ?? 0,
        mi_balance: g.miBalance ?? 0,
        miembros: g.miembros.map((m) => ({
          id: m.usuarioId,
          nombre: m.usuario?.nombre || 'Miembro',
          email: m.usuario?.email || '',
          rol: m.rol,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  static async archivar(req: RequestAutenticado, res: Response, next: NextFunction) {
    try {
      const grupoId = Number(req.params.id);
      await archivarGrupoUseCase.ejecutar(req.usuario!.id, grupoId);
      res.status(200).json({ mensaje: 'Grupo archivado exitosamente.' });
    } catch (error) {
      next(error);
    }
  }

  static async agregarMiembro(req: RequestAutenticado, res: Response, next: NextFunction) {
    try {
      const grupoId = Number(req.params.id);
      await agregarMiembroGrupoUseCase.ejecutar(req.usuario!.id, {
        grupoId,
        email: req.body.email,
        nombre: req.body.nombre,
      });
      res.status(200).json({ mensaje: 'Miembro agregado exitosamente.' });
    } catch (error) {
      next(error);
    }
  }
}
