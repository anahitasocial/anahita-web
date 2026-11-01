# Security

## Reporting a vulnerability

Please do not open a public issue. Report it privately on GitHub instead:
the repository's **Security** tab, then **Report a vulnerability**
(<https://github.com/anahitasocial/anahita-web/security/advisories/new>).
Only the maintainers see it. Without a GitHub account, write to
<security@anahita.io>.

Say what is affected, how to reproduce it, and what somebody could do with
it. You will have a reply within seven days. When it is fixed, the advisory
is published, with your name in it if you would like.

## What this covers

| What | Where to report |
| --- | --- |
| The services, and the images built from them | [anahita-services](https://github.com/anahitasocial/anahita-services/security/advisories/new) |
| The web app | [anahita-web](https://github.com/anahitasocial/anahita-web/security/advisories/new) |
| The website, www.anahita.io | [anahita.io](https://github.com/anahitasocial/anahita.io/security/advisories/new) |
| The MCP server, on npm and at mcp.anahita.io | [anahita-mcp](https://github.com/anahitasocial/anahita-mcp/security/advisories/new) |
| A site that runs Anahita | The people who run it: their address is on the site's `/support` page |

Only `main` is supported: a site builds the web app from it.

## Advisories on build tools

The alerts still open on this repository are all in tools that `react-scripts`
holds at old versions: `webpack-dev-server`, `webpack-dev-middleware`, `postcss`,
`svgo`, `minimatch`, `uuid` and `deepmerge`. They run on a developer's machine
during `yarn start` and `yarn build`, and none is in what is sent to browsers.
Replacing `react-scripts` closes them (the roadmap's row 118). Until then, close
other tabs you do not trust while `yarn start` is running.
