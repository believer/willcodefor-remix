import type { LinksFunction } from '@remix-run/node'
import { DateTime } from 'luxon'
import type { Habit } from './Habit'
import HabitView from './Habit'
import habitsManifest from './manifest.webmanifest'

export const links: LinksFunction = () => {
  return [{ rel: 'manifest', href: habitsManifest }]
}

const habits: Habit[] = [
  {
    title: 'No alcohol',
    progressColor: 'text-emerald-900',
    startDate: DateTime.fromISO('2023-01-29T20:30:32.000Z'),
    color:
      'bg-gradient-to-br from-emerald-500 to-emerald-700 ring-emerald-500/30',
  },
  {
    title: 'No coffee',
    progressColor: 'text-cyan-900',
    startDate: DateTime.fromISO('2023-02-18T14:35:14.000Z'),
    color: 'bg-gradient-to-br from-cyan-500 to-cyan-700 ring-cyan-500/30',
  },
]

export default function HabitsPage() {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
      {habits.map((habit) => (
        <HabitView key={habit.title} habit={habit} />
      ))}
    </div>
  )
}
