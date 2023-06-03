import type { Habit } from './Habit'
import { useNow } from './hooks'

export function HabitCardFront({ habit }: { habit: Habit }) {
  const now = useNow(10000)
  const days = now.diff(habit.startDate).toFormat('d')

  return (
    <>
      <time
        dateTime={habit.startDate.toISODate() ?? ''}
        title={habit.startDate.toFormat('cccc, LLLL d, yyyy HH:mm')}
      >
        <div className="text-5xl font-medium text-slate-800">{days}</div>
        <div className="text-xs text-slate-700">days</div>
      </time>
      <div className="text-sm text-slate-800">{habit.title}</div>
    </>
  )
}
