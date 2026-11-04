#!/bin/sh
# Restore a backup made by backup-db.sh into the local Docker MongoDB.
# The current database is DROPPED and replaced by the backup.
# Usage: sh scripts/restore-db.sh backups/<file>.archive.gz
# Author: Ryan Naidji
set -eu
FILE="${1:?Usage: restore-db.sh <backup file>}"
DB="${DB_NAME:-trimerge-pro-careers}"
[ -f "$FILE" ] || { echo "File not found: $FILE"; exit 1; }
docker compose exec -T mongo mongorestore --nsInclude "${DB}.*" --drop --archive --gzip < "$FILE"
echo "Restored $FILE into $DB"
