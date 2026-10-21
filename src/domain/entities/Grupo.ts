export interface GrupoProps {
  id?: number;
  nombre: string;
  descripcion?: string | null;
  icono?: string | null;
  ciudad?: string | null;
  lat?: number | null;
  lng?: number | null;
  creadoPor: number;
  fechaCreacion?: Date;
  estado?: 'activo' | 'archivado';
}

export class Grupo {
  readonly id?: number;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly icono: string;
  readonly ciudad: string | null;
  readonly lat: number | null;
  readonly lng: number | null;
  readonly creadoPor: number;
  readonly fechaCreacion: Date;
  readonly estado: 'activo' | 'archivado';

  constructor(props: GrupoProps) {
    this.id = props.id;
    this.nombre = props.nombre;
    this.descripcion = props.descripcion ?? null;
    this.icono = props.icono || 'building';
    this.ciudad = props.ciudad ?? null;
    this.lat = props.lat ?? null;
    this.lng = props.lng ?? null;
    this.creadoPor = props.creadoPor;
    this.fechaCreacion = props.fechaCreacion ?? new Date();
    this.estado = props.estado ?? 'activo';
  }
}
