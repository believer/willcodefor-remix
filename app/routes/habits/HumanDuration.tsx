import humanizeDuration from 'humanize-duration'
import { DateTime } from 'luxon'
import React from 'react'

const useTick = (startDate: DateTime) => {
  const difference = React.useCallback(() => {
    const now = DateTime.now()
    const diff = now.diff(startDate, 'seconds').toMillis()

    return humanizeDuration(diff, { round: true })
  }, [startDate])

  const [time, setTime] = React.useState<string>(difference)

  React.useEffect(() => {
    const interval = setInterval(() => setTime(difference()), 1000)

    return () => {
      clearInterval(interval)
    }
  }, [difference])

  return time
}

export default function HumanDuration({ startDate }: { startDate: DateTime }) {
  const time = useTick(startDate)

  return (
    <div className="mt-2 space-y-1 text-center text-xs text-slate-600">
      {time}
    </div>
  )
}
