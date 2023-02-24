import clsx from 'clsx'
import type { DateTime, DurationObjectUnits } from 'luxon'
import React from 'react'
import { useNow } from './hooks'

export type Habit = {
  calendarColor: string
  color: string
  progressColor: string
  resets?: DateTime[]
  startDate: DateTime
  title: string
}

type HabitProps = {
  habit: Habit
}

type NoOptionals<T> = {
  [K in keyof T]-?: T[K]
}

type Difference = NoOptionals<
  Pick<
    DurationObjectUnits,
    'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds'
  >
>

export default function HabitCard({ habit }: HabitProps) {
  const now = useNow(1000)
  const [displayBack, setDisplayBack] = React.useState(false)

  const parts = now
    .diff(habit.startDate, [
      'years',
      'months',
      'weeks',
      'days',
      'hours',
      'minutes',
      'seconds',
    ])
    .toObject() as Difference
  const days = now.diff(habit.startDate).toFormat('d')
  const startDateAsToday = habit.startDate.set({
    day: now.get('day'),
    month: now.get('month'),
    year: now.get('year'),
  })
  const hasOccuredToday = startDateAsToday < now

  const hoursUntilNext =
    startDateAsToday
      .plus({ days: hasOccuredToday ? 1 : 0 })
      .diff(now, ['hours'])
      .toObject().hours ?? 0

  const radius = 12
  const circumference = radius * 2 * Math.PI
  const percentComplete = (24 - hoursUntilNext) / 24

  return (
    <button
      className={clsx([
        'group relative flex h-32 items-end justify-between rounded-lg px-5 pb-4 text-left shadow-md ring-offset-4 ring-offset-tokyoNight-bg hover:ring-2 focus:outline-none focus:ring-2',
        habit.color,
      ])}
      key={habit.title}
      onClick={() => setDisplayBack(!displayBack)}
    >
      {displayBack ? (
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(parts)
            .filter(([_, value]) => value !== 0)
            .map(([key, value]) => (
              <div className="text-2xl font-bold text-slate-800" key={key}>
                {Math.floor(value)}
                <div className="text-xs font-normal">
                  {Math.floor(value) === 1 ? key.slice(0, -1) : key}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <>
          <time
            dateTime={habit.startDate.toISODate()}
            title={habit.startDate.toFormat('cccc, LLLL d, yyyy HH:mm')}
          >
            <div className="text-5xl font-medium text-slate-800">{days}</div>
            <div className="text-xs text-slate-700">days</div>
          </time>
          <div className="text-sm text-slate-800">{habit.title}</div>
        </>
      )}

      <svg
        className="absolute top-4 right-4 h-8 w-8 -rotate-90 transform"
        aria-hidden="true"
      >
        <circle
          className="text-tokyoNight-bg/10"
          strokeWidth="2"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="16"
          cy="16"
        />
        <circle
          className={habit.progressColor}
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - percentComplete * circumference}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="16"
          cy="16"
        />
      </svg>
    </button>
  )
}
