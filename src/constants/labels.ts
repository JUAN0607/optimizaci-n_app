import type { ActivityStatus, ActivityType, MeasurementType, Priority } from '@/types/entities';

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  TASK: 'Tarea',
  EVENT: 'Evento',
  REMINDER: 'Recordatorio',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
};

export const STATUS_LABELS: Record<ActivityStatus, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completada',
  SKIPPED: 'Omitida',
  OVERDUE: 'Atrasada',
};

export const MEASUREMENT_LABELS: Record<MeasurementType, string> = {
  CHECKBOX: 'Simple',
  DURATION: 'Duración',
  QUANTITY: 'Cantidad',
  DISTANCE: 'Distancia',
  COUNT: 'Conteo',
};

export const WEEKDAY_LABELS_SHORT = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
export const WEEKDAY_LABELS_LONG = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];
export const MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];
