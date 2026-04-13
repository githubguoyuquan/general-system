import pino from "pino";

/** 服务端轻量 JSON 日志；生产环境可由采集端解析 */
export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
});
