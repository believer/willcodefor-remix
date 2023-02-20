import clsx from 'clsx'
import { DateTime } from 'luxon'
import React from 'react'
import type { Habit } from './Habit'

type CalendarProps = {
  habits: Habit[]
}

const useTick = () => {
  const [month, setMonth] = React.useState<string>(DateTime.now().monthLong)

  React.useEffect(() => {
    const interval = setInterval(
      () => setMonth(() => DateTime.now().monthLong),
      1000 * 10
    )

    return () => {
      clearInterval(interval)
    }
  }, [])

  return month
}

export default function Calendar({ habits }: CalendarProps) {
  const currentMonth = useTick()
  const daysInMonth = DateTime.now().daysInMonth
  const daysInLastMonth = DateTime.now().minus({ month: 1 }).daysInMonth
  const firstInMonthDay = DateTime.now().startOf('month').weekday
  const lastInMonthDay = DateTime.now().endOf('month').weekday

  return (
    <div className="mt-6 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-3 shadow-md">
      <h3 className="mb-2 text-center font-bold text-slate-400">
        {currentMonth}
      </h3>
      <div className="grid grid-cols-7">
        {[
          ...Array.from({ length: firstInMonthDay - 1 })
            .map(() => daysInLastMonth)
            .map((day, index) => ({
              day: day - index,
              isOtherMonth: true,
              month: DateTime.now().minus({ month: 1 }).month,
            }))
            .reverse(),
          ...Array.from({ length: daysInMonth }).map((_, index) => ({
            day: index + 1,
            isOtherMonth: false,
            month: DateTime.now().month,
          })),
          ...Array.from({ length: 7 - lastInMonthDay }).map((_, index) => ({
            day: index + 1,
            isOtherMonth: true,
            month: DateTime.now().plus({ month: 1 }).month,
          })),
        ].map(({ day, isOtherMonth, month }) => {
          return (
            <div
              className={clsx('py-2 text-center', [
                isOtherMonth ? 'text-slate-700' : 'text-slate-400',
              ])}
              key={day}
            >
              {day}
              {habits.map((habit) => {
                const startDate = habit.startDate
                const now = DateTime.now()
                const currentDay = DateTime.now().set({ day, month })
                const dateContainsHabit =
                  currentDay >= startDate && currentDay <= now

                return (
                  <div
                    className={clsx(
                      'mt-1 h-1',
                      dateContainsHabit ? habit.calendarColor : 'transparent'
                    )}
                    key={habit.title}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
