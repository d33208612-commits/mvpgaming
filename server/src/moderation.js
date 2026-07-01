// Banned-words filter for vacancy moderation. The list is intentionally easy
// to extend — add lowercase stems here. Matching is accent/case-insensitive and
// ignores spacing/punctuation, so "з а к л а д к а" is caught too.
//
// Note: generic professions like "курьер" are intentionally NOT listed — only
// dangerous combinations ("курьер наркотиков", "курьер закладок", "наркокурьер").
export const BANNED_WORDS = [
  // drugs / dealing
  'закладчик', 'кладчик', 'кладмен', 'кладмэн', 'наркокурьер', 'курьер наркотиков',
  'курьер закладок', 'наркошоп', 'наркотик', 'наркота', 'мефедрон', 'амфетамин',
  'гашиш', 'героин', 'кокаин', 'продавец наркотиков', 'дилер наркотиков',
  'оператор наркошопа', 'менеджер наркошопа', 'администратор наркошопа',
  'сотрудник даркнет магазина', 'кладовщик веществ',
  // drops / fraud / carding
  'дроп', 'дроппер', 'дроповод', 'дроповод карт', 'обнальщик', 'обнальщик карт',
  'обнал', 'специалист по обналу', 'кардер', 'кардинг специалист', 'фишер',
  'фишинг специалист', 'обходчик банков',
  // hacking
  'взломщик', 'хакер', 'крякер', 'специалист по взлому',
  // weapons / documents
  'торговец оружием', 'продавец оружия', 'оружие без', 'изготовитель документов',
  'подделыватель документов', 'поддельные документ', 'продавец паспортов',
  // recruiting / extremism
  'вербовщик', 'экстремист', 'террорист', 'заказное убийство', 'киллер',
  // illegal gambling
  'сотрудник казино без лицензии', 'букмекер без лицензии', 'оператор казино',
  // adult
  'вебкам модель', 'вебкам менеджер', 'эскорт модель', 'интим модель',
  'интим услуг', 'секс работник', 'работница досуга', 'проститу', 'стриптизер',
  'стриптизерша', 'модель 18', 'onlyfans менеджер', 'porn менеджер', 'xxx модель',
];

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[\s._\-*]+/g, '');
}

/**
 * Returns the first banned stem found in the given text fragments, or null.
 */
export function findBannedWord(...fragments) {
  const haystack = normalize(fragments.join(' '));
  for (const word of BANNED_WORDS) {
    if (haystack.includes(normalize(word))) return word;
  }
  return null;
}
