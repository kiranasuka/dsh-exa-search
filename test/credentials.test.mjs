import test from 'node:test'
import assert from 'node:assert/strict'
import { promises as fsp } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { apply, VAULT_API_KEY, VAULT_GRANT } from '../index.js'

test('credential record keys use the required <scope>/<id> shape', () => {
  assert.equal(VAULT_API_KEY, 'exa-search/api-key')
  assert.equal(VAULT_GRANT, 'exa-search/oauth')
  for (const key of [VAULT_API_KEY, VAULT_GRANT]) {
    assert.match(key, /^[^/]+\/[^/]+$/, key)
  }
})

test('secrets stay in the vault instead of state.json', async () => {
  const home = await fsp.mkdtemp(path.join(os.tmpdir(), 'exa-test-'))
  const previousHome = process.env.DSH_HOME
  const previousProfile = process.env.DSH_PROFILE_DIR
  delete process.env.DSH_PROFILE_DIR
  process.env.DSH_HOME = home

  const records = new Map([[VAULT_API_KEY, { kind: 'api-key', key: 'vault-secret-value' }]])
  const reads = []
  const vault = {
    async readRecord(key) {
      reads.push(key)
      return records.get(key) || null
    },
    async modifyRecord(key, mutate) {
      const next = await mutate(records.get(key))
      records.set(key, next)
      return next
    },
    async deleteRecord(key) {
      records.delete(key)
    },
  }

  let handler = null
  const scope = {
    credentials: vault,
    webServer: {
      register(descriptor) {
        handler = descriptor.handler
        return () => {}
      },
    },
  }
  const ctx = {
    get: (name) => (name === 'credentials' ? vault : undefined),
    inject: (_names, callback) => callback(scope),
    effect: (fn) => fn(),
    tools: { register: () => () => {} },
    web: { registerSearchProvider: () => () => {}, registerFetchProvider: () => () => {} },
  }

  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => {
    throw new Error('network disabled in tests')
  }
  const post = (target, body) =>
    new Promise((resolve, reject) => {
      const payload = Buffer.from(JSON.stringify(body ?? {}))
      const req = {
        method: 'POST',
        url: target,
        headers: { host: '127.0.0.1:13489', origin: 'http://127.0.0.1:13489' },
        [Symbol.asyncIterator]() {
          let sent = false
          return {
            async next() {
              if (sent) return { done: true, value: undefined }
              sent = true
              return { done: false, value: payload }
            },
          }
        },
      }
      const res = {
        status: 0,
        body: '',
        writeHead(status) {
          this.status = status
        },
        end(body) {
          this.body = body
          resolve(this)
        },
      }
      Promise.resolve(handler(req, res)).catch(reject)
    })

  try {
    await apply(ctx, { mode: 'apiKey', updateCheck: false })
    assert.ok(handler, 'the settings route is registered')
    assert.deepEqual(reads.sort(), [VAULT_API_KEY, VAULT_GRANT].sort())

    const response = await post('/exa-plugin/update/dismiss', { version: '9.9.9' })
    assert.equal(response.status, 200)

    const raw = await fsp.readFile(path.join(home, 'exa-search', 'state.json'), 'utf8')
    assert.ok(!raw.includes('vault-secret-value'), 'the key must not reach state.json')
    const saved = JSON.parse(raw)
    assert.equal(saved.apiKey, undefined)
    assert.equal(saved.dismissedUpdate, '9.9.9')
  } finally {
    globalThis.fetch = originalFetch
    if (previousHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousHome
    if (previousProfile === undefined) delete process.env.DSH_PROFILE_DIR
    else process.env.DSH_PROFILE_DIR = previousProfile
    await fsp.rm(home, { recursive: true, force: true })
  }
})