![Anahita social networking platform and framework](docs/images/anahita-logo.png)

# Anahita Web

The web app for [Anahita](https://www.anahita.io), an open source social
networking platform and framework. It is a single-page app built with React 19,
Material UI 9 and Redux. It is a client of **anahita-services**, the Go
microservices back end, and talks to it only through its HTTP API.

Changing the code, as a person or with an agent: begin with
[AGENTS.md](AGENTS.md), the project's working rules.

People use it to keep a profile, follow people, groups and events, post
notes, articles, topics, photos and videos, reply, like, repost and quote,
build their own feeds, and run their account. They follow and answer
people on Mastodon and Bluesky from the same place. Site administrators
use it to run the installation.

> **anahita-services is not public yet.** The back end will be released later
> in 2026. Until then this app has no server to run against outside the
> Anahita team.

## Part of the fediverse

An Anahita site is not an island. It speaks to the two open social networks,
each in its own protocol, and people take part in both without leaving the
site they are on.

| | Mastodon and the fediverse | Bluesky |
| --- | --- | --- |
| **Protocol** | ActivityPub | AT Protocol |
| **Follow and read** | Yes | Yes |
| **Be followed** | Yes | Through your own Bluesky account |
| **Posts, with pictures and link cards** | Both ways | Both ways |
| **Replies, likes and reposts** | Both ways | Both ways |
| **Who you are there** | `@name@your-site.example` | The Bluesky account you connect |

### Mastodon and the fediverse

Anahita is a server of the fediverse in its own right.

- **Found by a handle.** Each person chooses whether to be found, and is then
  `@name@your-site.example` to every Mastodon, GoToSocial or Pixelfed server.
- **Two-way.** Following, posts with their pictures, replies, likes and
  reposts cross both ways, and each is taken back when it is taken back here.
- **Private by design.** Pictures from other servers are copied into the
  site's own storage, so reading a post tells no other server who looked.

### Bluesky

- **Anybody can read.** Look up a Bluesky account, follow it, and its posts,
  replies and reposts are in your feed.
- **Connect your account to answer.** Somebody who connects the Bluesky
  account they already have posts there too: public notes and photos, and
  every reply, like, repost and follow made here, as them.
- **It comes back.** What people on Bluesky do in return arrives here, and
  what you post in Bluesky's own app appears here as yours.

### One feed for all of it

A post from Mastodon, a post from Bluesky and a post written here sit in the
same feed, newest first, and are liked, answered and reposted the same way.
The feeds people build for themselves, the hashtags, the recommendations and
the blocks apply to all three.

### On the site's terms

- **Each person's own choice.** Federation is off until they turn it on.
- **Each operator's own choice.** The two networks are separate, optional
  services: run both, either, or neither, and refuse any server.
- **Nothing leaks.** A site that is for its members only sends nothing out.

As far as we know, Anahita is the first social platform built in Canada to
take part in both networks at once. We would be glad to hear of another.

The operator's side of this is in anahita-services (`docs/federation.md`).
What the web app does with it is in [Architecture](docs/architecture.md).

## Quick start

You need [Node.js](https://nodejs.org/) (a current LTS release),
[Yarn](https://yarnpkg.com/), and anahita-services running locally.

```sh
yarn install
cp .env.example .env     # then set REACT_APP_API_BASE_URL=http://localhost
yarn start
```

The app opens at `http://localhost:3000`. See
[Getting started](docs/getting-started.md) for the details.

## Documentation

The documentation is in [`docs/`](docs/README.md):

1. [Getting started](docs/getting-started.md): running the app and developing
   it
2. [Configuration](docs/configuration.md): every environment variable
3. [Architecture](docs/architecture.md): how the app is put together and how
   it talks to the server
4. [Customising](docs/customising.md): themes, languages and legal documents
5. [Deploying](docs/deploying.md): building and hosting it

## How it fits together

- **The API** is anahita-services, behind its nginx gateway. Every request goes
  to `REACT_APP_API_BASE_URL`.
- **Signing in and signing up happen on the server.** The app sends people to
  auth-service's pages using OAuth 2.0 with PKCE, and comes back to
  `/oauth/callback`. Tokens stay on the server behind a session cookie; the app
  never sees a password.
- **The server decides what each viewer may do.** Whether someone can post,
  reply, like or edit is sent with each response, and the app shows only the
  controls that will work.
- **Operator settings live on the server.** Registration mode, support
  contacts and the other settings an operator changes without a rebuild are
  read from the server's NodeInfo document.

## Licence

[MIT](LICENSE)

## Credits

Anahita is developed and maintained by [rmdStudio Inc.](http://www.rmdstudio.com),
a software development company in Vancouver, Canada.

This project was bootstrapped with
[Create React App](https://github.com/facebook/create-react-app).
