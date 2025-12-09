export interface Mesa {
  id: number;
  category_id: number;
  code: string;
  description?: string;
  status: number; // 1=disponible, 2=ocupada, 3=mantenimiento
}

export interface Categoria {
  id: number;
  name: string;
  description?: string;
  base_price: number;
  status: number;
}

export interface Reserva {
  id: number;
  user_id: number;
  table_id: number;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: number; // 1=pendiente, 2=confirmada, 3=cancelada, 4=expirada
  created_at: string;
}

export interface Sesion {
  id: number;
  user_id?: number;
  reservation_id?: number;
  table_id: number;
  start_time: string;
  end_time?: string;
  session_type: number; // 1=reserva, 2=walk-in
  final_cost: number;
  status: number; // 1=activa, 2=cerrada, 3=cancelada
}

export interface Pago {
  id: number;
  session_id: number;
  amount: number;
  method: number; // 1=efectivo, 2=tarjeta, 3=qr, 4=otro
  created_at: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
