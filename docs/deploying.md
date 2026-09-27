# Deploying

[Documentation](README.md) › Deploying

Building the app and hosting it.

## Contents

- [Building](#building)
- [What the server needs to know](#what-the-server-needs-to-know)
- [Hosting](#hosting)
- [AWS Amplify](#aws-amplify)

## Building

```sh
yarn install
yarn build
```

The result is a static site in `build/`: HTML, JavaScript, CSS and images. No
server-side code runs.

Set the [environment variables](configuration.md) **before** building. They are
compiled into the bundle, so a build is tied to one installation. In
particular, `REACT_APP_API_BASE_URL` has to be the public address of your API,
for example `https://api.example.com`.

`DISABLE_ESLINT_PLUGIN=true` makes production builds faster by skipping lint,
which has already run during development.

## What the server needs to know

The app and the API are usually on different domains, for example
`www.example.com` and `api.example.com`. anahita-services has to be told about
the app's address in two places, or signing in fails:

| Where | What |
| --- | --- |
| nginx's CORS settings | Allow the app's origin, such as `https://www.example.com`, with credentials |
| The `anahita-web` OAuth client | Register `https://www.example.com/oauth/callback` as a redirect URI. A site administrator can do this in the app under **Settings › OAuth clients**; on a new installation it can go in anahita-services' `auth-defaults/oauth_seed_clients.json` before the first run |

Serve both over HTTPS. The session is a cookie set by the API's domain and sent
with the app's requests, and browsers only send such a cookie across sites
over HTTPS.

## Hosting

Any static host works: a CDN in front of object storage, nginx, Netlify, AWS
Amplify and so on.

**Every path has to serve `index.html`.** The app uses browser history, so a
link such as `/people/alice` is a real URL. The host must answer any path that
is not a file with `index.html`, with status 200, and let the app route it.
Without that rule, reloading any page other than `/` returns the host's 404.

With nginx, for example:

```nginx
location / {
    try_files $uri /index.html;
}
```

Files in `build/static/` have content hashes in their names and can be cached
for a long time. Keep `index.html` uncached, so a new build is picked up
straight away.

## AWS Amplify

Connect Amplify to the repository and it builds on every push, using
`amplify.yml`: `yarn install`, then `yarn run build`, publishing `build/`.

- Set the [environment variables](configuration.md) in Amplify's settings
  instead of a `.env` file.
- Add a rewrite so every path serves `index.html`. In **Rewrites and
  redirects**, send `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>`
  to `/index.html` as a **200 (Rewrite)**.
- Tell the server about the app's address, as described in
  [What the server needs to know](#what-the-server-needs-to-know).
