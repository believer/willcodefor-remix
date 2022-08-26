import { Outlet } from "@remix-run/react";

export default function StatsPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <Outlet />
    </div>
  )
}
