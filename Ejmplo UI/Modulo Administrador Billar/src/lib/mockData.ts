import { Mesa, Sesion, Pago, Reserva } from './types';

export const initialMesas: Mesa[] = [
  { id: '1', numero: 1, tipo: 'pool', estado: 'ocupada', tarifaPorHora: 15000 },
  { id: '2', numero: 2, tipo: 'pool', estado: 'disponible', tarifaPorHora: 15000 },
  { id: '3', numero: 3, tipo: 'pool', estado: 'disponible', tarifaPorHora: 15000 },
  { id: '4', numero: 4, tipo: 'snooker', estado: 'ocupada', tarifaPorHora: 25000 },
  { id: '5', numero: 5, tipo: 'pool', estado: 'reservada', tarifaPorHora: 15000 },
  { id: '6', numero: 6, tipo: 'pool', estado: 'disponible', tarifaPorHora: 15000 },
  { id: '7', numero: 7, tipo: 'carambola', estado: 'disponible', tarifaPorHora: 20000 },
  { id: '8', numero: 8, tipo: 'pool', estado: 'mantenimiento', tarifaPorHora: 15000 },
];

export const initialSesiones: Sesion[] = [
  {
    id: 's1',
    mesaId: '1',
    numeroMesa: 1,
    cliente: 'Carlos Pérez',
    horaInicio: new Date(Date.now() - 45 * 60 * 1000), // 45 min ago
    activa: true,
  },
  {
    id: 's2',
    mesaId: '4',
    numeroMesa: 4,
    cliente: 'Ana Gómez',
    horaInicio: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
    activa: true,
  },
];

export const initialPagos: Pago[] = [
  {
    id: 'p1',
    sesionId: 's100',
    numeroMesa: 2,
    cliente: 'Juan Rodríguez',
    monto: 30000,
    metodoPago: 'efectivo',
    fecha: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'p2',
    sesionId: 's101',
    numeroMesa: 3,
    cliente: 'María López',
    monto: 15000,
    metodoPago: 'tarjeta',
    fecha: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: 'p3',
    sesionId: 's102',
    numeroMesa: 1,
    cliente: 'Pedro Martínez',
    monto: 22500,
    metodoPago: 'efectivo',
    fecha: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: 'p4',
    sesionId: 's103',
    numeroMesa: 4,
    cliente: 'Sofía Hernández',
    monto: 50000,
    metodoPago: 'transferencia',
    fecha: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: 'p5',
    sesionId: 's104',
    numeroMesa: 2,
    cliente: 'Luis García',
    monto: 15000,
    metodoPago: 'efectivo',
    fecha: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'p6',
    sesionId: 's105',
    numeroMesa: 3,
    cliente: 'Carmen Díaz',
    monto: 30000,
    metodoPago: 'tarjeta',
    fecha: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
];

export const initialReservas: Reserva[] = [
  {
    id: 'r1',
    mesaId: '5',
    numeroMesa: 5,
    cliente: 'Roberto Silva',
    telefono: '555-1234',
    fecha: new Date(),
    horaInicio: '18:00',
    duracionHoras: 2,
    confirmada: true,
  },
  {
    id: 'r2',
    mesaId: '2',
    numeroMesa: 2,
    cliente: 'Laura Morales',
    telefono: '555-5678',
    fecha: new Date(Date.now() + 24 * 60 * 60 * 1000),
    horaInicio: '15:00',
    duracionHoras: 1,
    confirmada: false,
  },
  {
    id: 'r3',
    mesaId: '7',
    numeroMesa: 7,
    cliente: 'Diego Torres',
    telefono: '555-9012',
    fecha: new Date(Date.now() + 24 * 60 * 60 * 1000),
    horaInicio: '20:00',
    duracionHoras: 3,
    confirmada: true,
  },
];
