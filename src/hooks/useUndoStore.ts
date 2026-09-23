import { create } from 'zustand';

interface UndoState {
  message: string | null;
  onUndo: (() => void) | null;
  show: (message: string, onUndo: () => void) => void;
  hide: () => void;
}

// Deliberately scoped to deletions with no cascading children (activities, goals) —
// restoring a habit or routine would also need to resurrect its logs/items to be a
// faithful "undo", which the current delete flow doesn't capture.
export const useUndoStore = create<UndoState>((set) => ({
  message: null,
  onUndo: null,
  show: (message, onUndo) => set({ message, onUndo }),
  hide: () => set({ message: null, onUndo: null }),
}));
