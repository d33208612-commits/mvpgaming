export type TemplateId = "gamepad" | "fen" | "airpods" | "toothpaste";

export type ProductCategory =
  | "accessory"
  | "appliance"
  | "toy"
  | "electronics"
  | "beauty"
  | "other";

export interface Feature {
  icon: string; // lucide icon name
  title: string;
  subtitle: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface CardData {
  brand: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  nav: string[];
  badgeValue: string;
  badgeLabel: string;
  features: Feature[];
  stats: Stat[];
  extraTitle: string;
  extraList: string[];
  code: string;
  giftLabel: string;
}

export interface ClassifyResult {
  category: ProductCategory;
  categoryLabel: string;
  template: TemplateId;
  title: string;
  confidence: number;
  source: "ai" | "mock";
  suggestions?: Partial<CardData>;
}

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  accent: string;
  description: string;
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "gamepad",
    name: "Tech / Игровое",
    accent: "#5e7a64",
    description: "Светлый зелёный, для электроники и аксессуаров",
  },
  {
    id: "fen",
    name: "Premium / Техника",
    accent: "#ee7a1a",
    description: "Тёмный фон, для бытовой техники",
  },
  {
    id: "airpods",
    name: "Minimal / Аудио",
    accent: "#5d7a5f",
    description: "Светлый минимализм для гаджетов",
  },
  {
    id: "toothpaste",
    name: "Care / Бьюти",
    accent: "#f2c200",
    description: "Яркий акцент для косметики и ухода",
  },
];

export const CATEGORY_TO_TEMPLATE: Record<ProductCategory, TemplateId> = {
  electronics: "airpods",
  accessory: "gamepad",
  appliance: "fen",
  toy: "gamepad",
  beauty: "toothpaste",
  other: "gamepad",
};

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  electronics: "Электроника",
  accessory: "Аксессуар",
  appliance: "Бытовая техника",
  toy: "Игрушка",
  beauty: "Красота и уход",
  other: "Другое",
};
