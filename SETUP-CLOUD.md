# AgriMan cloud sync (Farm ID + password)

## Why you saw “Bindings cannot be added…”

A **static-assets-only** Worker cannot use D1. AgriMan is now a real Worker (`src/worker.js`) that serves the website **and** `/api/*`, so bindings work.

## Setup

### 1. Deploy this update

Push to GitHub and wait for Cloudflare to finish deploying `agriman`.

### 2. Add the D1 binding

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **agriman**
2. **Settings** → **Bindings** → **Add**
3. Choose **D1 database**
   - **Variable name:** `DB` (exactly)
   - **Database:** Create `agriman-db` (or pick an existing one)
4. **Save** → **Deploy** if Cloudflare asks

The error about static-only bindings should be gone now that the Worker script exists.

### 3. Use the app

1. Open your live URL  
2. **Create farm** → password (6+ chars)  
3. Copy **Farm ID** (e.g. `AM-XXXXXX`)  
4. Partner opens the same URL → **Join farm** with that ID + password  

### 4. Inspect data (optional)

**Workers & Pages** → **D1** → your database → Console:

```sql
SELECT farm_id, updated_at FROM farms;
```

No separate users table — each `farms` row is one shared farm account.
