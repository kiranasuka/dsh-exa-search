import test from 'node:test'
import assert from 'node:assert/strict'

import {
  VAULT_API_KEY,
  VAULT_GRANT,
  clampInt,
  mapMcpCategory,
  mapRestResults,
  mapWithConcurrency,
  parseSearchText,
  withQuery,
} from '../index.js'

test('credential record keys use the required <scope>/<id> shape', () => {
  // The Harness credential service rejects any other shape at load time, and a
  // bad record makes every plugin that depends on credentials fail to start.
  for (const key of [VAULT_API_KEY, VAULT_GRANT]) {
    assert.match(key, /^[^/]+\/[^/]+$/, `${key} must look like <scope>/<id>`)
  }
  assert.equal(VAULT_API_KEY, 'exa-search/api-key')
  assert.equal(VAULT_GRANT, 'exa-search/oauth')
})

test('parseSearchText splits the MCP text blob into sources', () => {
  const text = [
    'Title: First page',
    'URL: https://example.com/one',
    'Published: 2026-01-02',
    'Author: N/A',
    'Highlights:',
    'A useful excerpt.',
    '',
    '---',
    '',
    'Title: Second page',
    'URL: https://example.com/two',
    'Published: N/A',
    'Highlights:',
    'Another excerpt.',
  ].join('\n')

  const results = parseSearchText(text)
  assert.equal(results.length, 2)
  assert.deepEqual(results[0], {
    title: 'First page',
    url: 'https://example.com/one',
    publishedAt: '2026-01-02',
    snippet: 'A useful excerpt.',
  })
  assert.equal(results[1].url, 'https://example.com/two')
  assert.equal('publishedAt' in results[1], false)
  assert.match(results[1].snippet, /Another excerpt/)
})

test('parseSearchText ignores blocks without a URL and empty input', () => {
  assert.deepEqual(parseSearchText(''), [])
  assert.deepEqual(parseSearchText('just some prose without fields'), [])
})

test('mapMcpCategory translates REST-only names', () => {
  assert.equal(mapMcpCategory('company'), 'company')
  assert.equal(mapMcpCategory('research paper'), 'publication')
  assert.equal(mapMcpCategory('linkedin profile'), 'people')
  assert.equal(mapMcpCategory('tweet'), '')
  assert.equal(mapMcpCategory(''), '')
})

test('mapRestResults keeps snippets and drops entries without a URL', () => {
  const data = {
    results: [
      { title: 'A', url: 'https://a.test', highlights: ['one', 'two'] },
      { title: 'B', url: '', highlights: [] },
      { url: 'https://c.test', publishedDate: '2026-02-03' },
    ],
  }
  const results = mapRestResults(data, 5)
  assert.equal(results.length, 2)
  assert.equal(results[0].url, 'https://a.test')
  assert.match(results[0].snippet, /one … two/)
  assert.equal(results[1].title, 'c.test')
  assert.equal(results[1].publishedAt, '2026-02-03')
})

test('clampInt clamps and falls back', () => {
  assert.equal(clampInt('10', 1, 25, 8), 10)
  assert.equal(clampInt(0, 1, 25, 8), 1)
  assert.equal(clampInt(999, 1, 25, 8), 25)
  assert.equal(clampInt('nope', 1, 25, 8), 8)
  assert.equal(clampInt(undefined, 1, 25, 8), 8)
})

test('withQuery sets params and keeps existing ones', () => {
  const url = withQuery('https://mcp.example/mcp?x=1', { tools: 'a,b' })
  const parsed = new URL(url)
  assert.equal(parsed.searchParams.get('x'), '1')
  assert.equal(parsed.searchParams.get('tools'), 'a,b')
  assert.equal(withQuery('not a url', { tools: 'a' }), 'not a url')
})

test('mapWithConcurrency preserves order and respects the limit', async () => {
  const items = [1, 2, 3, 4, 5]
  let active = 0
  let peak = 0
  const results = await mapWithConcurrency(items, 2, async (value) => {
    active += 1
    peak = Math.max(peak, active)
    await new Promise((resolve) => setTimeout(resolve, 5))
    active -= 1
    return value * 10
  })
  assert.deepEqual(results, [10, 20, 30, 40, 50])
  assert.ok(peak <= 2, `peak concurrency was ${peak}`)
})
