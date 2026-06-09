import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "../components/Layout";
import { useAuth } from "../lib/auth";
import { Field } from "./Login";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Пароль должен быть не короче 6 символов");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <div className="mx-auto flex max-w-md flex-col px-4 py-16">
        <h1 className="text-3xl font-extrabold">Регистрация</h1>
        <p className="mt-2 text-slate-600">Создайте аккаунт — это бесплатно.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="Имя" type="text" value={name} onChange={setName} placeholder="Иван" />
          <Field label="E-mail" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
          <Field label="Пароль" type="password" value={password} onChange={setPassword} placeholder="минимум 6 символов" />
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
          <button
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Создаём..." : "Создать аккаунт"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="font-semibold text-emerald-600 hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
