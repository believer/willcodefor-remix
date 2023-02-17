import humanizeDuration from 'humanize-duration'
import { DateTime } from 'luxon'
import React from 'react'

export default function HumanDuration({ startDate }: { startDate: DateTime }) {
  const [time, setTime] = React.useState<string>('')

  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = DateTime.now()
      const diff = now.diff(startDate, 'seconds').toMillis()

      setTime(() => humanizeDuration(diff, { round: true }))
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [startDate])

  return (
    <div className="mt-2 space-y-1 text-center text-xs text-slate-500">
      {time}
    </div>
  )
}
