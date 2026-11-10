/* Rasmiylashtirish va tasdiq sahifalari. Hech qanday maʼlumot tashqariga yuborilmaydi. */
(function (C) {
  const phoneDigits = v => v.replace(/\D/g, '').replace(/^998/, '').slice(0, 9);
  const phoneFormat = d => {
    const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
    return `+998 ${parts.join(' ')}`.trimEnd();
  };

  const RULES = {
    phone: { test: v => phoneDigits(v).length === 9, msg: 'Raqam toʻliq emas. 9 ta raqam kiriting: 90 123 45 67.', help: 'Buyurtma boʻyicha shu raqamga qoʻngʻiroq qilinadi.' },
    name: { test: v => v.trim().length >= 2, msg: 'Ism kerak, kuryer sizni shu nom bilan topadi.', help: '' },
    city: { test: v => v.trim().length >= 2, msg: 'Shahar yoki tumanni yozing, yetkazish narxi shunga bogʻliq.', help: '' },
    address: { test: v => v.trim().length >= 5, msg: 'Manzil juda qisqa. Koʻcha va uy raqamini yozing.', help: '' },
  };

  const field = (id, label, attrs, help = '') => `<label class="field"><span class="field__label">${label}</span>
    <input class="input" id="${id}" name="${id}" aria-required="true" aria-describedby="${id}-help" ${attrs}>
    <span class="field__help" id="${id}-help">${help}</span></label>`;

  function summary(deliveryKey) {
    const items = C.store.cartProducts();
    const fee = C.delivery[deliveryKey].fee;
    const sub = C.store.cartTotal();
    return `<h2 class="block__title">Buyurtmangiz</h2>
      <ul>${items.map(p => `<li class="line"><img src="${C.photo(p, 'front')}" alt="" width="800" height="1000">
        <div><span class="line__title">${C.esc(p.title)}</span><p class="mono muted">${p.size} · koʻkrak ${p.chest} sm</p>
        <span class="price">${C.som(p.price)}</span>${C.timer(p)}</div></li>`).join('')}</ul>
      <div class="summary__rows">
        <div class="summary__row"><span>Koʻylaklar</span><span>${C.som(sub)}</span></div>
        <div class="summary__row"><span>Yetkazib berish</span><span>${fee ? C.som(fee) : 'bepul'}</span></div>
      </div>
      <div class="total"><span>Jami</span><span class="price">${C.som(sub + fee)}</span></div>`;
  }

  C.pages.checkout = () => {
    if (!C.store.state.cart.length) {
      return {
        title: 'Rasmiylashtirish · Çaqmoq',
        html: `<div class="done"><h1 class="done__title display" tabindex="-1">Savat boʻsh</h1>
          <p>Band qilish muddati tugagan yoki hali koʻylak qoʻshilmagan.</p>
          <a class="btn" href="#/katalog">Katalogni ochish</a></div>`,
        onStore() { if (C.store.state.cart.length) C.rerender(); },
      };
    }
    return {
      title: 'Rasmiylashtirish · Çaqmoq',
      html: `<div class="page-head"><h1 class="page-head__title display" tabindex="-1">Rasmiylashtirish</h1></div>
      <div class="checkout">
        <form class="form" id="order" novalidate>
          <fieldset class="form__sec"><legend>Aloqa</legend>
            <div class="form__row">
              ${field('phone', 'Telefon', 'type="tel" inputmode="tel" autocomplete="tel" placeholder="+998 90 123 45 67"', RULES.phone.help)}
              ${field('name', 'Ism', 'type="text" autocomplete="given-name" placeholder="Dilshod"')}
            </div>
          </fieldset>
          <fieldset class="form__sec"><legend>Yetkazib berish</legend>
            <div>${Object.entries(C.delivery).map(([k, d], i) => `<label class="radio">
              <input type="radio" name="delivery" value="${k}" ${i === 0 ? 'checked' : ''}>
              <span class="radio__label">${d.label}<span class="radio__note">${d.note}</span></span>
              <span class="num">${d.fee ? C.som(d.fee) : 'bepul'}</span></label>`).join('')}</div>
            <div class="form__row" id="address-box">
              ${field('city', 'Shahar yoki tuman', 'type="text" autocomplete="address-level2" placeholder="Chilonzor"')}
              ${field('address', 'Manzil', 'type="text" autocomplete="street-address" placeholder="Bunyodkor koʻchasi, 12-uy"')}
            </div>
          </fieldset>
          <fieldset class="form__sec"><legend>Toʻlov</legend>
            <div>${Object.entries(C.payment).map(([k, label], i) => `<label class="radio">
              <input type="radio" name="payment" value="${k}" ${i === 0 ? 'checked' : ''}>
              <span class="radio__label">${label}</span><span></span></label>`).join('')}</div>
          </fieldset>
          <div>
            <button class="btn btn--wide" type="submit" id="order-submit">Buyurtma berish</button>
            <p class="demo-note" style="margin-block-start: var(--space-xs)">Bu demo: toʻlov olinmaydi, maʼlumotlar hech qayerga yuborilmaydi.</p>
          </div>
        </form>
        <aside class="summary" id="summary" aria-label="Buyurtma tarkibi"></aside>
      </div>`,
      mount(root) {
        const form = root.querySelector('#order');
        const box = root.querySelector('#address-box');
        const sum = root.querySelector('#summary');
        const touched = new Set();
        const deliveryKey = () => form.elements.delivery.value;
        const drawSummary = () => { sum.innerHTML = summary(deliveryKey()); };

        function check(id) {
          const input = form.elements[id];
          const rule = RULES[id];
          const ok = rule.test(input.value);
          const help = root.querySelector(`#${id}-help`);
          input.setAttribute('aria-invalid', ok ? 'false' : 'true');
          help.textContent = ok ? rule.help : rule.msg;
          help.classList.toggle('is-error', !ok);
          return ok;
        }

        const activeFields = () => (C.delivery[deliveryKey()].address ? ['phone', 'name', 'city', 'address'] : ['phone', 'name']);

        form.addEventListener('focusout', e => {
          const id = e.target.name;
          if (!RULES[id]) return;
          if (e.target.value || touched.has(id)) { touched.add(id); check(id); }
        });
        form.addEventListener('input', e => {
          const id = e.target.name;
          if (id === 'phone') {
            const d = phoneDigits(e.target.value);
            e.target.value = d ? phoneFormat(d) : e.target.value.replace(/[^+\d\s]/g, '');
          }
          if (touched.has(id)) check(id);
        });
        form.addEventListener('change', e => {
          if (e.target.name !== 'delivery') return;
          box.hidden = !C.delivery[deliveryKey()].address;
          drawSummary();
        });
        form.addEventListener('submit', e => {
          e.preventDefault();
          const fields = activeFields();
          fields.forEach(id => touched.add(id));
          const bad = fields.filter(id => !check(id));
          if (bad.length) { form.elements[bad[0]].focus(); return; }
          const btn = root.querySelector('#order-submit');
          btn.disabled = true;
          btn.dataset.state = 'loading';
          btn.textContent = 'Yuborilmoqda…';
          setTimeout(() => {
            const fee = C.delivery[deliveryKey()].fee;
            C.store.placeOrder({ delivery: deliveryKey(), payment: form.elements.payment.value, total: C.store.cartTotal() + fee });
            location.hash = '#/tasdiq';
          }, 900);
        });
        drawSummary();
        this.onStore = () => {
          if (!C.store.state.cart.length) { if (location.hash !== '#/tasdiq' && !root.querySelector('#order-submit').disabled) C.rerender(); return; }
          drawSummary();
        };
      },
    };
  };

  C.pages.done = () => {
    const o = C.store.state.order;
    if (!o) return C.pages.missing();
    return {
      title: 'Buyurtma qabul qilindi · Çaqmoq',
      html: `<div class="done">
        <h1 class="done__title display" tabindex="-1">Koʻylak sizniki.</h1>
        <p class="done__no">${C.esc(o.no)}</p>
        <p>Operator qoʻngʻiroq qilib, ${C.delivery[o.delivery].label.toLowerCase()} boʻyicha kelishib oladi. Toʻlov: ${C.payment[o.payment]}. Jami: ${C.som(o.total)}.</p>
        <ul class="done__list">${o.items.map(C.byId).map(p => `<li class="line" style="grid-template-columns: 4rem minmax(0, 1fr); padding-inline: 0">
          <img src="${C.photo(p, 'front')}" alt="" width="800" height="1000">
          <div><span class="line__title">${C.esc(p.title)}</span><p class="mono muted">${p.size} · koʻkrak ${p.chest} sm</p><span class="price">${C.som(p.price)}</span></div></li>`).join('')}</ul>
        <p class="demo-note">Bu demo: toʻlov olinmadi, maʼlumotlar yuborilmadi. Koʻylak faqat shu brauzerda “Sotildi” boʻlib turadi.</p>
        <div class="done__actions"><a class="btn" href="#/katalog">Katalogga qaytish</a><button class="btn btn--quiet" type="button" data-action="reset">Demoni tiklash</button></div>
      </div>`,
    };
  };
})(window.Caqmoq = window.Caqmoq || {});
