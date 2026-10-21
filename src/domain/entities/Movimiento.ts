export type TipoMovimiento =
  | 'gasto_creado'
  | 'gasto_editado'
  | 'gasto_eliminado'
  | 'pago_registrado'
  | 'miembro_agregado'
  | 'miembro_expulsado';

export interface MovimientoProps {
  id?: number;
  usuarioId: number;
  grupoId: number;
  gastoId?: number | null;
  tipoMovimiento: TipoMovimiento;
  descripcion: string;
  fecha?: Date;
  usuario?: { id: number; nombre: string; email: string };
}

export class Movimiento {
  readonly id?: number;
  readonly usuarioId: number;
  readonly grupoId: number;
  readonly gastoId: number | null;
  readonly tipoMovimiento: TipoMovimiento;
  readonly descripcion: string;
  readonly fecha: Date;
  readonly usuario?: { id: number; nombre: string; email: string };

  constructor(props: MovimientoProps) {
    this.id = props.id;
    this.usuarioId = props.usuarioId;
    this.grupoId = props.grupoId;
    this.gastoId = props.gastoId ?? null;
    this.tipoMovimiento = props.tipoMovimiento;
    this.descripcion = props.descripcion;
    this.fecha = props.fecha ?? new Date();
    this.usuario = props.usuario;
  }
}
