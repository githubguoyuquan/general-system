/**
 * 全局 MOCK 数据：供各业务模板与服务层演示，可整体替换为真实 API。
 */

export type MockUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "guest";
  status: "active" | "disabled";
  department: string;
  createdAt: string;
};

export type ActivityItem = {
  id: string;
  action: string;
  operator: string;
  target: string;
  at: string;
};

export type ChartPoint = { date: string; value: number };

/** 表格 CRUD 初始用户（会被内存服务复制后可改） */
export const MOCK_USERS_INITIAL: MockUser[] = [
  {
    id: "u1",
    email: "zhang@example.com",
    name: "张三",
    role: "admin",
    status: "active",
    department: "研发",
    createdAt: "2025-01-02T08:00:00.000Z",
  },
  {
    id: "u2",
    email: "li@example.com",
    name: "李四",
    role: "user",
    status: "active",
    department: "产品",
    createdAt: "2025-01-08T10:20:00.000Z",
  },
  {
    id: "u3",
    email: "wang@example.com",
    name: "王五",
    role: "user",
    status: "disabled",
    department: "运营",
    createdAt: "2025-01-15T14:00:00.000Z",
  },
  {
    id: "u4",
    email: "zhao@example.com",
    name: "赵六",
    role: "guest",
    status: "active",
    department: "市场",
    createdAt: "2025-02-01T09:30:00.000Z",
  },
  {
    id: "u5",
    email: "chen@example.com",
    name: "陈七",
    role: "user",
    status: "active",
    department: "研发",
    createdAt: "2025-02-10T11:00:00.000Z",
  },
  {
    id: "u6",
    email: "liu@example.com",
    name: "刘八",
    role: "user",
    status: "active",
    department: "客服",
    createdAt: "2025-02-18T16:45:00.000Z",
  },
  {
    id: "u7",
    email: "sun@example.com",
    name: "孙九",
    role: "user",
    status: "active",
    department: "产品",
    createdAt: "2025-03-01T13:15:00.000Z",
  },
  {
    id: "u8",
    email: "zhou@example.com",
    name: "周十",
    role: "guest",
    status: "disabled",
    department: "市场",
    createdAt: "2025-03-05T08:50:00.000Z",
  },
];

export const MOCK_DEPARTMENTS = ["研发", "产品", "运营", "市场", "客服", "管理"] as const;

export const MOCK_ROLE_OPTIONS = [
  { value: "admin", label: "管理员" },
  { value: "user", label: "普通用户" },
  { value: "guest", label: "访客" },
] as const;

export const MOCK_STATUS_OPTIONS = [
  { value: "active", label: "启用" },
  { value: "disabled", label: "停用" },
] as const;

/** 看板：顶部统计卡片 */
export const MOCK_STAT_CARDS = [
  {
    key: "users",
    title: "用户总数",
    value: "12,480",
    delta: "+12.5%",
    trend: "up" as const,
    icon: "users" as const,
    hint: "较上月",
  },
  {
    key: "orders",
    title: "本月订单",
    value: "3,402",
    delta: "+4.2%",
    trend: "up" as const,
    icon: "cart" as const,
    hint: "较上月",
  },
  {
    key: "active",
    title: "七日活跃",
    value: "8,921",
    delta: "-1.1%",
    trend: "down" as const,
    icon: "activity" as const,
    hint: "较上周",
  },
  {
    key: "revenue",
    title: "预估营收(万)",
    value: "186.4",
    delta: "+8.0%",
    trend: "up" as const,
    icon: "revenue" as const,
    hint: "较上月",
  },
];

/** 近 7 日用户增长（折线图） */
export const MOCK_USER_GROWTH: ChartPoint[] = [
  { date: "04-06", value: 120 },
  { date: "04-07", value: 132 },
  { date: "04-08", value: 128 },
  { date: "04-09", value: 145 },
  { date: "04-10", value: 151 },
  { date: "04-11", value: 168 },
  { date: "04-12", value: 175 },
];

/** 最近操作记录 */
export const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: "a1", action: "创建用户", operator: "admin@example.com", target: "zhang@example.com", at: "2025-04-12T09:12:00.000Z" },
  { id: "a2", action: "修改配置", operator: "admin@example.com", target: "site.name", at: "2025-04-12T08:55:00.000Z" },
  { id: "a3", action: "禁用账号", operator: "demo@example.com", target: "zhou@example.com", at: "2025-04-11T17:40:00.000Z" },
  { id: "a4", action: "导出报表", operator: "operator@example.com", target: "users_202504.csv", at: "2025-04-11T15:20:00.000Z" },
  { id: "a5", action: "登录失败告警", operator: "system", target: "IP 192.168.1.x", at: "2025-04-11T11:03:00.000Z" },
];

/** 万能表单：城市搜索候选项 */
export const MOCK_CITY_OPTIONS = [
  { value: "beijing", label: "北京市" },
  { value: "shanghai", label: "上海市" },
  { value: "guangzhou", label: "广州市" },
  { value: "shenzhen", label: "深圳市" },
  { value: "hangzhou", label: "杭州市" },
  { value: "chengdu", label: "成都市" },
  { value: "wuhan", label: "武汉市" },
  { value: "xian", label: "西安市" },
];

/** 万能表单：多选标签 */
export const MOCK_SKILL_OPTIONS = ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Docker", "Kubernetes"] as const;
