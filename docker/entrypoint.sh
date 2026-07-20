#!/bin/sh
set -e

echo "Waiting for Postgres at ${DB_HOST:-db}:${DB_PORT:-5432}..."
node /app/scripts/wait-for-db.mjs

echo "Seeding admin user..."
node /app/scripts/seed-admin.mjs

UPLOAD_DIR="${UPLOAD_DIR:-/app/data/uploads}"
mkdir -p "$UPLOAD_DIR"

# Migrate uploads left in legacy public dirs (from earlier builds)
for SRC in /app/public/images /app/.output/public/images; do
  if [ -d "$SRC" ]; then
    echo "Syncing legacy images from $SRC -> $UPLOAD_DIR"
    # copy only upload-like files (timestamp-hash), keep built assets in place
    find "$SRC" -maxdepth 1 -type f \( -name '[0-9]*-*.png' -o -name '[0-9]*-*.jpg' -o -name '[0-9]*-*.jpeg' -o -name '[0-9]*-*.webp' -o -name '[0-9]*-*.gif' \) -exec cp -n {} "$UPLOAD_DIR"/ \; 2>/dev/null || true
  fi
done

echo "Starting application..."
exec "$@"
