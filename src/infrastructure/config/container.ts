import { pool } from '../adapters/out/persistence/postgres/db';
import { PostgresUsuarioRepository } from '../adapters/out/persistence/postgres/PostgresUsuarioRepository';
import { PostgresRefreshTokenRepository } from '../adapters/out/persistence/postgres/PostgresRefreshTokenRepository';
import { PostgresGrupoRepository } from '../adapters/out/persistence/postgres/PostgresGrupoRepository';
import { PostgresGastoRepository } from '../adapters/out/persistence/postgres/PostgresGastoRepository';
import { PostgresBalanceRepository } from '../adapters/out/persistence/postgres/PostgresBalanceRepository';
import { PostgresMovimientoRepository } from '../adapters/out/persistence/postgres/PostgresMovimientoRepository';
import { BcryptPasswordHasher } from '../adapters/out/security/BcryptPasswordHasher';
import { JwtTokenService } from '../adapters/out/security/JwtTokenService';
import { RegistrarUsuarioUseCaseImpl } from '../../application/usecases/RegistrarUsuarioUseCaseImpl';
import { IniciarSesionUseCaseImpl } from '../../application/usecases/IniciarSesionUseCaseImpl';
import { RefrescarTokenUseCaseImpl } from '../../application/usecases/RefrescarTokenUseCaseImpl';
import { CerrarSesionUseCaseImpl } from '../../application/usecases/CerrarSesionUseCaseImpl';
import { ObtenerPerfilUseCaseImpl } from '../../application/usecases/ObtenerPerfilUseCaseImpl';
import { ActualizarPerfilUseCaseImpl } from '../../application/usecases/ActualizarPerfilUseCaseImpl';
import { DesactivarCuentaUseCaseImpl } from '../../application/usecases/DesactivarCuentaUseCaseImpl';
import { ActivarCuentaUseCaseImpl } from '../../application/usecases/ActivarCuentaUseCaseImpl';
import { CrearGrupoUseCaseImpl } from '../../application/usecases/CrearGrupoUseCaseImpl';
import { ListarGruposUsuarioUseCaseImpl } from '../../application/usecases/ListarGruposUsuarioUseCaseImpl';
import { ObtenerDetalleGrupoUseCaseImpl } from '../../application/usecases/ObtenerDetalleGrupoUseCaseImpl';
import { ArchivarGrupoUseCaseImpl } from '../../application/usecases/ArchivarGrupoUseCaseImpl';
import { AgregarMiembroGrupoUseCaseImpl } from '../../application/usecases/AgregarMiembroGrupoUseCaseImpl';
import { RegistrarGastoUseCaseImpl } from '../../application/usecases/RegistrarGastoUseCaseImpl';
import { ListarGastosUseCaseImpl } from '../../application/usecases/ListarGastosUseCaseImpl';
import { EliminarGastoUseCaseImpl } from '../../application/usecases/EliminarGastoUseCaseImpl';
import { PagarParticipacionUseCaseImpl } from '../../application/usecases/PagarParticipacionUseCaseImpl';
import { ObtenerResumenPanelUseCaseImpl } from '../../application/usecases/ObtenerResumenPanelUseCaseImpl';
import { LiquidarBalanceUseCaseImpl } from '../../application/usecases/LiquidarBalanceUseCaseImpl';
import { ListarHistorialUseCaseImpl } from '../../application/usecases/ListarHistorialUseCaseImpl';
import { env } from './env';

// --- Adaptadores de persistencia y seguridad ---
export const usuarioRepository = new PostgresUsuarioRepository(pool);
export const refreshTokenRepository = new PostgresRefreshTokenRepository(pool);
export const grupoRepository = new PostgresGrupoRepository(pool);
export const gastoRepository = new PostgresGastoRepository(pool);
export const balanceRepository = new PostgresBalanceRepository(pool);
export const movimientoRepository = new PostgresMovimientoRepository(pool);

export const passwordHasher = new BcryptPasswordHasher();
export const tokenService = new JwtTokenService(env.jwtSecret, env.jwtExpiracion);

// --- Casos de uso de Usuarios y Auth ---
export const registrarUsuarioUseCase = new RegistrarUsuarioUseCaseImpl(usuarioRepository, passwordHasher);
export const iniciarSesionUseCase = new IniciarSesionUseCaseImpl(
  usuarioRepository,
  refreshTokenRepository,
  passwordHasher,
  tokenService,
);
export const refrescarTokenUseCase = new RefrescarTokenUseCaseImpl(
  usuarioRepository,
  refreshTokenRepository,
  tokenService,
);
export const cerrarSesionUseCase = new CerrarSesionUseCaseImpl(refreshTokenRepository);
export const obtenerPerfilUseCase = new ObtenerPerfilUseCaseImpl(usuarioRepository);
export const actualizarPerfilUseCase = new ActualizarPerfilUseCaseImpl(usuarioRepository);
export const desactivarCuentaUseCase = new DesactivarCuentaUseCaseImpl(usuarioRepository, refreshTokenRepository);
export const activarCuentaUseCase = new ActivarCuentaUseCaseImpl(usuarioRepository);

// --- Casos de uso de Grupos ---
export const crearGrupoUseCase = new CrearGrupoUseCaseImpl(grupoRepository, usuarioRepository, movimientoRepository);
export const listarGruposUsuarioUseCase = new ListarGruposUsuarioUseCaseImpl(grupoRepository);
export const obtenerDetalleGrupoUseCase = new ObtenerDetalleGrupoUseCaseImpl(grupoRepository);
export const archivarGrupoUseCase = new ArchivarGrupoUseCaseImpl(grupoRepository);
export const agregarMiembroGrupoUseCase = new AgregarMiembroGrupoUseCaseImpl(
  grupoRepository,
  usuarioRepository,
  movimientoRepository,
);

// --- Casos de uso de Gastos ---
export const registrarGastoUseCase = new RegistrarGastoUseCaseImpl(
  gastoRepository,
  grupoRepository,
  balanceRepository,
  movimientoRepository,
);
export const listarGastosUseCase = new ListarGastosUseCaseImpl(gastoRepository);
export const eliminarGastoUseCase = new EliminarGastoUseCaseImpl(
  gastoRepository,
  grupoRepository,
  balanceRepository,
  movimientoRepository,
);
export const pagarParticipacionUseCase = new PagarParticipacionUseCaseImpl(
  gastoRepository,
  grupoRepository,
  balanceRepository,
  movimientoRepository,
);

// --- Casos de uso de Panel, Balances e Historial ---
export const obtenerResumenPanelUseCase = new ObtenerResumenPanelUseCaseImpl(grupoRepository, balanceRepository);
export const liquidarBalanceUseCase = new LiquidarBalanceUseCaseImpl(
  balanceRepository,
  grupoRepository,
  movimientoRepository,
);
export const listarHistorialUseCase = new ListarHistorialUseCaseImpl(movimientoRepository);

export const tokenServiceInstancia = tokenService;
