import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

cleanup()

afterEach(() => {
  cleanup()
})

expect.extend({})