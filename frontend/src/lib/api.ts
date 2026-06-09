import type { ClassifyResult } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

export async function classifyImage(imageDataUrl: string): Promise<ClassifyResult> {
  try {
    const res = await fetch(`${API_BASE}/api/classify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageDataUrl }),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    return (await res.json()) as ClassifyResult;
  } catch {
    // offline / no backend fallback: deterministic mock classification
    return mockClassify();
  }
}

export interface GenerateBgResult {
  image: string | null;
  source: "ai" | "unavailable";
  message?: string;
}

export async function generateBackground(prompt: string): Promise<GenerateBgResult> {
  try {
    const res = await fetch(`${API_BASE}/api/generate-background`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    return (await res.json()) as GenerateBgResult;
  } catch {
    return { image: null, source: "unavailable", message: "Сервис недоступен" };
  }
}

function mockClassify(): ClassifyResult {
  const options: ClassifyResult[] = [
    {
      category: "electronics",
      categoryLabel: "Электроника",
      template: "airpods",
      title: "Электроника",
      confidence: 0.62,
      source: "mock",
    },
    {
      category: "appliance",
      categoryLabel: "Бытовая техника",
      template: "fen",
      title: "Бытовая техника",
      confidence: 0.6,
      source: "mock",
    },
    {
      category: "accessory",
      categoryLabel: "Аксессуар",
      template: "gamepad",
      title: "Аксессуар",
      confidence: 0.58,
      source: "mock",
    },
  ];
  return options[Math.floor(Math.random() * options.length)];
}
