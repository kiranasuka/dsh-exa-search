import test from 'node:test'
import assert from 'node:assert/strict'

import {
  clampInt,
  mapMcpCategory,
  mapRestResults,
  mapWithConcurrency,
  parseSearchText,
  withQuery,
} from '../index.js'

test('parseSearchText splits the MCP text blob into sources', () => {
  const blob = [
    'Title: First result',
    'URL: https://example.com/a',
    'Published: 2024-01-02',
    'Highlights:',
    'Some   spaced',
    'text',
    '---',
    'Title: Second result',
    'URL: https://example.org/b',
  ].join('\n')
  const results = parseSearchText(blob)
  assert.equal(results.length, 2)
  assert.deepEqual(results[0], {
    title: 'First result',
    url: 'https://example.com/a',
    publishedAt: '2024-01-02',
    snippet: 'Some spaced text',
  })
  assert.equal(results[1].url, 'https://example.org/b')
  assert.equal(results[1].publishedAt, undefined)
})

test('parseSearchText ignores blocks without a URL and empty input', () => {
  assert.deepEqual(parseSearchText(''), [])
  assert.deepEqual(parseSearchText('Title: nothing here'), [])
})

test('mapMcpCategory translates REST-only names', () => {
  assert.equal(mapMcpCategory('research paper'), 'publication')
  assert.equal(mapMcpCategory('linkedin profile'), 'people')
  assert.equal(mapMcpCategory('github'), 'github')
  assert.equal(mapMcpCategory('not a category'), '')
  assert.equal(mapMcpCategory(''), '')
})

test('mapRestResults keeps snippets and drops entries without a URL', () => {
  const rows = mapRestResults(
    {
      results: [
        { url: 'https://a.test/x', title: 'A', publishedDate: '2024-02-03', highlights: ['one', 'two'] },
        { title: 'no url' },
        { url: 'https://b.test/y' },
      ],
    },
    5,
  )
  assert.equal(rows.length, 2)
  assert.equal(rows[0].snippet, 'one … two')
  assert.equal(rows[0].publishedAt, '2024-02-03')
  assert.equal(rows[1].title, 'b.test')
})

test('clampInt clamps and falls back', () => {
  assert.equal(clampInt(5, 1, 3, 0), 3)
  assert.equal(clampInt('2', 1, 3, 0), 2)
  assert.equal(clampInt('x', 1, 3, 7), 7)
})

test('withQuery sets params and keeps existing ones', () => {
  assert.equal(
    withQuery('https://api.test/search?q=1', { numResults: 5 }),
    'https://api.test/search?q=1&numResults=5',
  )
})

test('mapWithConcurrency preserves order and respects the limit', async () => {
  let active = 0
  let peak = 0
  const rows = await mapWithConcurrency([1, 2, 3, 4, 5], 2, async (value) => {
    active += 1
    peak = Math.max(peak, active)
    await new Promise((resolve) => setTimeout(resolve, 5))
    active -= 1
    return value * 2
  })
  assert.deepEqual(rows, [2, 4, 6, 8, 10])
  assert.ok(peak <= 2, `peak concurrency was ${peak}`)
})
