import type { DurationObjectUnits } from 'luxon'
import { Duration } from 'luxon'
import type { Habit } from './Habit'
import { Trophy } from './icons'
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

  const longestStreak = habit.resets.reduce((longest, reset) => {
    const resetDuration = reset.endDate.diff(reset.startDate, ['days'])
    return resetDuration > longest ? resetDuration : longest
  }, Duration.fromObject({ days: 0 }))
  const longestStreakDays = Math.floor(longestStreak.days)

  const currentStreak = Math.floor(
    now.diff(habit.startDate, ['days']).toObject().days ?? 0
  )

  return (
    <>
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
      {currentStreak > longestStreakDays ? (
        <div className="text-yellow-500">
          <Trophy />
        </div>
      ) : null}
      {habit.resets.length > 0 ? (
        <div className="flex items-center gap-2 text-xs text-slate-800">
          <Trophy />
          {longestStreakDays} d
        </div>
      ) : null}
    </>
  )
}
