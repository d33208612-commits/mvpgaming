import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

function navClass({ isActive }: { isActive: boolean }) {
  return [
    "px-3 py-2 rounded-lg text-sm font-semibold transition",
    isActive ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100",
  ].join(" ");
}

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Sparkles size={18} />
          </span>
          Cardify
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className={navClass} end>
            Главная
          </NavLink>
          <NavLink to="/editor" className={navClass}>
            Редактор
          </NavLink>
          <NavLink to="/pricing" className={navClass}>
            Тарифы
          </NavLink>
          <NavLink to="/support" className={navClass}>
            Поддержка
          </NavLink>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:block"
              >
                {user.name}
                <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-700">
                  {user.plan === "pro" ? "PRO" : "FREE"}
                </span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Вход
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row">
        <span>© {new Date().getFullYear()} Cardify — генератор инфографики для маркетплейсов</span>
        <Link to="/support" className="hover:text-emerald-600">
          Техподдержка
        </Link>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
