import { NavLink } from 'remix'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid-template-main mt-8 grid md:px-8">
      <div className="col-start-3 col-end-4 flex flex-col space-y-2 border-b border-gray-200 pb-8 md:flex-row md:items-center md:justify-end md:space-y-0 md:space-x-8 md:border-0 md:pb-0">
        <NavLink
          className={({ isActive }) =>
            `font-bold no-underline hover:underline ${
              isActive ? 'text-brandBlue-600' : 'text-gray-700 dark:text-white'
            }`
          }
          to="/"
          prefetch="intent"
        >
          @rnattochdag
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `font-bold no-underline hover:underline ${
              isActive ? 'text-brandBlue-600' : 'text-gray-700 dark:text-white'
            }`
          }
          to="/posts"
          prefetch="intent"
        >
          Writing
        </NavLink>
      </div>
      <div className="col-start-3 col-end-4 my-10 md:my-12">{children}</div>
    </main>
  )
}
