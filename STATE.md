# STATE — Medflow (Clinic CRM Demo)
Date: 2026-02-04 (UTC snapshot)

Status: `DEGRADED`

Public URL: `https://medflow.lavescar.com.tr`  
Origin URL (resolve): `curl -I --resolve medflow.lavescar.com.tr:443:91.99.192.155 https://medflow.lavescar.com.tr`

Current Deploy:
- Symlink: `/var/www/lavescar/demos/medflow/current -> /var/www/lavescar/demos/medflow/releases/20260204_071957`
- Runtime model: static via nginx
- Active Port: `443` (nginx)

Evidence (commands + observed result):
- `curl -I https://medflow.lavescar.com.tr` -> `HTTP/2 200`, `content-type: text/html`, `cache-control: no-store...`, `cf-cache-status: DYNAMIC`, `x-robots-tag: noindex...`
- `curl -I --resolve medflow.lavescar.com.tr:443:91.99.192.155 https://medflow.lavescar.com.tr` -> `HTTP/2 200`, `server: nginx`
- Asset cache probe:
  - `curl -I https://medflow.lavescar.com.tr/_app/immutable/entry/start.B6Zv9kHA.js`
  - Result: `cache-control: public, max-age=31536000, immutable`
- `/api` behavior probe:
  - `curl -I https://medflow.lavescar.com.tr/api/health` -> `200 text/html` (SPA fallback)
- Nginx vhost proof:
  - `nginx -T | grep -nE 'server_name (medflow)\\.lavescar\\.com\\.tr'`
  - `/etc/nginx/sites-available/medflow.lavescar.com.tr` satır `13-14`: cache+spa include

Known Issues:
1. `/api/*` path static SPA fallback’e düşüyor (`200 text/html`), yanlış health sinyali üretiyor.  
   Evidence: `curl -I https://medflow.lavescar.com.tr/api/health`
2. Demo modu header’ı (`x-demo-mode`) sadece Nexus’ta var; Medflow’da standardizasyon eksik.  
   Evidence: `curl -I https://medflow.lavescar.com.tr`
3. Browser-level console/a11y regressions için kanıt toplanmadı (CLI ile kapatılamaz).  
   Evidence gap: DevTools console/network snapshot yok.

Next Actions:
- `IMPLEMENTATION.md` §2.1 (`/api` guard + nginx route safety)
- `IMPLEMENTATION.md` §2.2 (health endpoint stratejisi)
- `IMPLEMENTATION.md` §3 (UX reliability polish)
