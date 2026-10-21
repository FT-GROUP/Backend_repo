export type EstadoPago = 'pendiente' | 'pagado';

export interface ParticipacionGastoProps {
  id?: number;
  gastoId: number;
  usuarioId: number;
  montoAsignado: number;
  estadoPago?: EstadoPago;
  fechaPago?: Date | null;
  usuario?: {
    id: number;
    nombre: string;
    email: string;
  };
}

export class ParticipacionGasto {
  readonly id?: number;
  readonly gastoId: number;
  readonly usuarioId: number;
  readonly montoAsignado: number;
  readonly estadoPago: EstadoPago;
  readonly fechaPago: Date | null;
  readonly usuario?: {
    id: number;
    nombre: string;
    email: string;
  };

  constructor(props: ParticipacionGastoProps) {
    this.id = props.id;
    this.gastoId = props.gastoId;
    this.usuarioId = props.usuarioId;
    this.montoAsignado = props.montoAsignado;
    this.estadoPago = props.estadoPago ?? 'pendiente';
    this.fechaPago = props.fechaPago ?? null;
    this.usuario = props.usuario;
  }
}
