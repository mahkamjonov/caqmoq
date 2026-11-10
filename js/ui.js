/* Umumiy koʻrinish qismlari: karta, savat, surat oynasi, xabarlar. */
(function (C) {
  C.esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  C.num = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  C.som = n => `${C.num(n)} soʻm`;
  C.icon = name => `<svg class="i" aria-hidden="true"><use href="#i-${name}"/></svg>`;

  const cardHtml = (p, feature) => {
    const sold = C.store.isSold(p);
    return `<article class="card${sold ? ' is-sold' : ''}${feature ? ' card--feature' : ''}" data-card="${p.id}">
      <div class="card__media">
        <a class="card__photo" href="#/k/${p.id}" tabindex="-1" aria-hidden="true">
          <img class="card__img" src="${C.photo(p)}" alt="" width="600" height="750" loading="lazy">
          ${sold ? '<span class="stamp">Sotildi</span>' : ''}
          ${feature && !sold ? '<span class="sun">Hafta tanlovi</span>' : ''}
        </a>
        ${sold ? '' : `<button class="heart" type="button" data-save="${p.id}" aria-pressed="false">${C.icon('heart')}</button>
        <button class="card__add" type="button" data-add="${p.id}"></button>`}
      </div>
      <div class="card__body">
        <h3 class="card__title"><a href="#/k/${p.id}">${C.esc(p.title)}</a></h3>
        <p class="card__price">${sold ? 'Sotilgan' : C.som(p.price)}</p>
        <p class="card__meta">${p.type} · ${p.era} · ${p.size}</p>
      </div>
    </article>`;
  };
  // map() indeksni ikkinchi argument qilib beradi, shuning uchun alohida funksiyalar
  C.card = p => cardHtml(p, false);
  C.featureCard = p => cardHtml(p, true);

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
  C.timer = p => `<span class="timer" data-hold="${p.until}">${C.icon('clock')}<span><span data-time>${C.holdText(p.until)}</span> siz uchun</span></span>`;

  C.renderCart = () => {
    const items = C.store.cartProducts();
    const top = `<div class="drawer__top"><h2 class="drawer__title" id="cart-title">Savat${items.length ? ` (${items.length})` : ''}</h2>
      <button class="icon-btn" type="button" data-close aria-label="Savatni yopish">${C.icon('x')}</button></div>`;
    if (!items.length) {
      cartEl().innerHTML = `${top}<div class="drawer__empty">
        <p>Savat boʻsh. Yoqqan buyumni qoʻshsangiz, 15 daqiqa siz uchun saqlanadi.</p>
        <a class="btn" href="#/katalog">Katalogni ochish</a></div>`;
      return;
    }
    cartEl().innerHTML = `${top}
      <ul class="drawer__items">${items.map(p => `<li class="line">
        <a class="line__photo" href="#/k/${p.id}" tabindex="-1" aria-hidden="true"><img src="${C.photo(p)}" alt="" width="600" height="750"></a>
        <div class="line__text">
          <a class="line__title" href="#/k/${p.id}">${C.esc(p.title)}</a>
          <p class="muted">Oʻlcham ${p.size}</p>
          <span class="line__price">${C.som(p.price)}</span>
          ${C.timer(p)}
        </div>
        <button class="icon-btn" type="button" data-remove="${p.id}" aria-label="${C.esc(p.title)}ni savatdan olish">${C.icon('x')}</button>
      </li>`).join('')}</ul>
      <div class="drawer__bottom">
        <div class="total"><span>Jami</span><span class="total__sum">${C.som(C.store.cartTotal())}</span></div>
        <a class="btn btn--wide" href="#/rasmiylashtirish">Rasmiylashtirish</a>
      </div>`;
  };

  C.openCart = () => { C.renderCart(); if (!cartEl().open) cartEl().showModal(); };

  // ---------- katta surat ----------
  C.openLightbox = p => {
    const el = document.getElementById('lightbox');
    el.innerHTML = `<img src="${C.photo(p)}" alt="${C.esc(p.title)}" width="600" height="750">
      <button class="lightbox__close" type="button" data-close aria-label="Yopish">${C.icon('x')}</button>`;
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
      b.textContent = inCart ? 'Savatda' : (b.classList.contains('card__add') || b.classList.contains('buybar__add') ? 'Savatga' : 'Savatga qoʻshish');
    });
    document.querySelectorAll('[data-save]').forEach(b => {
      const p = C.byId(b.dataset.save);
      const on = C.store.isSaved(p.id);
      b.setAttribute('aria-pressed', on);
      b.setAttribute('aria-label', on ? `${p.title}ni saralangandan olish` : `${p.title}ni saralash`);
    });
    if (cartEl().open) C.renderCart();
  };
})(window.Caqmoq = window.Caqmoq || {});
