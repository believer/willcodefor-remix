import type { LinksFunction, MetaFunction } from '@remix-run/node'
import { DateTime } from 'luxon'
import Calendar from './Calendar'
import type { Habit } from './Habit'
import HabitCard from './Habit'
import habitsManifest from './manifest.webmanifest'

export const links: LinksFunction = () => [
  { rel: 'manifest', href: habitsManifest },
]

export const meta: MetaFunction = () => ({
  title: 'Habits',
})

const habits: Habit[] = [
  {
    calendarColor: 'bg-emerald-500',
    title: 'No alcohol',
    progressColor: 'text-emerald-900',
    startDate: DateTime.fromISO('2023-03-02T17:29:32.000Z'),
    color:
      'bg-gradient-to-br from-emerald-500 to-emerald-700 ring-emerald-500/30',
    resets: [
      {
        startDate: DateTime.fromISO('2023-03-01T18:29:32.000Z'),
        endDate: DateTime.fromISO('2023-03-02T15:29:32.000Z'),
      },
      {
        startDate: DateTime.fromISO('2023-02-28T18:05:32.000Z'),
        endDate: DateTime.fromISO('2023-03-01T15:36:32.000Z'),
      },
      {
        startDate: DateTime.fromISO('2023-02-26T18:09:32.000Z'),
        endDate: DateTime.fromISO('2023-02-28T16:26:32.000Z'),
      },
      {
        startDate: DateTime.fromISO('2023-02-25T18:09:32.000Z'),
        endDate: DateTime.fromISO('2023-02-26T17:09:32.000Z'),
      },
      {
        startDate: DateTime.fromISO('2023-02-24T16:51:32.000Z'),
        endDate: DateTime.fromISO('2023-02-25T17:09:32.000Z'),
      },
      {
        startDate: DateTime.fromISO('2023-01-29T20:30:32.000Z'),
        endDate: DateTime.fromISO('2023-02-24T15:51:32.000Z'),
      },
    ],
  },
  {
    calendarColor: 'bg-cyan-500',
    title: 'No coffee',
    progressColor: 'text-cyan-900',
    startDate: DateTime.fromISO('2023-02-25T12:05:14.000Z'),
    color: 'bg-gradient-to-br from-cyan-500 to-cyan-700 ring-cyan-500/30',
    resets: [
      {
        startDate: DateTime.fromISO('2023-02-18T14:35:14.000Z'),
        endDate: DateTime.fromISO('2023-02-25T11:35:14.000Z'),
      },
    ],
  }
]

export default function HabitsPage() {
  return (
    <div className="grid grid-cols-1 items-start gap-x-8 gap-y-6 md:grid-cols-2">
      <div className="grid grid-cols-1 gap-y-6">
        {habits.map((habit) => (
          <HabitCard key={habit.title} habit={habit} />
        ))}
      </div>
      <Calendar habits={habits} />
    </div>
  )
}
