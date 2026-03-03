import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-44 -left-32 h-80 w-80 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="absolute top-40 -right-20 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute -bottom-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-500/25 blur-3xl" />
      </div>

      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900/80 shadow-lg shadow-sky-900/70 ring-1 ring-slate-700/80">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 opacity-70 blur-sm" />
              <span className="relative z-10 text-sm font-semibold tracking-tight">
                CB
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">
                CampusBridge
              </p>
              <p className="text-[11px] text-slate-400">
                Connect. Collaborate. Grow.
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-5 text-xs font-medium text-slate-300 md:flex">
            <a href="#features" className="hover:text-sky-300 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-sky-300 transition-colors">
              How it works
            </a>
            <a href="#for-whom" className="hover:text-sky-300 transition-colors">
              For whom
            </a>
          </nav>

          <div className="flex items-center gap-3 text-xs">
            <Link
              to="/login"
              className="text-slate-200 hover:text-sky-300 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 px-3 py-1.5 font-semibold text-slate-950 shadow-lg shadow-sky-900/60 hover:brightness-110 transition"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 space-y-20">
        <section className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-6">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-sky-400/80">
              Campus OS · Dark mode native
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
              One bridge for your{" "}
              <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                entire campus
              </span>
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              CampusBridge is your single source of truth for announcements,
              events, placements and student–admin communication. Built to feel
              like a premium app, not another dusty portal.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-sm">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 px-5 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-sky-900/60 hover:brightness-110 transition"
              >
                Get started – it&apos;s free
              </Link>
              <Link
                to="/login"
                className="text-xs font-medium text-sky-300 hover:text-sky-200"
              >
                I already have an account
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 pt-4 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Secure, role‑based access
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                Real‑time announcements
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                Placement‑ready dashboards
              </span>
            </div>
          </div>

          <div className="w-full max-w-md">
            <div className="relative rounded-3xl border border-slate-800/80 bg-slate-900/90 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.9)] backdrop-blur-xl overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),transparent_55%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.16),transparent_55%)] opacity-90" />
              <div className="relative z-10 space-y-3 text-xs text-slate-300">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-400/80">
                  Campus snapshot
                </p>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 space-y-2 overflow-hidden">
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <div className="h-2 w-24 rounded-full bg-slate-800" />
                      <div className="h-6 rounded-lg bg-slate-900 border border-slate-700" />
                      <div className="h-6 rounded-lg bg-slate-900 border border-slate-700" />
                      <div className="h-6 w-24 rounded-full bg-sky-500/80" />
                    </div>
                    <div className="hidden h-16 w-16 flex-none rounded-xl bg-gradient-to-br from-sky-500/40 via-indigo-500/40 to-emerald-400/40 md:block" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-400/80">
                Why campuses choose us
              </p>
              <h2 className="mt-2 text-xl md:text-2xl font-semibold tracking-tight">
                Built for students, admins and clubs
              </h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-4 text-sm shadow-[0_16px_50px_rgba(15,23,42,0.9)]">
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-sky-500/10 via-transparent to-emerald-400/10" />
              <div className="relative z-10 space-y-2">
                <p className="text-xs font-semibold text-sky-300">
                  For students
                </p>
                <p className="text-sm font-medium text-slate-50">
                  One personalised campus feed
                </p>
                <p className="text-xs text-slate-400">
                  See classes, clubs, events, placements and notices in a single,
                  calm dashboard – not ten different WhatsApp groups.
                </p>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-4 text-sm shadow-[0_16px_50px_rgba(15,23,42,0.9)]">
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-indigo-500/10 via-transparent to-sky-400/10" />
              <div className="relative z-10 space-y-2">
                <p className="text-xs font-semibold text-indigo-300">
                  For admins
                </p>
                <p className="text-sm font-medium text-slate-50">
                  Announce once, reach everyone
                </p>
                <p className="text-xs text-slate-400">
                  Publish announcements by department, year or batch. Know who
                  has seen what with simple analytics.
                </p>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-4 text-sm shadow-[0_16px_50px_rgba(15,23,42,0.9)]">
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-emerald-500/10 via-transparent to-indigo-400/10" />
              <div className="relative z-10 space-y-2">
                <p className="text-xs font-semibold text-emerald-300">
                  For clubs
                </p>
                <p className="text-sm font-medium text-slate-50">
                  Events that actually get discovered
                </p>
                <p className="text-xs text-slate-400">
                  Showcase events with posters, registrations and reminders –
                  all inside the same app students already open daily.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="grid gap-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] shadow-[0_24px_80px_rgba(0,0,0,0.9)]"
        >
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-400/80">
              How it fits your campus
            </p>
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
              Three steps from chaos to clarity
            </h2>
            <p className="text-xs md:text-sm text-slate-300">
              Start with secure logins, then plug in your departments, years and
              clubs. CampusBridge becomes the home screen for your students&apos;
              academic life.
            </p>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex gap-3">
                <span className="mt-0.5 h-5 w-5 rounded-full bg-sky-500/20 text-[11px] flex items-center justify-center text-sky-300">
                  1
                </span>
                <div>
                  <p className="font-medium text-slate-50">
                    Students sign up with college email
                  </p>
                  <p className="text-slate-400">
                    Only verified <code className="text-[10px]">*@student.edu.in</code> IDs are
                    allowed, keeping your community closed and safe.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 h-5 w-5 rounded-full bg-indigo-500/20 text-[11px] flex items-center justify-center text-indigo-300">
                  2
                </span>
                <div>
                  <p className="font-medium text-slate-50">
                    Admins broadcast announcements & events
                  </p>
                  <p className="text-slate-400">
                    Target by department or year, attach media, and send
                    time‑sensitive alerts instantly.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 h-5 w-5 rounded-full bg-emerald-500/20 text-[11px] flex items-center justify-center text-emerald-300">
                  3
                </span>
                <div>
                  <p className="font-medium text-slate-50">
                    Everyone lands on one dashboard
                  </p>
                  <p className="text-slate-400">
                    Students see everything that matters to them – and nothing
                    else – in a calm, dark‑mode interface.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-400/80">
              Secure by design
            </p>
            <p className="mt-2 text-sm font-medium text-slate-50">
              Dark‑theme experience that respects your data
            </p>
            <p className="mt-1 text-slate-400">
              CampusBridge is built with modern authentication and private
              college spaces in mind – keeping student activity inside your own
              campus bridge.
            </p>
          </div>
        </section>

        <section id="for-whom" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
              Designed for modern campuses
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-300">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-400/80">
                Students
              </p>
              <p className="mt-2 text-sm font-medium text-slate-50">
                A calmer way to stay updated
              </p>
              <p className="mt-1 text-slate-400">
                Replace scattered notifications across multiple apps with one
                curated, dark‑mode friendly feed.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-300">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-400/80">
                Faculty & admins
              </p>
              <p className="mt-2 text-sm font-medium text-slate-50">
                Less chasing, more clarity
              </p>
              <p className="mt-1 text-slate-400">
                Announce once, track reach, and avoid miscommunication between
                departments, years and sections.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-300">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-400/80">
                Placement cells
              </p>
              <p className="mt-2 text-sm font-medium text-slate-50">
                Showcase opportunities beautifully
              </p>
              <p className="mt-1 text-slate-400">
                Highlight drives, internships and deadlines in a UI that feels
                as premium as the opportunities themselves.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 px-5 py-6 text-sm shadow-[0_24px_80px_rgba(0,0,0,0.95)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-400/80">
                Ready when you are
              </p>
              <p className="mt-2 text-base font-semibold text-slate-50">
                Spin up your first CampusBridge space in minutes.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                You already have login, signup and a dashboard wired. The next
                step is adding your real data.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 px-5 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-sky-900/60 hover:brightness-110 transition"
              >
                Create campus account
              </Link>
              <Link
                to="/login"
                className="text-xs font-medium text-sky-300 hover:text-sky-200"
              >
                Continue where you left off
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

