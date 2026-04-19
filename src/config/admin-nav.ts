import { BookMarked, FileSpreadsheet, LayoutDashboard, Settings, Users } from "lucide-react";

export const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "统计看板", icon: LayoutDashboard },
  { href: "/admin/crud", label: "用户 CRUD", icon: Users },
  { href: "/admin/advanced-form", label: "复杂表单", icon: FileSpreadsheet },
  { href: "/admin/dictionaries", label: "数据字典", icon: BookMarked },
  { href: "/admin/settings", label: "系统配置", icon: Settings },
] as const;
