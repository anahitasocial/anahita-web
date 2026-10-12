# anahita-web

## Material UI docs

This repo configures the MUI MCP server (`mui-mcp`, in `.mcp.json`). For any
question or change involving Material UI:

1. Call `useMuiDocs` for the documentation of the relevant MUI package.
2. Call `fetchDocs` for further pages, using only URLs the previous calls
   returned.
3. Repeat until everything relevant is gathered, then answer from what was
   fetched, not from memory.

The app is on `@mui/material` v9 throughout. The upgrade from Material-UI v4
(`@material-ui/*`) is finished and nothing imports the old packages; see
`docs/plans/done/mui-upgrade.md`.
