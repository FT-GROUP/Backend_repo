import { Grupo } from '../../entities/Grupo';
import { MiembroGrupo } from '../../entities/MiembroGrupo';

export interface GrupoConMiembros extends Grupo {
  miembros: MiembroGrupo[];
  rol?: string;
  totalGastos?: number;
  numGastos?: number;
  miBalance?: number;
}

export interface GrupoRepository {
  crear(grupo: Grupo, miembros: Array<{ usuarioId: number; rol: 'administrador' | 'miembro' }>): Promise<Grupo>;
  buscarPorId(id: number): Promise<Grupo | null>;
  obtenerDetalle(id: number, usuarioId?: number): Promise<GrupoConMiembros | null>;
  listarPorUsuario(usuarioId: number): Promise<GrupoConMiembros[]>;
  esMiembro(grupoId: number, usuarioId: number): Promise<boolean>;
  obtenerRol(grupoId: number, usuarioId: number): Promise<'administrador' | 'miembro' | null>;
  agregarMiembro(miembro: MiembroGrupo): Promise<MiembroGrupo>;
  cambiarEstadoMiembro(grupoId: number, usuarioId: number, estado: 'activo' | 'expulsado' | 'salido'): Promise<void>;
  archivarGrupo(id: number): Promise<void>;
}
