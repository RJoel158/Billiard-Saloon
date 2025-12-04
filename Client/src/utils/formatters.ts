export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('es-BO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const formatTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const getTableStatusLabel = (status: number): string => {
  const labels: Record<number, string> = {
    1: 'Disponible',
    2: 'Ocupada',
    3: 'Mantenimiento',
  };
  return labels[status] || 'Desconocido';
};

export const getTableStatusColor = (status: number): string => {
  const colors: Record<number, string> = {
    1: 'green',
    2: 'red',
    3: 'orange',
  };
  return colors[status] || 'gray';
};

export const getReservationStatusLabel = (status: number): string => {
  const labels: Record<number, string> = {
    1: 'Pendiente',
    2: 'Confirmada',
    3: 'Cancelada',
    4: 'Expirada',
  };
  return labels[status] || 'Desconocido';
};

export const getReservationStatusColor = (status: number): string => {
  const colors: Record<number, string> = {
    1: 'orange',
    2: 'green',
    3: 'red',
    4: 'gray',
  };
  return colors[status] || 'gray';
};

export const getSessionStatusLabel = (status: number): string => {
  const labels: Record<number, string> = {
    1: 'Activa',
    2: 'Cerrada',
    3: 'Cancelada',
  };
  return labels[status] || 'Desconocido';
};

export const getPaymentMethodLabel = (method: number): string => {
  const labels: Record<number, string> = {
    1: 'Efectivo',
    2: 'Tarjeta',
    3: 'QR',
    4: 'Otro',
  };
  return labels[method] || 'Desconocido';
};

export const calculateDuration = (startTime: string, endTime?: string): string => {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  const diffMs = end.getTime() - start.getTime();
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
