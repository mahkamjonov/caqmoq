/* Sahifalar: bosh sahifa, katalog, mahsulot, saralangan, yordam. */
(function (C) {
  const available = p => !C.store.isSold(p);
  const pages = C.pages = {};

  // ---------- bosh sahifa ----------
  pages.home = () => {
    const list = C.products.filter(available);
    const feature = available(C.byId('jun-palto')) ? C.byId('jun-palto') : list[0];
    const shelf = [...['charm-trench', 'toqilgan-nimcha', 'vilvet-yoqa-kurtka', 'zaytun-palto'].map(C.byId).filter(available), ...list]
      .filter((p, i, a) => p && a.indexOf(p) === i).slice(0, 4);
    const rest = C.products.filter(p => p !== feature);
    const tilt = ['-5deg', '3deg', '-2deg', '4deg'];
    const covers = { Palto: 'zaytun-palto', Kurtka: 'vilvet-yoqa-kurtka', Pidjak: 'vilvet-pidjak', Nimcha: 'toqilgan-nimcha' };
    const tape = ['Har biri bitta', 'Ikkinchisi yoʻq', 'Yangi partiya har juma, 20:00', 'Qoʻlda tanlangan', 'Toshkent boʻylab yetkazib berish'];
    const tapeRun = tape.map(t => `<span class="tape__item">${t}${C.icon('bolt')}</span>`).join('');
    return {
      title: 'Çaqmoq · Vintage kiyimlar',
      html: `
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero__text">
          <h1 class="hero__title display" id="hero-title" tabindex="-1">
            <span class="hero__line"><span>Har biri bitta.</span></span>
            <span class="hero__line"><span>Ikkinchisi yoʻq.</span></span>
          </h1>
          <p class="hero__lede">Kuz tanlovida ${list.length} ta vintage buyum. Hammasi tozalangan, nuqsoni ochiq yozilgan.</p>
          <a class="btn btn--on-ink hero__btn" href="#/katalog">Tanlovni koʻrish</a>
          <a class="hero__link" href="#/katalog">Hammasini koʻrish ${C.icon('arrow')}</a>
        </div>
        <div class="hero__stack" aria-label="Tanlovdan">
          ${shelf.map((p, i) => `<a class="snap snap--${i + 1}" href="#/k/${p.id}" style="--r: ${tilt[i]}">
            <span class="snap__photo"><img src="${C.photo(p)}" alt="${C.esc(p.title)}" width="600" height="750" ${i < 2 ? 'fetchpriority="high"' : 'loading="lazy"'}></span>
            <span class="snap__tag"><span class="snap__name">${C.esc(p.title)}</span><span class="snap__price">${C.som(p.price)}</span></span>
          </a>`).join('')}
          <span class="patch hero__patch" aria-hidden="true">Bitta dona</span>
        </div>
      </section>

      <div class="tape" aria-hidden="true"><div class="tape__track">${tapeRun}${tapeRun}</div></div>

      <section aria-labelledby="edit-title">
        <div class="head">
          <h2 class="head__title display" id="edit-title">Kuz tanlovi</h2>
          <a class="link" href="#/katalog">Butun katalog ${C.icon('arrow')}</a>
        </div>
        <div class="grid grid--edit">
          ${feature ? C.featureCard(feature) : ''}${rest.map(C.card).join('')}
          <a class="grid-more" href="#/katalog">${C.icon('bolt')}<span>Butun katalog</span></a>
        </div>
      </section>

      <section class="cats" aria-labelledby="cats-title">
        <div class="head"><h2 class="head__title display" id="cats-title">Nima qidiryapsiz?</h2></div>
        <div class="cat-tiles">
          ${C.groups.tur.options.map(o => {
            const cover = C.byId(covers[o.key]) || C.products.find(o.test);
            const count = C.products.filter(p => available(p) && o.test(p)).length;
            return `<a class="cat-tile" href="#/katalog?tur=${encodeURIComponent(o.key)}" aria-label="${o.label}: ${count} ta buyum">
              <img src="${C.photo(cover)}" alt="" width="600" height="750" loading="lazy">
              <span class="cat-tile__label">${o.label}<span class="cat-tile__count">${count}</span></span>
            </a>`;
          }).join('')}
        </div>
      </section>

      <section class="story" aria-labelledby="story-title">
        <h2 class="story__title display" id="story-title">Yaxshi kiyim <mark>ikki umr</mark> koʻradi.</h2>
        <div class="story__side">
          <p>Har bir buyumni qoʻlda tanlaymiz, tozalaymiz va holatini ochiq yozamiz. Kiyim ikkinchi egasiga birinchi kungidek hurmat bilan yetib boradi.</p>
          <ul class="stickers">
            <li class="sticker sticker--blue" style="--r: -6deg">Qoʻlda tanlangan</li>
            <li class="sticker sticker--ink" style="--r: 3deg">Tozalangan</li>
            <li class="sticker sticker--paper" style="--r: -2deg">Nuqsoni ochiq</li>
          </ul>
        </div>
      </section>`,
    };
  };

  // ---------- katalog ----------
  function readFilters(query) {
    const q = new URLSearchParams(query);
    const sets = {};
    Object.keys(C.groups).forEach(g => { sets[g] = (q.get(g) || '').split(',').filter(Boolean); });
    return { q: q.get('q') || '', sort: q.get('tartib') || 'yangi', sotilgan: q.get('sotilgan') === '1', sets };
  }

  function writeFilters(f) {
    const q = new URLSearchParams();
    if (f.q) q.set('q', f.q);
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
      return Object.entries(C.groups).every(([g, group]) => {
        if (g === skip || !f.sets[g].length) return true;
        return group.options.filter(o => f.sets[g].includes(o.key)).some(o => o.test(p));
      });
    });
  }

  const SORTS = {
    yangi: () => 0,
    arzon: (a, b) => a.price - b.price,
    qimmat: (a, b) => b.price - a.price,
  };

  pages.catalog = (_, query) => {
    const f = readFilters(query);
    const groupsInDrawer = Object.entries(C.groups).filter(([g]) => g !== 'tur');
    return {
      title: 'Katalog · Çaqmoq',
      html: `
      <div class="page-head">
        <h1 class="page-head__title display" id="cat-title" tabindex="-1">Katalog</h1>
        <p class="muted" id="cat-count" aria-live="polite"></p>
      </div>
      <div class="cat-bar">
        <div class="tabs" role="group" aria-label="Tur boʻyicha">
          <button class="tab" type="button" data-tab-type="">Hammasi</button>
          ${C.groups.tur.options.map(o => `<button class="tab" type="button" data-tab-type="${C.esc(o.key)}">${o.label}</button>`).join('')}
        </div>
        <div class="cat-bar__tools">
          <button class="tool" type="button" id="filter-open">${C.icon('sliders')}<span id="filter-label">Filtr</span></button>
          <label class="tool tool--select"><span class="sr-only">Tartiblash</span>
            <select id="sort">
              <option value="yangi">Avval yangilari</option>
              <option value="arzon">Arzonidan</option>
              <option value="qimmat">Qimmatidan</option>
            </select>
          </label>
        </div>
      </div>
      <div class="cat-active" id="cat-active"></div>
      <div class="grid" id="results"></div>

      <dialog class="sheet" id="filters" aria-labelledby="filters-title">
        <div class="drawer__top"><h2 class="drawer__title" id="filters-title">Filtr</h2>
          <button class="icon-btn" type="button" data-close aria-label="Filtrni yopish">${C.icon('x')}</button></div>
        <form class="sheet__body" id="filter-form">
          ${groupsInDrawer.map(([g, group]) => `<fieldset class="fgroup"><legend>${group.label}</legend>
            ${group.options.map(o => `<label class="check"><input type="checkbox" name="${g}" value="${C.esc(o.key)}" ${f.sets[g].includes(o.key) ? 'checked' : ''}><span>${o.label}</span><span class="num muted" data-count></span></label>`).join('')}
          </fieldset>`).join('')}
          <label class="check"><input type="checkbox" name="sotilgan" ${f.sotilgan ? 'checked' : ''}><span>Sotilganlarni ham koʻrsatish</span></label>
        </form>
        <div class="drawer__bottom"><button class="btn btn--wide" type="button" data-close id="filter-apply"></button></div>
      </dialog>`,
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
            <h2 class="empty__title display">Bunday buyum hozircha yoʻq</h2>
            <p>Filtrni yumshatib koʻring yoki Telegramga ulaning: yangi partiya chiqqanda xabar beramiz.</p>
            <button class="btn btn--ghost" type="button" id="filter-clear">Filtrni tozalash</button></div>`;
          root.querySelector('#cat-count').textContent = `${list.length} ta buyum`;
          root.querySelector('#filter-apply').textContent = `${list.length} ta buyumni koʻrish`;
          root.querySelector('#cat-title').textContent = f.sets.tur[0] || 'Katalog';
          root.querySelectorAll('[data-tab-type]').forEach(t => {
            t.setAttribute('aria-pressed', (f.sets.tur[0] || '') === t.dataset.tabType);
          });

          const chips = [];
          if (f.q) chips.push(['q', '', `“${f.q}”`]);
          if (f.sotilgan) chips.push(['sotilgan', '', 'Sotilganlar bilan']);
          groupsInDrawer.forEach(([g, group]) => f.sets[g].forEach(key => {
            const o = group.options.find(x => x.key === key);
            if (o) chips.push([g, key, o.label]);
          }));
          active.innerHTML = chips.map(([g, key, label]) => `<button class="pill" type="button" data-off="${g}" data-key="${C.esc(key)}" aria-label="${C.esc(label)} filtrini olib tashlash">${C.esc(label)}${C.icon('x')}</button>`).join('')
            + (chips.length > 1 ? '<button class="link" type="button" id="filter-clear-all">Tozalash</button>' : '');
          root.querySelector('#filter-label').textContent = chips.length ? `Filtr (${chips.length})` : 'Filtr';

          groupsInDrawer.forEach(([g, group]) => {
            const pool = applyFilters(f, g);
            group.options.forEach(o => {
              const input = form.querySelector(`input[name="${g}"][value="${CSS.escape(o.key)}"]`);
              const count = pool.filter(o.test).length;
              input.closest('.check').querySelector('[data-count]').textContent = count;
              input.disabled = !count && !input.checked;
            });
          });
          C.syncState();
        }

        function clearAll() {
          f.q = ''; f.sotilgan = false;
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
          const tab = e.target.closest('[data-tab-type]');
          if (tab) {
            f.sets.tur = tab.dataset.tabType ? [tab.dataset.tabType] : [];
            writeFilters(f);
            draw();
            return;
          }
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
    const others = C.products.filter(x => x !== p && available(x));
    const similar = [...others.filter(x => x.type === p.type), ...others.filter(x => x.type !== p.type)].slice(0, 3);

    return {
      title: `${p.title} · Çaqmoq`,
      html: `
      <div class="pdp">
        <div class="gallery">
          <button class="shot shot--main" type="button" data-zoom aria-label="${C.esc(p.title)} suratini kattalashtirish">
            <img src="${C.photo(p)}" alt="${C.esc(p.title)}" width="600" height="750" fetchpriority="high">
            ${sold ? '<span class="stamp">Sotildi</span>' : '<span class="patch" aria-hidden="true">Bitta dona</span>'}
          </button>
          ${p.details.map(d => `<button class="shot" type="button" data-zoom aria-label="${C.esc(d.label)}ni kattalashtirish">
            <img src="${C.photo(p)}" alt="${C.esc(p.title)}, ${C.esc(d.label)}" width="600" height="750" loading="lazy" style="${C.detailStyle(d)}">
            <span class="shot__cap">${C.esc(d.label)}</span>
          </button>`).join('')}
        </div>
        <div class="buy">
          <nav class="crumbs" aria-label="Sahifa yoʻli">
            <a href="#/katalog">Katalog</a><span aria-hidden="true">/</span>
            <a href="#/katalog?tur=${encodeURIComponent(p.type)}">${p.type}</a>
          </nav>
          <h1 class="buy__title display" tabindex="-1">${C.esc(p.title)}</h1>
          ${sold ? '<p class="buy__price">Sotilgan</p>' : `<p class="buy__price">${C.som(p.price)}</p>`}
          <dl class="facts">
            <div><dt>Oʻlcham</dt><dd>${p.size}</dd></div>
            <div><dt>Davr</dt><dd>${p.era}</dd></div>
            <div><dt>Rang</dt><dd>${p.color}</dd></div>
          </dl>
          ${sold
            ? `<p>Bu buyum sotilgan. Ikkinchisi yoʻq, lekin oʻxshashlari bor.</p>
               <a class="btn btn--wide" href="#/katalog?tur=${encodeURIComponent(p.type)}">Oʻxshashini koʻrish</a>`
            : `<div class="buy__actions">
                 <button class="btn btn--wide buy__add" type="button" data-add="${p.id}"></button>
                 <button class="buy__heart" type="button" data-save="${p.id}" aria-pressed="false">${C.icon('heart')}</button>
               </div>
               <p class="buy__note">Savatga qoʻshsangiz, 15 daqiqa siz uchun saqlanadi.</p>`}
          <div class="accordion">
            <details class="more" open><summary>Tavsif</summary><div class="more__body">${C.esc(p.desc)}</div></details>
            <details class="more"><summary>Holati</summary><div class="more__body">${C.esc(p.note)}</div></details>
            <details class="more"><summary>Mato va kelib chiqishi</summary><div class="more__body">${C.esc(p.fabric)}. Ishlab chiqarilgan joyi: ${C.esc(p.origin)}.</div></details>
            <details class="more"><summary>Yetkazib berish va toʻlov</summary><div class="more__body">${Object.values(C.delivery).map(d => `${d.label}: ${d.fee ? C.som(d.fee) : 'bepul'}`).join('. ')}. Toʻlov: ${Object.values(C.payment).join(', ')}.</div></details>
          </div>
        </div>
      </div>
      ${sold ? '' : `<div class="buybar"><span class="buybar__price">${C.som(p.price)}</span><button class="btn buybar__add" type="button" data-add="${p.id}"></button></div>`}
      ${similar.length ? `<section aria-labelledby="similar-title">
        <div class="head head--small"><h2 class="head__title display" id="similar-title">Bularni ham koʻring</h2></div>
        <div class="grid">${similar.map(C.card).join('')}</div>
      </section>` : ''}`,
      mount(root) {
        root.querySelectorAll('[data-zoom]').forEach(b => b.addEventListener('click', () => C.openLightbox(p)));
        // Kompyuterda kursor ostidagi joy yaqinlashadi
        const main = root.querySelector('.shot--main');
        const img = main.querySelector('img');
        if (matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) {
          main.addEventListener('pointermove', e => {
            const r = main.getBoundingClientRect();
            img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
            img.classList.add('is-zoomed');
          });
          main.addEventListener('pointerleave', () => img.classList.remove('is-zoomed'));
        }
        root.querySelectorAll('.buy__add, .buybar__add').forEach(b => b.addEventListener('click', () => C.openCart()));
      },
    };
  };

  // ---------- saralangan ----------
  pages.saved = () => {
    const draw = () => {
      const list = C.store.state.saved.map(C.byId);
      return list.length ? `<div class="grid">${list.map(C.card).join('')}</div>` : `<div class="empty">
        <h2 class="empty__title display">Hali hech narsa saralanmagan</h2>
        <p>Buyum ustidagi yurakchani bosing, shu yerda saqlanadi. Lekin unutmang: har biri bitta dona.</p>
        <a class="btn" href="#/katalog">Katalogni ochish</a></div>`;
    };
    return {
      title: 'Saralangan · Çaqmoq',
      html: `<div class="page-head"><h1 class="page-head__title display" tabindex="-1">Saralangan</h1></div><div id="saved-list">${draw()}</div>`,
      onStore(root) {
        const box = root.querySelector('#saved-list');
        const ids = [...box.querySelectorAll('[data-card]')].map(c => c.dataset.card).join();
        if (ids !== C.store.state.saved.join()) { box.innerHTML = draw(); C.syncState(); }
      },
    };
  };

  // ---------- yordam ----------
  pages.help = () => ({
    title: 'Yordam · Çaqmoq',
    html: `<div class="page-head"><h1 class="page-head__title display" tabindex="-1">Yordam</h1></div>
    <div class="help accordion">
      <details class="more" open><summary>Savatga qoʻshsam, buyum meniki boʻladimi?</summary><div class="more__body">
        <p>Buyum 15 daqiqa siz uchun saqlanadi. Shu vaqtda buyurtma berilmasa, yana sotuvga chiqadi.</p></div></details>
      <details class="more"><summary>Buyum holatini qayerdan bilaman?</summary><div class="more__body">
        <p>Har bir mahsulot sahifasida holati oddiy soʻz bilan yozilgan. Nuqsoni boʻlsa, ochiq aytamiz.</p></div></details>
      <details class="more"><summary>Yetkazib berish qancha turadi?</summary><div class="more__body">
        ${Object.values(C.delivery).map(d => `<p>${d.label}: ${d.fee ? C.som(d.fee) : 'bepul'}. ${d.note}.</p>`).join('')}</div></details>
      <details class="more"><summary>Qanday toʻlayman?</summary><div class="more__body"><p>${Object.values(C.payment).join(', ')}.</p></div></details>
      <details class="more"><summary>Qaytarish mumkinmi?</summary><div class="more__body"><p>Qaytarish shartlari doʻkon tomonidan shu yerga yoziladi.</p></div></details>
    </div>`,
  });

  pages.missing = () => ({
    title: 'Topilmadi · Çaqmoq',
    html: `<div class="done"><h1 class="done__title display" tabindex="-1">Bu sahifa topilmadi</h1>
      <p>Havola eskirgan boʻlishi mumkin. Buyumlar katalogda.</p><a class="btn" href="#/katalog">Katalogni ochish</a></div>`,
  });
})(window.Caqmoq = window.Caqmoq || {});
