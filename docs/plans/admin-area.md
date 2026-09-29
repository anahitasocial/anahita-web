# Admin area

*Roadmap item 4a, planned 2026-09-28. See the [roadmap](roadmap.md) for order and dependencies.*

## Context
Admin screens are scattered today. `/signup-requests` and `/invites` are admin pages and `/settings` is a super-admin page, each with its own entry in the left menu. Abuse reports (item 4b) and future moderation screens need one home.

**Bug found:** the admin email for a new signup request links to `/settings/signup-requests` (`auth-service/cmd/api/notifiers/signup.go:98`), but the web route is `/signup-requests` (`src/routes/index.js:274`). The link is broken today.

## What exists
- Role helpers in `src/utils/node.js`: `isSuperAdmin` (:49) and `isAdmin` (:53). They read `viewer.personType`, which is camelCase.
- Permission modules: `src/permissions/settings.js` (super-admin), `permissions/signupRequest.js` and `permissions/node.js#canAdminister` (admin), and `permissions/roleLevel.js`.
- Routes: `src/routes/index.js:257-287`, each wrapped in `AuthenticatedRoute`. Each page checks its own permission and shows a "restricted" message (`containers/settings/index.jsx:47-79`, `containers/auth/SignupRequests/index.jsx:67,141-153`).
- Menu entries: `src/assets/default/navs/LeftMenu.jsx:149-192`.
- A tabbed page to copy: `containers/settings/index.jsx`, a card header with `TABS`/`TAB_ORDER`.

## Implementation
1. **Routes:** a new `containers/admin/index.jsx` with nested routes:
   - `/admin` redirects to the first tab the viewer may see
   - `/admin/reports` and `/admin/reports/:id` (added by item 4b)
   - `/admin/signup-requests`
   - `/admin/invites`
   - `/admin/settings` (super-admin only)
2. **Tabs and access:** each tab has a `canView(viewer)` check that reuses the existing permission modules. Tabs the viewer can't use are hidden. With no tabs left, the page shows the existing "restricted" message. Use URL routing, not local state, so admin emails can deep-link.
3. **Move pages:** move the existing `SignupRequests`, invites and `settings` containers under the tabs unchanged. Only their page chrome changes.
4. **Old URLs:** redirect `/signup-requests`, `/invites` and `/settings` to the new paths, so bookmarks and the broken email link still work. Also change the email link in `signup.go:98` to `/admin/signup-requests`.
5. **Menu:** replace the three entries in `LeftMenu.jsx` with one "Admin" entry, shown when the viewer can see at least one tab.
   - The entry has an MUI `Badge` with the count of things waiting: pending signup requests (the `pagination.total` from `GET /signup-requests?limit=1`) plus open report cases (from item 4b).
   - Load the counts once the session is ready, then again every 5 minutes and when the tab regains focus. Add a small `admin` reducer holding the counts, updated after each approve, reject or resolve.
6. **i18n:** a new `admin` namespace in en-GB and fr-FR, registered in `languages/*/index.js`.

## Estimate
3–4 h.

## Verification
- An admin sees Admin, with Reports, Signup requests and Invites.
- A super-admin also sees Settings.
- A registered user sees no menu entry, and gets the "restricted" message at `/admin`.
- Old URLs redirect. The badge count drops after approving a request.
- The link in the signup email opens the right tab.

## Documentation

A phase is finished only when these pages match the code. anahita-services pages are under its `docs/`, anahita-web pages under its `docs/`. When a page is added, add it to that repo's `docs/README.md` contents too.

- **web `architecture.md`**, *Routes*: `/admin` and its tabs, and the redirects from `/signup-requests`, `/invites`, `/settings`; *What a viewer may do*: which roles see which tab.
- **services `registration.md`**, *The approval queue*: the signup-request email now links to `/admin/signup-requests`.

## Status

| Item | State |
| --- | --- |
| Plan | written 2026-09-28 |
| Implementation | not started |
