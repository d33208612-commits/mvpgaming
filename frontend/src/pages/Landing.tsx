import { Link } from "react-router-dom";
import { PageShell } from "../components/Layout";
import { TemplateRenderer } from "../components/templates";
import { defaultCard } from "../lib/sampleData";
import { TEMPLATES } from "../lib/types";
import type { CardData, TemplateId } from "../lib/types";
import { Sparkles, Upload, Wand2, Download, Brain } from "lucide-react";

const previews: { id: TemplateId; data: CardData }[] = [
  {
    id: "gamepad",
    data: { ...defaultCard, brand: "8BitDo", title: "Геймпад", subtitle: "с виброоткликом" },
  },
  {
    id: "airpods",
    data: {
      ...defaultCard,
      brand: "Apple",
      title: "Air Pods Max",
      subtitle: "Оригинальная продукция Apple",
      stats: [
        { value: "20", label: "часов работы" },
        { value: "200", label: "часов ожидания" },
        { value: "2", label: "часа до зарядки" },
      ],
    },
  },
  {
    id: "fen",
    data: {
      ...defaultCard,
      brand: "BORK",
      title: "ФЕН-\nСТАЙЛЕР",
      subtitle: "для создания роскошных укладок",
      stats: [
        { value: "5", label: "Количество скоростей" },
        { value: "8", label: "Режимов нагрева" },
        { value: "3", label: "Количество насадок" },
        { value: "31", label: "Скорость потока, м/с" },
        { value: "1.65", label: "Мощность, кВт" },
      ],
    },
  },
  {
    id: "toothpaste",
    data: {
      ...defaultCard,
      brand: "Perfora",
      title: "Зубная\nпаста.",
      subtitle: "Накопительный эффект",
      features: [
        { icon: "Check", title: "Снимает", subtitle: "воспаление дёсен" },
        { icon: "Check", title: "Возвращает", subtitle: "естественный цвет" },
        { icon: "Check", title: "Улучшает", subtitle: "зубную эмаль" },
      ],
    },
  },
];

const steps = [
  { icon: Upload, title: "Загрузите фото", text: "Добавьте изображение товара — фон можно убрать автоматически." },
  { icon: Brain, title: "ИИ определит категорию", text: "Нейросеть распознаёт, что на фото: техника, аксессуар, игрушка и т.д." },
  { icon: Wand2, title: "Подберём дизайн", text: "Под категорию подбирается готовый шаблон в стиле топовых карточек." },
  { icon: Download, title: "Скачайте PNG", text: "Экспорт в формате маркетплейса в один клик." },
];

export function Landing() {
  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-10 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700">
          <Sparkles size={16} /> Инфографика для WB и Ozon за минуту
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          Продающие карточки товара с помощью ИИ
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          Загрузите фото — искусственный интеллект определит тип товара и соберёт
          красивую инфографику по готовому дизайну. Никакого Photoshop.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/editor"
            className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
          >
            Создать карточку
          </Link>
          <Link
            to="/pricing"
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Тарифы
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <s.icon size={22} />
              </div>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-center text-3xl font-extrabold">Готовые стили дизайна</h2>
        <p className="mt-2 text-center text-slate-600">
          Шаблоны вдохновлены лучшими карточками маркетплейсов
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {previews.map((p) => {
            const meta = TEMPLATES.find((t) => t.id === p.id)!;
            return (
              <div key={p.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex justify-center overflow-hidden bg-slate-50 p-3">
                  <div style={{ transform: "scale(0.42)", transformOrigin: "top center", height: 336 }}>
                    <TemplateRenderer template={p.id} data={p.data} />
                  </div>
                </div>
                <div className="p-4">
                  <div className="font-bold">{meta.name}</div>
                  <div className="text-sm text-slate-500">{meta.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
