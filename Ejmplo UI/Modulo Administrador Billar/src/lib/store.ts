import { create } from 'zustand';
import { Mesa, Sesion, Pago, Reserva } from './types';
import { initialMesas, initialSesiones, initialPagos, initialReservas } from './mockData';

interface BillarStore {
  mesas: Mesa[];
  sesiones: Sesion[];
  pagos: Pago[];
  reservas: Reserva[];
  
  // Mesas
  updateMesaEstado: (id: string, estado: Mesa['estado']) => void;
  
  // Sesiones
  iniciarSesion: (mesaId: string, cliente: string) => void;
  finalizarSesion: (sesionId: string, metodoPago: Pago['metodoPago']) => void;
  
  // Pagos
  agregarPago: (pago: Pago) => void;
  
  // Reservas
  agregarReserva: (reserva: Reserva) => void;
  confirmarReserva: (id: string) => void;
  cancelarReserva: (id: string) => void;
}

export const useBillarStore = create<BillarStore>((set, get) => ({
  mesas: initialMesas,
  sesiones: initialSesiones,
  pagos: initialPagos,
  reservas: initialReservas,
  
  updateMesaEstado: (id, estado) => {
    set(state => ({
      mesas: state.mesas.map(mesa => 
        mesa.id === id ? { ...mesa, estado } : mesa
      ),
    }));
  },
  
  iniciarSesion: (mesaId, cliente) => {
    const mesa = get().mesas.find(m => m.id === mesaId);
    if (!mesa) return;
    
    const nuevaSesion: Sesion = {
      id: `s${Date.now()}`,
      mesaId,
      numeroMesa: mesa.numero,
      cliente,
      horaInicio: new Date(),
      activa: true,
    };
    
    set(state => ({
      sesiones: [...state.sesiones, nuevaSesion],
      mesas: state.mesas.map(m => 
        m.id === mesaId ? { ...m, estado: 'ocupada' } : m
      ),
    }));
  },
  
  finalizarSesion: (sesionId, metodoPago) => {
    const sesion = get().sesiones.find(s => s.id === sesionId);
    if (!sesion) return;
    
    const mesa = get().mesas.find(m => m.id === sesion.mesaId);
    if (!mesa) return;
    
    const horaFin = new Date();
    const duracionMinutos = Math.ceil((horaFin.getTime() - sesion.horaInicio.getTime()) / (1000 * 60));
    const monto = Math.ceil((duracionMinutos / 60) * mesa.tarifaPorHora);
    
    const nuevoPago: Pago = {
      id: `p${Date.now()}`,
      sesionId,
      numeroMesa: sesion.numeroMesa,
      cliente: sesion.cliente,
      monto,
      metodoPago,
      fecha: horaFin,
    };
    
    set(state => ({
      sesiones: state.sesiones.map(s => 
        s.id === sesionId 
          ? { ...s, horaFin, duracionMinutos, monto, activa: false }
          : s
      ),
      mesas: state.mesas.map(m => 
        m.id === sesion.mesaId ? { ...m, estado: 'disponible' } : m
      ),
      pagos: [nuevoPago, ...state.pagos],
    }));
  },
  
  agregarPago: (pago) => {
    set(state => ({
      pagos: [pago, ...state.pagos],
    }));
  },
  
  agregarReserva: (reserva) => {
    set(state => ({
      reservas: [...state.reservas, reserva],
      mesas: state.mesas.map(m => 
        m.id === reserva.mesaId ? { ...m, estado: 'reservada' } : m
      ),
    }));
  },
  
  confirmarReserva: (id) => {
    set(state => ({
      reservas: state.reservas.map(r => 
        r.id === id ? { ...r, confirmada: true } : r
      ),
    }));
  },
  
  cancelarReserva: (id) => {
    const reserva = get().reservas.find(r => r.id === id);
    if (!reserva) return;
    
    set(state => ({
      reservas: state.reservas.filter(r => r.id !== id),
      mesas: state.mesas.map(m => 
        m.id === reserva.mesaId ? { ...m, estado: 'disponible' } : m
      ),
    }));
  },
}));
