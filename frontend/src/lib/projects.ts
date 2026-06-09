import type { CardData, TemplateId } from "./types";

export interface Project {
  id: string;
  name: string;
  template: TemplateId;
  data: CardData;
  updatedAt: string;
}

function key(email: string) {
  return `ig_projects_${email}`;
}

export function listProjects(email: string): Project[] {
  try {
    return JSON.parse(localStorage.getItem(key(email)) ?? "[]");
  } catch {
    return [];
  }
}

export function saveProject(email: string, project: Project) {
  const all = listProjects(email);
  const idx = all.findIndex((p) => p.id === project.id);
  const next = { ...project, updatedAt: new Date().toISOString() };
  if (idx >= 0) all[idx] = next;
  else all.unshift(next);
  localStorage.setItem(key(email), JSON.stringify(all));
}

export function deleteProject(email: string, id: string) {
  const all = listProjects(email).filter((p) => p.id !== id);
  localStorage.setItem(key(email), JSON.stringify(all));
}

export function getProject(email: string, id: string): Project | undefined {
  return listProjects(email).find((p) => p.id === id);
}
