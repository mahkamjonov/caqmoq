/* Yoʻnaltirish va umumiy hodisalar. */
(function (C) {
  const main = document.getElementById('main');
  const nav = document.getElementById('nav');
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = null;
  let firstRender = true;

  const ROUTES = [
    [/^\/$/, 'home'],
    [/^\/katalog$/, 'catalog'],
    [/^\/k\/([\w-]+)$/, 'product'],
    [/^\/saralangan$/, 'saved'],
    [/^\/rasmiylashtirish$/, 'checkout'],
    [/^\/tasdiq$/, 'done'],
    [/^\/yordam$/, 'help'],
  ];

  function render() {
    const [path, query = ''] = (location.hash.slice(1) || '/').split('?');
    let name = 'missing';
    let args = [];
    for (const [re, key] of ROUTES) {
      const m = path.match(re);
      if (m) { name = key; args = m.slice(1); break; }
    }
    current = C.pages[name](args, query);
    document.title = current.title;
    document.body.dataset.page = name;
    main.innerHTML = current.html;
    current.mount?.(main);
    fadeInImages(main);
    C.syncState();
    markCurrent(name, query);
  }

  function markCurrent(name, query) {
    const type = new URLSearchParams(query).get('tur') || '';
    document.querySelectorAll('.nav__links a').forEach(a => {
      const on = name === 'catalog' && (a.dataset.type || '') === type;
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    document.querySelectorAll('[data-tab]').forEach(t => {
      if (t.dataset.tab === name) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
    });
  }

  // Suratlar yuklangach ohista paydo boʻladi
  function fadeInImages(root) {
    root.querySelectorAll('img').forEach(img => {
      if (img.complete) return;
      img.classList.add('is-loading');
      const done = () => img.classList.remove('is-loading');
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
  }

  function swapPage() {
    document.querySelectorAll('dialog[open]').forEach(d => d.close());
    closeSearch();
    render();
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!firstRender) main.focus({ preventScroll: true });
    firstRender = false;
  }

  // Sahifalar orasida ohista oʻtish; mahsulot surati kartadan sahifaga koʻchib oʻtadi
  function navigate() {
    if (!firstRender && document.startViewTransition && !calm()) {
      const vt = document.startViewTransition(swapPage);
      vt.ready.catch(() => {});
      // Brauzer kadr chizmayotgan boʻlsa ham sahifa kutib qolmasin
      const guard = setTimeout(() => vt.skipTransition(), 250);
      vt.updateCallbackDone.finally(() => clearTimeout(guard));
    } else swapPage();
  }

  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#/k/"]');
    const img = link?.closest('.card, .snap')?.querySelector('img');
    if (img) img.style.viewTransitionName = 'product-photo';
  }, true);

  C.rerender = () => {
    const y = window.scrollY;
    render();
    window.scrollTo({ top: y, behavior: 'instant' });
  };

  C.store.on(() => {
    C.syncState();
    current?.onStore?.(main);
  });

  // ---------- umumiy bosishlar ----------
  document.addEventListener('click', e => {
    const t = e.target;
    const add = t.closest('[data-add]');
    if (add) {
      if (C.store.inCart(add.dataset.add)) { if (!add.matches('.buy__add, .buybar__add')) C.openCart(); } else C.store.add(add.dataset.add);
      return;
    }
    const save = t.closest('[data-save]');
    if (save) { C.store.toggleSaved(save.dataset.save); return; }

    const remove = t.closest('[data-remove]');
    if (remove) {
      const p = C.byId(remove.dataset.remove);
      const line = C.store.remove(p.id);
      C.toast(`${p.title} savatdan olindi.`, { label: 'Qaytarish', run: () => C.store.restore(line) });
      return;
    }
    const close = t.closest('[data-close]');
    if (close) { closeDialog(close.closest('dialog')); return; }
    if (t.matches('dialog[open]')) { closeDialog(t); return; }

    const action = t.closest('[data-action]');
    if (!action) return;
    const run = {
      cart: C.openCart,
      telegram: () => C.toast('Demo: bu yerga doʻkonning Telegram kanali ulanadi.'),
      reset: () => {
        C.store.reset();
        showBanner();
        if (location.hash === '#/tasdiq') location.hash = '#/'; else C.rerender();
      },
    }[action.dataset.action];
    run?.();
  });

  function closeDialog(d) {
    if (!d?.open) return;
    if (d.matches('.drawer, .sheet')) {
      d.classList.add('is-closing');
      // Harakat kamaytirilgan rejimda animatsiya boʻlmaydi, shuning uchun taymer bilan yopiladi
      setTimeout(() => { d.classList.remove('is-closing'); d.close(); }, 260);
    } else d.close();
  }

  // ---------- eʼlon va qaytariluvchi sarlavha ----------
  const banner = document.getElementById('banner');
  function hideBanner() {
    banner.hidden = true;
    document.documentElement.style.setProperty('--banner-h', '0px');
  }
  function showBanner() {
    banner.hidden = false;
    document.documentElement.style.removeProperty('--banner-h');
  }
  document.getElementById('banner-x').addEventListener('click', () => { C.store.setBannerOff(); hideBanner(); });
  if (C.store.state.bannerOff) hideBanner();

  let lastY = window.scrollY;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y < 48 || y < lastY) setCompact(false);
      else if (y > lastY) setCompact(true);
      lastY = y;
      ticking = false;
    });
  }, { passive: true });
  function setCompact(on) {
    nav.classList.toggle('is-compact', on);
    document.documentElement.classList.toggle('nav-compact', on);
  }

  // ---------- keyingi partiya: juma, 20:00 ----------
  function updateDrop() {
    const box = document.querySelector('.drop__time');
    if (!box) return;
    const now = new Date();
    const next = new Date(now);
    next.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7));
    next.setHours(20, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 7);
    const left = Math.floor((next - now) / 1000);
    const parts = { d: Math.floor(left / 86400), h: Math.floor((left % 86400) / 3600), m: Math.floor((left % 3600) / 60), s: left % 60 };
    Object.entries(parts).forEach(([k, v]) => { box.querySelector(`[data-drop="${k}"]`).textContent = String(v).padStart(2, '0'); });
  }
  updateDrop();

  // ---------- saqlash hisoblagichi ----------
  setInterval(() => {
    updateDrop();
    C.store.sweep().forEach(line => {
      const p = C.byId(line.id);
      C.toast(`${p.title}ning saqlash muddati tugadi.`, { label: 'Qayta saqlash', run: () => C.store.add(p.id) });
    });
    document.querySelectorAll('[data-hold]').forEach(el => {
      const until = Number(el.dataset.hold);
      el.querySelector('[data-time]').textContent = C.holdText(until);
      el.classList.toggle('is-low', until - Date.now() < 120000);
    });
  }, 1000);

  // ---------- qidiruv ----------
  const form = document.getElementById('search');
  const input = document.getElementById('search-input');
  const list = document.getElementById('search-list');
  const toggle = document.getElementById('search-toggle');
  let active = -1;
  let debounce;

  function closeSearch() {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    nav.classList.remove('is-searching');
    toggle.setAttribute('aria-expanded', 'false');
    active = -1;
  }

  function drawResults() {
    const q = input.value.trim();
    active = -1;
    input.removeAttribute('aria-activedescendant');
    if (!C.search.norm(q)) { list.hidden = true; input.setAttribute('aria-expanded', 'false'); return; }
    const found = C.search.products(q);
    const avail = found.filter(p => !C.store.isSold(p));
    const shown = (avail.length ? avail : found).slice(0, 5);
    const allHref = `#/katalog?q=${encodeURIComponent(q)}`;
    list.innerHTML = shown.length ? `${shown.map((p, i) => `<li class="search__opt" role="option" id="opt-${i}" aria-selected="false" data-href="#/k/${p.id}">
        <img src="${C.photo(p)}" alt="" width="600" height="750">
        <span>${C.search.mark(p.title, q)}<br><span class="muted">${p.type} · ${p.size}</span></span>
        <span class="num">${C.store.isSold(p) ? 'Sotilgan' : C.som(p.price)}</span></li>`).join('')}
      <li class="search__opt search__opt--plain" role="option" id="opt-${shown.length}" aria-selected="false" data-href="${C.esc(allHref)}">
        <span class="link">Hammasini koʻrish</span><span class="num">${avail.length} ta</span></li>`
      : `<li class="search__empty" role="option" aria-selected="false" aria-disabled="true">“${C.esc(q)}” boʻyicha hech narsa topilmadi. “Palto”, “charm” yoki “90-lar” deb koʻring.</li>`;
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function moveActive(d) {
    const opts = [...list.querySelectorAll('[data-href]')];
    if (!opts.length) return;
    active = (active + d + opts.length) % opts.length;
    opts.forEach((o, i) => {
      o.classList.toggle('is-active', i === active);
      o.setAttribute('aria-selected', i === active);
    });
    input.setAttribute('aria-activedescendant', opts[active].id);
    opts[active].scrollIntoView({ block: 'nearest' });
  }

  const go = href => { input.value = ''; closeSearch(); location.hash = href; };

  input.addEventListener('input', () => { clearTimeout(debounce); debounce = setTimeout(drawResults, 120); });
  input.addEventListener('focus', () => { if (input.value.trim()) drawResults(); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (list.hidden) drawResults(); moveActive(1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); }
    if (e.key === 'Escape') { input.value = ''; closeSearch(); toggle.focus(); }
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const opts = [...list.querySelectorAll('[data-href]')];
    if (active >= 0 && opts[active]) { go(opts[active].dataset.href); return; }
    const q = input.value.trim();
    if (q) go(`#/katalog?q=${encodeURIComponent(q)}`);
  });
  list.addEventListener('click', e => {
    const o = e.target.closest('[data-href]');
    if (o) go(o.dataset.href);
  });
  toggle.addEventListener('click', () => {
    const on = !nav.classList.contains('is-searching');
    if (on) {
      nav.classList.add('is-searching');
      toggle.setAttribute('aria-expanded', 'true');
      input.focus();
    } else closeSearch();
  });
  document.addEventListener('pointerdown', e => {
    if (!form.contains(e.target) && !toggle.contains(e.target)) closeSearch();
  });

  window.addEventListener('hashchange', navigate);
  navigate();
})(window.Caqmoq = window.Caqmoq || {});
