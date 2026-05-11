import { Eye, BookOpen, Mic2, Type } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { UrlInput } from "@/components/url-input";

export default function Home() {
  return (
    <div className="relative min-h-dvh">
      <SiteHeader />

      <main
        id="main"
        className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-10 pt-12 md:pt-20 pb-24"
      >
        {/* Masthead rule */}
        <div className="flex items-center gap-3 mb-10 text-[11px] font-mono uppercase tracking-[0.22em] text-[var(--color-mute)]">
          <span>Monday, in print and on screen</span>
          <span className="flex-1 h-px bg-[var(--color-rule)]" />
          <span className="stamp">Beta · Static audit</span>
        </div>

        {/* Hero */}
        <section className="grid grid-cols-12 gap-y-10 md:gap-x-10">
          <div className="col-span-12 md:col-span-8">
            <h1 className="font-serif text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95] tracking-[-0.02em] text-[var(--color-ink)]">
              Paste a URL.
              <br />
              We&rsquo;ll grade its{" "}
              <em className="italic text-[var(--color-stamp)]">accessibility</em>,
              <br />
              then re&#8209;publish it for the human
              <br />
              you choose.
            </h1>
            <p className="mt-8 max-w-[60ch] text-lg leading-relaxed text-[var(--color-ink-2)]">
              A static audit with{" "}
              <span className="font-mono text-sm bg-[var(--color-paper-2)] px-1.5 py-0.5 rounded-[2px]">
                axe-core
              </span>
              , a structured rewrite from{" "}
              <span className="font-mono text-sm bg-[var(--color-paper-2)] px-1.5 py-0.5 rounded-[2px]">
                gpt-4o-mini
              </span>
              , and a friendly narrator who reads it out loud — adjusted for
              dyslexia, low vision, color blindness, motor or cognitive needs.
            </p>
          </div>

          <section
            aria-labelledby="in-this-issue"
            className="col-span-12 md:col-span-4 md:pl-8 md:border-l md:border-[var(--color-rule)]"
          >
            <h2
              id="in-this-issue"
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-mute)] mb-3"
            >
              In this issue
            </h2>
            <ul className="space-y-3 font-serif text-lg leading-snug">
              <li>
                <span className="font-mono text-xs text-[var(--color-mute)] mr-2">
                  01
                </span>
                A score for any page, by impact.
              </li>
              <li>
                <span className="font-mono text-xs text-[var(--color-mute)] mr-2">
                  02
                </span>
                A short, funny voiceover summary.
              </li>
              <li>
                <span className="font-mono text-xs text-[var(--color-mute)] mr-2">
                  03
                </span>
                A re-rendered, profile-aware version.
              </li>
              <li>
                <span className="font-mono text-xs text-[var(--color-mute)] mr-2">
                  04
                </span>
                Colour-vision simulation, on demand.
              </li>
            </ul>
          </section>
        </section>

        {/* Input */}
        <section className="mt-16 md:mt-20">
          <UrlInput />
        </section>

        {/* Profiles strip */}
        <section className="mt-20 md:mt-28">
          <h2 className="font-mono uppercase tracking-[0.22em] text-[11px] text-[var(--color-mute)] mb-6">
            What you can translate for
          </h2>
          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <Feature
              kicker="Low vision"
              title="Bigger type. Stronger ink. Wider focus."
              icon={<Eye />}
            />
            <Feature
              kicker="Dyslexia"
              title="OpenDyslexic, generous spacing, shorter measure."
              icon={<Type />}
            />
            <Feature
              kicker="Cognitive"
              title="Short sentences. Plain words. Calm layout."
              icon={<BookOpen />}
            />
            <Feature
              kicker="Voiceover"
              title="A dry, friendly narrator reads it out for you."
              icon={<Mic2 />}
            />
          </div>
        </section>

        {/* Footer note */}
        <footer className="mt-24 pt-8 border-t border-[var(--color-rule)] flex flex-wrap items-baseline justify-between gap-4 text-sm">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-mute)]">
            Set in Fraunces &amp; Geist · Printed in your browser
          </p>
          <p className="text-[var(--color-mute)]">
            Built for the A11Y hackathon. No tracking, no logins, no clever
            popups.
          </p>
        </footer>
      </main>
    </div>
  );
}

function Feature({
  kicker,
  title,
  icon,
}: {
  kicker: string;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="col-span-12 sm:col-span-6 lg:col-span-3 group">
      <div className="flex items-center gap-2 text-[var(--color-stamp)]">
        <span className="size-5 [&>svg]:size-5">{icon}</span>
        <span className="font-mono uppercase tracking-[0.18em] text-[11px]">
          {kicker}
        </span>
      </div>
      <p className="mt-3 font-serif text-xl leading-snug">{title}</p>
      <hr className="mt-4 rule" />
    </article>
  );
}
