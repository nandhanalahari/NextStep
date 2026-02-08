export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary-foreground"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="font-display text-lg font-bold text-foreground">
            NextStep
          </span>
        </div>

        <div className="flex gap-8 text-sm text-muted-foreground">
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            How It Works
          </a>
          <a href="#faq" className="transition-colors hover:text-foreground">
            FAQ
          </a>
        </div>

        <p className="text-xs text-muted-foreground">
          Built for hackers who reach new heights.
        </p>
      </div>
    </footer>
  )
}
