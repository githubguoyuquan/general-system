import { create } from "zustand";

/**
 * 客户端 UI 状态示例（Zustand）：与服务器配置分离，适合做侧边栏、主题草稿等纯前端状态
 */
type UiState = {
  settingsMessage: string | null;
  setSettingsMessage: (m: string | null) => void;
};

export const useUiStore = create<UiState>((set) => ({
  settingsMessage: null,
  setSettingsMessage: (m) => set({ settingsMessage: m }),
}));
