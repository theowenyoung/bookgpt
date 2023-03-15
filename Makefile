ifneq (,$(wildcard ./.env))
    include .env
    export
endif


.PHONY: fetch
fetch:
	deno run -A ./fetch_book.js

.PHONY: serve
serve:
	zola serve --port 8000

.PHONY: build
build:
	zola build

.PHONY: install
install:
	./scripts/install_zola.sh
