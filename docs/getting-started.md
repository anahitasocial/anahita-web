# Getting started

[Documentation](README.md) › Getting started

Running the app locally and working on it.

## Contents

- [Requirements](#requirements)
- [Installing](#installing)
- [First run](#first-run)
- [Developing](#developing)
- [Tests](#tests)
- [Linting](#linting)

## Requirements

- [Node.js](https://nodejs.org/), a current LTS release
- [Yarn](https://yarnpkg.com/)
- anahita-services running locally. See its getting started guide. Its nginx
  gateway answers at `http://localhost`, and allows `http://localhost:3000`,
  where this app runs, for CORS.

  anahita-services will be released later in 2026. Until then it is available
  only to the Anahita team.

## Installing

```sh
yarn install
cp .env.example .env
```

In `.env`, point the app at the local API:

```sh
REACT_APP_API_BASE_URL=http://localhost
```

The other values in `.env.example` work as they are for local development.
Every variable is described in [Configuration](configuration.md).

## First run

```sh
yarn start
```

The app opens at `http://localhost:3000`.

Signing in sends you to auth-service's sign-in page and back to
`http://localhost:3000/oauth/callback`. anahita-services registers that
address for the `anahita-web` OAuth client when it seeds its clients, so it
works without any setup. If signing in fails with a redirect error, check that
the app is on port 3000 and that the client's seed has not been changed.

Whether the **Create account** button appears depends on the server's
`REGISTRATION_MODE`, not on anything in this app.

## Developing

`yarn start` runs the development server with hot reload.

In development the Redux store also runs `redux-logger`, which logs every
action to the browser console, and the Redux DevTools dock
(`src/containers/DevTools.jsx`). Neither is in a production build.

`REACT_APP_*` values are read when the server starts. After changing `.env`,
restart `yarn start`.

## Tests

```sh
yarn test                                  # watch mode
CI=true yarn test --watchAll=false         # run once, as CI would
```

Tests live next to what they test, in `__tests__` directories, and are run by
Jest through Create React App. Most test plain modules rather than rendering
components. For example, `src/containers/actors/Settings/__tests__/` checks
the settings tabs and the permission rules as data. That is why several of
those modules are kept free of JSX.

## Linting

The code follows the Airbnb style guide (`.eslintrc.json`), with a few changes.
The one that shows most is that arrow functions always have a block body
(`arrow-body-style: always`).

```sh
npx eslint src
```

`yarn start` shows lint problems in the browser and the terminal as you work.
