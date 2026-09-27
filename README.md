![Anahita social networking platform and framework](https://s3.ca-central-1.amazonaws.com/production.anahita.io/media/logos/homepage_logo.png)

# Anahita Web

The web app for [Anahita](https://www.anahita.io), an open source social
networking platform and framework. It is a single-page app built with React 18,
Material-UI 4 and Redux. It is a client of **anahita-services**, the Go
microservices back end, and talks to it only through its HTTP API.

People use it to keep a profile, follow people and groups, post notes,
articles, topics and photos, comment and like, and run their account. Site
administrators use it to run the installation.

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
  comment, like or edit is sent with each response, and the app shows only the
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
