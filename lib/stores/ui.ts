import { create } from "zustand";

/**
 * Global *UI* state only — never server data (that's TanStack Query) and never
 * URL-derived state (that's nuqs). Think: chrome that outlives a single page,
 * like the sidebar or a command palette.
 */
type UiState = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  commandOpen: false,
  setCommandOpen: (commandOpen) => set({ commandOpen }),
}));
