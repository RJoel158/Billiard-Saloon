// Exportar todos los servicios desde un único punto
export { authService } from './auth.service';
export { mesasService } from './mesas.service';
export { categoriasService } from './categorias.service';
export { sesionesService } from './sesiones.service';
export { pagosService } from './pagos.service';
export { reservasService } from './reservas.service';
export { settingsService } from './settings.service';

// Exportar tipos comunes
export type { PaginatedResponse } from './mesas.service';
export type { Mesa, CreateMesaDto, UpdateMesaDto } from './mesas.service';
export type { Categoria } from './categorias.service';
export type { Session, CreateSessionDto, UpdateSessionDto } from './sesiones.service';
export type { Payment, CreatePaymentDto } from './pagos.service';
export type { Reservation, CreateReservationDto, UpdateReservationDto } from './reservas.service';
export type { SystemSetting } from './settings.service';
