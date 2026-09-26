# Shortcuts for the everyday commands; everything runs through npm.

.DEFAULT_GOAL := help
.PHONY: help install build check test lint typecheck demo clean release-patch release-minor

help: ## Show this help
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | sed 's/:.*## /|/' | column -t -s '|'

install: ## Install dependencies
	npm ci

build: ## Compile to dist/
	npm run build

check: typecheck lint test ## Typecheck, lint and tests

test: ## Vitest
	npm test

lint: ## ESLint
	npm run lint

typecheck: ## tsc
	npm run typecheck

demo: ## The interactive demo page
	npm run demo

clean: ## Remove build output
	rm -rf dist

release-patch: ## Bump the patch version, tag it and push - CI publishes to npm
	npm version patch && git push --follow-tags

release-minor: ## Bump the minor version, tag it and push - CI publishes to npm
	npm version minor && git push --follow-tags
