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
| The gateway's `WEB_ORIGIN` setting | The app's origin, such as `https://www.example.com`. The gateway allows that one origin to call the API with the session cookie. See anahita-services' `docs/deploying.md` |
| The `anahita-web` OAuth client | Register `https://www.example.com/oauth/callback` as a redirect URI. A site administrator can do this in the app under **Settings › OAuth clients**; on a new installation it can go in anahita-services' `auth-defaults/oauth_seed_clients.json` before the first run |

Serve both over HTTPS. The session is a cookie set by the API's domain and sent
with the app's requests, and browsers only send such a cookie across sites
over HTTPS.

## Hosting

There are two ways to put the app on the web.

### Through the web shell

anahita-services has a small server for the app, `web-shell`. It sends the
build's files, and for every page it sends `index.html` with that page's
own title, description and picture written in. That is what makes a link to
a profile or a post show as itself when it is pasted into Mastodon,
Bluesky, Slack or a message: those sites read the page's tags and run no
JavaScript, so on a plain static host every link to the app looks the same.

Build the app, then give the shell the `build/` folder:

```sh
yarn build
cd ../anahita-services
make web_shell WEB_BUILD=/path/to/anahita-web/build
```

It answers on the web app's own host (`www.example.com`), separate from the
API's, and needs no rewrite rule. Set `PUBLIC_WEB_URL` to that address.
Start it again after each new build. Everything else is in
anahita-services' `docs/web-shell.md`.

### On a static host

Any static host works: a CDN in front of object storage, nginx, Netlify, AWS
Amplify and so on. The app works the same; every shared link shows the
site's own title and picture, whatever page it is to.

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
