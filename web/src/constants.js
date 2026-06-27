export const WORK_TYPES = [
  { value: 'full', label: 'Полный день' },
  { value: 'remote', label: 'Удалённо' },
  { value: 'partial', label: 'Подработка' },
  { value: 'shift', label: 'Сменный график' },
];

export const workTypeLabel = (v) =>
  WORK_TYPES.find((t) => t.value === v)?.label || v;

export const CATEGORIES = [
  'Продажи',
  'Общепит',
  'IT и разработка',
  'Строительство',
  'Логистика',
  'Красота',
  'Образование',
  'Медицина',
  'Транспорт',
  'Маркетинг',
  'Без категории',
];

export const CITIES = [
  'Ташкент',
  'Самарканд',
  'Бухара',
  'Андижан',
  'Наманган',
  'Фергана',
  'Нукус',
  'Другой',
];

export function timeAgo(ts) {
  const sec = Math.floor(Date.now() / 1000) - ts;
  if (sec < 60) return 'только что';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} мин назад`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs} ч назад`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} дн назад`;
  return new Date(ts * 1000).toLocaleDateString('ru-RU');
}

export function formatDate(ts) {
  return new Date(ts * 1000).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
