import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-10 pt-8 md:pt-10 flex items-center justify-between">
      <Link
        href="/"
        className="group inline-flex items-baseline gap-2 no-underline"
      >
        <span className="font-serif text-2xl tracking-tight">
          The <em className="italic">Translator</em>
        </span>
        <span className="hidden sm:inline text-[10px] uppercase tracking-[0.2em] font-mono text-[var(--color-mute)]">
          / a11y reader
        </span>
      </Link>
      <nav className="flex items-center gap-5 text-sm font-mono uppercase tracking-[0.14em]">
        <a
          href="https://www.w3.org/WAI/standards-guidelines/wcag/"
          target="_blank"
          rel="noreferrer"
          className="hover:text-[var(--color-stamp)]"
        >
          WCAG
        </a>
        <a
          href="https://github.com/dequelabs/axe-core"
          target="_blank"
          rel="noreferrer"
          className="hover:text-[var(--color-stamp)]"
        >
          axe-core
        </a>
        <span className="text-[var(--color-mute)] hidden md:inline">
          Vol. 1 · Issue 1
        </span>
      </nav>
    </header>
  );
}
