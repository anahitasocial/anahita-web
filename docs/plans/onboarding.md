# Onboarding — web app

Companion to `anahita-services/docs/plans/onboarding.md`, which owns the flow,
the rules (nothing is followed automatically, skipping is quiet, an empty list
skips its step, existing members are included) and the backend items. This plan
covers only the web app. **S1–S6** refer to items in the services plan.

## Context

Signup asks only for username, email and password. After the agreements,
somebody with an incomplete profile is walked through avatar → name, bio,
pronouns → featured accounts → dashboard. This document is the React side: a
gate, a stepper, three steps, a toggle for super administrators to feature an
account, and a dashboard nudge.

## Phases

1. **Profile** — W1–W5, W8. Needs S1.
2. **Featured accounts** — W6, W7. Needs S2–S6.
3. **Suggestions from interests** — deferred to the recommendation engine in the
   services plan. When it lands it adds an "Interests" step (hashtags and
   locations as chips) and a "Suggested" step, both under the empty-list rule.

## What the web app uses from services

| what | from | arrives as |
| --- | --- | --- |
| `onboarded_at`, `has_bio` on `/oauth/userinfo` | S1 | `viewer.onboardedAt`, `viewer.hasBio` |
| `PATCH /onboarding` | S1 | |
| `GET /onboarding` → `{ invited_by }` | S6 | inviter's alias or `null` |
| `featured_at` on actor responses | S3 | `actor.featuredAt` |
| `PATCH /people/:id/featured`, `PATCH /groups/:id/featured` | S4 | |
| `GET /people/?featured=1`, `GET /groups/?featured=1` | S5 | |

## Status

`⬜ todo` · `🚧 in progress` · `✅ done` · `⛔ blocked`

| item | phase | state | depends on | commit |
| --- | --- | --- | --- | --- |
| W1. Viewer, API module, `needsOnboarding` | 1 | ⬜ | S1 | |
| W2. `OnboardingGate` | 1 | ⬜ | W1 | |
| W3. `containers/onboarding/` shell and stepper | 1 | ⬜ | W1 | |
| W4. Avatar step | 1 | ⬜ | W3 | |
| W5. Profile step (name, bio, pronouns) | 1 | ⬜ | W3 | |
| W6. Feature toggle for super administrators | 2 | ⬜ | S4 | |
| W7. Featured accounts step | 2 | ⬜ | W3, S5, S6 | |
| W8. Dashboard nudge | 1 | ⬜ | W1 | |

## Work items

### W1. Viewer, API module, `needsOnboarding`

- `src/proptypes/Viewer.js`: add `onboardedAt`, `hasBio`, and the missing
  `tosAgreement` / `privacyAgreement`.
- `src/api/onboarding.js`, a plain object like `api/agreements.js`:
  `read()` (GET `/onboarding`) and `complete()` (PATCH `/onboarding`). Register
  it in `src/api/index.js`. No redux slice: this flow's state is local to the
  flow, the same as `containers/agreements/`.
- `src/utils/onboarding.js`: `needsOnboarding(viewer)` returns
  `!viewer.onboardedAt && (!viewer.avatarUrls || !viewer.hasBio)`, the same
  shape as `utils/agreements.js` `hasOutdatedTerms`, plus
  `hasIncompleteProfile(viewer)` for the nudge.

### W2. `OnboardingGate`

- `src/routes/OnboardingGate.jsx`, the shape of `routes/AgreementsGate.jsx`:
  same selectors, `<Navigate to="/onboarding" replace />` when
  `needsOnboarding(viewer)`.
- Reachable while outstanding: `/onboarding`, `/agreements`, `/legal`,
  `/support`, `/oauth/callback`.
- Nested *inside* `AgreementsGate` in `src/routes/index.js`, and returns children
  while `hasOutdatedTerms(viewer)`, so agreements always come first and the two
  gates never fight each other.
- `/onboarding` route inside `<AuthenticatedRoute>`, next to `/agreements`.
- `isReachable` moves to a shared `routes/reachable.js` used by both gates.

### W3. Shell and stepper

- `src/containers/onboarding/index.jsx` holds the step list, the active step,
  and the flow's data.
- **An empty list skips its step.** A step that would show an empty list is
  removed from the flow, never shown empty, and a failed request counts as
  empty.
- The step list is built up front. On mount the shell fetches what the list
  steps need (phase 2: the featured accounts and the inviter, W7) with
  `Promise.allSettled` and shows `<Progress/>` until they return, then builds
  the steps: avatar and profile always, featured accounts if any came back. The
  stepper shows only steps that will happen.
- With nothing to offer (a fresh installation), the flow is avatar → profile →
  dashboard. Avatar and profile depend on no content, so there is always at
  least one step.
- Stepper: MUI `Stepper`/`Step`/`StepLabel` with `alternativeLabel`, in a Card,
  following `containers/auth/Totp/TotpSteps.jsx`. Step keys in
  `src/constants/onboarding.js` (`STEPS`), like `constants/totp.js`.
