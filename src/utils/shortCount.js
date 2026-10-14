// A count short enough to sit beside a word: 515, 1.2K, 48K, 3.1M, as the
// reader's language writes them ("1,2 k" in French). Never more than four
// or five characters, however large.
// What is left of a number once it is put in thousands, millions or
// billions: 48 for 48,210, 3.1 for 3,100,000.
const leading = (n) => {
  const size = Math.abs(n);
  if (size < 1000) {
    return size;
  }
  const group = Math.min(Math.floor(Math.log10(size) / 3), 4);
  return size / (1000 ** group);
};

const shortCount = (count, language = 'en') => {
  const n = Number(count) || 0;
  try {
    return new Intl.NumberFormat(language, {
      notation: 'compact',
      // A decimal only while it says something: 1.2K and 3.1M, but 48K
      // and not 48.2K.
      maximumFractionDigits: leading(n) < 10 ? 1 : 0,
    }).format(n);
  } catch (e) {
    return `${n}`;
  }
};

export default shortCount;
