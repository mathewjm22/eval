// src/components/Layout.tsx
import { ReactNode, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAppData } from "../context";
import { cn } from "../utils/cn";
import { useTheme } from "../theme";

const NAV_SECTIONS = [
  {
    label: "OVERVIEW",
    items: [{ path: "/", label: "Dashboard" }],
  },
  {
    label: "NAVIGATION",
    items: [
      { path: "/students", label: "Students" },
      { path: "/evaluate", label: "New Evaluation" },
      { path: "/evaluations", label: "All Evaluations" },
      { path: "/progress", label: "Progress View" },
      { path: "/calendar", label: "Calendar" },
    ],
  },
  {
    label: "SETTINGS",
    items: [{ path: "/settings", label: "Settings" }],
  },
];

// Flat list for mobile nav
const NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);

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
        "theme-ring inline-flex items-center justify-center w-9 h-9 rounded-xl transition border",
        "hover:opacity-95 active:opacity-90"
      )}
      style={{
        background: isDark ? "rgba(255,45,120,0.1)" : "var(--panel-2)",
        borderColor: isDark ? "rgba(255,45,120,0.3)" : "var(--border)",
        color: "var(--text)",
      }}
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="text-sm">{isDark ? "☾" : "☀︎"}</span>
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
      style={{ color: "var(--text)" }}
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
                color: "#ffffff",
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
                    ? isDark ? "rgba(255,45,120,0.3)" : "transparent"
                    : "transparent",
                  background: isActive
                    ? isDark ? "linear-gradient(135deg, rgba(255,45,120,0.2), rgba(124,58,237,0.2))" : "var(--accent)"
                    : "transparent",
                  color: isActive
                    ? isDark ? "#ff2d78" : "#ffffff"
                    : isDark ? "rgba(255,255,255,0.75)" : "var(--text)",
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      {/* Desktop layout — floating card on gradient background */}
      <div className="hidden md:block min-h-screen p-6">
        <div
          className="app-shell flex mx-auto overflow-hidden"
          style={{
            height: "calc(100vh - 48px)",
            maxWidth: "1400px",
            background: isDark ? "#0a0a0f" : "#ffffff",
            borderRadius: "20px",
            boxShadow: isDark ? "0 8px 48px rgba(0,0,0,0.6)" : "0 8px 48px rgba(0,0,0,0.10)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
          }}
        >
          {/* Sidebar */}
          <aside
            className="flex flex-col w-64 flex-shrink-0 p-4"
            style={{
              background: isDark ? "var(--sidebar-bg)" : "var(--sidebar-bg)",
              borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
            }}
          >
            {/* Brand */}
            <Link
              to="/"
              className="flex items-center gap-3 px-1 pb-4 border-b"
              style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "var(--border)" }}
            >
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                style={{
                  background: isDark ? "linear-gradient(135deg, #ff2d78, #7c3aed)" : "var(--accent)",
                  color: "#ffffff",
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

            {/* Nav with section labels */}
            <nav className="mt-3 flex-1 text-sm overflow-y-auto">
              {NAV_SECTIONS.map((section) => (
                <div key={section.label} className="mb-1">
                  <p
                    className="px-3 mt-4 mb-1 text-[10px] uppercase tracking-widest font-semibold"
                    style={{ color: isDark ? "rgba(255,255,255,0.3)" : "var(--muted)" }}
                  >
                    {section.label}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const active = isActivePath(item.path, location.pathname);
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                          style={({ isActive }) => ({
                            background: isActive
                              ? isDark
                                ? "linear-gradient(135deg, rgba(255,45,120,0.15), rgba(124,58,237,0.15))"
                                : "var(--accent)"
                              : "transparent",
                            color: isActive
                              ? isDark ? "#ff2d78" : "#ffffff"
                              : isDark ? "rgba(255,255,255,0.6)" : "var(--text)",
                          })}
                        >
                          <span
                            className="text-xs w-4 text-center flex-shrink-0"
                            style={{
                              color: active
                                ? isDark ? "#ff2d78" : "#ffffff"
                                : isDark ? "rgba(255,255,255,0.28)" : "rgba(148,163,184,0.6)",
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
                  </div>
                </div>
              ))}
            </nav>

            {/* Bottom promo card */}
            <div
              className="mt-3 mx-1 p-3 rounded-xl"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(255,45,120,0.15), rgba(124,58,237,0.15))"
                  : "linear-gradient(135deg, #4361ee 0%, #7c3aed 100%)",
                border: `1px solid ${isDark ? "rgba(255,45,120,0.2)" : "transparent"}`,
              }}
            >
              <p className="text-xs font-semibold text-white mb-0.5">PreceptorEval</p>
              <p className="text-[10px] mb-2" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.8)" }}>
                Local-only · Your data stays private
              </p>
              <Link
                to="/settings"
                className="text-[10px] font-medium text-white underline-offset-2 hover:underline"
              >
                View Settings →
              </Link>
            </div>

            {/* Sidebar footer: profile snippet */}
            <div
              className="mt-3 pt-3 border-t flex items-center gap-3 px-1"
              style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "var(--border)" }}
            >
              <div
                className="h-8 w-8 rounded-2xl text-[11px] font-semibold flex items-center justify-center flex-shrink-0"
                style={{
                  background: isDark ? "linear-gradient(135deg, #ff2d78, #7c3aed)" : "var(--accent)",
                  color: "#ffffff",
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
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top header: pill search + actions */}
            <header
              className="flex-shrink-0 px-5 py-3 flex items-center gap-3 border-b"
              style={{
                background: isDark ? "var(--header-bg)" : "var(--header-bg)",
                borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)",
                backdropFilter: isDark ? "blur(12px)" : undefined,
              }}
            >
              {/* Pill search input */}
              <div
                className="flex items-center rounded-full px-4 py-2 text-sm flex-1 max-w-md border"
                style={{
                  background: isDark ? "rgba(255,255,255,0.04)" : "var(--panel-2)",
                  borderColor: isDark ? "rgba(255,255,255,0.08)" : "var(--border)",
                }}
              >
                <span className="mr-2 text-base" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "var(--muted)" }}>⌕</span>
                <input
                  type="text"
                  placeholder="Search students or evaluations…"
                  className="bg-transparent outline-none flex-1 text-sm"
                  style={{ color: "var(--text)" }}
                />
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <ThemeToggle />

                {/* Notification bell */}
                <button
                  type="button"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-xl transition border"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.04)" : "var(--panel-2)",
                    borderColor: isDark ? "rgba(255,255,255,0.08)" : "var(--border)",
                    color: isDark ? "rgba(255,255,255,0.6)" : "var(--muted)",
                  }}
                  aria-label="Notifications"
                  title="Notifications"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </button>

                {/* User avatar chip */}
                <div
                  className="flex items-center gap-2 rounded-xl px-2 py-1 border"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.04)" : "var(--panel-2)",
                    borderColor: isDark ? "rgba(255,255,255,0.08)" : "var(--border)",
                  }}
                >
                  <div
                    className="h-7 w-7 rounded-xl text-[11px] font-semibold flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isDark ? "linear-gradient(135deg, #ff2d78, #7c3aed)" : "var(--accent)",
                      color: "#ffffff",
                      boxShadow: isDark ? "0 2px 8px rgba(255,45,120,0.4)" : undefined,
                    }}
                  >
                    {initials}
                  </div>
                  <div className="hidden sm:block pr-1">
                    <p className="text-[11px] font-medium leading-tight" style={{ color: isDark ? "rgba(255,255,255,0.9)" : "var(--text)" }}>
                      {preceptor.name || "Preceptor"}
                    </p>
                    <p className="text-[10px] leading-tight" style={{ color: isDark ? "rgba(255,255,255,0.38)" : "var(--muted)" }}>
                      {preceptor.specialty || "Clinical Educator"}
                    </p>
                  </div>
                </div>
              </div>
            </header>

            {/* Main scrollable content area */}
            <main
              className="flex-1 overflow-y-auto p-5"
              style={{
                background: isDark ? "rgba(10,10,15,0.8)" : "var(--panel-2)",
              }}
            >
              {children}
            </main>
          </div>
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

