.PHONY: up down logs shell dev seed

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f app

shell:
	docker compose exec app sh

dev:
	docker compose --profile dev up --build

seed:
	docker compose run --rm -e SEED_DB=true app node server.js
