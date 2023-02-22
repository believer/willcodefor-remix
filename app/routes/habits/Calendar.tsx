import clsx from 'clsx'
import { DateTime } from 'luxon'
import type { Habit } from './Habit'
import CalendarDay from './CalendarDay'
import React from 'react'

type CalendarProps = {
  habits: Habit[]
}

export default function Calendar({ habits }: CalendarProps) {
  const [selectedMonth, setSelectedMonth] = React.useState<number>(
    DateTime.now().month
  )
  const nowInMonth = DateTime.now().set({
    month: selectedMonth,
  })
  const currentMonth = nowInMonth.monthLong
  const daysInMonth = nowInMonth.daysInMonth
  const daysInLastMonth = nowInMonth.minus({ month: 1 }).daysInMonth
  const firstInMonthDay = nowInMonth.startOf('month').weekday
  const lastInMonthDay = nowInMonth.endOf('month').weekday

  const days = [
    ...Array.from({ length: firstInMonthDay - 1 })
      .map(() => daysInLastMonth)
      .map((day, index) => ({
        day: day - index,
        isOtherMonth: true,
        month: nowInMonth.minus({ month: 1 }).month,
      }))
      .reverse(),
    ...Array.from({ length: daysInMonth }).map((_, index) => ({
      day: index + 1,
      isOtherMonth: false,
      month: selectedMonth,
    })),
    ...Array.from({ length: 7 - lastInMonthDay }).map((_, index) => ({
      day: index + 1,
      isOtherMonth: true,
      month: nowInMonth.plus({ month: 1 }).month,
    })),
  ]

  return (
    <div className="rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-5 shadow-md">
      <div className="mb-2 flex items-center justify-between">
        {selectedMonth > 1 ? (
          <button
            className="w-12 rounded-lg text-sm font-bold text-slate-400 ring-yellow-500 ring-offset-4 ring-offset-slate-800 hover:text-slate-300 focus:outline-none focus:ring-2"
            onClick={() => setSelectedMonth(selectedMonth - 1)}
          >
            {'< Prev'}
          </button>
        ) : (
          <div className="w-12" />
        )}
        <h3 className="text-center font-bold text-slate-400">{currentMonth}</h3>
        {selectedMonth < 12 ? (
          <button
            className="w-12 rounded-lg text-sm font-bold text-slate-400 ring-yellow-500 ring-offset-4 ring-offset-slate-800 hover:text-slate-300 focus:outline-none focus:ring-2"
            onClick={() => setSelectedMonth(selectedMonth + 1)}
          >
            {'Next >'}
          </button>
        ) : (
          <div className="w-12" />
        )}
      </div>
      <div className="grid grid-cols-7">
        {days.map(({ day, isOtherMonth, month }) => {
          return (
            <div
              className={clsx('py-2 text-center', [
                isOtherMonth ? 'text-slate-700' : 'text-slate-400',
              ])}
              key={`${month}_${day}`}
            >
              {day}
              {habits.map((habit) => (
                <CalendarDay
                  day={day}
                  month={month}
                  habit={habit}
                  key={habit.title}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
