---
title: photography-portfolio
emoji: 🐳
colorFrom: red
colorTo: yellow
sdk: static
pinned:
tags:
---

Fryou Photography — Static site with self-hosted Strapi CMS

CMS (Strapi)
- Start: `cd infra/cms && docker compose up -d`
- Admin: `http://SERVER:1337/admin` (create the first admin on first run)
- Uploads: persisted in `infra/cms/uploads` and served at `http://SERVER:1337/uploads/...`

Content types
- Posts: title, slug, excerpt, cover, body, publishedAt
- Photos: title, slug, image, location, camera (Sony a6300), description, takenAt

Public API (read-only)
- `/api/posts` and `/api/photos`. Slug filter example: `/api/posts?filters[slug][$eq]=...&populate=cover`

Site wiring
- Client fetch logic in `assets/js/cms.js`. Change CMS host by setting `window.CMS_BASE` before load or editing default.
- `blog.html` hydrates grid from `/api/posts`.
- `index.html` shows latest posts.
- `blog-post.html` reads `?slug=` and renders the post.
