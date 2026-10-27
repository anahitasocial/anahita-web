# Documentation

Documentation for Anahita Web, the web app for Anahita. The server side,
including every setting an operator changes without rebuilding this app, is
documented in [anahita-services](https://github.com/anahitasocial/anahita-services).

To set up a whole site, make it your own, keep it running or build on it,
begin with the four ways in that the services' docs give:
[Where to begin](https://github.com/anahitasocial/anahita-services/blob/main/docs/README.md#where-to-begin).

Asking an AI agent about the web app? Add
[anahita-mcp](https://github.com/anahitasocial/anahita-mcp) to it, an MCP
server that runs on your computer and reads these docs, the services' and
the API reference, read-only.

## Contents

1. [Getting started](getting-started.md): running the app locally
   - [Requirements](getting-started.md#requirements)
   - [Installing](getting-started.md#installing)
   - [First run](getting-started.md#first-run)
   - [Developing](getting-started.md#developing)
   - [Tests](getting-started.md#tests)
   - [Linting](getting-started.md#linting)
2. [Configuration](configuration.md): every environment variable
   - [How configuration works](configuration.md#how-configuration-works)
   - [Variables](configuration.md#variables)
   - [Settings that live on the server](configuration.md#settings-that-live-on-the-server)
   - [Where the code is](configuration.md#where-the-code-is)
3. [Architecture](architecture.md): how the app is put together
   - [Directory layout](architecture.md#directory-layout)
   - [Talking to the API](architecture.md#talking-to-the-api)
   - [Signing in](architecture.md#signing-in)
   - [State](architecture.md#state)
   - [Routes](architecture.md#routes)
   - [What a viewer may do](architecture.md#what-a-viewer-may-do)
   - [Translations](architecture.md#translations)
   - [Styling](architecture.md#styling)
4. [Customising](customising.md): making an installation your own
   - [Name and description](customising.md#name-and-description)
   - [Themes](customising.md#themes)
   - [Languages](customising.md#languages)
   - [Terms of Service and Privacy Policy](customising.md#terms-of-service-and-privacy-policy)
   - [Where the code is](customising.md#where-the-code-is)
5. [Deploying](deploying.md): building and hosting the app
   - [Building](deploying.md#building)
   - [What the server needs to know](deploying.md#what-the-server-needs-to-know)
   - [Hosting](deploying.md#hosting)
   - [AWS Amplify](deploying.md#aws-amplify)
