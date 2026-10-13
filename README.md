![Anahita social networking platform and framework](docs/images/anahita-logo.png)

# Anahita Web

The web app for [Anahita](https://www.anahita.io), an open source social
networking platform and framework. It is a single-page app built with React 19,
Material UI 9 and Redux. It is a client of **anahita-services**, the Go
microservices back end, and talks to it only through its HTTP API.

People use it to keep a profile, follow people, groups and events, post
notes, articles, topics, photos and videos, reply, like, repost and quote,
build their own feeds, and run their account. They follow and answer
people on Mastodon and Bluesky from the same place. Site administrators
use it to run the installation.

## Part of the fediverse: Mastodon and Bluesky, from one place

An Anahita site is not an island. It speaks to the two open social
networks, each in its own protocol, and people take part in both without
leaving the site they are on.

**With Mastodon and the rest of the fediverse, over ActivityPub.** Anahita
is a server of the fediverse in its own right:

- Each person chooses whether to be found, and is then
  `@name@your-site.example` to every Mastodon, GoToSocial or Pixelfed
  server.
- Following works both ways, and so do posts with their pictures, replies,
  likes and reposts, each taken back when it is taken back here.
- Posts from other servers arrive as ordinary posts: with their hashtags, a
  card for the link in them, and their pictures copied into the site's own
  storage, so that reading them tells no other server who looked.

**With Bluesky, over the AT Protocol.**

- Anybody can look up a Bluesky account, follow it, and read its posts,
  replies and reposts in their feed.
- Somebody who connects the Bluesky account they already have also
  answers: their public notes and photos are posted there, and a reply, a
  like, a repost or a follow made here is made there too, as them.
- What people on Bluesky do in return comes back, and what they post in
  Bluesky's own app appears here as theirs.

**One feed for all of it.** A post from Mastodon, a post from Bluesky and
a post written here sit in the same feed, newest first, and can be liked,
answered and reposted the same way. The feeds people build for themselves,
the hashtags, the recommendations and the blocks apply to all three.

**On the site's terms.** Federation is each person's own choice and is off
until they make it. An operator can refuse any server, run either network
without the other, or run neither: both are separate, optional services.
A site that is for its members only sends nothing out.

As far as we know, Anahita is the first social platform built in Canada to
take part in both networks at once. We would be glad to hear of another.

The operator's side of this is in anahita-services
(`docs/federation.md`). What the web app does with it is in
[Architecture](docs/architecture.md).

> **anahita-services is not public yet.** The back end will be released later
> in 2026. Until then this app has no server to run against outside the
> Anahita team.

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
