import test from 'node:test'
import assert from 'node:assert/strict'

import { m, resolveLocale, setLocale } from '../index.js'

test('messages switch between English and Chinese', () => {
  setLocale('en')
  assert.match(m('noKey'), /No Exa API key/)
  assert.equal(m('callFailed'), 'call failed')
  setLocale('zh')
  assert.match(m('noKey'), /尚未配置/)
  assert.equal(m('callFailed'), '调用失败')
  setLocale('en')
})

test('message interpolation replaces every placeholder', () => {
  setLocale('en')
  assert.equal(
    m('httpError', { method: 'POST', endpoint: '/search', status: 401, detail: 'bad key' }),
    'Exa POST /search returned 401: bad key',
  )
})

test('resolveLocale honours an explicit setting and otherwise picks a known locale', () => {
  assert.equal(resolveLocale('en'), 'en')
  assert.equal(resolveLocale('zh'), 'zh')
  assert.ok(['en', 'zh'].includes(resolveLocale('auto')))
})
