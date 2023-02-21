import { DateTime } from 'luxon'
import React from 'react'

export const useNow = (interval: number): DateTime => {
  const [now, setNow] = React.useState<DateTime>(DateTime.now())

  React.useEffect(() => {
    const intervalId = setInterval(() => setNow(DateTime.now()), interval)

    return () => {
      clearInterval(intervalId)
    }
  }, [interval])

  return now
}
