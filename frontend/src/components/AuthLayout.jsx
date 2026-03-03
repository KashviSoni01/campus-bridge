import { Link } from "react-router-dom";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-80 w-80 rounded-full bg-blue-600/30 blur-3xl" />
        <div className="absolute top-40 -right-20 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute -bottom-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
      </div>

      <div className="w-full max-w-5xl grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-stretch">
        <div className="relative hidden md:flex flex-col justify-between rounded-3xl border border-slate-800/80 bg-slate-900/60 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.85)] backdrop-blur-xl overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),transparent_55%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.12),transparent_55%)] opacity-80" />

          <div className="relative z-10 flex items-center gap-3 mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 shadow-lg shadow-sky-900/70">
              <span className="text-xl font-semibold tracking-tight">CB</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">CampusBridge</h1>
              <p className="text-xs text-slate-400">Connect. Collaborate. Grow.</p>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight">
              Your campus,{" "}
              <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                beautifully connected
              </span>
            </h2>
            <p className="text-sm leading-relaxed text-slate-300">
              One bridge between students, clubs, and admins. Discover events,
              manage announcements, and never miss an opportunity again.
            </p>

            <div className="mt-6 grid gap-3 text-sm text-slate-200">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 text-xs">
                  ✓
                </span>
                <p>Smart dashboard for students and admins.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-sky-500/15 text-sky-400 text-xs">
                  ✓
                </span>
                <p>Realtime announcements, events, and placements.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-indigo-500/15 text-indigo-400 text-xs">
                  ✓
                </span>
                <p>Secure role‑based access for students & admins.</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-4 text-xs text-slate-400">
            <p>Designed for modern campuses · Dark mode native</p>
            <div className="flex gap-3">
              <Link to="/login" className="hover:text-slate-200 transition-colors">
                Login
              </Link>
              <span className="text-slate-600">•</span>
              <Link to="/signup" className="hover:text-slate-200 transition-colors">
                Create account
              </Link>
            </div>
          </div>
        </div>

        <div className="relative rounded-3xl border border-slate-800/80 bg-slate-900/90 p-6 sm:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.14),transparent_55%)] opacity-80" />
          <div className="relative z-10 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-sky-400/80">
                Welcome to CampusBridge
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-slate-300/90">{subtitle}</p>
              )}
            </div>

            <div className="space-y-5">{children}</div>

            {footer && (
              <div className="pt-2 border-t border-slate-800/80 text-sm text-slate-300">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

