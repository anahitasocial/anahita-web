# Anahita roadmap

*Planned 2026-09-28. One plan file per item, in the repo the item mostly touches.*

**The order follows four principles:**
1. Fix security and data problems first.
2. Lay shared foundations before the features that need them.
3. Build moderation before growth.
4. Save the biggest item, federation, for when everything it builds on exists.

Each milestone ends in a shippable state.

**Definition of done.** A phase is finished when its code, its tests and its documentation are done: every plan has a *Documentation* section listing the pages that phase must update. When a plan is finished, set its Status table, move it to `docs/plans/done/`, and update the plans table in anahita-services' `docs/README.md`.

| # | Item | Plan file | Repo | Est. sessions | Needs |
| --- | --- | --- | --- | --- | --- |
| **Now** | Rotate the AWS key found in `k8s/00-secret.yml` | — | services | ops, minutes | — |
| **M1. Safety and cleanup** | | | | **about 4–5** | |
| 1 | 0 · Feed access leak | [feed-access-leak.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/feed-access-leak.md) | services | ½–1 | — |
| 1b | 0b · auth-service hardening: IP lookup, `X-Forwarded-For`, refresh re-checks `Enabled`, TOTP freshness, gRPC shared-secret interceptor | [auth-service-hardening.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/auth-service-hardening.md) | services | 2 | — |
| 2 | 1 · Remove private notes | [remove-private-notes.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/remove-private-notes.md) | services + web | 1 | — |
| 3 | 18 · Delete legacy photo sets | (section of [photo-albums.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/photo-albums.md)) | services | ½ | — |
| 4 | 2 · Remove site-wide media browse | [remove-global-media-browse.md](remove-global-media-browse.md) | web + services | ½ | — |
| **M2. Foundations** | | | | **about 14–18** | |
| 5 | 9 · Cloud-neutral (storage, local Garage/MinIO, upload hardening, keys, k8s overlays) | [cloud-neutral.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/cloud-neutral.md) | services + web | 5–6 | — |
| 5b | 0c · gRPC mTLS (cert-manager or Linkerd) | [auth-service-hardening.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/auth-service-hardening.md) | services | 2–3 | 9, 0b |
| 6 | 6 · Sign in with a code | [login-code.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/login-code.md) | services | 3–4 | — |
| 7 | 6b · Codes for signup, reset, email change, step-up | [login-code.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/login-code.md) (phase 2) | services + web | 3–4 | 6 |
| **M3. Administration and moderation** | | | | **about 13** | |
| 8 | 4a · Admin area | [admin-area.md](admin-area.md) | web | 1 | — |
| 9 | 4b · Abuse reports | [abuse-report-service.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/abuse-report-service.md) | services + web | 6 | 4a |
| 10 | 5 · Complete purge + bulk cleanup | [actor-hard-delete.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/actor-hard-delete.md) | services + web | 6 | 4a |
| **M4. Posting experience** | | | | **about 13–18** | |
| 11 | 13 · Composer audience picker, then members-only / preview / no-public settings | [instance-privacy.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/instance-privacy.md) | services + web | 5–7 | 4a |
| 12 | 20 · Language on posts | [content-language.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/content-language.md) | services + web | 2–3 | — |
| 13 | 19 · Creative Commons licences | [content-licences.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/content-licences.md) | services + web | 3–4 | 9 |
| 14 | 17 · Up to 4 images per photo post | [photo-albums.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/photo-albums.md) | services + web | 3–4 | 9 |
| **M5. Conversations** | | | | **about 10–13** | |
| 15 | 7 · Notes as replies; retire comment-service | [notes-as-replies.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/notes-as-replies.md) (update) | services + web | 7–9 | 0, 1 |
| 16 | 15 · Pinned posts + "New from people you follow" tray; remove story-service | [pinned-posts-and-activity-tray.md](pinned-posts-and-activity-tray.md) | services + web | 3–4 | 0 |
| **M6. Community** | | | | **about 10–13** | |
| 17 | 11 · Invitations (plus 8 socialgraph bug fixes) | [actor-invitations.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/actor-invitations.md) | services + web | 5–6 | 4b limiter |
| 18 | 12 · Events | [events.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/events.md) | services + web | 5–7 | 11 |
| **M7. Discovery** | | | | **about 15–18** | |
| 19 | 14 · Custom feeds ("your algorithm") | [feed-generators.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/feed-generators.md) (update) | services + web | 5–7 | 0 |
| 20 | 3 · Recommendation service | [recommendation-service.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/recommendation-service.md) | services + web | 6 | 0, 1 |
| 21 | 10 · Link previews + web shell (Open Graph) | [link-previews.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/link-previews.md) + [open-graph.md](open-graph.md) | services + web | 4–5 | 9 |
| **M8. Media and portability** | | | | **about 11–14** | |
| 22 | 16 · Video service + worker | [video-service.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/video-service.md) | services + web | 5–7 | 9 |
| 23 | 21 · Download your data | [data-export.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/data-export.md) | services + web | 6–7 | 9, 5 |
| **M9. Federation** | | | | **about 19–25** | |
| 24 | 8 · Phase 0 groundwork | [federation.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/federation.md) | services | 5–6 | 0, 9, 10 |
| 25 | 8 · Phase 1 ActivityPub | [federation.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/federation.md) | services + web | 7–9 | 24 |
| 26 | 8 · Phase 1 AT Protocol | [federation.md](https://github.com/purplerat/anahita-services/blob/main/docs/plans/federation.md) | services + web | 6–8 | 24 |

**Total: about 425–560 hours, roughly 105–140 sessions** at about 4 h per session. Shared pieces built once save a few percent:
- the rate limiter;
- `FilterNodesForViewer`;
- the jobs queue;
- the file-grpc streaming RPCs;
- the ingress/TLS work.

**Deliberately early groundwork for federation:**
- item 9 already fixes storage, TLS and ingress;
- item 10 settles web hosting on the same front as the API;
- item 7 gives replies the ActivityPub shape.

To get to federation sooner, you can move **M9 phase 0** right after M3 and do **phase 1 ActivityPub** after M5. The cost is building feeds, events and video afterwards with federation in mind. Everything is already designed for that.

**Shared components, built by whichever item comes first:**

| Component | Used by |
| --- | --- |
| Shared rate limiter (`anahita-libs`) | 4b, 3, 10, 11, 20, 21 |
| `FilterNodesForViewer` (graph-grpc) | 3, 4b |
| Durable jobs queue (`anahita-libs/jobs`) | 8, 16, 21 |
| file-grpc streaming RPCs | 16, 21 |
| Stable public media URLs | 9 A / 8 phase 0.4, used by 10, 16, 17, 19 |
| Kustomize base, TLS, ingress | 9 E, used by 8 phase 0.8 |

### Plan files

**anahita-services** (`docs/plans/`), linked in the table above:
- scheduled: `auth-service-hardening.md` (items 0b and 0c);
- new: `feed-access-leak.md`, `remove-private-notes.md`, `recommendation-service.md`,
  `abuse-report-service.md`, `actor-hard-delete.md`, `login-code.md`, `federation.md`,
  `cloud-neutral.md`, `link-previews.md`, `actor-invitations.md`, `events.md`,
  `instance-privacy.md`, `video-service.md`, `photo-albums.md`, `content-licences.md`,
  `content-language.md`, `data-export.md`;
- extended with a "Decisions and schedule" section: `notes-as-replies.md`, `feed-generators.md`;
- pointers added: `done/onboarding.md` (recommendations) and `actor-profile-management.md` §2 (hard delete).
- finished, moved to `done/`: `signup-and-onboarding.md`, `onboarding.md`, `dissolve-people-people.md`, `actor-lifecycle-states.md`.

**anahita-web** (`docs/plans/`): this roadmap, `remove-global-media-browse.md`, `admin-area.md`,
`open-graph.md`, `pinned-posts-and-activity-tray.md`; finished, in `done/`: `deps-upgrade.md`, `mui-upgrade.md`, `onboarding.md`.

The operator guide `anahita-services/docs/deploying.md` (provider matrix and `STORAGE_*` settings)
is written as part of item 9, once those settings exist.
