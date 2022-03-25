import { test } from 'vitest'
import { formatDate, formatDateTime, toISO } from './date'

test('#formatDate - formats a date to international formatting', () => {
  expect(formatDate(new Date(2022, 2, 25, 10, 31))).toEqual('2022-03-25')
})

test('#formatDateTime - formats a date with time to international formatting', () => {
  expect(formatDateTime(new Date(2022, 2, 25, 10, 31))).toEqual(
    '2022-03-25 10:31'
  )
})

test('toISO - formats a date to ISO format. Used for <time> datetime', () => {
  expect(toISO(new Date(2022, 2, 25, 10, 31))).toEqual(
    '2022-03-25T09:31:00.000Z'
  )
})
