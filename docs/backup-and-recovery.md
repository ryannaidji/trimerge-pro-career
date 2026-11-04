# Backup and recovery

**Author:** Ryan Naidji · **Last tested:** 2026-11-03 (local Docker stack)

## What must be backed up

| Data | Where (local) | Where (production, to confirm) |
|---|---|---|
| Database (users, profiles, jobs, applications, tokens) | `mongo-data` Docker volume | MongoDB host used by Render (not confirmed — see #3) |
| Uploaded files (resumes, cover letters, logos) | `api-uploads` Docker volume | Cloudinary |
| Source code | GitHub fork `ryannaidji/trimerge-pro-career` | GitHub |
| Configuration / secrets | `apps/api/.env`, `apps/web/.env` (never committed) | Render / Netlify dashboards |

## Database backup (local)

```sh
docker compose up -d
sh scripts/backup-db.sh           # -> backups/trimerge-pro-careers-<timestamp>.archive.gz
```

Uses `mongodump --archive --gzip` inside the `mongo` container. `backups/` is git-ignored
because backups contain personal data. Copy them to an encrypted location if they must be kept.

## Database restore (local)

```sh
sh scripts/restore-db.sh backups/<file>.archive.gz
```

`mongorestore --drop` replaces the current collections with the backup.

**Verified:** 9 users → backup → 1 test user inserted (10) → restore → 9 users.

## Uploaded files (local)

```sh
docker run --rm -v trimerge-pro-career_api-uploads:/data -v "$PWD/backups:/out" alpine \
  tar czf /out/uploads-$(date +%Y%m%d).tar.gz -C /data .
```

## Production (to do when access is granted)

1. Confirm which MongoDB the Render API uses (`MONGODB_URI` in Render), with read-only access.
2. If MongoDB Atlas: enable the free-tier snapshot or run `mongodump` with a read-only user,
   from a trusted machine, into encrypted storage.
3. Test a restore into a **separate** database, never into production.
4. Code rollback: every release is a Git tag / GHCR image (`.github/workflows/cd.yml`);
   roll back by redeploying the previous tag.
