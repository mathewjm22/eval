// src/components/Layout.tsx
import { ReactNode, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAppData } from "@/context";
import { cn } from "@/utils/cn";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard" },
  { path: "/students", label: "Students" },
  { path: "/evaluate", label: "New Evaluation" },
  { path: "/evaluations", label: "All Evaluations" },
  { path: "/progress", label: "Progress View" },
  { path: "/settings", label: "Settings" },
];

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data } = useAppData();
  const { preceptor } = data;

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const initials = preceptor.name
    ? preceptor.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
    : "DR";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Mobile top bar */}
      <header className="md:hidden bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg">
              🩺
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 leading-tight">
                PreceptorEval
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">
                Medical Student Evaluations
              </p>
            </div>
          </Link>
          <button
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
        {mobileMenuOpen && (
          <nav className="border-t border-slate-200 bg-white px-4 pb-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "block px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      {/* Desktop layout */}
      <div className="hidden md:flex h-screen max-w-6xl mx-auto px-6 py-6 gap-5">
        {/* Sidebar */}
        <aside className="flex flex-col w-64 rounded-3xl bg-white/90 shadow-lg border border-slate-100 p-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 px-1 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-lg shadow-md">
              🩺
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                MSEVAL
              </p>
              <p className="text-sm font-semibold text-slate-800 leading-tight">
                Preceptor Evaluation
              </p>
            </div>
          </Link>

          {/* Nav */}
          <nav className="mt-4 flex-1 space-y-1 text-sm">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl transition-colors",
                    "text-slate-500 hover:text-slate-900 hover:bg-slate-50",
                    isActive &&
                      "bg-indigo-50 text-indigo-700 font-medium border border-indigo-100"
                  )
                }
              >
                <span className="h-2 w-2 rounded-full bg-slate-200" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Sidebar footer: profile snippet */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3 px-1">
            <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-semibold text-white flex items-center justify-center">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-800 truncate">
                {preceptor.name || "Preceptor"}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {preceptor.institution || "Set up profile in Settings"}
              </p>
            </div>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Header card */}
          <header className="rounded-3xl bg-white/95 shadow-lg border border-slate-100 px-5 py-3 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                {today}
              </p>
              <h1 className="text-lg font-semibold text-slate-900 truncate">
                {getPageTitle(location.pathname)}
              </h1>
            </div>

            {/* Search (visual) */}
            <div className="hidden lg:flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-400 w-60">
              <span className="mr-2">🔍</span>
              <input
                type="text"
                placeholder="Search students or evaluations"
                className="bg-transparent outline-none flex-1 text-xs text-slate-600 placeholder:text-slate-400"
              />
            </div>

            {/* Profile pill */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-2 py-1">
              <div className="h-7 w-7 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-[11px] font-semibold text-white flex items-center justify-center">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-[11px] font-medium text-slate-800 leading-tight">
                  {preceptor.name || "Preceptor"}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {preceptor.specialty || "Clinical Educator"}
                </p>
              </div>
            </div>
          </header>

          {/* Main “card” that holds pages */}
          <main className="flex-1 rounded-3xl bg-white/95 shadow-lg border border-slate-100 p-5 overflow-y-auto">
            {children}
          </main>

          {/* Footer line */}
          <footer className="text-[11px] text-slate-400 px-1 pb-1 flex justify-between">
            <span>MSEVAL · Local-only data</span>
            <Link
              to="/settings"
              className="underline-offset-2 hover:underline text-slate-400"
            >
              Settings
            </Link>
          </footer>
        </div>
      </div>

      {/* For small screens, reuse existing simple layout (content below header) */}
      <main className="md:hidden max-w-7xl mx-auto px-4 pb-6 pt-4">
        {children}
      </main>
    </div>
  );
}

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Dashboard";
  if (pathname.startsWith("/students")) return "Students";
  if (pathname.startsWith("/evaluate")) return "New Evaluation";
  if (pathname.startsWith("/evaluations")) return "Evaluations";
  if (pathname.startsWith("/progress")) return "Progress View";
  if (pathname.startsWith("/settings")) return "Settings";
  return "Medical Preceptor Evaluation Tracker";
}
