import { test } from 'vitest'
import { formatDate, formatDateTime, parseNumber, toISO } from './intl'

test('#formatDate - formats a date to international formatting', () => {
  expect(formatDate('2022-03-25T10:31:00.000Z')).toEqual('2022-03-25')
})

test('#formatDateTime - formats a date with time to international formatting', () => {
  expect(formatDateTime('2022-03-25T10:31:00.000Z')).toEqual('2022-03-25 11:31')
})

test('#toISO - formats a date to ISO format. Used for <time> datetime', () => {
  expect(toISO('2022-03-25T10:31:00.000Z')).toEqual('2022-03-25T10:31:00.000Z')
})

test('#parseNumber - parses numbers with separators', () => {
  expect(parseNumber(100_000_000)).toEqual('100\u00a0000\u00a0000')
})
