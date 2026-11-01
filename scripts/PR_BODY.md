## Summary

- Add FarmerID registration/login, multi-farm D1 schema (`crop_farms`, sessions), and farm APIs with legacy `AgriBakMan-*` / `AM-*` ID support.
- Extend the UI for merchants, procurements, calendar period reports, and JD defaults; update service worker cache.
- Send welcome email via Resend with `EMAIL_FROM`, `EMAIL_TEST_TO`, and sender fallbacks when the custom domain is not verified.
- Add admin panel (`/admin.html`) and farmer list/export/delete APIs; `Agri-####` FarmerIDs; expand `SETUP-CLOUD.md` for deploy, Resend, and admin secrets.

## Test plan

- [ ] Register a farmer (email-only); confirm FarmerID and session persistence.
- [ ] Create and switch farms; save/load; check farms hub summaries.
- [ ] Merchants, procurements, and calendar period report breakdowns.
- [ ] Welcome email with current Resend/domain/`EMAIL_TEST_TO` settings.
- [ ] Set `ADMIN_PASSWORD` on the Worker; use `/admin.html` list/export/delete on test data.
- [ ] After merge/deploy: `/api/health` shows expected `email_ready` and `admin_ready`.
