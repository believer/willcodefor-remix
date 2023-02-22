import type { LinksFunction } from '@remix-run/node'
import { DateTime } from 'luxon'
import Calendar from './Calendar'
import type { Habit } from './Habit'
import HabitCard from './Habit'
import habitsManifest from './manifest.webmanifest'

export const links: LinksFunction = () => {
  return [{ rel: 'manifest', href: habitsManifest }]
}

const habits: Habit[] = [
  {
    calendarColor: 'bg-emerald-500',
    title: 'No alcohol',
    progressColor: 'text-emerald-900',
    startDate: DateTime.fromISO('2023-01-29T20:30:32.000Z'),
    color:
      'bg-gradient-to-br from-emerald-500 to-emerald-700 ring-emerald-500/30',
  },
  {
    calendarColor: 'bg-cyan-500',
    title: 'No coffee',
    progressColor: 'text-cyan-900',
    startDate: DateTime.fromISO('2023-02-18T14:35:14.000Z'),
    color: 'bg-gradient-to-br from-cyan-500 to-cyan-700 ring-cyan-500/30',
  },
  {
    calendarColor: 'bg-indigo-500',
    title: 'No food before bed',
    progressColor: 'text-indigo-900',
    startDate: DateTime.fromISO('2023-02-21T20:45:49.000Z'),
    color: 'bg-gradient-to-br from-indigo-500 to-indigo-700 ring-indigo-500/30',
  },
]

export default function HabitsPage() {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
      {habits.map((habit) => (
        <HabitCard key={habit.title} habit={habit} />
      ))}
      <Calendar habits={habits} />
    </div>
  )
}
