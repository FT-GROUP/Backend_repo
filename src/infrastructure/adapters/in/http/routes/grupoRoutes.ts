import { Router } from 'express';
import { GrupoController } from '../controllers/GrupoController';
import { autenticar } from '../middlewares/authMiddleware';
import { validarBody } from '../middlewares/validate';
import { crearGrupoSchema, agregarMiembroSchema } from '../validators/grupoValidators';

export const grupoRouter = Router();

grupoRouter.use(autenticar);

grupoRouter.get('/', GrupoController.listar);
grupoRouter.get('/:id', GrupoController.obtenerPorId);
grupoRouter.post('/', validarBody(crearGrupoSchema), GrupoController.crear);
grupoRouter.delete('/:id', GrupoController.archivar);
grupoRouter.post('/:id/miembros', validarBody(agregarMiembroSchema), GrupoController.agregarMiembro);