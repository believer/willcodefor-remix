import clsx from 'clsx'
import type { DurationObjectUnits } from 'luxon'
import { DateTime } from 'luxon'
import React from 'react'

export type Habit = {
  calendarColor: string
  color: string
  progressColor: string
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

const useTick = (startDate: Habit['startDate']) => {
  const difference = React.useCallback((): Difference => {
    const now = DateTime.now()

    return now
      .diff(startDate ?? now, [
        'years',
        'months',
        'weeks',
        'days',
        'hours',
        'minutes',
        'seconds',
      ])
      .toObject() as Difference
  }, [startDate])

  const [time, setTime] = React.useState<Difference>(difference)

  React.useEffect(() => {
    const interval = setInterval(() => setTime(difference()), 1000)

    return () => {
      clearInterval(interval)
    }
  }, [difference])

  return time
}

export default function HabitView({ habit }: HabitProps) {
  const parts = useTick(habit.startDate)
  const now = DateTime.now()
  const days = now.diff(habit.startDate).toFormat('d')
  const [displayBack, setDisplayBack] = React.useState(false)
  const hasOccuredToday =
    (habit.startDate
      .set({
        day: now.get('day'),
        month: now.get('month'),
        year: now.get('year'),
      })
      .diff(now, ['hours'])
      .toObject().hours ?? 0) < 0

  const hoursUntilNext = hasOccuredToday
    ? now
        .set({
          hour: habit.startDate.get('hour'),
          minute: habit.startDate.get('minute'),
          second: habit.startDate.get('second'),
        })
        .plus({ days: 1 })
        .diff(now, ['hours'])
        .toObject().hours ?? 0
    : now
        .set({
          hour: habit.startDate.get('hour'),
          minute: habit.startDate.get('minute'),
          second: habit.startDate.get('second'),
        })
        .diff(now, ['hours'])
        .toObject().hours ?? 0

  const radius = 12
  const circumference = radius * 2 * Math.PI
  const percentComplete = (24 - hoursUntilNext) / 24

  return (
    <button
      className={clsx([
        'group relative flex h-32 items-end justify-between rounded-lg px-5 pb-4 text-left shadow-md ring-offset-4 ring-offset-tokyoNight-bg hover:ring-2',
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
          <div className="text-sm text-emerald-900">{habit.title}</div>
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
