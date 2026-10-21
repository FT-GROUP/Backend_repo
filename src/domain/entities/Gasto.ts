export type TipoDivision = 'equitativa' | 'personalizada';
export type OrigenRegistro = 'manual' | 'ocr';

export interface GastoProps {
  id?: number;
  grupoId: number;
  pagadorId: number;
  descripcion: string;
  montoTotal: number;
  fechaGasto: string;
  categoria: string;
  tipoDivision: TipoDivision;
  comprobanteUrl?: string | null;
  origenRegistro?: OrigenRegistro;
  fechaRegistro?: Date;
  pagador?: {
    id: number;
    nombre: string;
    email: string;
  };
  grupo?: {
    id: number;
    nombre: string;
  };
  divisiones?: Array<{
    id?: number;
    usuarioId: number;
    montoAsignado: number;
    estadoPago: 'pendiente' | 'pagado';
    fechaPago?: Date | null;
    usuario?: {
      id: number;
      nombre: string;
      email: string;
    };
  }>;
}

export class Gasto {
  readonly id?: number;
  readonly grupoId: number;
  readonly pagadorId: number;
  readonly descripcion: string;
  readonly montoTotal: number;
  readonly fechaGasto: string;
  readonly categoria: string;
  readonly tipoDivision: TipoDivision;
  readonly comprobanteUrl: string | null;
  readonly origenRegistro: OrigenRegistro;
  readonly fechaRegistro: Date;
  readonly pagador?: {
    id: number;
    nombre: string;
    email: string;
  };
  readonly grupo?: {
    id: number;
    nombre: string;
  };
  readonly divisiones?: Array<{
    id?: number;
    usuarioId: number;
    montoAsignado: number;
    estadoPago: 'pendiente' | 'pagado';
    fechaPago?: Date | null;
    usuario?: {
      id: number;
      nombre: string;
      email: string;
    };
  }>;

  constructor(props: GastoProps) {
    this.id = props.id;
    this.grupoId = props.grupoId;
    this.pagadorId = props.pagadorId;
    this.descripcion = props.descripcion;
    this.montoTotal = props.montoTotal;
    this.fechaGasto = props.fechaGasto;
    this.categoria = props.categoria;
    this.tipoDivision = props.tipoDivision;
    this.comprobanteUrl = props.comprobanteUrl ?? null;
    this.origenRegistro = props.origenRegistro ?? 'manual';
    this.fechaRegistro = props.fechaRegistro ?? new Date();
    this.pagador = props.pagador;
    this.grupo = props.grupo;
    this.divisiones = props.divisiones;
  }
}
