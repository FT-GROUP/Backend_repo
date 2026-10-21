export interface BalanceProps {
  id?: number;
  grupoId: number;
  deudorId: number;
  acreedorId: number;
  monto: number;
  fechaActualizacion?: Date;
  deudor?: { id: number; nombre: string; email: string };
  acreedor?: { id: number; nombre: string; email: string };
}

export class Balance {
  readonly id?: number;
  readonly grupoId: number;
  readonly deudorId: number;
  readonly acreedorId: number;
  readonly monto: number;
  readonly fechaActualizacion: Date;
  readonly deudor?: { id: number; nombre: string; email: string };
  readonly acreedor?: { id: number; nombre: string; email: string };

  constructor(props: BalanceProps) {
    this.id = props.id;
    this.grupoId = props.grupoId;
    this.deudorId = props.deudorId;
    this.acreedorId = props.acreedorId;
    this.monto = props.monto;
    this.fechaActualizacion = props.fechaActualizacion ?? new Date();
    this.deudor = props.deudor;
    this.acreedor = props.acreedor;
  }
}
