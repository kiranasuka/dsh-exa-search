# Exa Search for DeepSeek Harness

This plugin provides web search and page fetching for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) through [Exa](https://exa.ai). It supports three access modes — keyless, API key and Exa account — and registers tools according to the active mode.

Once installed:

- `web_search` and `web_fetch` keep their existing arguments and behaviour; requests are served by Exa.
- The plugin registers ten additional `exa_*` tools. A tool is exposed to the model only when the active mode can call it.
- **Settings → Exa Search** switches modes and shows the availability of every tool under all three modes.

## Tool catalog

| Group | Tool | Purpose | Keyless | API key | Exa account |
| --- | --- | --- | --- | --- | --- |
| Search | `web_search` | Harness web search, served by Exa | ✓ | ✓ | ✓ |
| Search | `exa_search` | Domain, category, date, text and subpage filters | ✓ | ✓ | ✓ |
| Search | `exa_deep_search` | Deep Search: multi-step retrieval with a cited answer | — | ✓ | — |
| Contents | `web_fetch` | Harness page fetch, served by Exa | ✓ | ✓ | ✓ |
| Contents | `exa_fetch` | Up to five pages; optional highlights, summary and subpages (API key required for those three), three-way concurrency | ✓ | ✓ | ✓ |
| Contents | `exa_find_similar` | Expands a known URL into similar pages | — | ✓ | — |
| Answer | `exa_answer` | `/answer`: a cited answer to a question | — | ✓ | — |
| Research | `exa_research` | Exa Agent: research, list building and structured output; resume, cancel, stop | — | ✓ | per account |
| Monitors | `exa_monitor` | Monitors: scheduled or manual searches; list, create, update, trigger, delete | — | ✓ | — |
| Websets | `exa_webset` | Websets: build and read verified datasets | — | ✓* | — |
| Batch | `exa_batch` | Batch: submit many `/search` or `/agent/runs` requests | — | ✓* | — |
| Status | `exa_status` | Reports the active mode, available tools and upstream tool list | ✓ | ✓ | ✓ |

Twelve tools in total: ten registered by the plugin and two native Harness tools redirected to Exa.

\* Websets requires a Pro plan; Batch must be enabled for the team. When an API key is active, the plugin performs one free probe for each. Features the team does not have are not registered as tools; the settings page marks them as unavailable instead of letting the model receive a 401 or 403.

## Deprecated MCP tools

The Exa MCP repository keeps eight deprecated entries in `toolRegistry.ts` (disabled by default). Their capabilities are covered by the current tools, so the plugin does not register them again:

| Deprecated tool | Replacement |
| --- | --- |
| `get_code_context_exa` | `exa_search` with `category=github` |
| `company_research_exa` | `exa_search` with `category=company` |
| `people_search_exa` | `exa_search` with `category=people` |
| `linkedin_search_exa` | `exa_search` with `category=linkedin profile` |
| `deep_search_exa` | `exa_deep_search` |
| `crawling_exa` | `exa_fetch` |
| `deep_researcher_start` | `exa_research` |
| `deep_researcher_check` | `exa_research` with `runId` |

The same table appears at the bottom of the settings page.

## Access modes

| Mode | Credential | Upstream | Notes |
| --- | --- | --- | --- |
| `keyless` | none | `https://mcp.exa.ai/mcp?tools=...` | Basic search, advanced search and fetching. Exa documents `web_search_advanced_exa` as usable without authentication, so it is enabled through the `tools` parameter. `agent_run` requires authentication and cannot be added to a keyless connection (the whole connection then returns 401). |
| `apiKey` | key saved in Settings, or `EXA_API_KEY` | `https://api.exa.ai` | The full REST surface: Search, Contents, Find Similar, Answer, Agent, Monitors and Websets. |
| `oauth` | browser sign-in | `https://mcp.exa.ai/mcp?tools=...` | MCP tools follow the account. `agent_run` is probed after sign-in; `exa_research` is registered only when it is present. |

“Per account” means the tool is registered according to the real `tools/list` response after sign-in, not a fixed setting.

## Implementation notes

**MCP `tools` parameter.** The hosted Exa MCP endpoint exposes only `web_search_exa` and `web_fetch_exa` by default, and `agent_run` only on authenticated connections. The plugin builds the URL per mode:

- Keyless: `?tools=web_search_exa,web_fetch_exa,web_search_advanced_exa`
- Exa account: `?tools=...,agent_run`; if the probe fails, the request is retried without `agent_run`.

**Rate limits.** When the keyless channel is rate limited, Exa returns `_meta.ai.exa/rateLimited` or a plain “free MCP rate limit” message rather than a JSON-RPC error. The plugin converts either into an explicit error that asks for an API key or sign-in; the text is never returned as a search result.

**Agent continuation.** `exa_research` waits at most `timeoutSeconds` per call (default 120, maximum 600). On timeout it returns `status: "running"` and a `runId`; a later call with that `runId` continues waiting. API key mode uses `POST /agent/runs` with polling; account mode uses the MCP `agent_run` tool.

**Category mapping.** The REST API accepts category names such as `research paper` and `linkedin profile`, while advanced MCP search uses a strict enum. The plugin maps the former to `publication` and `people`; categories without a mapping are dropped rather than sent unchanged.

**Deep Search and `outputSchema`.** Exa synthesizes an answer only when the request contains `outputSchema`; without it, `type: deep` still returns only `results`. The plugin supplies `{ "type": "text" }` by default to obtain a prose answer and returns structured JSON when the caller passes an object schema.

**Websets mount point.** In the OpenAPI document, `/v0/websets` declares `servers: https://api.exa.ai/websets`; the effective path is `/websets/v0/websets…`. Without the prefix every request returns 404.

**Entitlement probes.** Batch returns 403 when disabled and Websets returns 401 without a Pro plan. Both probes are free GETs; the plugin runs them at startup and on mode changes and does not register tools that the team cannot use.

**Fetch formats.** `exa_fetch` supports `format: text`, `highlights` and `summary`. API key mode requests the corresponding Contents fields; keyless and account modes return body text only and report a clear error for other formats. Multiple URLs are fetched three at a time; a failed URL carries an `error` field and does not affect the remaining pages.

**Monitor updates.** `exa_monitor` with `action=update` can rename a monitor, pause or resume it (`status: active | paused`), and change its query or interval. `manual: true` or `period: "none"` creates a monitor without a schedule, which runs only through `trigger`.

**Credential handling.** The credential service is resolved through `ctx.inject`, so a service that activates after the plugin does not cause a fallback to plaintext storage. Every write validates that the record key follows `<scope>/<id>`, which prevents records that the service cannot load at the next start. When a refresh token is revoked (`invalid_grant`), the plugin drops the grant and falls back to an API key or keyless mode instead of returning 401 indefinitely.

**Request policy.** Every outbound request has a hard timeout (search 30s, contents 30s, MCP tools 60s, Agent 240s). 429/5xx responses and network failures are retried twice with exponential backoff, honouring `Retry-After`; a cancellation signal interrupts the wait immediately.

**OAuth token expiry.** On a 401 from MCP, the plugin force-refreshes the token and replays the request once; only a second failure is reported as a sign-in requirement.

**Cancelling Agent runs.** `exa_research` supports `action: cancel | stop` with a `runId` (`cancel` stops immediately; `stop` keeps the results collected so far). This is available only in API key mode; OAuth tokens can call MCP only, which exposes no cancellation endpoint.

**Spend estimate.** Exa reports `costDollars.total` on billed REST responses. The plugin accumulates it per process and shows it in `exa_status` and on the settings page. Agent runs are recorded once, when they reach a terminal status, so polling does not double-count. OAuth MCP search responses carry no cost field, so that mode estimates Agent runs only; the counter restarts at zero with the process.

## Installation

### Option 1: Install through the DSH interface (recommended)

Available in the official Desktop app and Web UI.

1. Open **Plugins** in the sidebar and click **Add plugin**.
2. Enter `dsh-exa-search` in the package field and start the installation.
3. When installation completes, click **Enable now**. Restart DSH if the interface asks you to.
4. Open **Settings → Exa Search** and choose keyless, API key or Exa account mode.

If the official npm registry is slow to reach, select **npmmirror** (the mainland China mirror) from the installation dialog's **Registry** options.

### Option 2: Install into the Web profile from the command line

With the DSH CLI installed and `dsh` available in your terminal, run:

```sh
dsh plugin --profile web add dsh-exa-search
```

After installation, restart the running `dsh web` process, refresh the browser and open **Settings → Exa Search**. For a custom profile, replace `web` with the profile you use.

For the official Desktop app, prefer Option 1 so the plugin is installed into the profile the app uses.

### Install from GitHub or a local directory

To install this repository directly into the Web profile:

```sh
dsh plugin --profile web add github:kiranasuka/dsh-exa-search
```

For local development, enter the plugin directory's absolute path in DSH's **Add plugin** dialog. A local directory install stores a link rather than a copy in the profile; moving or deleting the source directory disables the plugin.

### First use

- **Keyless**: no credentials required; start with basic search and page fetching.
- **API key**: save an Exa API key on the settings page, or set `EXA_API_KEY` in the environment used to launch DSH.
- **Exa account**: start sign-in from the settings page and complete authorization in your browser.

Use **Test connection** to check the active mode (one search is consumed).

Installation pins the `web` row to the `exa` provider (see `cordis.patch.yml`). The pin is required: with two usable search providers, `ctx.web` fails closed with `WEB_PROVIDER_AMBIGUOUS` rather than choosing one.

## Configuration

| Key | Default | Description |
| --- | --- | --- |
| `mode` | `keyless` | Initial access mode; the settings page overrides it. |
| `apiKeyEnv` | `EXA_API_KEY` | Environment variable read when no key is saved. |
| `numResults` | `8` | Default number of sources. |
| `searchType` | `auto` | REST search effort: `auto`, `lite` or `fast`. |
| `maxCharacters` | `12000` | Per-page fetch limit. |
| `locale` | `auto` | Message language: `auto` follows the system, or `en` / `zh`. |
| `mcpTools` | `null` | Overrides the MCP `tools` list (array or comma-separated string). |
| `toolGroups` | `null` | Initial per-group switches, e.g. `{ "answer": false, "webset": false }`. Changes made in Settings are stored in the state file and override this value. |

Each group on the settings page has a switch. Disabling a group removes its `exa_*` tools from the model's tool list immediately; the `web_search` / `web_fetch` redirection is unaffected. The **Test connection** button at the top performs one minimal search with the active mode and reports latency and a sample result (one search is consumed).

## Data and credentials

- Access mode and OAuth client registration: `<DSH_HOME>/exa-search/state.json`. The Host process does not guarantee `DSH_PROFILE_DIR`, so this state is stored per user rather than per profile.
- API key and OAuth tokens: the Harness credential service (`ctx.credentials`), under the record keys `exa-search/api-key` and `exa-search/oauth`. They fall back to `state.json` (file mode 0600) only when the credential service is unavailable.
- No credential is written into the installation directory, and no state file is shipped with the package.

## Routes

The settings page uses same-origin routes instead of generated remotes:

- `GET /exa-plugin/state` — active mode, credential status, upstream tool list, tool matrix and per-mode counts;
- `GET /exa-plugin/diagnostics` — a redacted snapshot for issue reports;
- `POST /exa-plugin/mode` / `api-key` / `login` / `logout` / `tools` / `test` — mutations; cross-origin requests are rejected;
- `GET /exa-plugin/oauth/callback` — OAuth callback.

## Scope

Team management, webhooks and events, imports and Websets enrichments are account or event-delivery plumbing and are not exposed as model tools. The search, contents, answer, research, monitor, dataset and batch workflows are complete.

## Uninstall

`dsh plugin remove dsh-exa-search`. After removal, the `web` row is decided by the underlying bundles again.
