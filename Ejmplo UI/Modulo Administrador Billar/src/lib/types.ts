export type MesaEstado = 'disponible' | 'ocupada' | 'reservada' | 'mantenimiento';
export type TipoMesa = 'pool' | 'snooker' | 'carambola';
export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia';

export interface Mesa {
  id: string;
  numero: number;
  tipo: TipoMesa;
  estado: MesaEstado;
  tarifaPorHora: number;
}

export interface Sesion {
  id: string;
  mesaId: string;
  numeroMesa: number;
  cliente: string;
  horaInicio: Date;
  horaFin?: Date;
  duracionMinutos?: number;
  monto?: number;
  activa: boolean;
}

export interface Pago {
  id: string;
  sesionId: string;
  numeroMesa: number;
  cliente: string;
  monto: number;
  metodoPago: MetodoPago;
  fecha: Date;
}

export interface Reserva {
  id: string;
  mesaId: string;
  numeroMesa: number;
  cliente: string;
  telefono: string;
  fecha: Date;
  horaInicio: string;
  duracionHoras: number;
  confirmada: boolean;
}
