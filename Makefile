.PHONY: help dev dev-down dev-logs prod-up prod-down prod-logs rebuild clean \
	install lint build dev-host db-up db-down db-push db-seed db-studio

COMPOSE_BASE = docker compose -f docker-compose.yml
COMPOSE_DEV = $(COMPOSE_BASE) -f docker-compose.dev.yml
COMPOSE_PROD = $(COMPOSE_BASE) -f docker-compose.prod.yml --profile prod

# -----------------------------------------------------------------------------
# 本机 Node vs Docker（OrbStack / 无 npm）
# - 默认自动：有 npm → 宿主机执行；无 npm → docker compose run app-dev（与 make dev 共用镜像与 node_modules 卷）
# - 勿再用「裸 node:20-alpine + 宿主机 node_modules」：与 compose 里 node_modules 命名卷冲突，Prisma/依赖会不一致
# - 强制：NODE_VIA=host|docker
# -----------------------------------------------------------------------------
NPM ?= npm
NODE_VIA ?= auto
ifeq ($(NODE_VIA),auto)
  _NODE_VIA := $(shell command -v $(NPM) >/dev/null 2>&1 && echo host || echo docker)
else
  _NODE_VIA := $(NODE_VIA)
endif

# 本机 npm（整条子命令写在引号内）
define WITH_NODE
	bash -lc 'export PATH="/opt/homebrew/bin:/usr/local/bin:$$PATH"; cd "$(CURDIR)" && $(NPM) $(1)'
endef

# 无本机 npm：在 app-dev 容器内执行（DATABASE_URL=...@db，需先 make db-up；依赖写入 compose 的 node_modules 卷）
define WITH_COMPOSE_DEV
	$(COMPOSE_DEV) run --rm -T app-dev sh -lc '$(1)'
endef

help:
	@echo "Docker Compose（推荐与本仓库 Dockerfile 一致）"
	@echo "  make dev         - 启动开发栈（热更新 + DB）；app 启动前会 prisma generate；改表结构后请 make db-push"
	@echo "  make dev-down    - 停止开发栈"
	@echo "  make dev-logs    - 开发日志"
	@echo "  make prod-up     - 构建并后台启动生产栈"
	@echo "  make prod-down   - 停止生产栈"
	@echo "  make prod-logs   - 生产日志"
	@echo "  make rebuild     - 清空开发卷并重建"
	@echo "  make clean       - 清理开发与生产相关容器与卷"
	@echo ""
	@echo "数据库（Compose 中的 Postgres）"
	@echo "  make db-up       - 启动 db（映射宿主机 5432）"
	@echo "  make db-down     - 停止 db"
	@echo ""
	@echo "Prisma / npm（自动：有本机 npm 用本机；无则用 compose app-dev 容器，与 make dev 一致）"
	@echo "  当前检测: NODE_VIA=$(_NODE_VIA)  （可设 NODE_VIA=host|docker 覆盖）"
	@echo "  make install     - npm ci（生成 Prisma Client）"
	@echo "  make db-push     - prisma db push"
	@echo "  make db-seed     - prisma db seed"
	@echo "  make db-studio   - prisma studio"
	@echo "  make lint / build - eslint / next build"
	@echo "  make dev-host    - 仅当本机有 npm；否则请用 make dev（容器内开发）"
	@echo ""
	@echo "典型（仅 OrbStack、无本机 Node）："
	@echo "  make db-up && make install && make db-push && make db-seed   # 首次会构建 app-dev 镜像"
	@echo "  make dev"
	@echo ""
	@echo "详细说明见: docs/DEVELOPMENT.md"

dev:
	$(COMPOSE_DEV) up --build

dev-down:
	$(COMPOSE_DEV) down

dev-logs:
	$(COMPOSE_DEV) logs -f

prod-up:
	$(COMPOSE_PROD) up --build -d

prod-down:
	$(COMPOSE_PROD) down

prod-logs:
	$(COMPOSE_PROD) logs -f

rebuild:
	$(COMPOSE_DEV) down -v
	$(COMPOSE_DEV) up --build --force-recreate

clean:
	$(COMPOSE_DEV) down -v --remove-orphans
	$(COMPOSE_PROD) down -v --remove-orphans

db-up:
	$(COMPOSE_BASE) up -d db

db-down:
	$(COMPOSE_BASE) stop db

ifeq ($(_NODE_VIA),host)
install:
	$(call WITH_NODE,ci)
db-push:
	$(call WITH_NODE,run db:push)
db-seed:
	$(call WITH_NODE,run db:seed)
db-studio:
	$(call WITH_NODE,run db:studio)
lint:
	$(call WITH_NODE,run lint)
build:
	$(call WITH_NODE,run build)
dev-host:
	$(call WITH_NODE,run dev)
else
install:
	$(call WITH_COMPOSE_DEV,npm ci)
db-push:
	$(call WITH_COMPOSE_DEV,npm run db:push)
db-seed:
	$(call WITH_COMPOSE_DEV,npm run db:seed)
db-studio:
	$(COMPOSE_DEV) run --rm -T -p 5555:5555 app-dev sh -lc 'npx prisma studio --hostname 0.0.0.0 --port 5555'
lint:
	$(call WITH_COMPOSE_DEV,npm run lint)
build:
	$(call WITH_COMPOSE_DEV,npm run build)
dev-host:
	@echo "未检测到本机 npm，无法在宿主机跑 next dev。请使用: make dev"
	@exit 1
endif
