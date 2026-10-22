/**
 * Exa for DeepSeek Harness — Client half.
 *
 * One Settings page: pick the access mode (keyless / API key / signed-in Exa
 * account), configure it, and see the full Exa tool surface grouped by function
 * with the tools each mode can call.
 * The page reads and writes the Host through the small `/exa-plugin/*` routes
 * the Host half registers.
 */
window.__ModuleLoader__.load({
  id: 'dsh-exa-search',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const STRINGS = {
      zh: {
        navLabel: 'Exa 搜索',
        title: 'Exa 搜索',
        subtitle:
          'Harness 的联网搜索与网页抓取走 Exa。选择接入方式后，只有该方式能调用的工具才会注册给模型；下表按功能分组列出全部工具。',
        modeSection: '接入方式',
        modeKeylessTitle: '免登录',
        modeKeylessDesc: '不填任何密钥，直连 Exa 托管的 MCP 端点。按 IP 限流；已通过 tools 参数开启高级搜索，但 Agent 不可用。',
        modeApiKeyTitle: 'API Key',
        modeApiKeyDesc: '填入 Exa 控制台的 Key，走 REST。覆盖检索、内容、问答、Agent、监控与 Websets，额度归你的账号。',
        modeOauthTitle: '登录 Exa 账号',
        modeOauthDesc: '浏览器授权（OAuth + PKCE），令牌存进 Harness 凭据库。MCP 工具随账号开放，Agent 通常可用。',
        badgeActive: '使用中',
        badgeReady: '已配置',
        toolsSection: '全部工具',
        toolsCount: '个工具',
        colTool: '工具 / 作用',
        colKeyless: '免登录',
        colApiKey: 'API Key',
        colOauth: 'Exa 账号',
        groupSearch: '检索',
        groupContents: '内容',
        groupAnswer: '问答',
        groupResearch: '研究',
        groupMonitor: '监控',
        groupWebset: '数据集',
        groupBatch: '批量',
        groupStatus: '状态',
        toolWebSearch: 'Harness 原生搜索，已改走 Exa',
        toolExaSearch: '带域名 / 分类 / 日期 / 文本过滤的搜索',
        toolExaDeepSearch: '多步检索 + 带引用的综合答案',
        toolWebFetch: 'Harness 原生抓取，已改走 Exa',
        toolExaFetch: '一次抓取多个网页的正文',
        toolExaFindSimilar: '找和一篇已知好文相似的页面',
        toolExaAnswer: '带引用的直接问答',
        toolExaResearch: 'Exa Agent：多步研究、建名单、结构化输出',
        toolExaMonitor: '定时搜索，把新结果推到 webhook',
        toolExaWebset: '构建、读取经过验证的数据集',
        toolExaBatch: '批量提交搜索 / Agent 请求',
        toolExaStatus: '报告当前接入方式与可用工具',
        deprecatedTitle: '旧版 MCP 工具的去向',
        deprecatedHint: 'Exa MCP 仍保留这些已弃用条目（默认关闭）。功能已由现代工具覆盖，所以不再单独注册成工具。',
        matrixHint: '高亮列是当前方式；“·”表示登录后才确定；切换方式会立即增删注册给模型的工具。',
        teamFeaturesOff: '当前 Exa 团队未开通：',
        routingLabel: 'Harness 联网通道',
        apiKeyLabel: 'API Key',
        apiKeyPlaceholder: '粘贴 Exa API Key',
        apiKeySave: '保存并启用',
        apiKeyClear: '清除',
        apiKeySaved: '已保存',
        apiKeySourceSaved: '凭据库',
        apiKeySourceEnvironment: '环境变量',
        apiKeyHint: 'Key 保存在 Harness 凭据库；保存前会先向 Exa 校验，无效的 Key 不会被接受。',
        apiKeyInvalid: '当前 Key 已被 Exa 拒绝（401）。换一个有效 Key，或在上面切回免登录。',
        upstreamUnauthorized: 'API Key 无效',
        apiKeyEnvHint: '也可设置环境变量',
        apiKeyNeeded: '填入 Key 后才会切换到这种方式。',
        loginAction: '登录 Exa',
        loggingIn: '等待浏览器授权…',
        logoutAction: '退出登录',
        signedInAs: '已登录',
        notSignedIn: '未登录',
        loginHint: '点「Exa 账号」会直接打开系统浏览器授权；完成后本页自动刷新，中途可以取消。',
        loginWaitingHint: '已尝试打开系统浏览器。完成后这里会自动更新；没有跳转就点下面的按钮，或取消登录。',
        openAuthPage: '手动打开授权页',
        loginCancelled: '已取消登录，可以换其他接入方式。',
        badgePending: '待配置',
        cancelLogin: '取消登录',
        loginDone: '已登录 Exa。',
        loginTimeout: '没有等到授权完成，可以重新点击登录。',
        loading: '读取中…',
        upstreamLabel: '上游',
        upstreamMcp: 'Exa MCP',
        upstreamRest: 'Exa REST',
        upstreamUnavailable: '不可用',
        activeTools: '本方式注册的工具',
        costLabel: '本进程估算花费',
        billedRequests: '次计费请求',
        groupToggleLabel: '启用该组',
        groupToggleHint: '只控制这一组 exa_* 工具是否注册给模型；web_search / web_fetch 仍然走 Exa',
        testAction: '测试连接',
        testing: '测试中…',
        testHint: '会消耗一次搜索',
        testOk: '连接正常',
        testFail: '连接失败',
        diagnosticsAction: '复制诊断',
        diagnosticsCopied: '诊断信息已复制',
        diagnosticsFailed: '复制失败',
        errorPrefix: '操作失败',
        retry: '重试',
      },
      en: {
        navLabel: 'Exa Search',
        title: 'Exa Search',
        subtitle:
          'Harness web search and page fetching run on Exa. After you pick a mode, only the tools that mode can call are registered for the model; the table groups the full surface by function.',
        modeSection: 'Access mode',
        modeKeylessTitle: 'Keyless',
        modeKeylessDesc:
          'No credential: talks to Exa’s hosted MCP endpoint. Rate-limited per IP; advanced search is opted in through the tools parameter, Agent stays locked.',
        modeApiKeyTitle: 'API key',
        modeApiKeyDesc:
          'Paste a key from the Exa dashboard and use the REST API. Covers search, contents, answer, Agent, monitors and Websets on your account.',
        modeOauthTitle: 'Sign in to Exa',
        modeOauthDesc:
          'Authorize in the browser (OAuth + PKCE); the token goes into the Harness credential vault. MCP tools follow the account, Agent usually included.',
        badgeActive: 'In use',
        badgeReady: 'Configured',
        toolsSection: 'All tools',
        toolsCount: 'tools',
        colTool: 'Tool / what it does',
        colKeyless: 'Keyless',
        colApiKey: 'API key',
        colOauth: 'Exa account',
        groupSearch: 'Search',
        groupContents: 'Contents',
        groupAnswer: 'Answer',
        groupResearch: 'Research',
        groupMonitor: 'Monitors',
        groupWebset: 'Websets',
        groupBatch: 'Batches',
        groupStatus: 'Status',
        toolWebSearch: 'Harness web search, now served by Exa',
        toolExaSearch: 'Search with domain / category / date / text filters',
        toolExaDeepSearch: 'Multi-step retrieval with a cited synthesized answer',
        toolWebFetch: 'Harness page fetch, now served by Exa',
        toolExaFetch: 'Read several pages in one call',
        toolExaFindSimilar: 'Find pages similar to a known-good URL',
        toolExaAnswer: 'Direct answer with citations',
        toolExaResearch: 'Exa Agent: multi-step research, list building, structured output',
        toolExaMonitor: 'Recurring search that pushes new results to a webhook',
        toolExaWebset: 'Build and read verified datasets',
        toolExaBatch: 'Submit many search / agent requests as one batch',
        toolExaStatus: 'Report the active mode and its tools',
        deprecatedTitle: 'Where the deprecated MCP tools went',
        deprecatedHint:
          'Exa MCP still lists these entries (disabled by default). Their capability is covered by the modern tools above, so they are not registered separately.',
        matrixHint:
          'The highlighted column is the active mode; “·” resolves after sign-in. Switching modes adds or removes registered tools immediately.',
        teamFeaturesOff: 'Not enabled for this Exa team: ',
        routingLabel: 'Harness web channel',
        apiKeyLabel: 'API key',
        apiKeyPlaceholder: 'Paste your Exa API key',
        apiKeySave: 'Save and use',
        apiKeyClear: 'Clear',
        apiKeySaved: 'Saved',
        apiKeySourceSaved: 'credential vault',
        apiKeySourceEnvironment: 'environment',
        apiKeyHint: 'Stored in the Harness credential vault. A key is checked against Exa before it is accepted.',
        apiKeyInvalid: 'Exa rejects the saved key (401). Enter a valid key, or switch back to keyless above.',
        upstreamUnauthorized: 'API key rejected',
        apiKeyEnvHint: 'You can also set the environment variable',
        apiKeyNeeded: 'Saving a key switches to this mode.',
        loginAction: 'Sign in to Exa',
        loggingIn: 'Waiting for the browser…',
        logoutAction: 'Sign out',
        signedInAs: 'Signed in',
        notSignedIn: 'Not signed in',
        loginHint: 'Choosing “Exa account” opens the authorization page in your system browser; this page refreshes when it finishes, and you can cancel at any point.',
        loginWaitingHint: 'Tried to open your system browser. This page updates when sign-in finishes; if nothing opened, use the button below or cancel.',
        openAuthPage: 'Open the authorization page',
        loginCancelled: 'Sign-in cancelled; you can pick another mode.',
        badgePending: 'Needs setup',
        cancelLogin: 'Cancel',
        loginDone: 'Signed in to Exa.',
        loginTimeout: 'The authorization did not finish; you can start it again.',
        loading: 'Loading…',
        upstreamLabel: 'Upstream',
        upstreamMcp: 'Exa MCP',
        upstreamRest: 'Exa REST',
        upstreamUnavailable: 'unavailable',
        activeTools: 'Tools registered in this mode',
        costLabel: 'Estimated spend',
        billedRequests: 'billed requests',
        groupToggleLabel: 'Enable group',
        groupToggleHint: 'Only controls whether this group of exa_* tools is registered for the model; web_search / web_fetch still use Exa',
        testAction: 'Test connection',
        testing: 'Testing…',
        testHint: 'spends one search',
        testOk: 'Connected',
        testFail: 'Failed',
        diagnosticsAction: 'Copy diagnostics',
        diagnosticsCopied: 'Diagnostics copied',
        diagnosticsFailed: 'Copy failed',
        errorPrefix: 'Action failed',
        retry: 'Retry',
      },
    }

    const CSS = `
.exa-panel { display:flex; flex-direction:column; gap:22px; max-width:880px; padding:2px 0 28px;
  color:var(--dsw-alias-label-primary); font-size:14px; line-height:1.5; }
.exa-panel * { box-sizing:border-box; }
.exa-head { display:flex; align-items:flex-start; gap:14px; }
.exa-mark { width:42px; height:42px; border-radius:13px; flex:none; display:grid; place-items:center;
  background:var(--dsw-alias-bg-layer-2); border:1px solid var(--dsw-alias-border-l1); }
.exa-head-text { min-width:0; }
.exa-panel h2 { margin:0; font-size:19px; font-weight:600; letter-spacing:-0.01em; }
.exa-sub { margin:5px 0 0; color:var(--dsw-alias-label-secondary); font-size:13px; }
.exa-chip { margin-left:auto; flex:none; font-size:12px; padding:4px 10px; border-radius:999px;
  border:1px solid var(--dsw-alias-border-l1); color:var(--dsw-alias-label-secondary); white-space:nowrap; }
.exa-chip.on { color:var(--dsw-alias-brand-primary); border-color:var(--dsw-alias-brand-primary); }
.exa-panel h3 { margin:0 0 10px; font-size:13px; font-weight:600; color:var(--dsw-alias-label-secondary); }
.exa-banner { display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding:10px 12px; border-radius:10px;
  background:var(--dsw-alias-bg-layer-1); border:1px solid var(--dsw-alias-border-l1);
  font-size:12.5px; color:var(--dsw-alias-label-secondary); }
.exa-pipe { display:inline-flex; align-items:center; gap:6px; padding:2px 8px; border-radius:6px;
  background:var(--dsw-alias-bg-base); border:1px solid var(--dsw-alias-border-l1);
  font-family:ui-monospace, SFMono-Regular, Menlo, monospace; font-size:12px; color:var(--dsw-alias-label-primary); }
.exa-modes { display:flex; flex-direction:column; gap:8px; }
.exa-mode { display:flex; gap:12px; align-items:flex-start; width:100%; text-align:left; padding:12px 14px;
  border-radius:12px; border:1px solid var(--dsw-alias-border-l1); background:var(--dsw-alias-bg-layer-1);
  color:inherit; font:inherit; cursor:pointer; transition:border-color .15s ease, background .15s ease; }
.exa-mode:hover { border-color:var(--dsw-alias-border-l2); }
.exa-mode[data-active="true"] { border-color:var(--dsw-alias-brand-primary); background:var(--dsw-alias-bg-layer-2); }
.exa-radio { width:16px; height:16px; border-radius:50%; border:1.5px solid var(--dsw-alias-border-l2);
  margin-top:3px; flex:none; position:relative; }
.exa-mode[data-active="true"] .exa-radio { border-color:var(--dsw-alias-brand-primary); }
.exa-mode[data-active="true"] .exa-radio::after { content:""; position:absolute; inset:3px; border-radius:50%;
  background:var(--dsw-alias-brand-primary); }
.exa-mode-body { min-width:0; flex:1; }
.exa-mode-title { display:flex; align-items:center; gap:8px; font-weight:600; font-size:14px; flex-wrap:wrap; }
.exa-badge { font-size:11px; font-weight:500; padding:1px 7px; border-radius:999px;
  border:1px solid var(--dsw-alias-border-l1); color:var(--dsw-alias-label-secondary); }
.exa-mode-desc { display:block; margin-top:3px; color:var(--dsw-alias-label-secondary); font-size:12.5px; }
.exa-mode-count { margin-left:auto; flex:none; font-size:12px; color:var(--dsw-alias-label-secondary);
  font-variant-numeric:tabular-nums; align-self:center; }
.exa-card { border:1px solid var(--dsw-alias-border-l1); background:var(--dsw-alias-bg-layer-1);
  border-radius:12px; padding:14px 16px; display:flex; flex-direction:column; gap:10px; }
.exa-row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.exa-label { font-size:12px; color:var(--dsw-alias-label-secondary); }
.exa-input { flex:1 1 260px; min-width:0; height:34px; padding:0 10px; border-radius:8px;
  border:1px solid var(--dsw-alias-border-l1); background:var(--dsw-alias-bg-base);
  color:var(--dsw-alias-label-primary); font:inherit; font-size:13px; }
.exa-input:focus { outline:none; border-color:var(--dsw-alias-brand-primary); }
.exa-btn { height:34px; padding:0 14px; border-radius:8px; border:1px solid var(--dsw-alias-border-l1);
  background:var(--dsw-alias-bg-layer-2); color:var(--dsw-alias-label-primary); font:inherit; font-size:13px;
  cursor:pointer; white-space:nowrap; }
.exa-btn:hover { border-color:var(--dsw-alias-border-l2); }
.exa-btn.primary { background:var(--dsw-alias-brand-primary); border-color:var(--dsw-alias-brand-primary); color:#fff; }
.exa-btn.ghost { background:transparent; }
.exa-btn:disabled { opacity:.55; cursor:default; }
.exa-link-btn { display:inline-flex; align-items:center; gap:6px; height:34px; padding:0 12px;
  border-radius:8px; border:1px solid var(--dsw-alias-border-l1);
  background:var(--dsw-alias-bg-layer-2); color:var(--dsw-alias-label-primary);
  font-size:12.5px; text-decoration:none; white-space:nowrap; transition:border-color .15s, color .15s; }
.exa-link-btn:hover { border-color:var(--dsw-alias-brand-primary); color:var(--dsw-alias-brand-primary); }
.exa-link-btn:focus-visible { outline:2px solid var(--dsw-alias-brand-primary); outline-offset:2px; }
.exa-link-arrow { font-size:12px; opacity:.7; }
.exa-hint { margin:0; font-size:12px; color:var(--dsw-alias-label-secondary); }
.exa-error { padding:10px 12px; border-radius:10px; border:1px solid var(--dsw-alias-state-error-primary);
  color:var(--dsw-alias-state-error-primary); font-size:12.5px; }
.exa-note { padding:10px 12px; border-radius:10px; border:1px solid var(--dsw-alias-border-l1);
  background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-secondary); font-size:12.5px; }
.exa-table { width:100%; border-collapse:collapse; font-size:13px; }
.exa-table th { text-align:left; font-weight:500; font-size:12px; color:var(--dsw-alias-label-secondary);
  padding:0 10px 8px; border-bottom:1px solid var(--dsw-alias-border-l1); }
.exa-table td { padding:8px 10px; border-bottom:1px solid var(--dsw-alias-border-l1); vertical-align:top; }
.exa-table tr:last-child td { border-bottom:none; }
.exa-table .num { text-align:center; width:76px; color:var(--dsw-alias-label-secondary); }
.exa-table .num.current { color:var(--dsw-alias-label-primary); font-weight:600; background:var(--dsw-alias-bg-layer-1); }
.exa-grouprow td { padding:14px 10px 6px; border-bottom:none; }
.exa-groupname { font-size:12px; font-weight:600; color:var(--dsw-alias-label-secondary); letter-spacing:.02em; }
.exa-groupcount { margin-left:8px; font-weight:400; color:var(--dsw-alias-label-secondary); opacity:.75; }
.exa-groupbar { display:flex; align-items:center; gap:8px; }
.exa-group-toggle { margin-left:auto; display:inline-flex; align-items:center; gap:6px; font-size:11.5px;
  font-weight:400; color:var(--dsw-alias-label-secondary); cursor:pointer; }
.exa-group-toggle input { accent-color:var(--dsw-alias-brand-primary); margin:0; }
.exa-testrow { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.exa-test-ok { font-size:12.5px; color:var(--dsw-alias-state-success-primary); }
.exa-test-fail { font-size:12.5px; color:var(--dsw-alias-state-error-primary); word-break:break-word; }
.exa-tool { font-family:ui-monospace, SFMono-Regular, Menlo, monospace; font-size:12.5px; white-space:nowrap; }
.exa-tool-desc { display:block; margin-top:2px; font-size:12px; color:var(--dsw-alias-label-secondary); }
.exa-upstream { display:block; margin-top:3px; font-family:ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size:11px; color:var(--dsw-alias-label-secondary); opacity:.85; }
.exa-yes { color:var(--dsw-alias-state-success-primary); }
.exa-no { color:var(--dsw-alias-state-idle-primary); }
.exa-dep { color:var(--dsw-alias-state-warn-primary); }
.exa-foot { font-size:12px; color:var(--dsw-alias-label-secondary); border-top:1px solid var(--dsw-alias-border-l1);
  padding-top:12px; display:flex; gap:14px; flex-wrap:wrap; }
.exa-deprecated-list { list-style:none; margin:0; padding:0; display:grid;
  grid-template-columns:repeat(2, minmax(0, 1fr)); gap:6px 18px; font-size:12px; }
.exa-deprecated-list li { display:flex; align-items:baseline; gap:6px; min-width:0;
  color:var(--dsw-alias-label-secondary); }
.exa-arrow { color:var(--dsw-alias-label-secondary); opacity:.6; }
.exa-arg { font-size:11px; padding:0 5px; border-radius:4px; border:1px solid var(--dsw-alias-border-l1);
  color:var(--dsw-alias-label-secondary); white-space:nowrap; }
`

    function resolveTranslate(ctx) {
      const locale = ctx && typeof ctx.get === 'function' ? ctx.get('locale') : undefined
      let id = 'zh'
      try {
        if (locale && typeof locale.getLocale === 'function') {
          const snapshot = locale.getLocale()
          if (snapshot && typeof snapshot.id === 'string' && STRINGS[snapshot.id]) id = snapshot.id
          else if (snapshot && typeof snapshot.locale === 'string' && STRINGS[snapshot.locale]) id = snapshot.locale
        }
      } catch {
        // Fall through to the default language.
      }
      if (locale && typeof locale.register === 'function' && typeof locale.bind === 'function') {
        try {
          locale.register('exaSearch', STRINGS)
        } catch {
          // Already registered by a previous load.
        }
        try {
          const bound = locale.bind('exaSearch')
          const probe = typeof bound === 'function' ? bound('navLabel') : ''
          if (typeof probe === 'string' && probe && probe !== 'navLabel') return bound
        } catch {
          // Fall through to the static dictionary.
        }
      }
      return (key) => (STRINGS[id] && STRINGS[id][key]) || STRINGS.en[key] || key
    }

    function Mark() {
      return h(
        'svg',
        { viewBox: '0 0 64 64', width: 30, height: 30, 'aria-hidden': true },
        h(
          'defs',
          null,
          h(
            'linearGradient',
            { id: 'exaMarkGradient', x1: '0', y1: '0', x2: '1', y2: '1' },
            h('stop', { offset: '0', stopColor: '#1d4ed8' }),
            h('stop', { offset: '1', stopColor: '#06b6d4' }),
          ),
        ),
        h('rect', { x: 3, y: 3, width: 58, height: 58, rx: 17, fill: 'url(#exaMarkGradient)' }),
        h('circle', { cx: 27, cy: 27, r: 13, fill: 'none', stroke: '#fff', strokeWidth: 4.5 }),
        h('line', { x1: 37, y1: 37, x2: 50, y2: 50, stroke: '#fff', strokeWidth: 6, strokeLinecap: 'round' }),
        h('circle', { cx: 22, cy: 23, r: 2.6, fill: '#fff' }),
        h('circle', { cx: 32, cy: 21, r: 2.6, fill: '#fff' }),
        h('circle', { cx: 28.5, cy: 32, r: 2.6, fill: '#fff' }),
      )
    }

    function Cell({ value, current }) {
      const className = ['num', current ? 'current' : ''].filter(Boolean).join(' ')
      if (value === true) return h('td', { className }, h('span', { className: 'exa-yes' }, '✓'))
      if (value === false) return h('td', { className }, h('span', { className: 'exa-no' }, '—'))
      return h('td', { className }, h('span', { className: 'exa-dep' }, '·'))
    }

    const MODE_ORDER = ['keyless', 'apiKey', 'oauth']
    const GROUP_ORDER = ['search', 'contents', 'answer', 'research', 'monitor', 'webset', 'batch', 'status']
    const GROUP_LABELS = {
      search: 'groupSearch',
      contents: 'groupContents',
      answer: 'groupAnswer',
      research: 'groupResearch',
      monitor: 'groupMonitor',
      webset: 'groupWebset',
      batch: 'groupBatch',
      status: 'groupStatus',
    }
    const TOOL_LABELS = {
      web_search: 'toolWebSearch',
      exa_search: 'toolExaSearch',
      exa_deep_search: 'toolExaDeepSearch',
      web_fetch: 'toolWebFetch',
      exa_fetch: 'toolExaFetch',
      exa_find_similar: 'toolExaFindSimilar',
      exa_answer: 'toolExaAnswer',
      exa_research: 'toolExaResearch',
      exa_monitor: 'toolExaMonitor',
      exa_webset: 'toolExaWebset',
      exa_batch: 'toolExaBatch',
      exa_status: 'toolExaStatus',
    }

    function ExaPanel({ t }) {
      const [state, setState] = React.useState(null)
      const [error, setError] = React.useState('')
      const [notice, setNotice] = React.useState('')
      const [busy, setBusy] = React.useState('')
      const [pending, setPending] = React.useState('')
      const [draft, setDraft] = React.useState('')
      const [loginUrl, setLoginUrl] = React.useState('')
      const [testing, setTesting] = React.useState(false)
      const [testResult, setTestResult] = React.useState(null)
      const [diagNotice, setDiagNotice] = React.useState('')
      const pollTimer = React.useRef(null)
      const diagTimer = React.useRef(null)
      const loginWindow = React.useRef(null)
      const closedTicks = React.useRef(0)
      const mounted = React.useRef(true)

      const request = React.useCallback(async (path, body) => {
        const response = await fetch(path, {
          method: body === undefined ? 'GET' : 'POST',
          headers: body === undefined ? undefined : { 'content-type': 'application/json' },
          body: body === undefined ? undefined : JSON.stringify(body),
        })
        let data = null
        try {
          data = await response.json()
        } catch {
          data = null
        }
        if (!response.ok) throw new Error((data && data.error) || `HTTP ${response.status}`)
        return data
      }, [])

      const refresh = React.useCallback(async () => {
        try {
          const next = await request('/exa-plugin/state')
          if (mounted.current && next) {
            setState(next)
            // A successful read clears a banner left by an earlier failure
            // (for example the route being unavailable during a cold boot).
            setError('')
          }
        } catch (err) {
          if (mounted.current) setError(String((err && err.message) || err))
        }
      }, [request])

      const stopPolling = React.useCallback(() => {
        if (pollTimer.current !== null) {
          window.clearInterval(pollTimer.current)
          pollTimer.current = null
        }
      }, [])

      /** Tear down a login attempt: stop polling, close the popup, re-enable the page. */
      const resetLogin = React.useCallback(
        (closeWindow) => {
          stopPolling()
          closedTicks.current = 0
          if (closeWindow && loginWindow.current && !loginWindow.current.closed) {
            try {
              loginWindow.current.close()
            } catch {
              // The window may already be gone.
            }
          }
          loginWindow.current = null
          setLoginUrl('')
          setBusy((value) => (value === 'login' ? '' : value))
        },
        [stopPolling],
      )

      const cancelLogin = React.useCallback(() => {
        resetLogin(true)
        setError('')
        setNotice(t('loginCancelled'))
      }, [resetLogin, t])

      const startPolling = React.useCallback(() => {
        stopPolling()
        closedTicks.current = 0
        const startedAt = Date.now()
        pollTimer.current = window.setInterval(async () => {
          if (Date.now() - startedAt > 120000) {
            resetLogin(true)
            if (mounted.current) {
              setNotice('')
              setError(t('loginTimeout'))
            }
            return
          }
          try {
            const next = await request('/exa-plugin/state')
            if (!mounted.current) return
            setState(next)
            if (next && next.oauth && next.oauth.signedIn) {
              resetLogin(false)
              setPending('')
              setNotice(t('loginDone'))
              return
            }
          } catch {
            // Keep waiting; the callback may still be in flight.
          }
          // Two quiet ticks after the window disappears means the user closed
          // it without finishing; release the page instead of waiting 2 minutes.
          if (loginWindow.current && loginWindow.current.closed) {
            closedTicks.current += 1
            if (closedTicks.current >= 2) {
              resetLogin(false)
              if (mounted.current) setNotice(t('loginCancelled'))
            }
          } else {
            closedTicks.current = 0
          }
        }, 1500)
      }, [request, resetLogin, stopPolling, t])

      React.useEffect(() => {
        mounted.current = true
        refresh()
        const onMessage = (event) => {
          if (event && event.data && event.data.type === 'exa-oauth-done') refresh()
        }
        window.addEventListener('message', onMessage)
        return () => {
          mounted.current = false
          window.removeEventListener('message', onMessage)
          stopPolling()
          if (diagTimer.current) window.clearTimeout(diagTimer.current)
          if (loginWindow.current && !loginWindow.current.closed) {
            try {
              loginWindow.current.close()
            } catch {
              // The window may already be gone.
            }
          }
          loginWindow.current = null
        }
      }, [refresh, stopPolling])

      const act = async (kind, body) => {
        setBusy(kind)
        setError('')
        setNotice('')
        try {
          const next = await request(`/exa-plugin/${kind}`, body)
          if (next && next.mode) setState(next)
          return next
        } catch (err) {
          setError(`${t('errorPrefix')}: ${String((err && err.message) || err)}`)
          return null
        } finally {
          if (mounted.current) setBusy('')
        }
      }

      const chooseMode = async (mode) => {
        if (!state) return
        // Any mode change abandons an in-flight sign-in, so a stuck popup can
        // never trap the page again.
        if (busy === 'login') resetLogin(true)
        if (mode === state.mode) {
          setPending('')
          setNotice('')
          return
        }
        if (mode === 'apiKey' && !(state.apiKey.configured && state.apiKey.status !== 'invalid')) {
          setPending('apiKey')
          setNotice(t('apiKeyNeeded'))
          return
        }
        if (mode === 'oauth' && !(state.oauth && state.oauth.signedIn)) {
          // Selecting the account card starts the browser sign-in immediately;
          // the manual link stays visible for shells that cannot hand off.
          setPending('oauth')
          setNotice(t('loginHint'))
          await beginLogin()
          return
        }
        setPending('')
        await act('mode', { mode })
      }

      const saveKey = async () => {
        const key = draft.trim()
        if (!key) return
        const next = await act('api-key', { apiKey: key })
        if (next) {
          setDraft('')
          setPending('')
        }
      }

      const clearKey = async () => {
        const next = await act('api-key', { apiKey: '' })
        if (next) setPending('')
      }

      const beginLogin = async () => {
        setError('')
        setNotice('')
        setBusy('login')
        setLoginUrl('')
        try {
          const data = await request('/exa-plugin/login', {})
          if (!mounted.current) return
          const url = typeof data.url === 'string' ? data.url : ''
          if (!url) throw new Error('empty authorization URL')
          setLoginUrl(url)
          // The desktop shell's window-open handler forwards http(s) URLs to
          // the system browser and denies the window itself, so a null return
          // means "handed off", not "blocked". A real window is tracked so
          // closing it ends the wait early.
          const win = window.open(url, '_blank', 'noopener,noreferrer')
          loginWindow.current = win || null
          closedTicks.current = 0
          setNotice(t('loggingIn'))
          startPolling()
        } catch (err) {
          resetLogin(true)
          setError(`${t('errorPrefix')}: ${String((err && err.message) || err)}`)
        }
      }

      const logout = async () => {
        const next = await act('logout', {})
        if (next) setPending('')
      }

      const toggleGroup = async (group) => {
        if (!state) return
        const enabled = state.toolGroups ? state.toolGroups[group] !== false : true
        setBusy('tools')
        setError('')
        try {
          const next = await request('/exa-plugin/tools', { group, enabled: !enabled })
          if (next && next.mode) setState(next)
        } catch (err) {
          setError(`${t('errorPrefix')}: ${String((err && err.message) || err)}`)
        } finally {
          if (mounted.current) setBusy('')
        }
      }

      const runTest = async () => {
        setTesting(true)
        setTestResult(null)
        try {
          const result = await request('/exa-plugin/test', {})
          if (mounted.current) setTestResult(result)
        } catch (err) {
          if (mounted.current) setTestResult({ ok: false, error: String((err && err.message) || err) })
        } finally {
          if (mounted.current) setTesting(false)
        }
      }

      const copyDiagnostics = async () => {
        setDiagNotice('')
        try {
          const data = await request('/exa-plugin/diagnostics')
          if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
            throw new Error('clipboard unavailable')
          }
          await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
          if (!mounted.current) return
          setDiagNotice(t('diagnosticsCopied'))
          if (diagTimer.current) window.clearTimeout(diagTimer.current)
          diagTimer.current = window.setTimeout(() => {
            if (mounted.current) setDiagNotice('')
          }, 4000)
        } catch (err) {
          if (mounted.current) setDiagNotice(`${t('diagnosticsFailed')}: ${String((err && err.message) || err)}`)
        }
      }

      if (!state) {
        return h('div', { className: 'exa-panel' }, h('style', null, CSS), h('div', { className: 'exa-note' }, error || t('loading')))
      }

      const current = state.mode
      const selected = pending || current
      const showKeyForm = selected === 'apiKey'
      const showLoginForm = selected === 'oauth'
      const signedIn = Boolean(state.oauth && state.oauth.signedIn)
      const modeMeta = {
        keyless: { title: t('modeKeylessTitle'), desc: t('modeKeylessDesc') },
        apiKey: { title: t('modeApiKeyTitle'), desc: t('modeApiKeyDesc') },
        oauth: { title: t('modeOauthTitle'), desc: t('modeOauthDesc') },
      }
      const upstreamText =
        state.upstream.kind === 'mcp'
          ? t('upstreamMcp')
          : state.upstream.kind === 'rest'
            ? t('upstreamRest')
            : state.upstream.kind === 'unauthorized'
              ? t('upstreamUnauthorized')
              : t('upstreamUnavailable')
      const byGroup = GROUP_ORDER.map((group) => ({
        group,
        rows: state.tools.filter((row) => row.group === group),
      })).filter((entry) => entry.rows.length > 0)
      const disabledFeatures = []
      if (state.entitlements && state.entitlements.batch === false) disabledFeatures.push('Batch')
      if (state.entitlements && state.entitlements.webset === false) disabledFeatures.push('Websets')

      return h(
        'div',
        { className: 'exa-panel' },
        h('style', null, CSS),

        h(
          'div',
          { className: 'exa-head' },
          h('div', { className: 'exa-mark' }, h(Mark, null)),
          h('div', { className: 'exa-head-text' }, h('h2', null, t('title')), h('p', { className: 'exa-sub' }, t('subtitle'))),
          h('span', { className: 'exa-chip on' }, `${modeMeta[current] ? modeMeta[current].title : current} · ${upstreamText}`),
        ),

        h(
          'div',
          { className: 'exa-banner' },
          h('span', null, t('routingLabel')),
          h('span', { className: 'exa-pipe' }, 'web_search → exa'),
          h('span', { className: 'exa-pipe' }, 'web_fetch → exa'),
          h('span', { style: { marginLeft: 'auto' } }, `${t('activeTools')}: ${state.active.join(', ') || '—'}`),
        ),

        h(
          'div',
          { className: 'exa-testrow' },
          h(
            'button',
            { type: 'button', className: 'exa-btn', onClick: runTest, disabled: testing || Boolean(busy) },
            testing ? t('testing') : t('testAction'),
          ),
          h(
            'button',
            { type: 'button', className: 'exa-btn ghost', onClick: copyDiagnostics, disabled: Boolean(busy) },
            t('diagnosticsAction'),
          ),
          diagNotice ? h('span', { className: 'exa-hint' }, diagNotice) : null,
          h('span', { className: 'exa-hint' }, t('testHint')),
          testResult
            ? h(
                'span',
                { className: testResult.ok ? 'exa-test-ok' : 'exa-test-fail' },
                testResult.ok
                  ? `${t('testOk')} · ${testResult.ms}ms${testResult.sample && testResult.sample.title ? ` · ${testResult.sample.title}` : ''}`
                  : `${t('testFail')} · ${testResult.error || ''}`,
              )
            : null,
        ),

        error ? h('div', { className: 'exa-error' }, error) : null,
        !error && notice ? h('div', { className: 'exa-note' }, notice) : null,

        h(
          'section',
          null,
          h('h3', null, t('modeSection')),
          h(
            'div',
            { className: 'exa-modes' },
            ...MODE_ORDER.map((id) => {
              const active = selected === id
              const isCurrent = current === id
              const configured =
                id === 'keyless'
                  ? false
                  : id === 'apiKey'
                    ? Boolean(state.apiKey.configured && state.apiKey.status !== 'invalid')
                    : Boolean(state.oauth && state.oauth.signedIn)
              const count = state.counts && typeof state.counts[id] === 'number' ? state.counts[id] : 0
              return h(
                'button',
                {
                  key: id,
                  type: 'button',
                  className: 'exa-mode',
                  'data-active': active ? 'true' : 'false',
                  'aria-pressed': active ? 'true' : 'false',
                  onClick: () => chooseMode(id),
                  // A running sign-in must never lock the page: clicking
                  // another card cancels it instead.
                  disabled: Boolean(busy) && busy !== 'login',
                },
                h('span', { className: 'exa-radio', 'aria-hidden': 'true' }),
                h(
                  'span',
                  { className: 'exa-mode-body' },
                  h(
                    'span',
                    { className: 'exa-mode-title' },
                    modeMeta[id].title,
                    isCurrent ? h('span', { className: 'exa-badge' }, t('badgeActive')) : null,
                    !isCurrent && pending === id ? h('span', { className: 'exa-badge' }, t('badgePending')) : null,
                    !isCurrent && !pending && configured ? h('span', { className: 'exa-badge' }, t('badgeReady')) : null,
                  ),
                  h('span', { className: 'exa-mode-desc' }, modeMeta[id].desc),
                ),
                h('span', { className: 'exa-mode-count' }, `${count} ${t('toolsCount')}`),
              )
            }),
          ),
        ),

        showKeyForm
          ? h(
              'section',
              { className: 'exa-card' },
              h('span', { className: 'exa-label' }, t('apiKeyLabel')),
              h(
                'div',
                { className: 'exa-row' },
                h('input', {
                  className: 'exa-input',
                  type: 'password',
                  value: draft,
                  placeholder: t('apiKeyPlaceholder'),
                  autoComplete: 'off',
                  autoFocus: true,
                  spellCheck: false,
                  onChange: (event) => setDraft(event.target.value),
                  onKeyDown: (event) => {
                    if (event.key === 'Enter') saveKey()
                  },
                }),
                h('button', { type: 'button', className: 'exa-btn primary', onClick: saveKey, disabled: Boolean(busy) || !draft.trim() }, t('apiKeySave')),
                state.apiKey.configured
                  ? h('button', { type: 'button', className: 'exa-btn ghost', onClick: clearKey, disabled: Boolean(busy) }, t('apiKeyClear'))
                  : null,
              ),
              h(
                'p',
                { className: 'exa-hint' },
                state.apiKey.configured
                  ? `${t('apiKeySaved')}: ${state.apiKey.hint} · ${state.apiKey.source === 'environment' ? t('apiKeySourceEnvironment') : t('apiKeySourceSaved')}`
                  : `${t('apiKeyHint')} ${t('apiKeyEnvHint')} ${state.apiKey.env}。`,
              ),
              state.apiKey.status === 'invalid' ? h('p', { className: 'exa-error' }, t('apiKeyInvalid')) : null,
            )
          : null,

        showLoginForm
          ? h(
              'section',
              { className: 'exa-card' },
              h(
                'div',
                { className: 'exa-row' },
                h(
                  'span',
                  { className: 'exa-label', style: { flex: '1 1 auto' } },
                  signedIn ? `${t('signedInAs')}${state.oauth.email ? ` · ${state.oauth.email}` : ''}` : t('notSignedIn'),
                ),
                signedIn
                  ? h('button', { type: 'button', className: 'exa-btn', onClick: logout, disabled: Boolean(busy) && busy !== 'login' }, t('logoutAction'))
                  : h(
                      'button',
                      { type: 'button', className: 'exa-btn primary', onClick: beginLogin, disabled: busy === 'login' },
                      busy === 'login' ? t('loggingIn') : t('loginAction'),
                    ),
                busy === 'login'
                  ? h('button', { type: 'button', className: 'exa-btn ghost', onClick: cancelLogin }, t('cancelLogin'))
                  : null,
              ),
              h('p', { className: 'exa-hint' }, busy === 'login' ? t('loginWaitingHint') : t('loginHint')),
              !signedIn && loginUrl
                ? h(
                    'p',
                    { className: 'exa-hint' },
                    h(
                      'a',
                      { className: 'exa-link-btn', href: loginUrl, target: '_blank', rel: 'noreferrer' },
                      t('openAuthPage'),
                      h('span', { className: 'exa-link-arrow', 'aria-hidden': 'true' }, '↗'),
                    ),
                  )
                : null,
            )
          : null,

        h(
          'section',
          null,
          h('h3', null, `${t('toolsSection')} · ${state.tools.length}`),
          h(
            'table',
            { className: 'exa-table' },
            h(
              'thead',
              null,
              h(
                'tr',
                null,
                h('th', null, t('colTool')),
                h('th', { className: 'num' }, t('colKeyless')),
                h('th', { className: 'num' }, t('colApiKey')),
                h('th', { className: 'num' }, t('colOauth')),
              ),
            ),
            h(
              'tbody',
              null,
              ...byGroup.flatMap((entry) => [
                h(
                  'tr',
                  { key: `group-${entry.group}`, className: 'exa-grouprow' },
                  h(
                    'td',
                    { colSpan: 4 },
                    h(
                      'div',
                      { className: 'exa-groupbar' },
                      h('span', { className: 'exa-groupname' }, t(GROUP_LABELS[entry.group])),
                      h('span', { className: 'exa-groupcount' }, String(entry.rows.length)),
                      h(
                        'label',
                        { className: 'exa-group-toggle', title: t('groupToggleHint') },
                        h('input', {
                          type: 'checkbox',
                          checked: !(state.toolGroups && state.toolGroups[entry.group] === false),
                          disabled: Boolean(busy),
                          onChange: () => toggleGroup(entry.group),
                        }),
                        h('span', null, t('groupToggleLabel')),
                      ),
                    ),
                  ),
                ),
                ...entry.rows.map((row) =>
                  h(
                    'tr',
                    { key: row.id },
                    h(
                      'td',
                      null,
                      h('span', { className: 'exa-tool' }, row.id),
                      h('span', { className: 'exa-tool-desc' }, t(TOOL_LABELS[row.id] || 'colTool')),
                      state.upstreamNames && state.upstreamNames[row.id]
                        ? h('span', { className: 'exa-upstream' }, `↳ ${state.upstreamNames[row.id]}`)
                        : null,
                    ),
                    h(Cell, { value: row.modes.keyless, current: current === 'keyless' }),
                    h(Cell, { value: row.modes.apiKey, current: current === 'apiKey' }),
                    h(Cell, { value: row.modes.oauth, current: current === 'oauth' }),
                  ),
                ),
              ]),
            ),
          ),
          h('p', { className: 'exa-hint', style: { marginTop: '8px' } }, t('matrixHint')),
          disabledFeatures.length
            ? h(
                'p',
                { className: 'exa-hint', style: { marginTop: '4px' } },
                `${t('teamFeaturesOff')}${disabledFeatures.join(' / ')}`,
              )
            : null,
        ),

        state.deprecated && state.deprecated.length
          ? h(
              'section',
              { className: 'exa-card' },
              h('span', { className: 'exa-groupname' }, t('deprecatedTitle')),
              h('p', { className: 'exa-hint' }, t('deprecatedHint')),
              h(
                'ul',
                { className: 'exa-deprecated-list' },
                ...state.deprecated.map((item) =>
                  h(
                    'li',
                    { key: item.id },
                    h('span', { className: 'exa-tool' }, item.id),
                    h('span', { className: 'exa-arrow' }, '→'),
                    h('span', { className: 'exa-tool' }, item.replacement),
                    item.argument ? h('span', { className: 'exa-arg' }, item.argument) : null,
                  ),
                ),
              ),
            )
          : null,

        h(
          'div',
          { className: 'exa-foot' },
          h('span', null, `${t('upstreamLabel')}: ${upstreamText} · ${(state.upstream.tools || []).join(', ') || '—'}`),
          h('span', null, `MCP: ${state.endpoints.mcp}`),
          state.cost
            ? h('span', null, `${t('costLabel')}: $${state.cost.total} · ${state.cost.calls} ${t('billedRequests')}`)
            : null,
        ),
      )
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        const t = resolveTranslate(ctx)
        ctx.slots.inject('settings.section', () =>
          ctx.slots.register(
            {
              name: 'settings.section',
              id: 'exa-search',
              order: 120,
              label: () => t('navLabel'),
              inject: () => ({ t }),
            },
            ExaPanel,
          ),
        )
      },
    }
  },
})
