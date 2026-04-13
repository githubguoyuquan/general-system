/**
 * 热配置键名常量：与 seed、管理后台约定一致，避免魔法字符串。
 */
export const HOT_CONFIG = {
  SITE_NAME: "site.name",
  AI_ENABLED: "ai.enabled",
  MAINTENANCE_MODE: "maintenance.mode",
  RATE_LIMIT_GLOBAL: "rate_limit.global_per_minute",
  /** 是否开放自助注册（热配置，即时生效） */
  AUTH_REGISTER_OPEN: "auth.register_open",
  /**
   * 功能开关集合（JSON 对象，如 { "betaHome": true }）
   * 业务代码中请用 isFeatureEnabled()，勿直接解析字符串。
   */
  APP_FEATURES: "app.features",
} as const;
