# Fryou Photography CMS (Strapi)

## Run

```bash
cd infra/cms
docker compose up -d
```

- Admin: http://SERVER:1337/admin
- First run will prompt to create the first admin user.

## Volumes
- `./app` → Strapi application files (SQLite DB lives here by default)
- `./uploads` → Uploaded media, served at `/uploads/...`

## Notes
- Uses SQLite (no external DB).
- Change server host in client `assets/js/cms.js` if hostname changes.
