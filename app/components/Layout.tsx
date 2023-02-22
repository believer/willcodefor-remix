import clsx from 'clsx'
import { NavLink } from '@remix-run/react'

export default function Layout({
  children,
  noHeader,
}: {
  children: React.ReactNode
  noHeader?: boolean
}) {
  return (
    <main className="grid-template-main grid py-5 md:px-8">
      {noHeader ? null : (
        <div className="col-start-3 col-end-4 flex flex-col space-y-2 border-b border-gray-200 pb-8 md:flex-row md:items-center md:justify-end md:space-y-0 md:space-x-8 md:border-0 md:pb-0">
          <NavLink
            className={({ isActive }) =>
              clsx('font-bold no-underline hover:underline', {
                'text-gray-700 dark:text-white': !isActive,
              })
            }
            to="/"
            prefetch="intent"
          >
            @rnattochdag
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              clsx('font-bold no-underline hover:underline', {
                'text-gray-700 dark:text-white': !isActive,
              })
            }
            to="/posts"
            prefetch="intent"
          >
            Writing
          </NavLink>
        </div>
      )}
      <div
        className={clsx([
          'col-start-3 col-end-4',
          noHeader ? '' : 'my-10 md:my-12',
        ])}
      >
        {children}
      </div>
    </main>
  )
}
