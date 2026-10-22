import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'
import { apply } from '../index.js'

test('credential reads, writes and deletion use Harness scoped names', async (t) => {
  const home = await mkdtemp(path.join(os.tmpdir(), 'exa-credentials-test-'))
  const previousHome = process.env.DSH_PROFILE_DIR
  process.env.DSH_PROFILE_DIR = home
  t.after(async () => {
    if (previousHome === undefined) delete process.env.DSH_PROFILE_DIR
    else process.env.DSH_PROFILE_DIR = previousHome
    await rm(home, { recursive: true, force: true })
  })
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({ result: { tools: [] } })))

  const records = new Map([
    ['exa-search/api-key', { kind: 'api-key', key: 'test-only-saved-key' }],
    ['exa-search/oauth', { kind: 'grant', payload: { accessToken: 'test-only-token' } }],
  ])
  const reads = []
  const writes = []
  const deletes = []
  const checkKey = (key) => assert.match(key, /^[^/]+\/[^/]+$/)
  const vault = {
    async readRecord(key) {
      reads.push(key)
      checkKey(key)
      return records.get(key)
    },
    async modifyRecord(key, update) {
      checkKey(key)
      writes.push(key)
      const next = await update(records.get(key))
      records.set(key, next)
      return next
    },
    async deleteRecord(key) {
      checkKey(key)
      deletes.push(key)
      records.delete(key)
    },
  }
  let handler
  const disposers = []
  const ctx = {
    get: (service) => service === 'credentials' ? vault : undefined,
    effect: (fn) => { disposers.push(fn()) },
    inject: (_services, fn) => fn({ webServer: {
      register: (route) => { handler = route.handler; return () => {} },
    } }),
    tools: { register: () => () => {} },
    web: { registerSearchProvider() {}, registerFetchProvider() {} },
  }
  t.after(() => { for (const dispose of disposers) dispose?.() })
  await apply(ctx, { apiKeyEnv: '' })
  assert.deepEqual(reads, ['exa-search/api-key', 'exa-search/oauth'])

  async function request(method, suffix, body) {
    const req = Readable.from(body === undefined ? [] : [Buffer.from(JSON.stringify(body))])
    Object.assign(req, { method, url: `/exa-plugin/${suffix}`, headers: {} })
    let status
    let value
    await handler(req, {
      writeHead(code) { status = code },
      end(data) { value = JSON.parse(data) },
    })
    assert.equal(status, 200)
    return value
  }

  const loaded = await request('GET', 'state')
  assert.equal(loaded.apiKey.source, 'saved')
  assert.equal(loaded.oauth.signedIn, true)
  await request('POST', 'api-key', { apiKey: 'test-only-new-key' })
  assert.deepEqual(writes, ['exa-search/api-key'])
  assert.equal(records.get('exa-search/api-key').key, 'test-only-new-key')
  const saved = JSON.parse(await readFile(path.join(home, 'exa-search/state.json'), 'utf8'))
  assert.equal('apiKey' in saved, false)
  assert.equal('oauth' in saved, false)
  await request('POST', 'api-key', { apiKey: '' })
  await request('POST', 'logout', {})
  assert.deepEqual(deletes, ['exa-search/api-key', 'exa-search/oauth'])
  assert.equal(records.size, 0)
})
