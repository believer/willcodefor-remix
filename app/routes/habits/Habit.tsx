import clsx from 'clsx'
import type { DateTime } from 'luxon'
import React from 'react'
import { HabitProgress } from './HabitProgress'
import { HabitCardBack } from './HabitCardBack'
import { HabitCardFront } from './HabitCardFront'

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

export default function HabitCard({ habit }: HabitProps) {
  const [displayBack, setDisplayBack] = React.useState(false)

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
        <HabitCardBack habit={habit} />
      ) : (
        <HabitCardFront habit={habit} />
      )}

      <HabitProgress habit={habit} />
    </button>
  )
}
