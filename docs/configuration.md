# Configuration

[Documentation](README.md) › Configuration

Every environment variable the app reads, and why most settings are not here.

## Contents

- [How configuration works](#how-configuration-works)
- [Variables](#variables)
- [Settings that live on the server](#settings-that-live-on-the-server)

## How configuration works

The app is configured with environment variables, set in a `.env` file in
development or in the host's settings when it is built for production.
`.env.example` lists them all with notes. Copy it to `.env` to start.

Three things follow from the app being built with Create React App:

- **Only `PUBLIC_URL`, `NODE_ENV` and variables beginning `REACT_APP_` reach
  the app.** Anything else is invisible to it, whatever its name.
- **Values are compiled into the bundle when it is built.** Changing one means
  restarting `yarn start`, or rebuilding for production.
- **Anybody can read them.** They end up in JavaScript that every visitor
  downloads, so none of them may hold a secret.

Create React App reads these files, highest priority first. No other file name
is read:

| File | Loaded |
| --- | --- |
| `.env.development.local`, `.env.production.local` | For `yarn start` and `yarn build` respectively |
| `.env.development`, `.env.production` | Likewise |
| `.env.local` | Always, except when running tests |
| `.env` | Always |

## Variables

### Identity

| Variable | Description |
| --- | --- |
| `REACT_APP_NAME` | The installation's name. Shown throughout the app and used as the page title in `public/index.html` |
| `REACT_APP_DESCRIPTION` | A one-line description, used as the page's meta description |
| `PUBLIC_URL` | Where the app is served from, for example `http://localhost:3000` |

### Back end

| Variable | Description |
| --- | --- |
| `REACT_APP_API_BASE_URL` | The anahita-services gateway, for example `http://localhost` in development or `https://api.example.com` in production. Every API call goes here, so this decides which installation the app belongs to |

### Optional

| Variable | Description |
| --- | --- |
| `REACT_APP_NOTIFICATIONS_CHECK_INTERVAL` | How often to check for new notifications, in milliseconds. `15000` (15 seconds) when unset; `.env.example` sets `1500000` (25 minutes) |
| `REACT_APP_ASSETS` | The theme to use: the name of a directory under `src/assets/`. Unset uses `src/assets/default`. See [Themes](customising.md#themes) |
| `REACT_APP_ANALYTICS` | Page-view analytics: `plausible`, `umami` or `matomo`. Unset means off: no script is loaded and nothing leaves the browser |
| `REACT_APP_ANALYTICS_URL` | Where that analytics service is, for example `https://stats.example.org` |
| `REACT_APP_ANALYTICS_SITE_ID` | The site as that service knows it: the domain for Plausible, the website id for Umami, the numeric site id for Matomo |
| `REACT_APP_MAP_TILE_URL` | Where map tiles come from, in Leaflet's `{s}/{z}/{x}/{y}` form. Unset uses OpenStreetMap's public tile server |
| `REACT_APP_MAP_TILE_ATTRIBUTION` | The credit shown on the map, as the tile server's licence requires. Unset credits OpenStreetMap |
| `REACT_APP_LOCATION_FIXED_COUNTRY` | Pins every new location to one country, as a two-letter code such as `CA`, and hides the country field |
| `REACT_APP_LOCATION_FIXED_STATE_PROVINCE` | Pins new locations to one state or province, as a short code such as `BC` |
| `REACT_APP_LOCATION_FIXED_CITY` | Pins new locations to one city, as free text |

Leave the location variables unset to let people choose freely. That is the
usual case.

### Third parties the app talks to

With the defaults, the browser contacts two services besides your own API:

- **OpenStreetMap's tile server**, whenever a map is shown. Point
  `REACT_APP_MAP_TILE_URL` at your own tiles to avoid it.
- **Video and audio hosts** (YouTube, Vimeo and the like), only when a post
  embeds something from one of them.

Analytics is off unless you configure it, and all three supported services can
be self-hosted. The app loads no fonts or scripts from a CDN.

### Build

| Variable | Description |
| --- | --- |
| `ESLINT_NO_DEV_ERRORS` | `true` shows lint errors as warnings in development instead of failing the build |
| `DISABLE_ESLINT_PLUGIN` | `true` skips linting during the build entirely, which is faster for production builds |

## Settings that live on the server

Anything an operator should be able to change without rebuilding the app is
configured in anahita-services. The app reads it at run time, mostly from the
server's NodeInfo document (`/.well-known/nodeinfo`):

| Setting | Where it is set |
| --- | --- |
| Whether people can sign up, and how | `REGISTRATION_MODE` |
| Support email, phone and website | `SUPPORT_EMAIL`, `SUPPORT_PHONE`, `SUPPORT_WEBSITE` |
| Who may create groups and send invitations | `GROUPS_FROM`, `INVITES_FROM` |
| Whether people who are not signed in can read anything | `SITE_READ_ACCESS`. On a members-only site the app shows them a way in, in place of every page |
| Whether anything new may be public | `MIN_CONTENT_ACCESS`. The app stops offering "Public" where it may not |
| Who may post, comment and like by default | `graph-grpc-defaults/actor_features` |

Some older variables are no longer read:

| Variable | Replaced by |
| --- | --- |
| `REACT_APP_SIGNUP_CLOSED` | `REGISTRATION_MODE` on the server |
| `REACT_APP_GOOGLE_MAPS_API_KEY` | Nothing. Maps use Leaflet with OpenStreetMap |
| `REACT_APP_THEME` | `REACT_APP_ASSETS` |
| `SUPPORT_EMAIL` and the other `SUPPORT_*` | The server's `SUPPORT_*`. Without the `REACT_APP_` prefix these never reached the app |
