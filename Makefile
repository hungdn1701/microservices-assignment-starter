# ============================================
# Makefile — Common project commands
# Usage: make <target>
# ============================================

.PHONY: help up up-d down build logs logs-service clean init status restart smoke

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

init: ## Create .env from .env.example and check Docker
	@bash scripts/init.sh

up: ## Start all services
	docker compose up --build

up-d: ## Start all services (detached)
	docker compose up --build -d

down: ## Stop all services
	docker compose down

build: ## Rebuild all containers
	docker compose build --no-cache

logs: ## Tail logs from all services
	docker compose logs -f

logs-service: ## Tail logs from a specific service (usage: make logs-service s=service-a)
	docker compose logs -f $(s)

clean: ## Remove all containers, volumes, and images
	docker compose down -v --rmi all --remove-orphans

status: ## Show status of all services
	docker compose ps

restart: ## Restart all services
	docker compose restart

smoke: ## Health-check every component that has code (system must be running)
	@bash scripts/smoke-test.sh
