#!/bin/sh
# Back up the local Docker MongoDB database to ./backups/<timestamp>.archive.gz
# Usage: sh scripts/backup-db.sh            (stack must be running: docker compose up -d)
# Author: Ryan Naidji
set -eu
DB="${DB_NAME:-trimerge-pro-careers}"
mkdir -p backups
FILE="backups/${DB}-$(date +%Y%m%d-%H%M%S).archive.gz"
docker compose exec -T mongo mongodump --db "$DB" --archive --gzip > "$FILE"
echo "Backup written to $FILE ($(wc -c < "$FILE") bytes)"