- `StepActions.jsx`, one shared footer: the primary `Button variant="contained"`
  ("Continue", or "Finish" on the last step), and below it a quiet
  `Link color="textSecondary"` "Skip for now" — never a button.
- Finish (on the last step, or skipping it): `api.onboarding.complete()`, then
  `dispatch(actions.session.read())`, then `navigate('/', { replace: true })`.
  Errors go through `actions.app.alert.error`, as in
  `containers/agreements/index.jsx`.
- No new `makeStyles`/`withStyles`: layout through `Box` and `Grid` props, so
  the MUI upgrade has nothing to migrate here but imports.
- i18n: an `onboarding` namespace in `src/languages/en-GB/onboarding.js` and
  `fr-FR/onboarding.js`, registered in each locale's `index.js`.

### W4. Avatar step — `Steps/Avatar.jsx`

- Reuse `containers/actors/Forms/Avatar.jsx` (`ActorAvatarForm`, size `large`)
  and `api/avatar.js` `add(node, file)`, as `containers/actors/Read/Avatar.js`
  already does.
- After upload, re-read the session so `viewer.avatarUrls` updates.
- No cropping. The server's `square` size centre-crops already.

### W5. Profile step — `Steps/Profile.jsx`

- Reuse the fields of `containers/people/Settings/InfoForm.jsx` (name, body,
  `SelectPronouns`) and the save path of `containers/people/Settings/Info.jsx`:
  `form.createFormFields` → `validateForm` → `fieldsToData` →
  `actions.people.edit`. Load the person with `actions.people.read(viewer.alias)`
  so the fields are pre-filled.
- `websiteUrl` is left out of this step.
- **Check first:** `personPronouns` is not in `Info.jsx`'s `formFields`, so
  pronouns may not be saved. Add it and check that it saves, in Settings and
  here.
- After save, re-read the session so `viewer.hasBio` updates.

### W6. Feature toggle for super administrators

- `api/actor/featured.js`: `edit(namespace, actor, featured)` →
  `PATCH /<namespace>/:id/featured`.
- A "Feature this account" / "Stop featuring" item in the actor's menu,
  shown only to super administrators (`permissions/actor.js`
  `canFeature(viewer, actor)`), for people and groups. The state comes from
  `actor.featuredAt`.

### W7. Featured accounts step — `Steps/Featured.jsx`

- The shell fetches, on mount: `api.onboarding.read()` for the inviter's alias,
  then the inviter's profile through `/people/:alias`; and
  `GET /people/?featured=1` and `GET /groups/?featured=1`. The inviter goes
  first; duplicates are dropped by id; the viewer is left out.
- `SuggestedActors.jsx`, a list: each row `ListItem` + `ListItemAvatar` +
  `components/ActorAvatar`, as in `containers/actors/Read/Admins.jsx`, labelled
  person or group, with:
  - a checkbox for "Follow selected", **never pre-checked**, the inviter
    included, and not shown for accounts already followed;
  - `containers/controls/Follow.jsx` for an immediate single follow.
- "Follow selected" calls `actions.socialgraph.follow({ actor, viewer })` for
  each checked account with `Promise.allSettled`, then continues. A failure
  shows an alert and does not block the flow.
- Follow requests: `Follow.jsx` has no "requested" state; for an account that
  requires approval, the follow is a request. Check what the response carries
  and add the state to `Follow.jsx` if needed, which fixes it everywhere else
  it is used too.

### W8. Dashboard nudge

- `src/containers/dashboard/CompleteProfileCard.jsx`, a dismissible card shown
  while `hasIncompleteProfile(viewer)`, linking to the person's settings.
- A new `Grid item` above `Composers` in `src/containers/Dashboard.jsx`.
- Dismissal in `localStorage`, reads and writes wrapped in try/catch: a
  per-browser convenience, not a record.

## Deferred

- Phase 3 (interests and suggestions) — see Phases.
- Avatar cropping.
- The MUI upgrade, which follows this plan.

## Verification

Run `yarn start` against a local anahita-services.

- A new account signs in → agreements → `/onboarding` → dashboard, and
  `/oauth/userinfo` has `onboarded_at`.
- Sign out and back in: straight to the dashboard.
- Skip every step: dashboard reached, `onboarded_at` set, the nudge shows;
  dismissing it survives a reload.
- Outdated terms and an incomplete profile: `/agreements` first, never
  `/onboarding`.
- While onboarding is outstanding, `/legal` and `/support` open; other paths
  redirect to `/onboarding`.
- Avatar upload updates the step and the app-bar avatar without a reload.
- Profile save persists name, bio **and pronouns**, in Settings too.
- Fresh installation, no featured accounts, not invited: the stepper shows only
  Avatar and Profile.
- Invited account: the inviter is first and not checked; no follow edge exists
  until one is clicked.
- Featured request fails (service stopped): the step is skipped and the flow
  completes.
- A super administrator features a person and a group; both appear in the step.
  An administrator who is not a super administrator sees no toggle.
- An existing member with an avatar and bio but no `onboardedAt` is not
  redirected.
- `yarn build` passes, and eslint has no new warnings.
