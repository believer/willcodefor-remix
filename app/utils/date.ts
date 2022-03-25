const formatter = (options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("sv", options);

export const formatDate = (date: Date) => formatter().format(new Date(date));

export const formatDateTime = (date: Date) =>
  formatter({ dateStyle: "short", timeStyle: "short" }).format(new Date(date));

export const toISO = (date: Date) => new Date(date).toISOString();
