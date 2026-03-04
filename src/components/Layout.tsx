// src/components/Layout.tsx
import { ReactNode, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAppData } from "../context";
import { cn } from "../utils/cn";
import { useTheme } from "../theme";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard" },
  { path: "/students", label: "Students" },
  { path: "/evaluate", label: "New Evaluation" },   // <-- this is the sidebar item
  { path: "/evaluations", label: "All Evaluations" },
  { path: "/progress", label: "Progress View" },
  { path: "/calendar", label: "Calendar" },
  { path: "/settings", label: "Settings" },
];

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "theme-ring inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-xs font-medium transition border",
        "hover:opacity-95 active:opacity-90"
      )}
      style={{
        background: "var(--panel-2)",
        borderColor: "var(--border)",
        color: "var(--text)",
      }}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: "var(--accent)" }}
      />
      <span className="hidden xl:inline">{isDark ? "Dark" : "Light"}</span>
      <span className="opacity-70">{isDark ? "☾" : "☀︎"}</span>
    </button>
  );
}

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

  const navLinkBase =
    "block px-3 py-2.5 rounded-xl text-sm font-medium transition-all border";
  const navLinkInactive = "opacity-90 hover:opacity-100";
  const navLinkActive = "shadow-sm";

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      {/* Mobile top bar */}
      <header
        className="md:hidden sticky top-0 z-40 border-b"
        style={{ background: "var(--panel)", borderColor: "var(--border)" }}
      >
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-black text-lg"
              style={{ background: "var(--accent)" }}
            >
              🩺
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight truncate">
                PreceptorEval
              </p>
              <p className="text-[10px] leading-tight truncate theme-muted">
                Medical Student Evaluations
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 rounded-xl border"
              style={{ borderColor: "var(--border)" }}
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              title="Toggle menu"
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
        </div>

        {mobileMenuOpen && (
          <nav
            className="border-t px-4 pb-3 space-y-1"
            style={{ borderColor: "var(--border)" }}
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(navLinkBase, isActive ? navLinkActive : navLinkInactive)
                }
                style={({ isActive }) => ({
                  borderColor: isActive
                    ? "rgba(163, 255, 18, 0.22)"
                    : "transparent",
                  background: isActive ? "var(--accent-soft)" : "transparent",
                  color: isActive ? "var(--accent)" : "var(--text)",
                })}
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
        <aside className="flex flex-col w-64 rounded-3xl theme-panel p-4 shadow-lg">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 px-1 pb-4 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-black text-lg shadow-md"
              style={{ background: "var(--accent)" }}
            >
              🩺
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] theme-muted">
                MSEVAL
              </p>
              <p className="text-sm font-semibold leading-tight">
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
                    "flex items-center gap-2 px-3 py-2 rounded-xl transition-colors border",
                    isActive ? "shadow-sm" : "opacity-90 hover:opacity-100"
                  )
                }
                style={({ isActive }) => ({
                  borderColor: isActive
                    ? "rgba(163, 255, 18, 0.22)"
                    : "transparent",
                  background: isActive ? "var(--accent-soft)" : "transparent",
                  color: isActive ? "var(--accent)" : "var(--text)",
                })}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: isActivePath(item.path, location.pathname)
                      ? "var(--accent)"
                      : "rgba(148, 163, 184, 0.35)",
                  }}
                />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Sidebar footer: profile snippet */}
          <div
            className="mt-3 pt-3 border-t flex items-center gap-3 px-1"
            style={{ borderColor: "var(--border)" }}
          >
            <div
              className="h-8 w-8 rounded-2xl text-[11px] font-semibold text-black flex items-center justify-center"
              style={{ background: "var(--accent)" }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">
                {preceptor.name || "Preceptor"}
              </p>
              <p className="text-[11px] truncate theme-muted">
                {preceptor.institution || "Set up profile in Settings"}
              </p>
            </div>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Header card */}
          <header className="rounded-3xl theme-panel px-5 py-3 shadow-lg">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[220px]">
                <p className="text-[11px] uppercase tracking-[0.18em] theme-muted">
                  {today}
                </p>
                <h1 className="text-lg font-semibold truncate">
                  {getPageTitle(location.pathname)}
                </h1>
              </div>

              {/* Right controls (never collapse) */}
              <div className="shrink-0 flex items-center gap-2 flex-wrap justify-end">
                <div className="hidden lg:flex items-center rounded-2xl px-3 py-2 text-xs w-60 border theme-panel-2">
                  <span className="mr-2 theme-muted">⌕</span>
                  <input
                    type="text"
                    placeholder="Search students or evaluations"
                    className="bg-transparent outline-none flex-1 text-xs"
                    style={{ color: "var(--text)" }}
                  />
                </div>

                <ThemeToggle />

                <div className="flex items-center gap-2 rounded-2xl px-2 py-1 border theme-panel-2">
                  <div
                    className="h-7 w-7 rounded-2xl text-[11px] font-semibold text-black flex items-center justify-center"
                    style={{ background: "var(--accent)" }}
                  >
                    {initials}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[11px] font-medium leading-tight">
                      {preceptor.name || "Preceptor"}
                    </p>
                    <p className="text-[10px] leading-tight theme-muted">
                      {preceptor.specialty || "Clinical Educator"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main “card” that holds pages */}
          <main className="flex-1 rounded-3xl theme-panel p-5 overflow-y-auto shadow-lg">
            {children}
          </main>

          {/* Footer line */}
          <footer className="text-[11px] px-1 pb-1 flex justify-between theme-muted">
            <span>MSEVAL · Local-only data</span>
            <Link to="/settings" className="underline-offset-2 hover:underline">
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

function isActivePath(itemPath: string, pathname: string) {
  if (itemPath === "/") return pathname === "/";
  return pathname.startsWith(itemPath);
}

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Dashboard";
  if (pathname.startsWith("/students")) return "Students";
  if (pathname.startsWith("/evaluate")) return "New Evaluation";
  if (pathname.startsWith("/evaluations")) return "Evaluations";
  if (pathname.startsWith("/progress")) return "Progress View";
  if (pathname.startsWith("/calendar")) return "Evaluation Calendar"; // NEW
  if (pathname.startsWith("/settings")) return "Settings";
  return "Medical Preceptor Evaluation Tracker";
}
