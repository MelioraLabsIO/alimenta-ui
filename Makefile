# Local development helpers.
# Requires Docker running and the Supabase CLI (`brew install supabase/tap/supabase`).

SUPABASE ?= supabase

.DEFAULT_GOAL := help
.PHONY: help dev supabase-start supabase-stop supabase-status supabase-reset check-docker

help: ## List available targets
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

dev: supabase-start ## Start Supabase, then the Next.js dev server on :3000
	npm run dev

supabase-start: check-docker ## Start the local Supabase containers (no-op if already running)
	$(SUPABASE) start

supabase-stop: ## Stop the local Supabase containers (data is kept)
	$(SUPABASE) stop

supabase-status: ## Show local Supabase URLs and keys
	$(SUPABASE) status

supabase-reset: check-docker ## Recreate the local database and re-apply migrations
	$(SUPABASE) db reset

check-docker:
	@docker info > /dev/null 2>&1 || { echo "Docker is not running. Start Docker Desktop and try again."; exit 1; }
