import type { MeasurementType } from '@/types/entities';

// Fixed at habit creation so the daily log screen never has to ask the user to pick a
// unit again — it just displays whichever of these the habit was created with.
export const UNIT_OPTIONS: Record<MeasurementType, string[]> = {
  CHECKBOX: [],
  DISTANCE: ['m', 'km', 'mi'],
  DURATION: ['seg', 'min', 'h', 'días'],
  QUANTITY: ['vasos', 'ml', 'litros', 'páginas', 'calorías', 'unidades'],
  COUNT: ['veces', 'repeticiones', 'unidades'],
};
