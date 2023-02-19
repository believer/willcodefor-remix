import clsx from 'clsx'
import type { DurationObjectUnits } from 'luxon'
import { DateTime } from 'luxon'
import React from 'react'

export type Habit = {
  color: string
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
  const days = now.diff(habit.startDate ?? now, 'days').toFormat('d')
  const [displayBack, setDisplayBack] = React.useState(false)

  return (
    <button
      className={clsx([
        'group flex h-32 items-end justify-between rounded-lg px-5 pb-4 text-left ring-offset-4 ring-offset-tokyoNight-bg hover:ring-2',
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
            <div className="text-2xl font-bold text-slate-800">{days}</div>
            <div className="text-xs text-slate-800">days</div>
          </time>
          <div className="text-sm text-emerald-900">{habit.title}</div>
        </>
      )}
    </button>
  )
}
