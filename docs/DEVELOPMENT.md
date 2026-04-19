# 本地开发与构建说明

面向 **OrbStack / Docker** 与本机 Node 两种环境，说明推荐命令顺序、易错点与 Makefile 行为。

---

## 1. 环境前提

- **数据库**：`docker-compose.yml` 中 Postgres 默认用户/库为 `postgres` / `general_system`，端口映射 **`5432:5432`**。
- **环境变量**：项目根目录需有 **`.env`**（至少含 `DATABASE_URL`、`AUTH_SECRET` 等）。Compose 服务通过 `env_file: .env` 注入；**不要**把 `.env` 提交进 Git。
- **本机 Node（可选）**：若已安装 Node/npm，Makefile 会优先在**宿主机**执行 `npm`；若 `which npm` 无输出，则自动走 **Docker**（见下文）。

---

## 2. 推荐命令顺序（首次克隆或换机器）

在仓库根目录执行：

```bash
make db-up                 # 启动 Postgres（未起库时）
make install               # npm ci + postinstall（prisma generate）
make db-push               # 将 prisma/schema 同步到数据库
make db-seed               # 种子数据（含演示账号、热配置、数据字典示例等）
make dev                   # 启动开发栈：app-dev + db（热更新）
```

说明：

- **`make install` / `make db-push` / `make db-seed`**：无本机 npm 时，Makefile 会用 **`docker compose run app-dev`** 执行，与 **`make dev` 共用同一镜像和 `node_modules` 命名卷**，避免依赖与 Prisma Client 不一致。
- **首次**执行会构建 **`app-dev` 镜像**，耗时可能较长。

---

## 3. 修改 Prisma schema 之后

只要改动 **`prisma/schema.prisma`**（增表、改字段等），在重启或继续开发前务必：

```bash
make db-push
```

然后再 `make dev`（若开发栈已在跑，可只执行 `make db-push`，必要时重启 `app-dev` 容器）。

**原因**：`docker-compose.dev.yml` 中 `app-dev` 的启动命令仅为 **`npm run dev`**，**不会**在每次容器启动时自动执行 `prisma db push`，以免与手动同步重复、拖慢重启。表结构需由你显式执行 `make db-push` 对齐。

---

## 4. 仅 OrbStack / 无本机 Node（`which npm` 为空）

| 情况 | 说明 |
|------|------|
| **`make dev-host`** | 会在无 npm 时**失败并提示**；请改用 **`make dev`** 在容器内跑 Next。 |
| **数据库连接** | 通过 Compose 服务名 **`db`** 访问，**不要**在容器内用 `localhost` 指宿主机上的库（与 `make db-push` 使用同一 `app-dev` 网络）。 |
| **`node_modules`** | `docker-compose.dev.yml` 使用命名卷 **`node_modules:/app/node_modules`**，与宿主机 `./node_modules` **不是同一份**；请用 **`make install`**（走 `compose run app-dev`）安装依赖，勿依赖「在宿主机用别的容器写入的 `node_modules`」。 |

强制使用本机或容器执行 npm（一般无需设置）：

```bash
make db-push NODE_VIA=host    # 强制宿主机 npm
make db-push NODE_VIA=docker  # 强制 compose app-dev
```

---

## 5. Makefile 与 `make help`

常用目标见仓库根目录 **`Makefile`**，执行 **`make help`** 可查看摘要。

---

## 6. 生产镜像说明（了解即可）

**`Dockerfile`** 生产阶段默认命令包含 **`npx prisma db push`** 后再启动 Node。部署策略若改为「发布流水线单独执行 `migrate deploy` / `db push`」，可再评估是否去掉镜像内的自动 push，此处不展开。

---

## 7. 与功能文档的关系

- **数据字典模块**（表结构、API、`getDict`、`DictSelect` 等）：见 **`docs/DICTIONARY.md`**。
- 字典相关的 **首次建表、种子** 同样遵循本文 **§2、§3** 的流程。
