# Changelog

## 1.0.2

- The settings page checks the npm registry for a newer release at startup and shows an update card when one exists; the same check is available from a **Check for updates** button.
- **Update** uninstalls and reinstalls the newest release through the Harness plugin manager and asks for a restart; a local linked install is refused so its source directory is never removed. **Skip this version** hides that release until a newer one appears.
- New `updateCheck` config key (default `true`) turns the startup check off.
- New 3D magnifier artwork (`icon.png`); the same image is the package icon and the settings-page header mark.

## 1.0.1

First public release: Exa-backed `web_search` / `web_fetch`, ten additional tools, and three access modes.

### Tools

- `exa_search` — domain / category / date / text / subpage filters, `additionalQueries`, and the same arguments as Exa's advanced search.
- `exa_deep_search` — Deep Search with a synthesized answer; a `text` output schema is sent by default so Exa actually produces one.
- `exa_fetch` — up to five URLs, `format: text | highlights | summary`, optional subpages, three-way concurrency, and per-URL failure isolation.
- `exa_find_similar`, `exa_answer` — REST-only helpers for expanding a known URL and citing an answer.
- `exa_research` — Exa Agent with `run` / `cancel` / `stop`, resumable by `runId`.
- `exa_monitor` — list / get / runs / create / update / trigger / delete, webhook events, manual-only monitors (`manual: true` or `period: "none"`).
- `exa_webset`, `exa_batch` — registered only when the account/team is entitled (probed with free GETs).
- `exa_status` — active mode, per-mode tool counts, upstream, entitlements, spend estimate.
- Per-group tool switches in Settings, persisted across restarts.

### Access modes

- **Keyless** via Exa's public MCP endpoint (advanced search opted in; no `agent_run`).
- **API key** via the full REST surface (search, contents, find similar, answer, agent, monitors, websets, batch).
- **Exa account** via OAuth 2.1 + PKCE with dynamic client registration; the exposed MCP tools follow what the account actually offers.
- Settings shows the live mode × tool matrix and can run a minimal "Test connection" search.

### Reliability

- Hard timeouts on every request, retries with backoff for 429/5xx, `Retry-After` support, and cancellation that interrupts immediately.
- One forced token refresh on a 401; a revoked refresh token drops the grant and falls back to a saved key or keyless mode.
- Credential records use the required `<scope>/<id>` shape, are resolved through an injection (late activation is safe), and are validated before every write.
- A dead refresh token, an invalid saved key, or an unentitled team feature can no longer leave web search silently broken.
- Process-level spend estimate from Exa's `costDollars`, plus a redacted diagnostics endpoint and "Copy diagnostics" button.

### Privacy

- API key and OAuth tokens live in the Harness credential service, never in the package.
- Diagnostics exclude email, key fragments, tokens and file paths.
- The published tarball contains no machine paths, credentials or account identifiers.

### Notes

- Unit tests (`node --test`), the CI workflow and the English README live in the repository; they are not part of the npm tarball.
