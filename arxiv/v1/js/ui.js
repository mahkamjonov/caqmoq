/* Umumiy koʻrinish qismlari: karta, savat, oʻlcham oynasi, xabarlar. */
(function (C) {
  C.esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  C.num = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  C.som = n => `${C.num(n)} soʻm`;
  C.icon = name => `<svg class="i" aria-hidden="true"><use href="#i-${name}"/></svg>`;

  C.views = p => [
    ['front', 'Old tomoni'],
    ['back', 'Orqa tomoni'],
    ['label', 'Yorliq'],
    ['detail', p.flaw ? 'Nuqson yaqindan' : 'Chok va tugma'],
  ];

  C.addButton = (p, cls = 'add') => `<button class="btn ${cls}" type="button" data-add="${p.id}"></button>`;

  C.card = p => {
    const sold = C.store.isSold(p);
    return `<article class="card${sold ? ' is-sold' : ''}" data-card="${p.id}">
      <a class="card__media" href="#/k/${p.id}" tabindex="-1" aria-hidden="true">
        <img class="card__img" src="${C.photo(p, 'front')}" alt="" width="800" height="1000" loading="lazy">
        ${sold ? '' : `<img class="card__img card__img--alt" data-alt="${C.photo(p, 'back')}" alt="" width="800" height="1000">`}
        <span class="tag">${p.cond}</span>
        ${!sold && C.fits(p) ? `<span class="fit-flag">${C.icon('check')}Sizga mos</span>` : ''}
        ${sold ? '<span class="stamp">Sotildi</span>' : ''}
      </a>
      ${sold ? '' : `<button class="heart" type="button" data-save="${p.id}" aria-pressed="false">${C.icon('heart')}</button>`}
      <div class="card__body">
        <p class="card__measure mono">${p.size} · koʻkrak ${p.chest} sm<span class="long"> · uzun ${p.length}</span></p>
        <h3 class="card__title"><a href="#/k/${p.id}">${C.esc(p.title)}</a></h3>
        <div class="card__foot">
          ${sold
            ? `<a class="link" href="#/katalog?tur=${encodeURIComponent(p.type)}">Oʻxshashlari</a>`
            : `<span class="price">${C.som(p.price)}</span>${C.addButton(p)}`}
        </div>
      </div>
    </article>`;
  };

  C.measureSvg = () => `<svg class="measure-svg" viewBox="60 90 680 830" role="img" aria-label="Koʻylakda koʻkrak, yelka va uzunlik qayerdan oʻlchanishi">
    <path class="o" d="M224 224 84 372Q118 416 164 442L228 384Q218 300 224 224Z"/>
    <path class="o" d="M576 224 716 372Q682 416 636 442L572 384Q582 300 576 224Z"/>
    <path class="o" d="M330 172 222 226C216 300 222 362 226 420L215 866Q400 906 585 866L574 420C578 362 584 300 578 226L470 172Q400 214 330 172Z"/>
    <path class="m" d="M224 150H576M224 138V162M576 138V162"/>
    <path class="m" d="M228 430H572M228 418V442M572 418V442"/>
    <path class="m" d="M400 192V884M388 192H412M388 884H412"/>
    <text x="400" y="124" text-anchor="middle">Yelka</text>
    <text x="300" y="414" text-anchor="middle">Koʻkrak</text>
    <text x="414" y="700">Uzunlik</text>
  </svg>`;

  // ---------- xabarlar ----------
  C.toast = (message, action) => {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span>${C.esc(message)}</span>`;
    let timer;
    const close = () => { clearTimeout(timer); el.remove(); };
    const arm = () => { timer = setTimeout(close, 6000); };
    if (action) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = action.label;
      b.addEventListener('click', () => { action.run(); close(); });
      el.append(b);
    }
    el.addEventListener('pointerenter', () => clearTimeout(timer));
    el.addEventListener('pointerleave', arm);
    el.addEventListener('focusin', () => clearTimeout(timer));
    document.getElementById('toasts').append(el);
    arm();
  };

  // ---------- savat ----------
  const cartEl = () => document.getElementById('cart');

  C.holdText = until => {
    const left = Math.max(0, until - Date.now());
    const m = Math.floor(left / 60000);
    const s = Math.floor(left / 1000) % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };
  C.timer = p => `<span class="timer mono" data-hold="${p.until}">${C.icon('clock')}<span>${C.holdText(p.until)}</span><span class="sr-only"> daqiqa band</span></span>`;

  C.renderCart = () => {
    const items = C.store.cartProducts();
    const top = `<div class="drawer__top"><h2 class="drawer__title" id="cart-title">Savat${items.length ? ` · ${items.length}` : ''}</h2>
      <button class="icon-btn" type="button" data-close aria-label="Savatni yopish">${C.icon('x')}</button></div>`;
    if (!items.length) {
      cartEl().innerHTML = `${top}<div class="drawer__empty">
        <p>Savat boʻsh. Yoqqan koʻylakni qoʻshsangiz, 15 daqiqa siz uchun band turadi.</p>
        <a class="btn" href="#/katalog">Katalogni ochish</a></div>`;
      return;
    }
    cartEl().innerHTML = `${top}
      <ul class="drawer__items">${items.map(p => `<li class="line">
        <a href="#/k/${p.id}" tabindex="-1" aria-hidden="true"><img src="${C.photo(p, 'front')}" alt="" width="800" height="1000"></a>
        <div>
          <a class="line__title" href="#/k/${p.id}">${C.esc(p.title)}</a>
          <p class="mono muted">${p.size} · koʻkrak ${p.chest} sm</p>
          <span class="price">${C.som(p.price)}</span>
          ${C.timer(p)}
        </div>
        <button class="icon-btn" type="button" data-remove="${p.id}" aria-label="${C.esc(p.title)}ni savatdan olish">${C.icon('x')}</button>
      </li>`).join('')}</ul>
      <div class="drawer__bottom">
        <div class="total"><span>Jami</span><span class="price">${C.som(C.store.cartTotal())}</span></div>
        <a class="btn btn--wide" href="#/rasmiylashtirish">Rasmiylashtirish</a>
      </div>`;
  };

  C.openCart = () => { C.renderCart(); if (!cartEl().open) cartEl().showModal(); };

  // ---------- oʻlcham oynasi ----------
  C.openFit = () => {
    const el = document.getElementById('fit');
    const fit = C.store.state.fit;
    el.innerHTML = `<div class="modal__top"><h2 class="modal__title" id="fit-title">Oʻlchamingiz</h2>
        <button class="icon-btn" type="button" data-close aria-label="Oynani yopish">${C.icon('x')}</button></div>
      <form class="modal__body" id="fit-form" novalidate>
        <p>Eng yaxshi tushadigan koʻylagingizni tekis qoʻying va qoʻltiq ostidan qoʻltiq ostigacha oʻlchang.</p>
        ${C.measureSvg()}
        <label class="field"><span class="field__label">Koʻkrak kengligi, sm</span>
          <input class="input" id="fit-input" type="number" inputmode="numeric" min="40" max="75" placeholder="54" value="${fit ?? ''}" aria-describedby="fit-help">
          <span class="field__help" id="fit-help">Mos koʻylaklar katalogda belgilanadi.</span>
        </label>
        <div class="modal__actions">
          <button class="btn" type="submit">Saqlash</button>
          ${fit != null ? '<button class="btn btn--quiet" type="button" id="fit-clear">Oʻchirish</button>' : ''}
        </div>
      </form>`;
    const input = el.querySelector('#fit-input');
    const help = el.querySelector('#fit-help');
    el.querySelector('#fit-form').addEventListener('submit', e => {
      e.preventDefault();
      const n = Number(input.value);
      if (!input.value || n < 40 || n > 75) {
        input.setAttribute('aria-invalid', 'true');
        help.textContent = 'Oʻlcham 40 va 75 sm orasida boʻlishi kerak. Sonni tekshirib koʻring.';
        help.classList.add('is-error');
        input.focus();
        return;
      }
      C.store.setFit(Math.round(n));
      el.close();
      C.rerender();
    });
    el.querySelector('#fit-clear')?.addEventListener('click', () => {
      C.store.setFit(null);
      el.close();
      C.rerender();
    });
    el.showModal();
    input.focus();
  };

  // ---------- katta surat ----------
  C.openLightbox = (p, start) => {
    const el = document.getElementById('lightbox');
    const views = C.views(p);
    let at = start;
    const draw = () => {
      const [view, cap] = views[at];
      el.innerHTML = `<img src="${C.photo(p, view)}" alt="${C.esc(p.title)}, ${C.esc(cap)}" width="800" height="1000">
        <button class="lightbox__btn lightbox__close" type="button" data-close aria-label="Yopish">${C.icon('x')}</button>
        <button class="lightbox__btn lightbox__prev" type="button" data-step="-1" aria-label="Oldingi surat">${C.icon('left')}</button>
        <button class="lightbox__btn lightbox__next" type="button" data-step="1" aria-label="Keyingi surat">${C.icon('right')}</button>`;
    };
    const step = d => { at = (at + d + views.length) % views.length; draw(); };
    el.onclick = e => { const b = e.target.closest('[data-step]'); if (b) { step(Number(b.dataset.step)); el.querySelector(`[data-step="${b.dataset.step}"]`).focus(); } };
    el.onkeydown = e => { if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); };
    draw();
    el.showModal();
  };

  // ---------- holatni sahifaga moslash ----------
  C.syncState = () => {
    const { state } = C.store;
    document.querySelectorAll('[data-cart-count]').forEach(b => { b.textContent = state.cart.length; b.hidden = !state.cart.length; });
    document.querySelectorAll('[data-saved-count]').forEach(b => { b.textContent = state.saved.length; b.hidden = !state.saved.length; });
    document.querySelectorAll('[data-add]').forEach(b => {
      const p = C.byId(b.dataset.add);
      const inCart = C.store.inCart(p.id);
      b.dataset.state = inCart ? 'in' : '';
      b.setAttribute('aria-label', inCart ? `${p.title} savatda, savatni ochish` : `${p.title}ni savatga qoʻshish`);
      b.innerHTML = b.classList.contains('add')
        ? `${C.icon(inCart ? 'check' : 'bag')}<span class="add__label">${inCart ? 'Savatda' : 'Savatga'}</span>`
        : (inCart ? 'Savatda' : b.classList.contains('buybar__add') ? 'Savatga' : 'Savatga qoʻshish');
    });
    document.querySelectorAll('[data-save]').forEach(b => {
      const p = C.byId(b.dataset.save);
      const on = C.store.isSaved(p.id);
      b.setAttribute('aria-pressed', on);
      b.setAttribute('aria-label', on ? `${p.title}ni saralangandan olish` : `${p.title}ni saralash`);
    });
    const fitBtn = document.querySelector('.nav__fit');
    fitBtn.toggleAttribute('data-set', state.fit != null);
    fitBtn.setAttribute('aria-label', state.fit != null ? `Oʻlchamim: ${state.fit} sm, oʻzgartirish` : 'Oʻlchamimni kiritish');
    fitBtn.querySelector('[data-fit-label]').textContent = state.fit != null ? `${state.fit} sm` : 'Oʻlchamim';
    if (cartEl().open) C.renderCart();
  };
})(window.Caqmoq = window.Caqmoq || {});
