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
  const isStartDay =
    currentDay.get('day') === startDate.get('day') &&
    currentDay.get('month') === startDate.get('month') &&
    currentDay.get('year') === startDate.get('year')

  // Display a progress bar from the start date/time to the end of the day
  if (isStartDay) {
    const hoursUntilEndOfDay =
      startDate.endOf('day').diff(startDate, ['hours']).toObject().hours ?? 0
    // Since we are going backwards, we need to subtract by 100 to get
    // the remaining percentage of the day
    const percentComplete = 100 - ((24 - hoursUntilEndOfDay) / 24) * 100

    return (
      <div className="relative mt-1 h-1 rounded-tl-lg rounded-bl-lg bg-slate-800">
        <div
          className={`absolute top-0 right-0 h-1 ${calendarColor} rounded-tl-lg rounded-bl-lg`}
          style={{ width: `${percentComplete}%` }}
        />
      </div>
    )
  }

  // Display a progress bar from the start of the day to the current time
  if (isCurrentDay && !hasOccuredToday()) {
    const hoursUntilNext =
      now.endOf('day').diff(now, ['hours']).toObject().hours ?? 0
    const percentComplete = ((24 - hoursUntilNext) / 24) * 100

    return (
      <div className="relative mt-1 h-1 rounded-tr-lg rounded-br-lg bg-slate-800">
        <div
          className={`absolute top-0 left-0 h-1 ${calendarColor} rounded-tr-lg rounded-br-lg`}
          style={{ width: `${percentComplete}%` }}
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
