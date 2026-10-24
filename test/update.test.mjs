import test from 'node:test'
import assert from 'node:assert/strict'

import { compareVersions } from '../index.js'

test('compareVersions orders releases by number', () => {
  assert.equal(compareVersions('1.0.2', '1.0.1'), 1)
  assert.equal(compareVersions('1.0.1', '1.0.2'), -1)
  assert.equal(compareVersions('1.0.1', '1.0.1'), 0)
  assert.equal(compareVersions('1.10.0', '1.9.9'), 1)
  assert.equal(compareVersions('2.0.0', '1.99.99'), 1)
})

test('compareVersions ranks a release above its prereleases', () => {
  assert.equal(compareVersions('1.0.0', '1.0.0-stage'), 1)
  assert.equal(compareVersions('1.0.0-rc.1', '1.0.0-beta.2'), 1)
  assert.equal(compareVersions('1.0.0-beta.2', '1.0.0-beta.10'), -1)
  assert.equal(compareVersions('1.0.0-alpha', '1.0.0-beta'), -1)
})

test('compareVersions treats unparsable input as equal and accepts a v prefix', () => {
  assert.equal(compareVersions('latest', '1.0.1'), 0)
  assert.equal(compareVersions('1.0.1', ''), 0)
  assert.equal(compareVersions('v1.0.2', '1.0.1'), 1)
  assert.equal(compareVersions('1.0.1+build.5', '1.0.1'), 0)
})