import { create } from 'zustand';

interface ActivePickerState {
  activeId: string | null;
  open: (id: string) => void;
  close: (id: string) => void;
}

// Only one DateTimeField's picker may be open at a time — without this, two adjacent
// fields (e.g. Fecha/Hora) could both be opened, and their inline iOS spinners would
// render on top of each other, blocking input entirely.
export const useActivePickerStore = create<ActivePickerState>((set) => ({
  activeId: null,
  open: (id) => set({ activeId: id }),
  close: (id) => set((s) => (s.activeId === id ? { activeId: null } : {})),
}));
