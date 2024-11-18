import { expect, test } from 'vitest'
import { generateCodeVerifier } from './index'

test('adds 1 + 2 to equal 3', () => {
  expect(generateCodeVerifier(25)).toHaveLength(25)
})

test('adds 1 + 2 to equal 3', () => {
  expect(generateCodeVerifier(50)).toHaveLength(50)
})