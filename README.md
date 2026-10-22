# Exa Search for DeepSeek Harness

> English documentation: [README.en.md](./README.en.md)

本插件为 DeepSeek Harness 提供基于 [Exa](https://exa.ai) 的联网搜索与网页抓取能力，支持免登录、API Key 与 Exa 账号三种接入方式，并按接入方式注册工具。

安装后：

- `web_search`、`web_fetch` 的调用方式与参数保持不变，实际请求由 Exa 提供；
- 插件额外注册 10 个 `exa_*` 工具；仅当当前接入方式可以调用某个工具时，该工具才会暴露给模型；
- 在「设置 → Exa 搜索」中可切换接入方式，并查看全部工具在三种方式下的可用性。

## 工具清单（按功能分组）

| 分组 | 工具 | 作用 | 免登录 | API Key | Exa 账号 |
| --- | --- | --- | --- | --- | --- |
| 检索 | `web_search` | Harness 原生搜索，由 Exa 提供 | ✓ | ✓ | ✓ |
| 检索 | `exa_search` | 域名 / 分类 / 日期 / 文本 / 子页过滤 | ✓ | ✓ | ✓ |
| 检索 | `exa_deep_search` | Deep Search：多步检索与带引用的综合答案 | — | ✓ | — |
| 内容 | `web_fetch` | Harness 原生抓取，由 Exa 提供 | ✓ | ✓ | ✓ |
| 内容 | `exa_fetch` | 最多 5 个网页；可选取 highlights / summary / 子页（后三者需 API Key），3 路并发 | ✓ | ✓ | ✓ |
| 内容 | `exa_find_similar` | 由一篇已知网址扩展相似页面 | — | ✓ | — |
| 问答 | `exa_answer` | `/answer`：带引用的直接问答 | — | ✓ | — |
| 研究 | `exa_research` | Exa Agent：研究、名单构建、结构化输出（续等 / 取消 / 停止） | — | ✓ | 按账号 |
| 监控 | `exa_monitor` | Monitors：定时或手动搜索，列表 / 新建 / 修改 / 触发 / 删除 | — | ✓ | — |
| 数据集 | `exa_webset` | Websets：构建与读取经过验证的数据集 | — | ✓* | — |
| 批量 | `exa_batch` | Batch：批量提交 `/search` 或 `/agent/runs` | — | ✓* | — |
| 状态 | `exa_status` | 报告当前方式、可用工具与上游工具表 | ✓ | ✓ | ✓ |

合计 12 个工具，其中 10 个由插件注册，2 个为 Harness 原生工具的 Exa 改道。

\* Websets 需要 Pro 计划，Batch 需要团队单独开通。启用 API Key 时，插件会分别执行一次免费探测；未开通的功能不会注册为工具，设置页会标注「当前团队未开通」，以避免模型调用后收到 401/403。

## 旧版 MCP 工具映射

Exa MCP 仓库的 `toolRegistry.ts` 中保留了 8 个已弃用条目（默认关闭）。这些能力已由现有工具覆盖，因此插件不再重复注册：

| 旧工具 | 对应工具 |
| --- | --- |
| `get_code_context_exa` | `exa_search`，`category=github` |
| `company_research_exa` | `exa_search`，`category=company` |
| `people_search_exa` | `exa_search`，`category=people` |
| `linkedin_search_exa` | `exa_search`，`category=linkedin profile` |
| `deep_search_exa` | `exa_deep_search` |
| `crawling_exa` | `exa_fetch` |
| `deep_researcher_start` | `exa_research` |
| `deep_researcher_check` | `exa_research`，传入 `runId` |

设置页底部同样列出该对照表，以便核对工具是否缺失。

## 接入方式

| 方式 | 凭据 | 上游 | 说明 |
| --- | --- | --- | --- |
| 免登录 `keyless` | 不需要 | `https://mcp.exa.ai/mcp?tools=...` | 基础搜索、高级搜索与抓取。Exa 说明 `web_search_advanced_exa` 无需认证，因此通过 `tools` 参数启用；`agent_run` 需要认证，不能加入免登录连接（否则整个连接返回 401）。 |
| API Key `apiKey` | 设置页填入，或环境变量 `EXA_API_KEY` | `https://api.exa.ai` | 全部接口：Search、Contents、Find Similar、Answer、Agent、Monitors、Websets。 |
| Exa 账号 `oauth` | 浏览器授权 | `https://mcp.exa.ai/mcp?tools=...` | MCP 工具随账号开放；`agent_run` 在登录后探测，探测到才会注册 `exa_research`。 |

表格中的「按账号」表示该工具是否注册取决于登录后 `tools/list` 的实际返回，而非固定配置。

## 实现说明

**MCP 的 `tools` 参数**。Exa 托管 MCP 默认仅提供 `web_search_exa` 与 `web_fetch_exa`，`agent_run` 仅对有凭据的连接开放。插件按接入方式拼接 URL：

- 免登录：`?tools=web_search_exa,web_fetch_exa,web_search_advanced_exa`
- Exa 账号：`?tools=...,agent_run`；若探测失败，则去掉 `agent_run` 重试。

**限流识别**。免登录通道触发限流时，Exa 返回 `_meta.ai.exa/rateLimited` 或一段 "free MCP rate limit" 文本，而非 JSON-RPC 错误。插件会将其转换为明确错误，并提示配置 API Key 或登录，不会将限流文本作为搜索结果返回。

**Agent 续等**。`exa_research` 单次最多等待 `timeoutSeconds`（默认 120，上限 600）；超时返回 `status: "running"` 与 `runId`，再次调用并传入该 `runId` 可继续等待。API Key 模式使用 `POST /agent/runs` 与轮询，Exa 账号模式使用 MCP 的 `agent_run`。

**分类映射**。REST 接口接受 `research paper`、`linkedin profile` 等分类名，MCP 高级搜索使用严格枚举。插件将前者映射为 `publication`、`people`；无法映射的分类会被丢弃，不会原样发送。

**Deep Search 的 `outputSchema`**。Exa 仅在请求包含 `outputSchema` 时生成综合答案；缺失时 `type: deep` 也只返回 `results`。插件默认补充 `{ "type": "text" }` 以获得散文答案；调用方传入对象 schema 时返回结构化 JSON。

**Websets 的挂载点**。OpenAPI 文档中 `/v0/websets` 的 `servers` 为 `https://api.exa.ai/websets`，实际地址为 `/websets/v0/websets…`；缺少该前缀会持续返回 404。

**功能开通探测**。Batch 未开通返回 403，Websets 未开通返回 401（Pro 计划）。两者均为免费 GET；插件在启动或切换接入方式时探测，未开通则不注册对应工具。

**抓取格式**。`exa_fetch` 的 `format` 支持 `text`、`highlights`、`summary`。API Key 模式下分别请求 Contents API 的对应字段；免登录与账号模式的 MCP 抓取仅返回正文，请求其他格式会返回明确错误。多 URL 抓取采用 3 路并发，单个 URL 失败不影响其余页面，失败信息以 `error` 字段返回。

**监控更新**。`exa_monitor` 的 `update` 操作支持修改名称、暂停 / 恢复（`status: active | paused`）、修改查询与周期；`manual: true` 或 `period: "none"` 可创建不排期的监控，仅能通过 `trigger` 手动执行。

**凭据读写**。凭据服务通过 `ctx.inject` 解析，即使其激活晚于插件也不会退回明文存储；写入前会校验记录键必须符合 `<scope>/<id>`，避免产生无法在下次启动时加载的记录。刷新令牌被吊销（`invalid_grant`）时，插件会丢弃授权并回退到 API Key 或免登录，而非持续返回 401。

**请求策略**。所有出站请求均设置硬超时（搜索 30s、内容 30s、MCP 工具 60s、Agent 240s）；429/5xx 与网络失败按指数退避重试 2 次，并遵循 `Retry-After`；取消信号会立即中断等待。

**OAuth 令牌失效**。MCP 返回 401 时，插件先强制刷新令牌并使用新令牌重放请求；仅当刷新后仍失败时才提示重新登录。

**取消 Agent**。`exa_research` 的 `action: cancel | stop` 配合 `runId` 可中止运行（`cancel` 立即取消，`stop` 保留已收集结果），仅在 API Key 模式下可用；OAuth 令牌仅能通过 MCP 调用，没有取消入口。

**费用估算**。Exa 在 REST 计费响应中返回 `costDollars.total`，插件按进程累计，并在 `exa_status` 与设置页中显示；Agent 运行仅在到达终态时记录一次，轮询不会重复计数。OAuth 模式下搜索响应不包含费用字段，因此该模式的估算仅覆盖 Agent 运行；进程重启后从 0 开始。

## 安装

可通过 Harness 插件管理安装本目录，或从 npm 安装 `dsh-exa-search`。
使用本地目录安装时，profile 中保存的是链接而非副本；移动或删除源目录会导致插件失效。

安装后，`web` 行会被固定到 `exa` provider（见 `cordis.patch.yml`）。这是必要配置：当存在两个可用搜索 provider 时，`ctx.web` 会以 `WEB_PROVIDER_AMBIGUOUS` 拒绝选择，而不会自动猜测。

## 配置

`cordis.patch.yml` 中的行配置：

| 键 | 默认 | 说明 |
| --- | --- | --- |
| `mode` | `keyless` | 首次运行的默认接入方式；设置页会覆盖它。 |
| `apiKeyEnv` | `EXA_API_KEY` | 未保存 Key 时读取的环境变量。 |
| `numResults` | `8` | 默认返回来源数。 |
| `searchType` | `auto` | 检索强度：`auto` / `lite` / `fast`。 |
| `maxCharacters` | `12000` | 单页抓取字符上限。 |
| `locale` | `auto` | 消息语言：`auto` 跟随系统，或强制 `en` / `zh`。 |
| `mcpTools` | `null` | 覆盖 MCP 的 `tools` 列表（数组或逗号分隔字符串）。 |
| `toolGroups` | `null` | 分组开关的初始值，例如 `{ "answer": false, "webset": false }`；设置页的改动存入 state 并覆盖它。 |

设置页中每个分组右侧均有开关；关闭后，该分组下的 `exa_*` 工具会立即从模型工具表中移除，`web_search` / `web_fetch` 的 Exa 改道不受影响。设置页顶部的「测试连接」按钮会使用当前接入方式执行一次最小搜索，并返回耗时与示例结果（消耗一次搜索）。

## 数据与凭据

- 接入方式与 OAuth 客户端注册信息：`<DSH_HOME>/exa-search/state.json`。Host 进程不保证存在 `DSH_PROFILE_DIR`，因此该状态按用户存储，而非按 profile。
- API Key 与 OAuth 令牌：Harness 凭据服务（`ctx.credentials`），记录键为 `exa-search/api-key`、`exa-search/oauth`；仅当凭据服务不可用时，才退回上述 `state.json`（文件权限 0600）。
- 插件不会将任何凭据写入安装目录，也不会随包分发状态文件。

## 路由

设置页通过同源路由读写 Host，避免为纯 JS 插件生成 Remote 命名空间：

- `GET /exa-plugin/state` — 当前方式、凭据状态、上游工具表、工具矩阵与各方式计数；
- `GET /exa-plugin/diagnostics` — 脱敏诊断快照，用于问题反馈；
- `POST /exa-plugin/mode` / `api-key` / `login` / `logout` / `tools` / `test` — 变更操作，拒绝跨源请求；
- `GET /exa-plugin/oauth/callback` — OAuth 回调。

## 未覆盖范围

Team Management、Webhooks / Events、Imports 属于账号与事件投递的底层接口，不注册为模型工具；检索、内容、问答、研究、监控、数据集、批量这条链路已经完整。

## 卸载

`dsh plugin remove dsh-exa-search`。卸载后 `web` 行恢复由下层 bundle 决定。
