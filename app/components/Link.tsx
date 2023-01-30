type ExternalLinkProps = {
  children: React.ReactNode
  className?: HTMLAnchorElement['className']
  href: HTMLAnchorElement['href']
  label?: string
}

export const ExternalLink = ({
  children,
  className,
  href,
  label,
}: ExternalLinkProps) => {
  return (
    <a
      aria-label={label}
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  )
}
