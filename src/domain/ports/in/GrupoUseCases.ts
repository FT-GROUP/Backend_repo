import { Grupo } from '../../entities/Grupo';
import { GrupoConMiembros } from '../out/GrupoRepository';

export interface CrearGrupoDTO {
  nombre: string;
  descripcion?: string | null;
  icono?: string | null;
  ciudad?: string | null;
  lat?: number | null;
  lng?: number | null;
  integrantes?: Array<{ nombre: string; email?: string | null }>;
}

export interface AgregarMiembroDTO {
  grupoId: number;
  email: string;
  nombre?: string;
}

export interface CrearGrupoUseCase {
  ejecutar(usuarioId: number, dto: CrearGrupoDTO): Promise<GrupoConMiembros>;
}

export interface ListarGruposUsuarioUseCase {
  ejecutar(usuarioId: number): Promise<GrupoConMiembros[]>;
}

export interface ObtenerDetalleGrupoUseCase {
  ejecutar(usuarioId: number, grupoId: number): Promise<GrupoConMiembros>;
}

export interface ArchivarGrupoUseCase {
  ejecutar(usuarioId: number, grupoId: number): Promise<void>;
}

export interface AgregarMiembroGrupoUseCase {
  ejecutar(usuarioId: number, dto: AgregarMiembroDTO): Promise<void>;
}
