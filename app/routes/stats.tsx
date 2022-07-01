import { Outlet } from 'remix'

export default function StatsPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <Outlet />
    </div>
  )
}
