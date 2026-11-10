/* Qidiruv: koʻylak, koylak, ko'ylak va куйлак bir xil natija beradi. */
(function (C) {
  const CYR = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'x', ц: 's', ч: 'ch', ш: 'sh', щ: 'sh', ъ: '', ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya', ў: 'o', қ: 'q', ғ: 'g', ҳ: 'h' };
  const SYNONYMS = { kuylak: 'koylak', flannel: 'flanel', flanel: 'flanel', falanel: 'flanel', hawaii: 'gavayi', gavay: 'gavayi', xavay: 'gavayi', jinsi: 'denim', jins: 'denim', bowling: 'bouling', boling: 'bouling', vintaj: 'retro', vintage: 'retro' };

  const norm = s => s.toLowerCase()
    .replace(/[а-яёўқғҳ]/g, c => CYR[c] ?? c)
    .replace(/[ʻʼ'’‘`]/g, '')
    .replace(/[^a-z0-9+\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const index = new Map();
  function hay(p) {
    if (!index.has(p.id)) index.set(p.id, norm(`koylak ${p.title} ${p.type} ${p.era} ${p.color} ${p.fabric} ${p.origin} ${p.size}`));
    return index.get(p.id);
  }

  function matches(p, query) {
    const tokens = norm(query).split(' ').filter(Boolean);
    return tokens.every(t => {
      const word = SYNONYMS[t] || t;
      if (/^\d{2}$/.test(word) && Number(word) >= 40 && Number(word) <= 70) return Math.abs(p.chest - Number(word)) <= 1 || hay(p).includes(`${word}-lar`);
      if (word === 'kokrak' || word === 'sm') return true;
      return hay(p).split(' ').some(h => h.startsWith(word));
    });
  }

  C.search = {
    norm,
    matches,
    products: q => C.products.filter(p => matches(p, q)),
    // Topilgan qismni ajratib koʻrsatadi; harflar soni normalizatsiyadan keyin oʻzgarsa, belgilamaydi
    mark(text, q) {
      const safe = C.esc(text);
      const first = norm(q).split(' ').filter(Boolean)[0];
      if (!first) return safe;
      const at = text.toLowerCase().indexOf(first);
      if (at < 0) return safe;
      return `${C.esc(text.slice(0, at))}<mark>${C.esc(text.slice(at, at + first.length))}</mark>${C.esc(text.slice(at + first.length))}`;
    },
  };
})(window.Caqmoq = window.Caqmoq || {});
