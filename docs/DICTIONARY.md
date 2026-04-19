# 数据字典模块说明

本文档描述「通用数据字典」功能：与 **系统热配置（`SystemConfig`）分表存储**，用于树形层级、强类型取值，以及全站可复用的字典项与下拉选项。

---

## 与 SystemConfig 的区别

| | SystemConfig（系统配置） | Dictionary（数据字典） |
|---|-------------------------|------------------------|
| 用途 | Key-Value 热配置、功能开关、站点参数 | 分类树、码表、业务可选项（如支付方式、状态枚举展示） |
| 结构 | 扁平一行一键 | **自关联树**（`parentId`），支持无限层级 |
| 类型 | JSON 字符串存任意值 | **强类型**：`STRING` / `NUMBER` / `BOOLEAN` / `JSON` / `COLOR` / `IMAGE` |
| 管理入口 | `/admin/settings` | `/admin/dictionaries` |

---

## 数据库

- **表名**：`dictionaries`（Prisma 模型 `Dictionary`）
- **枚举**：`DictionaryValueType`
- **关键字段**：
  - `key`：全局唯一标识（如 `USER_STATUS`、`PAYMENT_WECHAT`）
  - `label` / `description`：展示与说明
  - `parentId`：父节点，根节点为 `null`
  - 按类型写入 `valueString` / `valueNumber` / `valueBoolean` / `valueJson`
  - `sortOrder`、`isActive`

建库、安装依赖、推 schema、跑种子与 **OrbStack / 无本机 Node** 等注意事项，统一见 **`docs/DEVELOPMENT.md`**。

推荐顺序：

```bash
make db-up && make install && make db-push && make db-seed
```

种子数据包含字典示例：`USER_STATUS` 及其子项、`PAYMENT_METHOD` 及微信/支付宝子项，见 `prisma/seed.ts`。

---

## 管理后台

- **路径**：`/admin/dictionaries`（需管理员角色）
- **能力**：
  - 左侧 **树形导航**，展开/折叠，点击选中节点
  - 右侧 **编辑**：按 `type` 显示文本、数字、开关、颜色选择器、图片 URL、JSON 文本域等
  - 修改 **父节点** 时服务端会做 **成环检测**（不可把节点挪到自己或后代下）
  - 底部 **表格**：搜索、按类型筛选、多选 **批量启用/停用**
  - **新建根节点** / **添加子项**（对话框）

侧边栏导航项在 `src/config/admin-nav.ts` 中配置为「数据字典」。

---

## 服务端读取

### `getDict` / 缓存

- **文件**：`src/lib/dictionary-cache.ts`、`src/lib/dictionary.ts`（再导出）
- **`getDict(rootKey)`**：基于 React `cache()`，同一次请求内多次调用会去重。
- **`getCachedDictionaryTree(rootKey)`**：使用 Next.js `unstable_cache`，默认 `revalidate: 300`，并按 `dictionary:${rootKey}` 打 **tag**，在字典变更后通过 `revalidateTag` 失效。

### 可选 Redis（多实例）

- 注册：`registerDictionaryExternalCache(provider)`，`provider` 需实现 `get` / `set` / `del`。
- 读路径会先查外部缓存（键如 `dict:tree:${rootKey}`），未命中再查库；变更时 Server Actions 会同步 `del`。

### 核心服务

- **`src/services/dictionary.service.ts`**：`getTreeByRootKey`、`listAll`、`createEntry`、`updateEntry`、`deleteEntry`、`batchSetActive`、`getDirectChildrenForSelect` 等。

### Server Actions

- **`src/app/actions/dictionary-actions.ts`**：管理员 CRUD 与批量状态；成功后 **失效 Next 缓存 tag** 与可选 Redis 键。

---

## HTTP API（公开读）

用于浏览器端 Hook 与下拉组件（无管理员会话也可调用，按需自行加网关或鉴权）。

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/dictionaries/public/[rootKey]` | 返回该 `rootKey` 对应节点的**整棵子树**（JSON，`ApiResponse` 包装） |
| GET | `/api/dictionaries/options/[rootKey]` | 返回该根下**直接子节点**且 `isActive=true`（供下拉选项） |

`rootKey` 需 URL 编码（如包含特殊字符）。

---

## 客户端

### `useDictionary(rootKey)`

- **文件**：`src/hooks/use-dictionary.ts`
- 请求 `/api/dictionaries/public/...`，返回 `{ data, loading, error, reload }`。

### `DictSelect`

- **文件**：`src/components/dictionary/dict-select.tsx`
- 请求 `/api/dictionaries/options/...`，渲染下拉；`valueMode` 可选 `"id"`（默认）或 `"key"`。

示例：

```tsx
import { DictSelect } from "@/components/dictionary/dict-select";

<DictSelect dictKey="PAYMENT_METHOD" value={id} onValueChange={setId} />
```

---

## TypeScript 类型

- **`src/types/dictionary.ts`**：`DictionaryNodeDTO`、`DictionaryFlatDTO`、`DictionaryValue`、`rowToValue` 等。

---

## 相关文件索引

| 路径 | 说明 |
|------|------|
| `prisma/schema.prisma` | `Dictionary` 模型与枚举 |
| `prisma/seed.ts` | 字典示例数据 |
| `src/services/dictionary.service.ts` | 业务与查询 |
| `src/lib/dictionary-cache.ts` | Next 缓存 + 可选 Redis |
| `src/lib/dictionary.ts` | 对外导出 `getDict` 等 |
| `src/app/actions/dictionary-actions.ts` | Server Actions |
| `src/app/api/dictionaries/public/[rootKey]/route.ts` | 公开树 API |
| `src/app/api/dictionaries/options/[rootKey]/route.ts` | 下拉选项 API |
| `src/app/admin/dictionaries/page.tsx` | 管理页 |
| `src/features/dictionary/dictionary-admin-client.tsx` | 管理端 UI |

---

## 运维提示

- 修改 Prisma schema 后执行 **`make db-push`**（或 `npm run db:push`），再部署应用。
- 生产环境若多实例部署字典读缓存，建议实现 **`registerDictionaryExternalCache`** 或依赖 CDN/网关；否则以 DB + Next 缓存为准即可。
