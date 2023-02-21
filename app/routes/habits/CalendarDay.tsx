import clsx from 'clsx'
import { DateTime } from 'luxon'
import type { Habit } from './Habit'
import { useNow } from './hooks'

export type CalendarDayProps = {
  day: number
  month: number
  habit: Habit
}

export default function CalendarDay({ day, month, habit }: CalendarDayProps) {
  const now = useNow(1000)
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
  const isCurrentDay = currentDay.toISODate() === now.toISODate()
  const isStartDay = currentDay.toISODate() === startDate.toISODate()

  // Display a progress bar from the start date/time to the end of the day
  if (isStartDay) {
    const hoursUntilEndOfDay =
      endOfStartDate.diff(startDate, ['hours']).toObject().hours ?? 0
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
  if (isCurrentDay) {
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
