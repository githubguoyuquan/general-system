import { HOT_CONFIG } from "@/lib/config-keys";
import { getSysConfigParsed } from "@/lib/sys-config";

/** 功能开关 JSON 的结构约定（可扩展字段） */
export type AppFeatureFlags = {
  /** 示例：实验性首页模块 */
  betaHome?: boolean;
  /** 示例：新接口灰度 */
  experimentalApi?: boolean;
  /** 示例：在导航显示「注册」入口（可与 auth.register_open 配合） */
  showRegisterNav?: boolean;
};

/**
 * 读取整份功能开关（来自热配置 app.features，带缓存链路）。
 */
export async function getFeatureFlags(): Promise<AppFeatureFlags> {
  const parsed = await getSysConfigParsed<AppFeatureFlags>(HOT_CONFIG.APP_FEATURES);
  return parsed && typeof parsed === "object" ? parsed : {};
}

/**
 * 判断某功能是否开启（未配置视为 false）。
 */
export async function isFeatureEnabled(name: keyof AppFeatureFlags): Promise<boolean> {
  const flags = await getFeatureFlags();
  return flags[name] === true;
}
