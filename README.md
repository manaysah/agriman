# AgriMan

Farm money tracker for expenses, daily market sales, transport, calendar, and profit.

**Creator alias:** Manaysah

## Features

- **Farm ID + password** — partners share one cloud ledger on any device (Cloudflare D1)
- **Safe cloud storage** — survives clearing phone cache (join again with Farm ID + password)
- Expenses, market trips + transport, calendar plans, profit
- English / العربية
- Export backup

## Cloud setup

See **[SETUP-CLOUD.md](./SETUP-CLOUD.md)** — bind a free Cloudflare **D1** database as `DB`, then Create farm.

## Local preview

```bash
python3 -m http.server 5173
```

Local preview is device-only (API runs on Cloudflare after deploy).
