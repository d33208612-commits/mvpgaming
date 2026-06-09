import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "../components/Layout";
import { useAuth } from "../lib/auth";
import { deleteProject, listProjects, type Project } from "../lib/projects";
import { TemplateRenderer } from "../components/templates";
import { Plus, Trash2, Pencil } from "lucide-react";

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>(() =>
    user ? listProjects(user.email) : [],
  );

  function remove(id: string) {
    if (!user) return;
    deleteProject(user.email, id);
    setProjects(listProjects(user.email));
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">Мои карточки</h1>
            <p className="mt-1 text-slate-600">
              План: <span className="font-semibold">{user?.plan === "pro" ? "Pro" : "Free"}</span>
            </p>
          </div>
          <Link
            to="/editor"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            <Plus size={18} /> Новая карточка
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-600">У вас пока нет сохранённых карточек.</p>
            <Link to="/editor" className="mt-4 inline-block font-semibold text-emerald-600 hover:underline">
              Создать первую →
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex justify-center overflow-hidden bg-slate-50 p-2" style={{ height: 280 }}>
                  <div style={{ transform: "scale(0.34)", transformOrigin: "top center" }}>
                    <TemplateRenderer template={p.template} data={p.data} />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="min-w-0">
                    <div className="truncate font-bold">{p.name}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(p.updatedAt).toLocaleString("ru-RU")}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => navigate(`/editor?id=${p.id}`)}
                      className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                      title="Редактировать"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => remove(p.id)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      title="Удалить"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
