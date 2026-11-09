# Documentation

Documentation for Anahita Web, the web app for Anahita. The server side,
including every setting an operator changes without rebuilding this app, is
documented in [anahita-services](https://github.com/anahitasocial/anahita-services).

To set up a whole site, make it your own, keep it running or build on it,
begin with the four ways in that the services' docs give:
[Where to begin](https://github.com/anahitasocial/anahita-services/blob/main/docs/README.md#where-to-begin).

Its releases are named as the services' are: `main` is always the
**Embryo**, and a tagged version is a **Birth** release. The web app has
its own versions, and each Birth release says which Anahita Services
releases it works with; see
[Releases](https://github.com/anahitasocial/anahita-services/blob/main/docs/releases.md#with-anahita-web).

Asking an AI agent about the web app? Add Anahita's MCP server to it: see
[Anahita MCP](https://github.com/anahitasocial/anahita-services/blob/main/docs/ai-agents.md).

## Contents

1. [Getting started](getting-started.md): running the app locally
   1. [Requirements](getting-started.md#requirements)
   2. [Installing](getting-started.md#installing)
   3. [First run](getting-started.md#first-run)
   4. [Developing](getting-started.md#developing)
   5. [Tests](getting-started.md#tests)
   6. [Linting](getting-started.md#linting)
2. [Configuration](configuration.md): every environment variable
   1. [How configuration works](configuration.md#how-configuration-works)
   2. [Variables](configuration.md#variables)
   3. [Settings that live on the server](configuration.md#settings-that-live-on-the-server)
   4. [Where the code is](configuration.md#where-the-code-is)
3. [Architecture](architecture.md): how the app is put together
   1. [Directory layout](architecture.md#directory-layout)
   2. [Talking to the API](architecture.md#talking-to-the-api)
   3. [Signing in](architecture.md#signing-in)
   4. [State](architecture.md#state)
   5. [Routes](architecture.md#routes)
   6. [What a viewer may do](architecture.md#what-a-viewer-may-do)
   7. [Translations](architecture.md#translations)
   8. [Styling](architecture.md#styling)
4. [Customising](customising.md): making an installation your own
   1. [Name, description and logo](customising.md#name-description-and-logo)
   2. [Themes](customising.md#themes)
   3. [Languages](customising.md#languages)
   4. [Terms of Service and Privacy Policy](customising.md#terms-of-service-and-privacy-policy)
   5. [Where the code is](customising.md#where-the-code-is)
5. [Deploying](deploying.md): building and hosting the app
   1. [Building](deploying.md#building)
   2. [What the server needs to know](deploying.md#what-the-server-needs-to-know)
   3. [Hosting](deploying.md#hosting)
   4. [AWS Amplify](deploying.md#aws-amplify)
