import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PageShell } from "../components/Layout";
import { useAuth } from "../lib/auth";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <div className="mx-auto flex max-w-md flex-col px-4 py-16">
        <h1 className="text-3xl font-extrabold">Вход</h1>
        <p className="mt-2 text-slate-600">Войдите, чтобы создавать и сохранять карточки.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="E-mail" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
          <Field label="Пароль" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
          <button
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Входим..." : "Войти"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Нет аккаунта?{" "}
          <Link to="/register" className="font-semibold text-emerald-600 hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </PageShell>
  );
}

export function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        required
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
      />
    </label>
  );
}
