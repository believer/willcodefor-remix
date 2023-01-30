import clsx from 'clsx'
import { ExternalLink } from './Link'

const SocialLink = ({
  children,
  color,
  href,
}: {
  children: React.ReactNode
  color: string
  href: string
}) => {
  let iconStyles =
    'flex items-center focus:outline-none rounded bg-gray-100 p-2 text-gray-700 ring-1 ring-transparent ring-offset-transparent transition-all hover:ring-2 hover:ring-gray-200 hover:ring-offset-2 dark:bg-gray-700 dark:hover:ring-gray-700 motion-reduce:transition-none hover:text-white dark:text-white focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 dark:focus:ring-gray-700'

  return (
    <ExternalLink className={clsx(iconStyles, color)} href={href}>
      {children}
    </ExternalLink>
  )
}

export const GitHub = () => {
  return (
    <SocialLink
      color="hover:bg-github focus:bg-github"
      href="https://github.com/believer"
    >
      <svg
        className="h-6 w-6 fill-current"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>GitHub</title>
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    </SocialLink>
  )
}

export const Twitter = () => {
  return (
    <SocialLink
      color="hover:bg-twitter focus:bg-twitter"
      href="https://twitter.com/rnattochdag"
    >
      <svg
        className="h-6 w-6 fill-current"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <title>Twitter</title>
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      </svg>
    </SocialLink>
  )
}

export const Polywork = () => {
  return (
    <SocialLink
      color="hover:bg-polywork focus:bg-polywork"
      href="https://www.polywork.com/rickard"
    >
      <svg
        className="h-6 w-6"
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 37 37"
        fill="none"
      >
        <title>Polywork</title>
        <g clipPath="url(#clip0)">
          <path
            d="M12.719 36.063V25.01H24.28v4.52a6.544 6.544 0 01-6.544 6.533h-5.018z"
            fill="#88CFB0"
          />
          <path
            d="M17.714 37h-5.897V24.073h13.366v5.458a7.48 7.48 0 01-7.47 7.47zm-4.035-1.873h4.035a5.608 5.608 0 005.608-5.596v-3.585h-9.643v9.181z"
            fill="#2F2F3A"
          />
          <path
            d="M24.559 24.698V12.974H36.12v5.18a6.534 6.534 0 01-6.533 6.544h-5.03z"
            fill="#F2C94C"
          />
          <path
            d="M29.53 25.635h-5.908V12.037H37v6.117a7.481 7.481 0 01-7.47 7.48zm-4.035-1.873h4.036a5.608 5.608 0 005.596-5.608v-4.278h-9.632v9.886z"
            fill="#2F2F3A"
          />
          <path
            d="M24.247 12.974H12.742v11.724h11.505V12.974z"
            fill="#BD83CE"
          />
          <path
            d="M25.183 25.635H11.817V12.037h13.366v13.598zm-11.562-1.873h9.643v-9.886h-9.585l-.058 9.886z"
            fill="#2F2F3A"
          />
          <path
            d="M.937 12.719v-5.25A6.533 6.533 0 017.469.937h4.972v11.782H.937z"
            fill="#40BE88"
          />
          <path
            d="M13.378 13.598H0V7.469A7.48 7.48 0 017.47 0h5.908v13.598zM1.873 11.723h9.69v-9.85H7.468a5.596 5.596 0 00-5.596 5.595v4.255z"
            fill="#2F2F3A"
          />
          <path
            d="M24.559 12.719V.937h4.972a6.533 6.533 0 016.532 6.532v5.25H24.56z"
            fill="#FF7474"
          />
          <path
            d="M37 13.598H23.622V0h5.909A7.48 7.48 0 0137 7.47v6.128zm-11.505-1.874h9.632V7.47a5.596 5.596 0 00-5.596-5.596h-4.036v9.851z"
            fill="#2F2F3A"
          />
          <path d="M24.247.937H12.742V12.66h11.505V.937z" fill="#6776F9" />
          <path
            d="M25.183 13.598H11.817V0h13.366v13.598zm-11.562-1.874h9.643v-9.85h-9.585l-.058 9.85z"
            fill="#2F2F3A"
          />
          <path
            d="M.937 29.53v-4.52h11.562v11.053h-5.03a6.533 6.533 0 01-6.532-6.532z"
            fill="#37C2E2"
          />
          <path
            d="M13.378 37H7.469A7.48 7.48 0 010 29.53v-5.457h13.378V37zM1.873 25.946v3.585a5.596 5.596 0 005.596 5.596h4.093v-9.18H1.873z"
            fill="#2F2F3A"
          />
          <path d="M12.441 12.974H.937v11.724H12.44V12.974z" fill="#F2994A" />
          <path
            d="M13.378 25.635H0V12.037h13.378v13.598zM1.873 23.762h9.69v-9.886h-9.69v9.886z"
            fill="#2F2F3A"
          />
        </g>
        <defs>
          <clipPath id="clip0">
            <path fill="#fff" d="M0 0h37v37H0z" />
          </clipPath>
        </defs>
      </svg>
    </SocialLink>
  )
}
