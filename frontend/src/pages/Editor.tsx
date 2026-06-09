import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toPng } from "html-to-image";
import { PageShell } from "../components/Layout";
import { TemplateRenderer, CARD_W, CARD_H } from "../components/templates";
import { defaultCard } from "../lib/sampleData";
import { TEMPLATES, type CardData, type TemplateId, type ClassifyResult } from "../lib/types";
import { classifyImage } from "../lib/api";
import { useAuth } from "../lib/auth";
import { getProject, saveProject } from "../lib/projects";
import { ICON_NAMES } from "../lib/icons";
import { Upload, Download, Save, Plus, X, Brain, Loader2 } from "lucide-react";

const SCALE = 0.62;

export function Editor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get("id");

  const [existing] = useState(() =>
    editId && user ? getProject(user.email, editId) : undefined,
  );
  const [template, setTemplate] = useState<TemplateId>(existing?.template ?? "gamepad");
  const [data, setData] = useState<CardData>(existing?.data ?? defaultCard);
  const [classifying, setClassifying] = useState(false);
  const [result, setResult] = useState<ClassifyResult | null>(null);
  const [projectId, setProjectId] = useState<string | null>(existing?.id ?? null);
  const [name, setName] = useState(existing?.name ?? "Моя карточка");
  const cardRef = useRef<HTMLDivElement>(null);

  function update<K extends keyof CardData>(field: K, value: CardData[K]) {
    setData((d) => ({ ...d, [field]: value }));
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      update("imageUrl", url);
      void runClassify(url);
    };
    reader.readAsDataURL(file);
  }

  async function runClassify(url?: string) {
    const img = url ?? data.imageUrl;
    if (!img) return;
    setClassifying(true);
    try {
      const res = await classifyImage(img);
      setResult(res);
      setTemplate(res.template);
    } finally {
      setClassifying(false);
    }
  }

  async function exportPng() {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, {
      pixelRatio: 2,
      width: CARD_W,
      height: CARD_H,
      cacheBust: true,
    });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${name || "card"}.png`;
    a.click();
  }

  function save() {
    if (!user) {
      navigate("/login", { state: { from: "/editor" } });
      return;
    }
    const id = projectId ?? `p_${Date.now()}`;
    saveProject(user.email, { id, name, template, data, updatedAt: new Date().toISOString() });
    setProjectId(id);
    navigate("/dashboard");
  }

  return (
    <PageShell>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_minmax(420px,auto)]">
        {/* controls */}
        <div className="order-2 space-y-6 lg:order-1">
          <Section title="1. Фото товара">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-6 text-slate-600 hover:border-emerald-400">
              <Upload size={20} />
              <span className="font-semibold">Загрузить изображение</span>
              <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
            </label>
            {data.imageUrl && (
              <button
                onClick={() => runClassify()}
                disabled={classifying}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {classifying ? <Loader2 className="animate-spin" size={18} /> : <Brain size={18} />}
                Определить категорию (ИИ)
              </button>
            )}
            {result && (
              <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm">
                <div className="font-semibold text-emerald-800">
                  ИИ: {result.categoryLabel}{" "}
                  <span className="font-normal text-emerald-600">
                    ({Math.round(result.confidence * 100)}%, {result.source === "ai" ? "нейросеть" : "демо"})
                  </span>
                </div>
                <div className="text-emerald-700">Подобран шаблон: {TEMPLATES.find((t) => t.id === result.template)?.name}</div>
              </div>
            )}
          </Section>

          <Section title="2. Шаблон дизайна">
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={[
                    "rounded-xl border p-3 text-left text-sm",
                    template === t.id ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300",
                  ].join(" ")}
                >
                  <span className="block font-bold">{t.name}</span>
                  <span className="block text-xs text-slate-500">{t.description}</span>
                </button>
              ))}
            </div>
          </Section>

          <Section title="3. Текст и данные">
            <div className="space-y-3">
              <Input label="Бренд" value={data.brand} onChange={(v) => update("brand", v)} />
              <Input label="Заголовок (Enter — новая строка)" value={data.title} onChange={(v) => update("title", v)} multiline />
              <Input label="Подзаголовок / преимущество" value={data.subtitle} onChange={(v) => update("subtitle", v)} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Бейдж: число" value={data.badgeValue} onChange={(v) => update("badgeValue", v)} />
                <Input label="Бейдж: подпись" value={data.badgeLabel} onChange={(v) => update("badgeLabel", v)} />
              </div>
              <Input label="Артикул / код" value={data.code} onChange={(v) => update("code", v)} />
              <Input label="Подарок / подпись" value={data.giftLabel} onChange={(v) => update("giftLabel", v)} />
            </div>
          </Section>

          <Section title="4. Преимущества">
            <ListEditor
              items={data.features}
              onChange={(items) => update("features", items)}
              render={(item, set) => (
                <div className="grid grid-cols-[110px_1fr_1fr] gap-2">
                  <select
                    value={item.icon}
                    onChange={(e) => set({ ...item, icon: e.target.value })}
                    className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
                  >
                    {ICON_NAMES.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <input
                    value={item.title}
                    onChange={(e) => set({ ...item, title: e.target.value })}
                    placeholder="строка 1"
                    className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
                  />
                  <input
                    value={item.subtitle}
                    onChange={(e) => set({ ...item, subtitle: e.target.value })}
                    placeholder="строка 2"
                    className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
                  />
                </div>
              )}
              create={() => ({ icon: "Check", title: "Новое", subtitle: "преимущество" })}
            />
          </Section>

          <Section title="5. Характеристики (числа)">
            <ListEditor
              items={data.stats}
              onChange={(items) => update("stats", items)}
              render={(item, set) => (
                <div className="grid grid-cols-[90px_1fr] gap-2">
                  <input
                    value={item.value}
                    onChange={(e) => set({ ...item, value: e.target.value })}
                    placeholder="5"
                    className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
                  />
                  <input
                    value={item.label}
                    onChange={(e) => set({ ...item, label: e.target.value })}
                    placeholder="подпись"
                    className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
                  />
                </div>
              )}
              create={() => ({ value: "0", label: "характеристика" })}
            />
          </Section>

          <Section title="6. Доп. характеристики">
            <Input label="Заголовок блока" value={data.extraTitle} onChange={(v) => update("extraTitle", v)} />
            <textarea
              value={data.extraList.join("\n")}
              onChange={(e) => update("extraList", e.target.value.split("\n").filter(Boolean))}
              rows={3}
              placeholder="по одному пункту на строку"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </Section>
        </div>

        {/* preview */}
        <div className="order-1 lg:order-2">
          <div className="sticky top-20">
            <div className="mb-3 flex items-center gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
              />
            </div>
            <div
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              style={{ width: CARD_W * SCALE, height: CARD_H * SCALE }}
            >
              <div style={{ transform: `scale(${SCALE})`, transformOrigin: "top left", width: CARD_W, height: CARD_H }}>
                <div ref={cardRef}>
                  <TemplateRenderer template={template} data={data} />
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2" style={{ width: CARD_W * SCALE }}>
              <button
                onClick={exportPng}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700"
              >
                <Download size={18} /> Скачать PNG
              </button>
              <button
                onClick={save}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Save size={18} /> Сохранить
              </button>
            </div>
            {!user && (
              <p className="mt-2 text-center text-xs text-slate-400">
                Войдите, чтобы сохранять карточки в личном кабинете
              </p>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-slate-500">{title}</h3>
      {children}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          rows={2}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
      )}
    </label>
  );
}

function ListEditor<T>({
  items,
  onChange,
  render,
  create,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  render: (item: T, set: (next: T) => void) => React.ReactNode;
  create: () => T;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1">
            {render(item, (next) => {
              const copy = [...items];
              copy[i] = next;
              onChange(copy);
            })}
          </div>
          <button
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
          >
            <X size={16} />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, create()])}
        className="inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:border-emerald-400"
      >
        <Plus size={14} /> Добавить
      </button>
    </div>
  );
}
