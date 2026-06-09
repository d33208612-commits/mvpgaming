import type { CardData } from "./types";

export const defaultCard: CardData = {
  brand: "BRAND",
  title: "Название\nтовара",
  subtitle: "ключевое преимущество",
  imageUrl: null,
  nav: ["товар", "характеристики", "преимущества"],
  badgeValue: "6",
  badgeLabel: "часов работы",
  features: [
    { icon: "Volume2", title: "встроенный", subtitle: "динамик" },
    { icon: "Wifi", title: "беспроводное", subtitle: "подключение" },
  ],
  stats: [
    { value: "5", label: "Количество скоростей" },
    { value: "8", label: "Режимов нагрева" },
    { value: "3", label: "Количество насадок" },
    { value: "31", label: "Скорость потока, м/с" },
    { value: "1.65", label: "Мощность, кВт" },
  ],
  extraTitle: "Дополнительные характеристики",
  extraList: ["Обдув холодным воздухом", "Ионизация", "Термодатчик"],
  code: "156879",
  giftLabel: "подарок\nв комплекте",
};
