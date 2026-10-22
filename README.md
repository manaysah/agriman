# AgriMan

Farm money tracker for expenses, daily market sales, transport fees, a season calendar, and profit.

**Creator alias:** Manaysah

## Features

- **Farm ID + password** — two partners share one cloud ledger on any device
- **Safe cloud storage** — data survives clearing phone cache (log in again with Farm ID + password)
- **Expenses** — land, seeds, plants, water, labor, and more
- **Market** — daily sales with quantity, buyer, and transport fee
- **Calendar** — day-by-day money in/out + planned season payments
- **Profit** — revenue − all costs for the season
- **Language** — English / العربية (RTL)
- **Export backup** — download a JSON file from Settings

## Cloud setup (required for shared partners)

Follow **[SETUP-CLOUD.md](./SETUP-CLOUD.md)** (free Supabase project + paste keys into `config.js`).

Until cloud is configured you can still use **Continue on this device only**.

## Local preview

```bash
python3 -m http.server 5173
```

Open [http://localhost:5173](http://localhost:5173).
