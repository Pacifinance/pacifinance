#!/usr/bin/env bash
# One-command fully local self-host: clones Supabase's own official
# self-hosting stack (never vendored into this repo - see "Fully local
# Supabase" in README.md for why), generates its secrets, bootstraps
# supabase/schema.sql against it, wires this repo's own .env to it, then
# builds and starts Pacifinance itself. Safe to re-run: skips the clone and
# schema bootstrap if the Supabase stack is already set up.
#
# Bump this if Supabase cuts a newer self-hosted/vX release branch:
# https://github.com/supabase/supabase/branches (search "self-hosted/")
SUPABASE_REF="self-hosted/v0.8.0"

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUPA_DIR="$REPO_ROOT/.selfhost-supabase"
SCHEMA_FILE="$REPO_ROOT/supabase/schema.sql"
ENV_FILE="$REPO_ROOT/.env"

command -v git >/dev/null || { echo "git is required." >&2; exit 1; }
command -v docker >/dev/null || { echo "docker is required." >&2; exit 1; }

FIRST_RUN=false
if [ ! -d "$SUPA_DIR" ]; then
  FIRST_RUN=true
  echo "==> Cloning Supabase's self-hosting stack ($SUPABASE_REF)..."
  git clone --depth 1 --branch "$SUPABASE_REF" https://github.com/supabase/supabase "$SUPA_DIR.src"
  cp -rf "$SUPA_DIR.src/docker/." "$SUPA_DIR"
  rm -rf "$SUPA_DIR.src"
  cp "$SUPA_DIR/.env.example" "$SUPA_DIR/.env"
  echo "==> Generating Supabase secrets (POSTGRES_PASSWORD, JWT_SECRET, ANON_KEY, SERVICE_ROLE_KEY, ...)..."
  (cd "$SUPA_DIR" && sh utils/generate-keys.sh && sh utils/add-new-auth-keys.sh)
else
  echo "==> Reusing existing Supabase stack at $SUPA_DIR"
fi

# Pacifinance only ever calls Postgres, Auth (incl. its Admin API for account
# create/delete) and PostgREST through the gateway - never Realtime, Storage,
# Functions or the pooler. Starting these specific services instead of `sh
# run.sh start` (the full stack) means `docker compose` only pulls/runs what's
# actually needed - studio+meta are included too since they're the local
# dashboard used to verify data below, not because the app needs them. Update
# this list if Supabase renames a service (see the raw docker-compose.yml at
# the SUPABASE_REF above if `docker compose up` errors with "no such service").
SUPABASE_SERVICES="db auth rest api-gw studio meta"

echo "==> Starting the Supabase services Pacifinance needs ($SUPABASE_SERVICES)..."
docker compose -f "$SUPA_DIR/docker-compose.yml" --project-directory "$SUPA_DIR" up -d --wait $SUPABASE_SERVICES

SERVICE_ROLE_KEY="$(grep -m1 '^SERVICE_ROLE_KEY=' "$SUPA_DIR/.env" | cut -d= -f2-)"
POSTGRES_PASSWORD="$(grep -m1 '^POSTGRES_PASSWORD=' "$SUPA_DIR/.env" | cut -d= -f2-)"

if [ -z "$SERVICE_ROLE_KEY" ]; then
  echo "Could not read SERVICE_ROLE_KEY from $SUPA_DIR/.env - inspect it manually." >&2
  exit 1
fi

# Check the database itself for whether the schema is really there, instead
# of trusting FIRST_RUN/directory-existence - a first run that gets
# interrupted after cloning but before (or during) the schema apply below
# would otherwise leave a permanently empty database that every later run
# silently skips fixing, since the directory already exists.
SCHEMA_PRESENT="$(docker compose -f "$SUPA_DIR/docker-compose.yml" --project-directory "$SUPA_DIR" exec -T -e PGPASSWORD="$POSTGRES_PASSWORD" db \
  psql -U postgres -d postgres -tAc "SELECT to_regclass('public.profiles') IS NOT NULL")"

if [ "$SCHEMA_PRESENT" != "t" ]; then
  echo "==> Applying supabase/schema.sql (schema missing or incomplete)..."
  docker compose -f "$SUPA_DIR/docker-compose.yml" --project-directory "$SUPA_DIR" exec -T -e PGPASSWORD="$POSTGRES_PASSWORD" db \
    psql -U postgres -d postgres < "$SCHEMA_FILE"
  # PostgREST caches the DB schema at startup/on its own schedule, so it
  # won't see tables created just now until told to reload - restart it
  # rather than wait, so the very first request after setup already works.
  echo "==> Restarting PostgREST so it picks up the new schema..."
  docker compose -f "$SUPA_DIR/docker-compose.yml" --project-directory "$SUPA_DIR" restart rest
fi

echo "==> Wiring this repo's .env to the local Supabase stack..."
[ -f "$ENV_FILE" ] || cp "$REPO_ROOT/.env.example" "$ENV_FILE"
for key in SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY; do
  if grep -q "^${key}=" "$ENV_FILE"; then
    sed -i.bak "/^${key}=/d" "$ENV_FILE" && rm -f "$ENV_FILE.bak"
  fi
done
{
  echo "SUPABASE_URL=http://host.docker.internal:8000"
  echo "SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY"
} >> "$ENV_FILE"

echo "==> Building and starting Pacifinance..."
(cd "$REPO_ROOT" && docker compose up --build)
