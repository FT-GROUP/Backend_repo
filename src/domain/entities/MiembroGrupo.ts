export type RolMiembro = 'administrador' | 'miembro';
export type EstadoMiembro = 'activo' | 'expulsado' | 'salido';

export interface MiembroGrupoProps {
  id?: number;
  grupoId: number;
  usuarioId: number;
  rol?: RolMiembro;
  fechaUnion?: Date;
  estado?: EstadoMiembro;
  usuario?: {
    id: number;
    nombre: string;
    email: string;
  };
}

export class MiembroGrupo {
  readonly id?: number;
  readonly grupoId: number;
  readonly usuarioId: number;
  readonly rol: RolMiembro;
  readonly fechaUnion: Date;
  readonly estado: EstadoMiembro;
  readonly usuario?: {
    id: number;
    nombre: string;
    email: string;
  };

  constructor(props: MiembroGrupoProps) {
    this.id = props.id;
    this.grupoId = props.grupoId;
    this.usuarioId = props.usuarioId;
    this.rol = props.rol ?? 'miembro';
    this.fechaUnion = props.fechaUnion ?? new Date();
    this.estado = props.estado ?? 'activo';
    this.usuario = props.usuario;
  }
}
