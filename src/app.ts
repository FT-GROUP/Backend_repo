import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './infrastructure/adapters/in/http/routes/authRoutes';
import { grupoRouter } from './infrastructure/adapters/in/http/routes/grupoRoutes';
import { gastoRouter } from './infrastructure/adapters/in/http/routes/gastoRoutes';
import { panelRouter, balanceRouter, historialRouter } from './infrastructure/adapters/in/http/routes/panelRoutes';
import { errorHandler, rutaNoEncontrada } from './infrastructure/adapters/in/http/middlewares/errorHandler';
import { env } from './infrastructure/config/env';

/**
 * Composición de la aplicación Express (adaptador de entrada HTTP).
 */
export function crearApp(): Application {
  const app = express();

  // --- Seguridad básica de cabeceras HTTP ---
  app.use(helmet());

  // --- CORS ---
  app.use(cors({ origin: env.corsOrigin }));

  // --- Logging de peticiones ---
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

  // --- Parseo de JSON ---
  app.use(express.json({ limit: '100kb' }));

  // --- Chequeo de salud ---
  app.get('/health', (_req, res) => {
    res.status(200).json({
      estado: 'ok',
      servicio: 'ft-group-backend',
      modulos: ['usuarios', 'grupos', 'gastos', 'balances', 'historial'],
    });
  });

  // --- Endpoints de la API ---
  app.use('/api/auth', authRoutes);
  app.use('/api/grupos', grupoRouter);
  app.use('/api/gastos', gastoRouter);
  app.use('/api/panel', panelRouter);
  app.use('/api/balances', balanceRouter);
  app.use('/api/historial', historialRouter);

  // --- 404 y manejo centralizado de errores ---
  app.use(rutaNoEncontrada);
  app.use(errorHandler);

  return app;
}
