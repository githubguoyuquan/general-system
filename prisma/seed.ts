import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * MOCK 数据：开发/演示用账号与热配置。
 * 运行：npm run db:seed
 */
async function main() {
  const adminHash = await bcrypt.hash("Admin123!", 12);
  const userHash = await bcrypt.hash("User123!", 12);

  const mockUsers = [
    { email: "admin@example.com", name: "系统管理员", role: "admin", passwordHash: adminHash },
    { email: "demo@example.com", name: "演示用户甲", role: "user", passwordHash: userHash },
    { email: "operator@example.com", name: "运维演示", role: "user", passwordHash: userHash },
    { email: "viewer@example.com", name: "只读演示", role: "user", passwordHash: userHash },
  ];

  for (const u of mockUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, passwordHash: u.passwordHash },
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash: u.passwordHash,
      },
    });
  }

  const defaults: { key: string; value: unknown; description: string }[] = [
    { key: "site.name", value: "通用业务平台（MOCK）", description: "网站名称（热配置）" },
    { key: "site.subtitle", value: "内置 MOCK 用户与配置，便于联调", description: "副标题/标语（示例）" },
    { key: "ai.enabled", value: false, description: "AI 接口总开关（热配置）" },
    { key: "maintenance.mode", value: false, description: "维护模式（热配置）" },
    { key: "rate_limit.global_per_minute", value: 120, description: "全局限流：每分钟最大请求数（演示）" },
    { key: "auth.register_open", value: true, description: "是否开放自助注册（热配置，即时生效）" },
    {
      key: "app.features",
      value: {
        betaHome: true,
        experimentalApi: false,
        showRegisterNav: true,
      },
      description: "功能开关 JSON（Feature Flags，后台可改）",
    },
    {
      key: "mock.meta",
      value: {
        version: "1.0.0",
        seededAt: new Date().toISOString(),
        note: "可删除本键，仅作 MOCK 标记",
      },
      description: "MOCK 元数据（JSON，演示用）",
    },
  ];

  for (const row of defaults) {
    await prisma.systemConfig.upsert({
      where: { key: row.key },
      update: { value: JSON.stringify(row.value), description: row.description },
      create: {
        key: row.key,
        value: JSON.stringify(row.value),
        description: row.description,
      },
    });
  }

  console.log("\n========== MOCK 数据已写入 ==========");
  console.log("管理员  admin@example.com  / Admin123!");
  console.log("普通用户 demo@example.com  / User123!");
  console.log("         operator@example.com / User123!");
  console.log("         viewer@example.com   / User123!");
  console.log("=====================================\n");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
