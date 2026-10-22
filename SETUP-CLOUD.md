# AgriMan cloud sync (Farm ID + password)

Partners share one ledger on any device. Data is stored in **Cloudflare D1** (free with your existing Cloudflare account).

## One-time setup (about 2 minutes)

### 1. Push this code (already includes the API)

Make sure GitHub `main` is up to date so Cloudflare redeploys with the `functions/` API.

### 2. Create a D1 database and bind it

1. Open [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
2. Click your **agriman** project
3. Go to **Settings** → **Bindings** (or **Functions** → **D1 database bindings**)
4. **Add binding**
   - Type: **D1 database**
   - Variable name: **`DB`** (must be exactly `DB`)
   - Database: **Create new** → name it `agriman-db` (any name is fine)
5. **Save** and **Deploy** / retry deployment if asked

### 3. Verify

1. Open your live URL
2. You should see **Join farm** / **Create farm** (not only “this device only”)
3. Tap **Create farm** → choose a password (6+ characters)
4. Copy the **Farm ID** (e.g. `AM-XXXXXX`) and share **ID + password** with your partner
5. Partner uses **Join farm** with the same ID + password

### 4. Check stored farms (optional)

Cloudflare → **Workers & Pages** → **D1** → `agriman-db` → **Console**:

```sql
SELECT farm_id, updated_at FROM farms;
```

There is no separate users table — each row in `farms` is a shared farm account.

## Notes

- Clearing phone cache does **not** delete the cloud farm — just join again with Farm ID + password
- Use **Settings → Sync now** if two phones edited while offline
- Keep **Export backup** as an extra safety copy
