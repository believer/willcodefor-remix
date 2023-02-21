import clsx from 'clsx'
import { DateTime } from 'luxon'
import React from 'react'
import type { Habit } from './Habit'

export type CalendarDayProps = {
  day: number
  month: number
  habit: Habit
}

const useTick = () => {
  const [now, setNow] = React.useState<DateTime>(DateTime.now())

  React.useEffect(() => {
    const interval = setInterval(() => setNow(DateTime.now()), 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return now
}

export default function CalendarDay({ day, month, habit }: CalendarDayProps) {
  const now = useTick()
  const { calendarColor, startDate } = habit

  const endOfStartDate = startDate.endOf('day')
  const currentDay = DateTime.now().set({
    day,
    month,
    hour: startDate.get('hour'),
    minute: startDate.get('minute'),
    second: startDate.get('second'),
  })
  const dateContainsHabit = currentDay >= endOfStartDate && currentDay <= now
  const hasOccuredToday = () =>
    (startDate
      .set({
        day: now.get('day'),
        month: now.get('month'),
        year: now.get('year'),
      })
      .diff(now, ['hours'])
      .toObject().hours ?? 0) < 0

  const isCurrentDay =
    currentDay.get('day') === now.get('day') &&
    currentDay.get('month') === now.get('month') &&
    currentDay.get('year') === now.get('year')

  if (isCurrentDay && !hasOccuredToday()) {
    const hoursUntilNext = () =>
      now
        .set({
          hour: startDate.get('hour'),
          minute: startDate.get('minute'),
          second: startDate.get('second'),
        })
        .diff(now, ['hours'])
        .toObject().hours ?? 0
    const percentComplete = () => ((24 - hoursUntilNext()) / 24) * 100

    return (
      <div className="relative mt-1 h-1 bg-slate-800">
        <div
          className={`absolute top-0 left-0 h-1 ${calendarColor}`}
          style={{ width: `${percentComplete()}%` }}
        />
      </div>
    )
  }

  return (
    <div
      className={clsx([
        'mt-1 h-1',
        dateContainsHabit ? calendarColor : 'transparent',
      ])}
    />
  )
}
