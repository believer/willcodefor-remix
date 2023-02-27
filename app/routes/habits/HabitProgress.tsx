import { useNow } from './hooks'
import type { Habit } from './Habit'

export function HabitProgress({ habit }: { habit: Habit }) {
  const now = useNow(1000)
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
  )
}
