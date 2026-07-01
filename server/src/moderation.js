// Banned-words filter for vacancy moderation. The list is intentionally easy
// to extend — add lowercase stems here. Matching is accent/case-insensitive and
// also catches common leet/spacing tricks.
export const BANNED_WORDS = [
  'закладчик',
  'закладк',
  'наркошоп',
  'наркотик',
  'наркота',
  'мефедрон',
  'амфетамин',
  'гашиш',
  'героин',
  'кокаин',
  'киллер',
  'заказное убийство',
  'проститу',
  'интим услуг',
  'оружие без',
  'поддельные документ',
  'обнал',
];

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    // collapse spacing/punctuation used to evade filters: "з а к л а д к а"
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
