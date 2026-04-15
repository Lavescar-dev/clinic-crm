# IMPLEMENTATION — Medflow (Execution-Ready)
Date: 2026-02-04

## 1) Problem List (Evidence)

1. `/api/*` istekleri static SPA fallback’e düşüyor.
- Symptom: API health benzeri isteklerde JSON yerine HTML geliyor.
- Evidence: `curl -I https://medflow.lavescar.com.tr/api/health` => `200 text/html`.
- Hypothesis: Bu demo için API location tanımlı değil; `try_files` fallback çalışıyor.

2. Demo operational observability zayıf.
- Symptom: App-level health endpoint yok.
- Evidence: Yalnızca static `index` ve asset health sinyali var.
- Hypothesis: Monitoring false-positive üretebilir.

3. Browser runtime regressions ölçülmedi.
- Symptom: console/network smoke matrisi eksik.
- Evidence: CLI audit tamam; DevTools kanıtı yok.

## 2) Fix Plan (Smallest Safe Steps)

### 2.1 `/api` guard (Nginx)
- Files:
  - `/etc/nginx/sites-available/medflow.lavescar.com.tr`
- Change type: config
- Change:
  - `location ^~ /api/ { return 404; }` (veya net JSON stub response)
  - Static fallback korunur.
- Risk: low
- Rollback:
  - Vhost dosyasını eski haline al, `nginx -t && systemctl reload nginx`.

### 2.2 Health contract
- Files:
  - `demos/clinic-crm/src/routes/+page.svelte` (public smoke text)
  - Opsiyonel: nginx route bazlı lightweight `/healthz` static response
- Change type: code/config
- Change:
  - Monitoring için `GET /healthz` net 200 plain-text endpointi.
- Risk: low
- Rollback:
  - `/healthz` route kaldır.

### 2.3 Cache policy audit (no code change expected)
- Files:
  - `/etc/nginx/snippets/lavescar-demo-cache.conf`
- Change type: validate-only (if needed config tweak)
- Change:
  - HTML `no-store`, immutable assets current hali korunur.
- Risk: low
- Rollback: snippet revert + reload.

## 3) UI/UX Value Plan (0-bloat)

1. Empty-state clarity:
- File: `demos/clinic-crm/src/routes/(app)/dashboard/+page.svelte`
- Add: kısa “Demo data is synthetic” microcopy.

2. Error copy:
- File: `demos/clinic-crm/src/routes/(app)/patients/+page.svelte`
- Add: fallback error panel + retry CTA.

3. Loading consistency:
- File: `demos/clinic-crm/src/routes/(app)/appointments/+page.svelte`
- Add: skeleton/loading placeholder (mevcut style ile).

## 4) DoD

1. `https://medflow.lavescar.com.tr` => `200`.
2. SPA refresh (`/non-existent-path`) => `200` + app render.
3. `/api/health` artık yanlışlıkla HTML döndürmüyor (expected explicit behavior).
4. DevTools console’da uncaught error yok.
5. Cloudflare Dev Mode OFF iken davranış sabit.
