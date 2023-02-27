import type { DurationObjectUnits } from 'luxon'
import type { Habit } from './Habit'
import { useNow } from './hooks'

type NoOptionals<T> = {
  [K in keyof T]-?: T[K]
}

type Difference = NoOptionals<
  Pick<
    DurationObjectUnits,
    'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds'
  >
>

export function HabitCardBack({ habit }: { habit: Habit }) {
  const now = useNow(1000)
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

  return (
    <div className="grid grid-cols-5 gap-4">
      {Object.entries(parts)
        .filter(([_, value]) => value !== 0)
        .map(([key, value]) => (
          <div className="text-2xl font-bold text-slate-800" key={key}>
            {Math.floor(value)}
            <div className="text-xs font-normal">{key}</div>
          </div>
        ))}
    </div>
  )
}
