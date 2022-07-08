const dateFormatter = (options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('sv', options)

const numberFormatter = (options?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat('sv', options)

export const formatDate = (date: Date) => dateFormatter().format(new Date(date))

export const formatDateTime = (date: Date) =>
  dateFormatter({ dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(date)
  )

export const formatEventDate = (date: Date) =>
  new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date)

export const toISO = (date: Date) => new Date(date).toISOString()

export const parseNumber = (input: number) => numberFormatter().format(input)

export const parsePercent = (input: number) =>
  numberFormatter({ style: 'percent' }).format(input)
