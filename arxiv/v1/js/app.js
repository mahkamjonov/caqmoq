/* Yoʻnaltirish va umumiy hodisalar. */
(function (C) {
  const main = document.getElementById('main');
  const nav = document.getElementById('nav');
  let current = null;
  let firstRender = true;

  const ROUTES = [
    [/^\/$/, 'home', 'home'],
    [/^\/katalog$/, 'catalog', 'catalog'],
    [/^\/k\/([\w-]+)$/, 'product', 'product'],
    [/^\/saralangan$/, 'saved', 'saved'],
    [/^\/rasmiylashtirish$/, 'checkout', 'checkout'],
    [/^\/tasdiq$/, 'done', 'done'],
    [/^\/yordam$/, 'help', 'help'],
  ];

  function render() {
    const [path, query = ''] = (location.hash.slice(1) || '/').split('?');
    let page = C.pages.missing;
    let name = 'missing';
    let args = [];
    for (const [re, key, id] of ROUTES) {
      const m = path.match(re);
      if (m) { page = C.pages[key]; name = id; args = m.slice(1); break; }
    }
    current = page(args, query);
    document.title = current.title;
    document.body.dataset.page = name;
    main.innerHTML = current.html;
    current.mount?.(main);
    C.syncState();

    document.querySelectorAll('[data-tab]').forEach(t => {
      if (t.dataset.tab === name) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
    });
    const link = document.querySelector('.nav__link');
    if (name === 'catalog') link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  }

  function navigate() {
    document.querySelectorAll('dialog[open]').forEach(d => d.close());
    closeSearch();
    render();
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!firstRender) main.focus({ preventScroll: true });
    firstRender = false;
  }

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
      if (C.store.inCart(add.dataset.add)) C.openCart(); else C.store.add(add.dataset.add);
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
    if (t.matches('dialog.drawer, dialog.modal, dialog.lightbox') || (t.matches('dialog.filters') && t.open)) {
      closeDialog(t);
      return;
    }
    const action = t.closest('[data-action]');
    if (!action) return;
    const run = {
      cart: C.openCart,
      fit: C.openFit,
      telegram: () => C.toast('Demo: bu yerga doʻkonning Telegram kanali ulanadi.'),
      reset: () => { C.store.reset(); C.toast('Demo tiklandi.'); showBanner(); if (location.hash === '#/tasdiq') location.hash = '#/'; else C.rerender(); },
    }[action.dataset.action];
    run?.();
  });

  function closeDialog(d) {
    if (!d?.open) return;
    if (d.classList.contains('drawer')) {
      d.classList.add('is-closing');
      // Harakat kamaytirilgan rejimda animatsiya boʻlmaydi, shuning uchun taymer bilan yopiladi
      setTimeout(() => { d.classList.remove('is-closing'); d.close(); }, 260);
    } else d.close();
  }

  // Orqa tomon surati faqat kerak boʻlganda yuklanadi
  const loadAlt = e => {
    const card = e.target.closest?.('.card');
    const img = card?.querySelector('[data-alt]');
    if (img) { img.src = img.dataset.alt; img.removeAttribute('data-alt'); }
  };
  document.addEventListener('pointerover', loadAlt);
  document.addEventListener('focusin', loadAlt);

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

  // Keyingi juma, 20:00 gacha qolgan vaqt
  function updateCountdown() {
    const now = new Date();
    const next = new Date(now);
    next.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7));
    next.setHours(20, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 7);
    const mins = Math.floor((next - now) / 60000);
    const days = Math.floor(mins / 1440);
    const hours = Math.floor((mins % 1440) / 60);
    document.getElementById('drop-count').textContent = days ? `${days} kun ${hours} soat qoldi` : `${hours} soat ${mins % 60} daqiqa qoldi`;
  }
  updateCountdown();
  setInterval(updateCountdown, 60000);

  // ---------- band qilish hisoblagichi ----------
  setInterval(() => {
    C.store.sweep().forEach(line => {
      const p = C.byId(line.id);
      C.toast(`${p.title}ning band muddati tugadi.`, { label: 'Qayta band qilish', run: () => C.store.add(p.id) });
    });
    document.querySelectorAll('[data-hold]').forEach(el => {
      const until = Number(el.dataset.hold);
      el.querySelector('span').textContent = C.holdText(until);
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
        <img src="${C.photo(p, 'front')}" alt="" width="800" height="1000">
        <span>${C.search.mark(p.title, q)}<br><span class="mono muted">${p.size} · koʻkrak ${p.chest} sm</span></span>
        <span class="price">${C.store.isSold(p) ? 'Sotildi' : C.som(p.price)}</span></li>`).join('')}
      <li class="search__opt search__opt--plain" role="option" id="opt-${shown.length}" aria-selected="false" data-href="${C.esc(allHref)}">
        <span class="link">Hammasini koʻrish</span><span class="num">${avail.length} ta</span></li>`
      : `<li class="search__empty" role="option" aria-selected="false" aria-disabled="true">“${C.esc(q)}” boʻyicha koʻylak topilmadi. “Flanel”, “90-lar” yoki “koʻkrak 56” deb koʻring.</li>`;
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
    if (e.key === 'Escape') { if (input.value) input.value = ''; closeSearch(); }
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
    if (!form.contains(e.target) && !toggle.contains(e.target)) {
      list.hidden = true;
      input.setAttribute('aria-expanded', 'false');
    }
  });

  window.addEventListener('hashchange', navigate);
  navigate();
})(window.Caqmoq = window.Caqmoq || {});
