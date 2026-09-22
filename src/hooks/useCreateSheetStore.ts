import { create } from 'zustand';

interface CreateSheetState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useCreateSheetStore = create<CreateSheetState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
