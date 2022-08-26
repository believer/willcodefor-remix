const dateFormatter = (options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('sv', options)

const numberFormatter = (options?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat('sv', options)

export const formatDate = (date: string | Date) =>
  dateFormatter().format(new Date(date))
export const formatTime = (date: string | Date) =>
  dateFormatter({ timeStyle: 'short' }).format(new Date(date))

export const formatDateTime = (date: string | Date) =>
  dateFormatter({ dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(date)
  )

export const formatEventDate = (date: string | Date) =>
  new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit' }).format(
    new Date(date)
  )

export const toISO = (date: string | Date) => new Date(date).toISOString()

export const parseNumber = (input: number) => numberFormatter().format(input)

export const parsePercent = (input: number) =>
  numberFormatter({ style: 'percent' }).format(input)
