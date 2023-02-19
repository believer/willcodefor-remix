import type { LinksFunction } from '@remix-run/node'
import clsx from 'clsx'
import { DateTime } from 'luxon'
import HumanDuration from './HumanDuration'
import habitsManifest from './manifest.webmanifest'

type Habit = {
  startDate: DateTime | null
  title: string
}

export const links: LinksFunction = () => {
  return [{ rel: 'manifest', href: habitsManifest }]
}

export default function HabitsPage() {
  const habits: Habit[] = [
    {
      title: 'No alcohol',
      startDate: DateTime.fromISO('2023-01-29T20:30:32.000Z'),
    },
    {
      title: 'No coffee',
      startDate: DateTime.fromISO('2023-02-18T14:35:14.000Z'),
    },
    {
      title: 'No junk food',
      startDate: null,
    },
  ]

  const now = DateTime.now()

  const colors = [
    'bg-gradient-to-br from-emerald-500 to-emerald-700 ring-emerald-500/30',
    'bg-gradient-to-br from-cyan-500 to-cyan-700 ring-cyan-500/30',
    'bg-gradient-to-br from-rose-500 to-rose-700 ring-rose-500/30',
  ]

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
      {habits
        .filter(({ startDate }) => startDate)
        .map((habit, index) => {
          const days = now.diff(habit.startDate ?? now, 'days').toFormat('d')

          return (
            <div className="group" key={habit.title}>
              <div
                className={clsx([
                  'flex items-end justify-between rounded-lg px-5 pt-16 pb-4 ring-offset-4 ring-offset-tokyoNight-bg hover:ring-2',
                  colors[index],
                ])}
              >
                <time
                  dateTime={habit.startDate?.toISODate()}
                  title={habit.startDate?.toFormat('cccc, LLLL d, yyyy HH:mm')}
                >
                  <div className="text-2xl font-bold text-slate-800">
                    {days}
                  </div>
                  <div className="text-xs text-slate-800">days</div>
                </time>
                <div className="text-sm text-emerald-900">{habit.title}</div>
              </div>
              <div className="">
                {habit.startDate ? (
                  <HumanDuration startDate={habit.startDate} />
                ) : (
                  <div className="mt-2 text-center text-xs text-slate-500">
                    Not started
                  </div>
                )}
              </div>
            </div>
          )
        })}
    </div>
  )
}
