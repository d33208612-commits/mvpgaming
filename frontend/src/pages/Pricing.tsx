import { useNavigate } from "react-router-dom";
import { PageShell } from "../components/Layout";
import { useAuth } from "../lib/auth";
import { Check } from "lucide-react";

const plans = [
  {
    id: "free" as const,
    name: "Free",
    price: "0 ₽",
    period: "навсегда",
    features: ["3 карточки в месяц", "4 базовых шаблона", "Экспорт PNG с watermark", "ИИ-определение категории"],
    cta: "Текущий план",
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "990 ₽",
    period: "в месяц",
    highlight: true,
    features: [
      "Безлимит карточек",
      "Все шаблоны и стили",
      "Экспорт в высоком разрешении без watermark",
      "ИИ-генерация фона",
      "Приоритетная поддержка",
    ],
    cta: "Перейти на Pro",
  },
];

export function Pricing() {
  const { user, setPlan } = useAuth();
  const navigate = useNavigate();

  function choose(plan: "free" | "pro") {
    if (!user) {
      navigate("/register");
      return;
    }
    setPlan(plan);
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="text-center text-4xl font-extrabold">Тарифы</h1>
        <p className="mt-3 text-center text-slate-600">
          Начните бесплатно, переходите на Pro когда понадобится больше
        </p>
        <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
          {plans.map((p) => {
            const active = user?.plan === p.id;
            return (
              <div
                key={p.id}
                className={[
                  "relative rounded-3xl border p-8",
                  p.highlight ? "border-emerald-500 bg-white shadow-xl shadow-emerald-600/10" : "border-slate-200 bg-white",
                ].join(" ")}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-8 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                    Популярный
                  </span>
                )}
                <div className="text-lg font-bold">{p.name}</div>
                <div className="mt-2">
                  <span className="text-4xl font-extrabold">{p.price}</span>
                  <span className="ml-1 text-slate-500">/ {p.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="mt-0.5 text-emerald-600" size={18} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => choose(p.id)}
                  disabled={active}
                  className={[
                    "mt-8 w-full rounded-xl px-4 py-3 font-semibold",
                    active
                      ? "cursor-default bg-slate-100 text-slate-400"
                      : p.highlight
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {active ? "Активен" : p.cta}
                </button>
              </div>
            );
          })}
        </div>
        <p className="mt-8 text-center text-sm text-slate-400">
          Оплата — демо-режим: план меняется мгновенно без реального списания.
        </p>
      </div>
    </PageShell>
  );
}
