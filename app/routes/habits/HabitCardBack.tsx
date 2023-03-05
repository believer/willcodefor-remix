import type { DurationObjectUnits } from 'luxon'
import { Duration } from 'luxon'
import type { Habit } from './Habit'
import { Trophy } from './Icons'
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
  const longestStreakDays = longestStreak.days

  const currentStreak = now.diff(habit.startDate, ['days']).toObject().days ?? 0
  const isLongestStreak = currentStreak > longestStreakDays

  return (
    <>
      <div className="flex gap-4">
        {Object.entries(parts)
          .filter(([_, value]) => value !== 0)
          .map(([key, value]) => (
            <div
              className="grid grid-cols-[auto,8px] items-baseline gap-1 text-2xl font-bold tabular-nums text-slate-800"
              key={key}
            >
              {Math.floor(value)}
              <span className="text-xs font-normal">{key[0]}</span>
            </div>
          ))}
      </div>
      {isLongestStreak ? (
        <div
          className="pb-1 text-yellow-600/60"
          title={`${Math.floor(currentStreak)} d`}
        >
          <Trophy />
        </div>
      ) : null}
      {habit.resets.length > 0 && !isLongestStreak ? (
        <div
          className="flex items-center gap-2 pb-1 text-xs text-slate-800/30"
          title={`${Math.floor(longestStreakDays)} d`}
        >
          <Trophy />
        </div>
      ) : null}
    </>
  )
}
