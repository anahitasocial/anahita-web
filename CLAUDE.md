# anahita-web

## Material UI docs

This repo configures the MUI MCP server (`mui-mcp`, in `.mcp.json`). For any
question or change involving Material UI:

1. Call `useMuiDocs` for the documentation of the relevant MUI package.
2. Call `fetchDocs` for further pages, using only URLs the previous calls
   returned.
3. Repeat until everything relevant is gathered, then answer from what was
   fetched, not from memory.

The app is being upgraded from Material-UI v4 (`@material-ui/*`) to
`@mui/material` v9; see `docs/plans/mui-upgrade.md`. Check which version a file
is on before applying docs for the other.
