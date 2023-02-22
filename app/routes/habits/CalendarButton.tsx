type CalendarButtonProps = {
  children: React.ReactNode
  display: boolean
  onClick: () => void
}

export default function CalendarButton({
  children,
  display,
  onClick,
}: CalendarButtonProps) {
  // Keep a div of the same size in the DOM
  // to keep the layout consistent
  if (!display) {
    return <div className="w-12" />
  }

  return (
    <button
      className="w-12 rounded-lg text-sm font-bold text-slate-400 ring-yellow-500 ring-offset-4 ring-offset-slate-800 hover:text-slate-300 focus:outline-none focus:ring-2"
      onClick={onClick}
    >
      {children}
    </button>
  )
}
