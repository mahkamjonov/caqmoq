/* Qidiruv: palto, пальто, ko'ylak va koʻylak kabi yozuvlar bir xil ishlaydi. */
(function (C) {
  const CYR = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'x', ц: 's', ч: 'ch', ш: 'sh', щ: 'sh', ъ: '', ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya', ў: 'o', қ: 'q', ғ: 'g', ҳ: 'h' };
  const SYNONYMS = { coat: 'palto', jacket: 'kurtka', kurtka: 'kurtka', blazer: 'pidjak', pijak: 'pidjak', vest: 'nimcha', jilet: 'nimcha', bezrukavka: 'nimcha', leather: 'charm', koja: 'charm', teri: 'charm', wool: 'jun', sherst: 'jun', velvet: 'vilvet', corduroy: 'vilvet', vintage: 'kiyim', vintaj: 'kiyim', kuylak: 'kiyim', koylak: 'kiyim' };

  const norm = s => s.toLowerCase()
    .replace(/[а-яёўқғҳ]/g, c => CYR[c] ?? c)
    .replace(/[ʻʼ'’‘`]/g, '')
    .replace(/[^a-z0-9+\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const index = new Map();
  function hay(p) {
    if (!index.has(p.id)) index.set(p.id, norm(`kiyim buyum ${p.title} ${p.type} ${p.era} ${p.color} ${p.fabric} ${p.origin} ${p.size}`));
    return index.get(p.id);
  }

  function matches(p, query) {
    return norm(query).split(' ').filter(Boolean).every(t => {
      const word = SYNONYMS[t] || t;
      return hay(p).split(' ').some(h => h.startsWith(word));
    });
  }

  C.search = {
    norm,
    matches,
    products: q => C.products.filter(p => matches(p, q)),
    mark(text, q) {
      const first = norm(q).split(' ').filter(Boolean)[0];
      const at = first ? text.toLowerCase().indexOf(first) : -1;
      if (at < 0) return C.esc(text);
      return `${C.esc(text.slice(0, at))}<mark>${C.esc(text.slice(at, at + first.length))}</mark>${C.esc(text.slice(at + first.length))}`;
    },
  };
})(window.Caqmoq = window.Caqmoq || {});
