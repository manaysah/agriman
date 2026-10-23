# AgriMan cloud sync (Farm ID + password)

Cloud data uses **Cloudflare D1** (`agriman-db`) bound as **`DB`**.

## Cloudflare Pages build settings

In **Workers & Pages → agriman → Settings → Builds**:

| Setting | Value |
|--------|--------|
| Framework preset | **None** |
| Build command | **leave empty** (do not use `wrangler deploy`) |
| Build output directory | `/` or `.` |

`wrangler.toml` is configured for **Pages** (`pages_build_output_dir`), with D1 already set.

## App usage

1. Open your live Pages/Workers URL  
2. **Create farm** → password  
3. Share **Farm ID + password** with your partner → **Join farm**

## Check API

`https://YOUR-URL/api/farm/health`  
Should return: `{"ok":true,"provider":"cloudflare-d1"}`

## Inspect farms

**Workers & Pages → D1 → agriman-db → Console:**

```sql
SELECT farm_id, updated_at FROM farms;
```
