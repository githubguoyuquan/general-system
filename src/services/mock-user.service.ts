import { MOCK_USERS_INITIAL, type MockUser } from "@/lib/mock";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 内存中的 MOCK 用户表（演示 CRUD，刷新页面会重置） */
let store: MockUser[] = MOCK_USERS_INITIAL.map((u) => ({ ...u }));

export type ListMockUsersParams = {
  q?: string;
  role?: string;
  status?: string;
  page: number;
  pageSize: number;
};

export type ListMockUsersResult = { items: MockUser[]; total: number };

/**
 * 模拟服务端分页列表：支持关键词、角色、状态筛选。
 */
export async function listMockUsers(params: ListMockUsersParams): Promise<ListMockUsersResult> {
  await delay(450);
  let data = [...store];
  const q = params.q?.trim().toLowerCase();
  if (q) {
    data = data.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.department.includes(q)
    );
  }
  if (params.role && params.role !== "all") {
    data = data.filter((u) => u.role === params.role);
  }
  if (params.status && params.status !== "all") {
    data = data.filter((u) => u.status === params.status);
  }
  const total = data.length;
  const start = (params.page - 1) * params.pageSize;
  const items = data.slice(start, start + params.pageSize);
  return { items, total };
}

export async function getMockUser(id: string): Promise<MockUser | null> {
  await delay(200);
  return store.find((u) => u.id === id) ?? null;
}

export type SaveMockUserInput = Omit<MockUser, "id" | "createdAt"> & { id?: string };

export async function saveMockUser(input: SaveMockUserInput): Promise<MockUser> {
  await delay(400);
  if (input.id) {
    const idx = store.findIndex((u) => u.id === input.id);
    if (idx === -1) throw new Error("用户不存在");
    const prev = store[idx]!;
    const next: MockUser = {
      ...prev,
      email: input.email,
      name: input.name,
      role: input.role,
      status: input.status,
      department: input.department,
    };
    store[idx] = next;
    return next;
  }
  const id = `u${Date.now()}`;
  const row: MockUser = {
    id,
    email: input.email,
    name: input.name,
    role: input.role,
    status: input.status,
    department: input.department,
    createdAt: new Date().toISOString(),
  };
  store = [row, ...store];
  return row;
}

export async function deleteMockUser(id: string): Promise<void> {
  await delay(350);
  const before = store.length;
  store = store.filter((u) => u.id !== id);
  if (store.length === before) throw new Error("用户不存在");
}

/** 单元测试 / Storybook 可调用 */
export function resetMockUserStore() {
  store = MOCK_USERS_INITIAL.map((u) => ({ ...u }));
}
