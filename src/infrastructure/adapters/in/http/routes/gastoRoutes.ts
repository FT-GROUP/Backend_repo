import { Router } from 'express';
import { GastoController } from '../controllers/GastoController';
import { autenticar } from '../middlewares/authMiddleware';
import { validarBody } from '../middlewares/validate';
import { registrarGastoSchema } from '../validators/gastoValidators';

export const gastoRouter = Router();

gastoRouter.use(autenticar);

gastoRouter.get('/', GastoController.listar);
gastoRouter.post('/', validarBody(registrarGastoSchema), GastoController.crear);
gastoRouter.delete('/:id', GastoController.eliminar);
gastoRouter.post('/:id/pagar', GastoController.pagarParte);
