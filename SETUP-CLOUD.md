# AgriMan cloud sync (Farm ID + password)

This lets two partners share one farm ledger on any device. Data is stored in your own free Supabase database (not only on the phone).

## 1. Create a free Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign up
2. **New project** → pick a name, set a database password (save it), choose a region
3. Wait until the project is ready

## 2. Create the database tables

1. In Supabase: **SQL** → **New query**
2. Open `supabase/schema.sql` from this repo, paste all of it, click **Run**
3. Confirm it succeeds (no red errors)

## 3. Copy API keys into AgriMan

1. Supabase → **Project Settings** → **API**
2. Copy **Project URL** and the **anon public** key
3. Edit `config.js` in this project:

```js
window.AGRIMAN_CONFIG = {
  supabaseUrl: "https://xxxx.supabase.co",
  supabaseAnonKey: "eyJhbGciOi...",
};
```

## 4. Deploy

Commit and push to GitHub so Cloudflare redeploys:

```bash
cd ~/Projects/farm-money-tracker
git add config.js supabase SETUP-CLOUD.md index.html app.js styles.css README.md
git commit -m "Add Farm ID cloud sync for partners"
git push
```

**Security note:** the anon key is meant to be public in the browser. Access is protected by Farm ID + password via secure database functions (passwords are hashed; table rows are not directly readable).

## 5. Use it

1. Open your Cloudflare URL
2. **Create farm** → set a password → share the **Farm ID** + password with your partner
3. Partner chooses **Join farm** and enters the same Farm ID + password
4. Both phones stay aligned; clearing cache does not delete the cloud farm (just log in again)

Keep using **Export backup** in Settings as an extra safety copy.
