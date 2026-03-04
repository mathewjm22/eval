// src/components/Layout.tsx
import { ReactNode, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAppData } from "../context";
import { cn } from "../utils/cn";
import { useTheme } from "../theme";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard" },
  { path: "/students", label: "Students" },
  { path: "/evaluate", label: "New Evaluation" },
  { path: "/evaluations", label: "All Evaluations" },
  { path: "/progress", label: "Progress View" },
  { path: "/calendar", label: "Calendar" },
  { path: "/settings", label: "Settings" },
];

const NAV_ICONS: Record<string, string> = {
  "/": "◈",
  "/students": "◉",
  "/evaluate": "✦",
  "/evaluations": "≡",
  "/progress": "↗",
  "/calendar": "⊡",
  "/settings": "⚙",
};

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
        background: isDark ? "rgba(255,45,120,0.1)" : "var(--panel-2)",
        borderColor: isDark ? "rgba(255,45,120,0.3)" : "var(--border)",
        color: "var(--text)",
      }}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: isDark ? "var(--neon-pink)" : "var(--accent)" }}
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
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
    <div
      className="min-h-screen"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      {/* Mobile top bar */}
      <header
        className="md:hidden sticky top-0 z-40 border-b"
        style={{
          background: isDark ? "rgba(13, 13, 26, 0.95)" : "var(--panel)",
          borderColor: isDark ? "rgba(255,255,255,0.06)" : "var(--border)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-lg shadow-md"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, #ff2d78, #7c3aed)"
                  : "var(--accent)",
                color: isDark ? "#ffffff" : "#000000",
                boxShadow: isDark ? "0 4px 12px rgba(255,45,120,0.4)" : undefined,
              }}
            >
              🩺
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight truncate" style={{ color: isDark ? "#fff" : "var(--text)" }}>
                PreceptorEval
              </p>
              <p className="text-[10px] leading-tight truncate" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "var(--muted)" }}>
                Medical Student Evaluations
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 rounded-xl border"
              style={{
                borderColor: isDark ? "rgba(255,255,255,0.1)" : "var(--border)",
                background: isDark ? "rgba(255,255,255,0.04)" : undefined,
              }}
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              title="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav
            className="border-t px-4 pb-3 space-y-1"
            style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "var(--border)" }}
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-medium transition-all border"
                style={({ isActive }) => ({
                  borderColor: isActive
                    ? isDark ? "rgba(255,45,120,0.3)" : "rgba(79,70,229,0.22)"
                    : "transparent",
                  background: isActive
                    ? isDark ? "linear-gradient(135deg, rgba(255,45,120,0.2), rgba(124,58,237,0.2))" : "var(--accent-soft)"
                    : "transparent",
                  color: isActive
                    ? isDark ? "#ff2d78" : "var(--accent)"
                    : isDark ? "rgba(255,255,255,0.75)" : "var(--text)",
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
        <aside
          className="flex flex-col w-64 rounded-3xl p-4"
          style={{
            background: isDark ? "#0d0d1a" : "var(--panel)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "var(--border)"}`,
            boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 4px 24px rgba(0,0,0,0.08)",
          }}
        >
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 px-1 pb-4 border-b"
            style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "var(--border)" }}
          >
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg"
              style={{
                background: isDark ? "linear-gradient(135deg, #ff2d78, #7c3aed)" : "var(--accent)",
                color: isDark ? "#ffffff" : "#000000",
                boxShadow: isDark ? "0 4px 16px rgba(255,45,120,0.5)" : undefined,
              }}
            >
              🩺
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em]" style={{ color: isDark ? "rgba(255,255,255,0.38)" : "var(--muted)" }}>
                MSEVAL
              </p>
              <p className="text-sm font-semibold leading-tight" style={{ color: isDark ? "#ffffff" : "var(--text)" }}>
                Preceptor Eval
              </p>
            </div>
          </Link>

          {/* Nav */}
          <nav className="mt-4 flex-1 space-y-0.5 text-sm">
            {NAV_ITEMS.map((item) => {
              const active = isActivePath(item.path, location.pathname);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all border"
                  style={({ isActive }) => ({
                    borderColor: isActive
                      ? isDark ? "rgba(255,45,120,0.22)" : "rgba(79,70,229,0.22)"
                      : "transparent",
                    background: isActive
                      ? isDark
                        ? "linear-gradient(135deg, rgba(255,45,120,0.15), rgba(124,58,237,0.15))"
                        : "var(--accent-soft)"
                      : "transparent",
                    color: isActive
                      ? isDark ? "#ff2d78" : "var(--accent)"
                      : isDark ? "rgba(255,255,255,0.6)" : "var(--text)",
                  })}
                >
                  <span
                    className="text-xs w-4 text-center flex-shrink-0"
                    style={{
                      color: active
                        ? isDark ? "#ff2d78" : "var(--accent)"
                        : isDark ? "rgba(255,255,255,0.28)" : "rgba(148,163,184,0.5)",
                    }}
                  >
                    {NAV_ICONS[item.path] || "·"}
                  </span>
                  <span>{item.label}</span>
                  {active && isDark && (
                    <span
                      className="ml-auto h-1.5 w-1.5 rounded-full flex-shrink-0"
                      style={{ background: "#ff2d78", boxShadow: "0 0 6px #ff2d78" }}
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar footer: profile snippet */}
          <div
            className="mt-3 pt-3 border-t flex items-center gap-3 px-1"
            style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "var(--border)" }}
          >
            <div
              className="h-8 w-8 rounded-2xl text-[11px] font-semibold flex items-center justify-center flex-shrink-0"
              style={{
                background: isDark ? "linear-gradient(135deg, #ff2d78, #7c3aed)" : "var(--accent)",
                color: isDark ? "#ffffff" : "#000000",
                boxShadow: isDark ? "0 2px 8px rgba(255,45,120,0.4)" : undefined,
              }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: isDark ? "rgba(255,255,255,0.9)" : "var(--text)" }}>
                {preceptor.name || "Preceptor"}
              </p>
              <p className="text-[11px] truncate" style={{ color: isDark ? "rgba(255,255,255,0.38)" : "var(--muted)" }}>
                {preceptor.institution || "Set up profile in Settings"}
              </p>
            </div>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Header card */}
          <header
            className="rounded-3xl px-5 py-3"
            style={{
              background: isDark ? "rgba(13,13,26,0.9)" : "var(--panel)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "var(--border)"}`,
              backdropFilter: "blur(12px)",
              boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[220px]">
                <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: isDark ? "rgba(255,255,255,0.38)" : "var(--muted)" }}>
                  {today}
                </p>
                <h1 className="text-lg font-semibold truncate" style={{ color: isDark ? "#ffffff" : "var(--text)" }}>
                  {getPageTitle(location.pathname)}
                </h1>
              </div>

              <div className="shrink-0 flex items-center gap-2 flex-wrap justify-end">
                <div
                  className="hidden lg:flex items-center rounded-2xl px-3 py-2 text-xs w-60 border"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.03)" : "var(--panel-2)",
                    borderColor: isDark ? "rgba(255,255,255,0.07)" : "var(--border)",
                  }}
                >
                  <span className="mr-2" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "var(--muted)" }}>⌕</span>
                  <input
                    type="text"
                    placeholder="Search students or evaluations"
                    className="bg-transparent outline-none flex-1 text-xs"
                    style={{ color: "var(--text)" }}
                  />
                </div>

                <ThemeToggle />

                <div
                  className="flex items-center gap-2 rounded-2xl px-2 py-1 border"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.03)" : "var(--panel-2)",
                    borderColor: isDark ? "rgba(255,255,255,0.07)" : "var(--border)",
                  }}
                >
                  <div
                    className="h-7 w-7 rounded-2xl text-[11px] font-semibold flex items-center justify-center"
                    style={{
                      background: isDark ? "linear-gradient(135deg, #ff2d78, #7c3aed)" : "var(--accent)",
                      color: isDark ? "#ffffff" : "#000000",
                      boxShadow: isDark ? "0 2px 8px rgba(255,45,120,0.4)" : undefined,
                    }}
                  >
                    {initials}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[11px] font-medium leading-tight" style={{ color: isDark ? "rgba(255,255,255,0.9)" : "var(--text)" }}>
                      {preceptor.name || "Preceptor"}
                    </p>
                    <p className="text-[10px] leading-tight" style={{ color: isDark ? "rgba(255,255,255,0.38)" : "var(--muted)" }}>
                      {preceptor.specialty || "Clinical Educator"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main "card" that holds pages */}
          <main
            className="flex-1 rounded-3xl p-5 overflow-y-auto"
            style={{
              background: isDark ? "rgba(13,13,26,0.75)" : "var(--panel)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "var(--border)"}`,
              backdropFilter: "blur(12px)",
              boxShadow: isDark ? "0 8px 40px rgba(0,0,0,0.5)" : "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            {children}
          </main>

          {/* Footer line */}
          <footer className="text-[11px] px-1 pb-1 flex justify-between" style={{ color: isDark ? "rgba(255,255,255,0.28)" : "var(--muted)" }}>
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
  if (pathname.startsWith("/calendar")) return "Evaluation Calendar";
  if (pathname.startsWith("/settings")) return "Settings";
  return "Medical Preceptor Evaluation Tracker";
}
