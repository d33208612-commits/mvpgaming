// Reference data with RU/UZ labels. `value` is the canonical stored value
// (kept stable regardless of UI language so filtering/matching works).

export const WORK_FORMATS = [
  { value: 'onsite', ru: 'На месте', uz: 'Ish joyida' },
  { value: 'remote', ru: 'Удалённо', uz: 'Masofadan' },
  { value: 'hybrid', ru: 'Гибрид', uz: 'Gibrid' },
  { value: 'field', ru: 'Разъездная работа', uz: 'Safarli ish' },
];

export const SCHEDULES = [
  { value: '5/2', ru: '5/2', uz: '5/2' },
  { value: '6/1', ru: '6/1', uz: '6/1' },
  { value: 'other', ru: 'Другое', uz: 'Boshqa' },
];

export const WORK_HOURS = [
  { value: '08:00–17:00', ru: '08:00–17:00', uz: '08:00–17:00' },
  { value: '09:00–18:00', ru: '09:00–18:00', uz: '09:00–18:00' },
  { value: '10:00–19:00', ru: '10:00–19:00', uz: '10:00–19:00' },
  { value: 'other', ru: 'Другое', uz: 'Boshqa' },
];

export const EXPERIENCE = [
  { value: 'required', ru: 'Опыт требуется', uz: 'Tajriba talab qilinadi' },
  { value: 'none', ru: 'Без опыта', uz: 'Tajribasiz' },
  { value: 'remote', ru: 'Удалённая работа', uz: 'Masofaviy ish' },
];

export const CONTACT_TYPES = [
  { value: 'telegram', ru: 'Написать в Telegram', uz: 'Telegramga yozish' },
  { value: 'phone', ru: 'Номер телефона', uz: 'Telefon raqami' },
];

export const CATEGORIES = [
  { value: 'Продажи', ru: 'Продажи', uz: 'Savdo' },
  { value: 'Общепит', ru: 'Общепит', uz: 'Umumiy ovqatlanish' },
  { value: 'IT и разработка', ru: 'IT и разработка', uz: 'IT va dasturlash' },
  { value: 'Строительство', ru: 'Строительство', uz: 'Qurilish' },
  { value: 'Логистика', ru: 'Логистика', uz: 'Logistika' },
  { value: 'Красота', ru: 'Красота', uz: 'Go‘zallik' },
  { value: 'Образование', ru: 'Образование', uz: 'Ta’lim' },
  { value: 'Медицина', ru: 'Медицина', uz: 'Tibbiyot' },
  { value: 'Транспорт', ru: 'Транспорт', uz: 'Transport' },
  { value: 'Маркетинг', ru: 'Маркетинг', uz: 'Marketing' },
];

// Seeker profession = category, plus "any".
export const PROFESSIONS = [
  { value: 'any', ru: 'Любая работа', uz: 'Har qanday ish' },
  ...CATEGORIES,
];

export const CITIES = [
  { value: 'Ташкент', ru: 'Ташкент', uz: 'Toshkent' },
  { value: 'Самарканд', ru: 'Самарканд', uz: 'Samarqand' },
  { value: 'Бухара', ru: 'Бухара', uz: 'Buxoro' },
  { value: 'Андижан', ru: 'Андижан', uz: 'Andijon' },
  { value: 'Наманган', ru: 'Наманган', uz: 'Namangan' },
  { value: 'Фергана', ru: 'Фергана', uz: 'Farg‘ona' },
  { value: 'Нукус', ru: 'Нукус', uz: 'Nukus' },
  { value: 'Другой', ru: 'Другой', uz: 'Boshqa' },
];

const ALL = [
  ...WORK_FORMATS, ...SCHEDULES, ...WORK_HOURS, ...EXPERIENCE,
  ...CONTACT_TYPES, ...CATEGORIES, ...PROFESSIONS, ...CITIES,
];

// Look up a localized label for any known value.
export function labelOf(value, lang = 'ru') {
  if (!value) return '';
  const item = ALL.find((x) => x.value === value);
  return item ? item[lang] || item.ru : value;
}

// Turn a list into {value,label} for the given language.
export function localize(list, lang) {
  return list.map((x) => ({ value: x.value, label: x[lang] || x.ru }));
}

export function timeAgo(ts, lang = 'ru') {
  const sec = Math.floor(Date.now() / 1000) - ts;
  const t = TIME[lang] || TIME.ru;
  if (sec < 60) return t.now;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} ${t.min}`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs} ${t.hour}`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} ${t.day}`;
  return new Date(ts * 1000).toLocaleDateString(lang === 'uz' ? 'uz-UZ' : 'ru-RU');
}

const TIME = {
  ru: { now: 'только что', min: 'мин назад', hour: 'ч назад', day: 'дн назад' },
  uz: { now: 'hozirgina', min: 'daq oldin', hour: 'soat oldin', day: 'kun oldin' },
};

export function formatDate(ts, lang = 'ru') {
  return new Date(ts * 1000).toLocaleDateString(lang === 'uz' ? 'uz-UZ' : 'ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
