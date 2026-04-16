.PHONY: help dev dev-down dev-logs prod-up prod-down prod-logs rebuild clean \
	install lint build dev-host db-up db-down

COMPOSE_BASE = docker compose -f docker-compose.yml
COMPOSE_DEV = $(COMPOSE_BASE) -f docker-compose.dev.yml
COMPOSE_PROD = $(COMPOSE_BASE) -f docker-compose.prod.yml --profile prod

help:
	@echo "Docker Compose（推荐与本仓库 Dockerfile 一致）"
	@echo "  make dev         - 启动开发栈（热更新 + DB）"
	@echo "  make dev-down    - 停止开发栈"
	@echo "  make dev-logs    - 开发日志"
	@echo "  make prod-up     - 构建并后台启动生产栈"
	@echo "  make prod-down   - 停止生产栈"
	@echo "  make prod-logs   - 生产日志"
	@echo "  make rebuild     - 清空开发卷并重建"
	@echo "  make clean       - 清理开发与生产相关容器与卷"
	@echo ""
	@echo "本机 Node（不经过 Docker）"
	@echo "  make db-up       - 只启动 Postgres（与 .env 中 localhost:5432 一致）"
	@echo "  make db-down     - 停止 Postgres 容器"
	@echo "  make install     - npm ci"
	@echo "  make lint        - npm run lint"
	@echo "  make build       - npm run build"
	@echo "  make dev-host    - npm run dev（需 .env 已配置；可先 make db-up）"

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

install:
	npm ci

lint:
	npm run lint

build:
	npm run build

dev-host:
	npm run dev
