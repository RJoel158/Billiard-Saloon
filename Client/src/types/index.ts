// User types
export interface User {
  id: number;
  role_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  created_at?: string;
  status?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Table types
export interface TableCategory {
  id: number;
  name: string;
  description?: string;
  base_price: number;
  status?: number;
}

export interface BilliardTable {
  id: number;
  category_id: number;
  code: string;
  description?: string;
  status: number; // 1=available, 2=occupied, 3=maintenance
}

// Session types
export interface Session {
  id: number;
  user_id?: number;
  reservation_id?: number;
  table_id: number;
  start_time: string;
  end_time?: string;
  session_type: number; // 1=reservation, 2=walk_in
  final_cost: number;
  status: number; // 1=active, 2=closed, 3=cancelled
}

// Reservation types
export interface Reservation {
  id: number;
  user_id: number;
  table_id: number;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: number; // 1=pending, 2=confirmed, 3=cancelled, 4=expired
  created_at?: string;
}

// Payment types
export interface Payment {
  id: number;
  session_id: number;
  amount: number;
  method: number; // 1=cash, 2=card, 3=qr, 4=other
  receipt_image?: string;
  created_at?: string;
}

// Penalty types
export interface Penalty {
  id: number;
  session_id: number;
  amount: number;
  reason: string;
  applied_by: number;
  first_name?: string;
  last_name?: string;
  created_at?: string;
}

// Dynamic pricing types
export interface DynamicPricing {
  id: number;
  category_id: number;
  type: number; // 1=peak_hour, 2=weekend, 3=high_demand, 4=promotion, 5=event
  percentage: number;
  time_start?: string;
  time_end?: string;
  weekday?: number; // 1=Mon ... 7=Sun
  date_start?: string;
  date_end?: string;
  is_active: boolean;
}

// Role types
export interface Role {
  id: number;
  name: string;
}

// Dashboard stats
export interface DashboardStats {
  activeSessions: number;
  availableTables: number;
  occupiedTables: number;
  pendingReservations: number;
  todayRevenue: number;
  monthRevenue: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: any;
}
