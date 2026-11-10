/* Sahifalar: bosh sahifa, katalog, mahsulot, saralangan, yordam. */
(function (C) {
  const available = p => !C.store.isSold(p);
  const countFor = test => C.products.filter(p => available(p) && test(p)).length;
  const pages = C.pages = {};

  // ---------- bosh sahifa ----------
  pages.home = () => {
    const batch = C.products.filter(p => p.batch && available(p));
    const heroIds = ['moviy-gibiskus', 'qizil-katak-flanel', 'alangali-bouling'];
    const hero = [...heroIds.map(C.byId).filter(available), ...batch].filter((p, i, a) => a.indexOf(p) === i).slice(0, 3);
    const rest = batch.filter(p => !hero.includes(p));
    const gridItems = [...rest, ...hero].slice(0, 7);
    const flanelCount = countFor(C.groups.tur.options[0].test);
    const cells = gridItems.map(C.card);
    cells.splice(Math.min(2, cells.length), 0, `<a class="patch-cell" href="#/katalog?tur=Flanel" aria-label="Flanel javoni: ${flanelCount} ta koʻylak"><span class="patch">Flanel javoni</span></a>`);
    const sold = C.products.filter(C.store.isSold);
    const fit = C.store.state.fit;

    return {
      title: 'Çaqmoq · Vintage koʻylaklar',
      html: `
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero__panel">
          <h1 class="hero__title display" id="hero-title" tabindex="-1">Har biri bitta. Ikkinchisi yoʻq.</h1>
          <p class="hero__lede">Bu haftagi partiyada ${batch.length} ta koʻylak. Hammasi yuvilgan, santimetrda oʻlchangan, nuqsoni bilan suratga olingan.</p>
          <a class="btn btn--on-ink" href="#/katalog?partiya=1">Partiyani koʻrish</a>
        </div>
        <div class="hero__shelf">
          ${hero.map(p => `<a class="shelf-item" href="#/k/${p.id}">
            <img src="${C.photo(p, 'front')}" alt="${C.esc(p.title)}" width="800" height="1000" fetchpriority="high">
            <span class="shelf-item__cap"><span class="mono">${p.size} · ${p.chest} sm</span><span class="price">${C.som(p.price)}</span></span>
          </a>`).join('')}
        </div>
      </section>

      <section class="quick" aria-label="Tez tanlash">
        <div class="quick__row">
          <span class="quick__label">Koʻkrak kengligi</span>
          <div class="quick__chips">
            ${C.groups.kokrak.options.map(o => `<a class="chip" href="#/katalog?kokrak=${o.key}">${o.label}<span class="num">${countFor(o.test)}</span></a>`).join('')}
            <button class="chip chip--set" type="button" data-action="fit">${C.icon('ruler')}${fit != null ? `Oʻlchamim: ${fit} sm` : 'Oʻlchamimni saqlash'}</button>
          </div>
        </div>
        <div class="quick__row">
          <span class="quick__label">Tur</span>
          <div class="quick__chips">
            ${C.groups.tur.options.map(o => `<a class="chip" href="#/katalog?tur=${encodeURIComponent(o.key)}">${o.label}<span class="num">${countFor(o.test)}</span></a>`).join('')}
          </div>
        </div>
      </section>

      <section aria-labelledby="batch-title">
        <div class="head">
          <h2 class="head__title display" id="batch-title">Bu haftagi partiya</h2>
          <a class="link" href="#/katalog">Butun katalog ${C.icon('arrow')}</a>
        </div>
        <div class="grid">${cells.join('')}</div>
      </section>

      <section aria-labelledby="era-title">
        <div class="head"><h2 class="head__title display" id="era-title">Davr boʻyicha</h2></div>
        <div class="eras">
          ${C.groups.davr.options.map(o => {
            const items = C.products.filter(p => available(p) && o.test(p));
            return `<a class="era" href="#/katalog?davr=${encodeURIComponent(o.key)}">
              <span class="era__name display">${o.label}</span>
              <span class="era__thumbs" aria-hidden="true">${items.slice(0, 4).map(p => `<img src="${C.photo(p, 'front')}" alt="" width="800" height="1000" loading="lazy">`).join('')}</span>
              <span class="era__count"><span class="num">${items.length} ta</span>${C.icon('arrow')}</span>
            </a>`;
          }).join('')}
        </div>
      </section>

      ${sold.length ? `<section aria-labelledby="sold-title">
        <div class="head"><h2 class="head__title display" id="sold-title">Yaqinda sotildi</h2></div>
        <div class="sold-strip">
          ${sold.map(p => `<a class="sold-item" href="#/k/${p.id}" aria-label="${C.esc(p.title)}, sotilgan">
            <img src="${C.photo(p, 'front')}" alt="" width="800" height="1000" loading="lazy"><span class="stamp">Sotildi</span></a>`).join('')}
        </div>
      </section>` : ''}

      <section class="guide" aria-labelledby="guide-title">
        <div class="guide__intro">
          <h2 class="guide__title display" id="guide-title">Yorliqqa emas, santimetrga ishoning</h2>
          <p>Eski kiyimlarda “L” har xil chiqadi. Shuning uchun har bir koʻylakni tekis qoʻyib oʻlchaymiz va holatini yozamiz.</p>
          <button class="btn btn--quiet" type="button" data-action="fit">Oʻlchamimni saqlash</button>
        </div>
        <div class="guide__side">
          ${C.measureSvg()}
          <dl class="spec">
            ${Object.entries(C.conditions).map(([k, v]) => `<div class="spec__row"><dt>${k}</dt><dd><strong>${v.name}</strong>${v.text}</dd></div>`).join('')}
          </dl>
        </div>
      </section>`,
    };
  };

  // ---------- katalog ----------
  function readFilters(query) {
    const q = new URLSearchParams(query);
    const sets = {};
    Object.keys(C.groups).forEach(g => { sets[g] = (q.get(g) || '').split(',').filter(Boolean); });
    return { q: q.get('q') || '', sort: q.get('tartib') || 'yangi', partiya: q.get('partiya') === '1', mos: q.get('mos') === '1', sotilgan: q.get('sotilgan') === '1', sets };
  }

  function writeFilters(f) {
    const q = new URLSearchParams();
    if (f.q) q.set('q', f.q);
    if (f.partiya) q.set('partiya', '1');
    if (f.mos) q.set('mos', '1');
    if (f.sotilgan) q.set('sotilgan', '1');
    if (f.sort !== 'yangi') q.set('tartib', f.sort);
    Object.entries(f.sets).forEach(([g, v]) => { if (v.length) q.set(g, v.join(',')); });
    const s = q.toString();
    try { history.replaceState(null, '', `#/katalog${s ? `?${s}` : ''}`); } catch { /* ayrim brauzerlar file:// da ruxsat bermaydi */ }
  }

  function applyFilters(f, skip) {
    return C.products.filter(p => {
      if (f.q && !C.search.matches(p, f.q)) return false;
      if (!f.sotilgan && C.store.isSold(p)) return false;
      if (f.partiya && !p.batch) return false;
      if (f.mos && !C.fits(p)) return false;
      return Object.entries(C.groups).every(([g, group]) => {
        if (g === skip || !f.sets[g].length) return true;
        return group.options.filter(o => f.sets[g].includes(o.key)).some(o => o.test(p));
      });
    });
  }

  const SORTS = {
    yangi: (a, b) => Number(b.batch) - Number(a.batch),
    arzon: (a, b) => a.price - b.price,
    qimmat: (a, b) => b.price - a.price,
    kokrak: (a, b) => a.chest - b.chest,
  };

  pages.catalog = (_, query) => {
    const f = readFilters(query);
    const fit = C.store.state.fit;
    return {
      title: 'Katalog · Çaqmoq',
      html: `
      <div class="page-head">
        <h1 class="page-head__title display" tabindex="-1">Katalog</h1>
        <p class="num muted" id="cat-count" aria-live="polite"></p>
      </div>
      <div class="cat__active" id="cat-active"></div>
      <div class="cat">
        <dialog class="filters" id="filters" aria-label="Filtrlar">
          <div class="filters__top"><span class="filters__title">Filtr</span>
            <button class="icon-btn" type="button" data-close aria-label="Filtrni yopish">${C.icon('x')}</button></div>
          <form class="filters__scroll" id="filter-form">
            <div>
              ${fit != null
                ? `<label class="toggle"><input type="checkbox" name="mos" ${f.mos ? 'checked' : ''}>Faqat menga mos (${fit} sm)</label>`
                : `<button class="chip" type="button" data-action="fit">${C.icon('ruler')}Oʻlchamimni kiritish</button>`}
              <label class="toggle"><input type="checkbox" name="partiya" ${f.partiya ? 'checked' : ''}>Faqat bu haftagi partiya</label>
            </div>
            ${Object.entries(C.groups).map(([g, group]) => `<fieldset class="fgroup"><legend>${group.label}</legend><div class="fgroup__opts">
              ${group.options.map(o => `<label class="opt"><input type="checkbox" name="${g}" value="${C.esc(o.key)}" ${f.sets[g].includes(o.key) ? 'checked' : ''}>
                <span class="chip">${o.label}<span class="num" data-count></span></span></label>`).join('')}
            </div></fieldset>`).join('')}
            <label class="toggle"><input type="checkbox" name="sotilgan" ${f.sotilgan ? 'checked' : ''}>Sotilganlarni ham koʻrsatish</label>
          </form>
          <div class="filters__bottom"><button class="btn btn--wide" type="button" data-close id="filter-apply"></button></div>
        </dialog>
        <div class="cat__results">
          <div class="cat__tools">
            <button class="btn btn--quiet cat__filter-btn" type="button" id="filter-open">${C.icon('sliders')}<span id="filter-label">Filtr</span></button>
            <label class="cat__sort"><span class="sr-only">Tartiblash</span>
              <select class="select" id="sort">
                <option value="yangi">Avval yangilari</option>
                <option value="arzon">Arzonidan</option>
                <option value="qimmat">Qimmatidan</option>
                <option value="kokrak">Koʻkrak kengligi</option>
              </select>
            </label>
          </div>
          <div class="grid grid--cat" id="results"></div>
        </div>
      </div>`,
      mount(root) {
        const results = root.querySelector('#results');
        const active = root.querySelector('#cat-active');
        const form = root.querySelector('#filter-form');
        const dlg = root.querySelector('#filters');
        const sort = root.querySelector('#sort');
        sort.value = SORTS[f.sort] ? f.sort : 'yangi';

        function draw() {
          const list = applyFilters(f).sort(SORTS[f.sort] || SORTS.yangi);
          results.innerHTML = list.length ? list.map(C.card).join('') : `<div class="empty">
            <h2 class="empty__title display">Bunday koʻylak hozircha yoʻq</h2>
            <p>Filtrni yumshatib koʻring yoki Telegramga ulaning: yangi partiya chiqqanda xabar beramiz.</p>
            <button class="btn btn--quiet" type="button" id="filter-clear">Filtrni tozalash</button></div>`;
          root.querySelector('#cat-count').textContent = `${list.length} ta koʻylak`;
          root.querySelector('#filter-apply').textContent = `${list.length} ta koʻylakni koʻrish`;
          const chips = [];
          if (f.q) chips.push(['q', '', `“${f.q}”`]);
          if (f.partiya) chips.push(['partiya', '', 'Bu haftagi partiya']);
          if (f.mos) chips.push(['mos', '', `Menga mos: ${fit} sm`]);
          if (f.sotilgan) chips.push(['sotilgan', '', 'Sotilganlar bilan']);
          Object.entries(f.sets).forEach(([g, v]) => v.forEach(key => {
            const o = C.groups[g].options.find(x => x.key === key);
            if (o) chips.push([g, key, o.label]);
          }));
          active.innerHTML = chips.length ? chips.map(([g, key, label]) => `<button class="chip chip--set" type="button" data-off="${g}" data-key="${C.esc(key)}" aria-label="${C.esc(label)} filtrini olib tashlash">${C.esc(label)}${C.icon('x')}</button>`).join('') + (chips.length > 1 ? '<button class="chip" type="button" id="filter-clear-all">Hammasini tozalash</button>' : '') : '';
          const n = chips.length;
          root.querySelector('#filter-label').textContent = n ? `Filtr · ${n}` : 'Filtr';
          // Har bir variant uchun boshqa filtrlar hisobga olingan son
          Object.entries(C.groups).forEach(([g, group]) => {
            const pool = applyFilters(f, g);
            group.options.forEach(o => {
              const input = form.querySelector(`input[name="${g}"][value="${CSS.escape(o.key)}"]`);
              const count = pool.filter(o.test).length;
              input.closest('.opt').querySelector('[data-count]').textContent = count;
              input.disabled = !count && !input.checked;
            });
          });
          C.syncState();
        }

        function clearAll() {
          f.q = ''; f.partiya = false; f.mos = false; f.sotilgan = false;
          Object.keys(f.sets).forEach(g => { f.sets[g] = []; });
          form.querySelectorAll('input[type="checkbox"]').forEach(i => { i.checked = false; });
          writeFilters(f);
          draw();
        }

        form.addEventListener('change', e => {
          const { name, value, checked } = e.target;
          if (name in f.sets) f.sets[name] = checked ? [...f.sets[name], value] : f.sets[name].filter(v => v !== value);
          else f[name] = checked;
          writeFilters(f);
          draw();
        });
        form.addEventListener('submit', e => e.preventDefault());
        sort.addEventListener('change', () => { f.sort = sort.value; writeFilters(f); draw(); });
        root.querySelector('#filter-open').addEventListener('click', () => dlg.showModal());
        root.addEventListener('click', e => {
          if (e.target.closest('#filter-clear, #filter-clear-all')) { clearAll(); return; }
          const off = e.target.closest('[data-off]');
          if (!off) return;
          const g = off.dataset.off;
          if (g in f.sets) {
            f.sets[g] = f.sets[g].filter(v => v !== off.dataset.key);
            const input = form.querySelector(`input[name="${g}"][value="${CSS.escape(off.dataset.key)}"]`);
            if (input) input.checked = false;
          } else {
            f[g] = g === 'q' ? '' : false;
            const input = form.querySelector(`input[name="${g}"]`);
            if (input) input.checked = false;
          }
          writeFilters(f);
          draw();
        });
        draw();
      },
    };
  };

  // ---------- mahsulot ----------
  pages.product = ([id]) => {
    const p = C.byId(id);
    if (!p) return pages.missing();
    const sold = C.store.isSold(p);
    const cond = C.conditions[p.cond];
    const diff = C.fitDiff(p);
    const similar = [...C.products.filter(x => x !== p && x.type === p.type && available(x)),
      ...C.products.filter(x => x !== p && x.type !== p.type && x.era === p.era && available(x))].slice(0, 4);

    let fitLine = `<p class="fit-line">${C.icon('ruler')}<button class="link" type="button" data-action="fit">Oʻlchamingizni kiriting</button> va shu koʻylak bilan solishtiring.</p>`;
    if (diff !== null) {
      const text = diff === 0 ? `Aynan sizning oʻlchamingiz (${C.store.state.fit} sm).`
        : `Sizning ${C.store.state.fit} sm oʻlchamingizdan ${Math.abs(diff)} sm ${diff > 0 ? 'kengroq' : 'torroq'}.`;
      fitLine = `<p class="fit-line${C.fits(p) ? ' fit-line--match' : ''}">${C.icon(C.fits(p) ? 'check' : 'ruler')}${text}</p>`;
    }

    return {
      title: `${p.title} · Çaqmoq`,
      html: `
      <nav class="crumbs" aria-label="Sahifa yoʻli">
        <a href="#/katalog">Katalog</a><span aria-hidden="true">/</span>
        <a href="#/katalog?tur=${encodeURIComponent(p.type)}">${p.type}</a><span aria-hidden="true">/</span>
        <span aria-current="page">${C.esc(p.title)}</span>
      </nav>
      <div class="pdp">
        <div class="gallery">
          <div class="gallery__track" id="track" tabindex="0" aria-label="Koʻylak suratlari">
            ${C.views(p).map(([view, cap], i) => `<figure class="gallery__slide${sold ? ' is-sold' : ''}">
              <button class="gallery__open" type="button" data-zoom="${i}" aria-label="${C.esc(cap)}ni kattalashtirish">
                <img src="${C.photo(p, view)}" alt="${C.esc(p.title)}, ${C.esc(cap)}" width="800" height="1000" ${i < 2 ? 'fetchpriority="high"' : 'loading="lazy"'}>
              </button>
              <figcaption class="gallery__cap">${C.esc(cap)}</figcaption>
              ${sold && i === 0 ? '<span class="stamp">Sotildi</span>' : ''}
            </figure>`).join('')}
          </div>
          <span class="gallery__count num" id="gallery-count" aria-hidden="true">1/4</span>
        </div>
        <div class="buy">
          <div>
            <h1 class="buy__title display" tabindex="-1">${C.esc(p.title)}</h1>
            <p class="buy__sub">${p.type} · ${p.era} · yorliqda ${p.size}</p>
          </div>
          ${sold
            ? `<p>Bu koʻylak sotilgan. Ikkinchisi yoʻq, lekin oʻxshashlari bor.</p>
               <a class="btn" href="#/katalog?tur=${encodeURIComponent(p.type)}">Oʻxshashini koʻrish</a>`
            : `<p class="price buy__price">${C.som(p.price)}</p>
               <div class="buy__actions">
                 ${C.addButton(p, 'buy__add')}
                 <button class="buy__heart" type="button" data-save="${p.id}" aria-pressed="false">${C.icon('heart')}</button>
               </div>
               <p class="hold-note">${C.icon('clock')}Bitta dona. Savatga qoʻshsangiz, 15 daqiqa siz uchun band turadi.</p>`}
          <section class="block" aria-label="Oʻlchamlar">
            <h2 class="block__title">Oʻlchamlar</h2>
            <dl class="measures">
              <div><dt>Koʻkrak kengligi</dt><dd>${p.chest} sm</dd></div>
              <div><dt>Uzunlik</dt><dd>${p.length} sm</dd></div>
              <div><dt>Yelka</dt><dd>${p.shoulder} sm</dd></div>
              <div><dt>Yeng</dt><dd>${p.sleeve} sm</dd></div>
            </dl>
            ${fitLine}
          </section>
          <section class="block" aria-label="Holat">
            <h2 class="block__title">Holat</h2>
            <div class="cond"><span class="cond__mark">${p.cond}</span><p><strong>${cond.name}</strong>${cond.text}</p></div>
            <p class="flaw">${p.flaw ? `<strong>Nuqson:</strong> ${C.esc(p.flaw)}` : 'Koʻzga tashlanadigan nuqson topilmadi.'}</p>
          </section>
          <div>
            <details class="more"><summary>Mato va kelib chiqishi</summary><div class="more__body">${C.esc(p.fabric)}. ${C.esc(p.origin)}da ishlab chiqarilgan, ${p.era} davriga oid.</div></details>
            <details class="more"><summary>Yetkazib berish va toʻlov</summary><div class="more__body">${Object.values(C.delivery).map(d => `${d.label}: ${d.fee ? C.som(d.fee) : 'bepul'}`).join('. ')}. Toʻlov: ${Object.values(C.payment).join(', ')}.</div></details>
          </div>
        </div>
      </div>
      ${sold ? '' : `<div class="buybar"><span class="price">${C.som(p.price)}</span>${C.addButton(p, 'buybar__add')}</div>`}
      ${similar.length ? `<section aria-labelledby="similar-title">
        <div class="head"><h2 class="head__title display" id="similar-title">Oʻxshash koʻylaklar</h2></div>
        <div class="grid">${similar.map(C.card).join('')}</div>
      </section>` : ''}`,
      mount(root) {
        const track = root.querySelector('#track');
        const count = root.querySelector('#gallery-count');
        track.addEventListener('scroll', () => {
          count.textContent = `${Math.round(track.scrollLeft / Math.max(1, track.clientWidth)) + 1}/4`;
        }, { passive: true });
        root.addEventListener('click', e => {
          const z = e.target.closest('[data-zoom]');
          if (z) C.openLightbox(p, Number(z.dataset.zoom));
        });
      },
    };
  };

  // ---------- saralangan ----------
  pages.saved = () => {
    const draw = () => {
      const list = C.store.state.saved.map(C.byId);
      return list.length ? `<div class="grid">${list.map(C.card).join('')}</div>` : `<div class="empty">
        <h2 class="empty__title display">Hali hech narsa saralanmagan</h2>
        <p>Koʻylak ustidagi yurakchani bosing, shu yerda saqlanadi. Lekin unutmang: har biri bitta dona.</p>
        <a class="btn" href="#/katalog">Katalogni ochish</a></div>`;
    };
    return {
      title: 'Saralangan · Çaqmoq',
      html: `<div class="page-head"><h1 class="page-head__title display" tabindex="-1">Saralangan</h1></div><div id="saved-list">${draw()}</div>`,
      onStore(root) {
        const box = root.querySelector('#saved-list');
        const ids = [...box.querySelectorAll('[data-card]')].map(c => c.dataset.card).join();
        if (ids !== C.store.state.saved.join()) box.innerHTML = draw();
      },
    };
  };

  // ---------- yordam ----------
  pages.help = () => ({
    title: 'Yordam · Çaqmoq',
    html: `<div class="page-head"><h1 class="page-head__title display" tabindex="-1">Yordam</h1></div>
    <div class="help"><div>
      <details class="more" open><summary>Oʻlchamni qanday tanlayman?</summary><div class="more__body">
        <p>Eng yaxshi tushadigan koʻylagingizni tekis qoʻying. Qoʻltiq ostidan qoʻltiq ostigacha oʻlchang: shu son koʻkrak kengligi.</p>
        ${C.measureSvg()}
        <button class="btn btn--quiet" type="button" data-action="fit">Oʻlchamimni saqlash</button></div></details>
      <details class="more"><summary>Holat baholari nimani anglatadi?</summary><div class="more__body">
        ${Object.entries(C.conditions).map(([k, v]) => `<p><strong>${k}. ${v.name}.</strong> ${v.text}</p>`).join('')}</div></details>
      <details class="more"><summary>Savatga qoʻshsam, koʻylak meniki boʻladimi?</summary><div class="more__body">
        <p>Koʻylak 15 daqiqa siz uchun band turadi. Shu vaqtda buyurtma berilmasa, yana sotuvga chiqadi.</p></div></details>
      <details class="more"><summary>Yetkazib berish qancha turadi?</summary><div class="more__body">
        ${Object.values(C.delivery).map(d => `<p>${d.label}: ${d.fee ? C.som(d.fee) : 'bepul'}. ${d.note}.</p>`).join('')}</div></details>
      <details class="more"><summary>Qanday toʻlayman?</summary><div class="more__body"><p>${Object.values(C.payment).join(', ')}.</p></div></details>
      <details class="more"><summary>Qaytarish mumkinmi?</summary><div class="more__body"><p>Qaytarish shartlari doʻkon tomonidan shu yerga yoziladi.</p></div></details>
    </div></div>`,
  });

  pages.missing = () => ({
    title: 'Topilmadi · Çaqmoq',
    html: `<div class="done"><h1 class="done__title display" tabindex="-1">Bu sahifa topilmadi</h1>
      <p>Havola eskirgan boʻlishi mumkin. Koʻylaklar katalogda.</p><a class="btn" href="#/katalog">Katalogni ochish</a></div>`,
  });
})(window.Caqmoq = window.Caqmoq || {});
