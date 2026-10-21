import { Router } from 'express';
import { PanelController } from '../controllers/PanelController';
import { autenticar } from '../middlewares/authMiddleware';
import { validarBody } from '../middlewares/validate';
import { liquidarBalanceSchema } from '../validators/panelValidators';

export const panelRouter = Router();

panelRouter.use(autenticar);

panelRouter.get('/resumen', PanelController.resumen);

export const balanceRouter = Router();
balanceRouter.use(autenticar);
balanceRouter.post('/liquidar', validarBody(liquidarBalanceSchema), PanelController.liquidar);

export const historialRouter = Router();
historialRouter.use(autenticar);
historialRouter.get('/', PanelController.historial);
