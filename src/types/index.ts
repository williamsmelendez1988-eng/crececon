export type UserRole = 'admin' | 'setter' | 'socio' | 'cliente';

export interface User {
  uid: string;
  email: string;
  nombre: string;
  rol: UserRole;
  createdAt: Date;
  activo: boolean;
  avatar?: string;
}

export interface Cliente extends User {
  empresa?: string;
  whatsapp?: string;
  pais?: string;
  ciudad?: string;
  proyectoId?: string;
  setterId?: string;
}

export interface Setter extends User {
  ventas: number;
  comisiones: number;
  nivel: 'junior' | 'senior' | 'socio';
}

export interface Proyecto {
  id: string;
  clienteId: string;
  nombre: string;
  descripcion: string;
  estado: 'activo' | 'pausado' | 'completado';
  progreso: {
    informacion: number;
    diseno: number;
    desarrollo: number;
    seo: number;
    publicacion: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Ticket {
  id: string;
  clienteId: string;
  asunto: string;
  mensaje: string;
  estado: 'abierto' | 'en_proceso' | 'resuelto';
  createdAt: Date;
  respuestas?: TicketRespuesta[];
}

export interface TicketRespuesta {
  id: string;
  autorId: string;
  autorNombre: string;
  mensaje: string;
  createdAt: Date;
}

export interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  modulos: Modulo[];
  activo: boolean;
}

export interface Modulo {
  id: string;
  titulo: string;
  orden: number;
  lecciones: Leccion[];
}

export interface Leccion {
  id: string;
  titulo: string;
  descripcion: string;
  videoUrl: string;
  duracion: number;
  orden: number;
}

export interface ProgresoLeccion {
  leccionId: string;
  completado: boolean;
  porcentajeVisto: number;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  nombre: string;
  email: string;
  whatsapp: string;
  empresa?: string;
  servicio: string;
  mensaje: string;
  estado: 'nuevo' | 'contactado' | 'propuesta' | 'cerrado' | 'perdido';
  setterId?: string;
  createdAt: Date;
}
