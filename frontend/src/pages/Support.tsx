import { useState } from "react";
import { PageShell } from "../components/Layout";
import { Send, MessageCircle, Mail, Phone } from "lucide-react";

const socials = [
  { name: "Telegram", handle: "@cardify_support", href: "https://t.me/", icon: Send, color: "bg-sky-500" },
  { name: "WhatsApp", handle: "+7 (900) 000-00-00", href: "https://wa.me/", icon: Phone, color: "bg-green-500" },
  { name: "VK", handle: "vk.com/cardify", href: "https://vk.com/", icon: MessageCircle, color: "bg-blue-600" },
  { name: "E-mail", handle: "help@cardify.app", href: "mailto:help@cardify.app", icon: Mail, color: "bg-slate-700" },
];

export function Support() {
  const [sent, setSent] = useState(false);
  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-4xl font-extrabold">Поддержка</h1>
        <p className="mt-3 text-slate-600">
          Напишите нам в любом удобном мессенджере — отвечаем в течение часа в рабочее время.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-400 hover:shadow"
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${s.color}`}>
                <s.icon size={22} />
              </span>
              <div>
                <div className="font-bold">{s.name}</div>
                <div className="text-sm text-slate-500">{s.handle}</div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">Форма обращения</h2>
          {sent ? (
            <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-emerald-700">
              Спасибо! Мы получили ваше обращение и скоро ответим.
            </div>
          ) : (
            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <input
                required
                placeholder="Ваш e-mail"
                type="email"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
              <textarea
                required
                placeholder="Опишите вопрос"
                rows={4}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
              <button className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700">
                Отправить
              </button>
            </form>
          )}
        </div>
      </div>
    </PageShell>
  );
}
