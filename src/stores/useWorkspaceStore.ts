import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WorkspaceState {
  sidebarCollapsed: boolean;
  recentToolSlugs: string[];
  localFavorites: string[];
  commandPaletteOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  recordRecentTool: (slug: string) => void;
  toggleLocalFavorite: (slug: string) => void;
}

const MAX_RECENT_TOOLS = 8;

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      recentToolSlugs: [],
      localFavorites: [],
      commandPaletteOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      recordRecentTool: (slug) =>
        set((s) => ({
          recentToolSlugs: [slug, ...s.recentToolSlugs.filter((item) => item !== slug)].slice(
            0,
            MAX_RECENT_TOOLS
          ),
        })),
      toggleLocalFavorite: (slug) =>
        set((s) => ({
          localFavorites: s.localFavorites.includes(slug)
            ? s.localFavorites.filter((item) => item !== slug)
            : [...s.localFavorites, slug],
        })),
    }),
    {
      name: 'devtools-hub-workspace',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        recentToolSlugs: state.recentToolSlugs,
        localFavorites: state.localFavorites,
      }),
    }
  )
);
