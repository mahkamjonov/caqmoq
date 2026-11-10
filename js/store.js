/* Holat: savat, saralangan va sotilganlar. Faqat brauzerda saqlanadi. */
(function (C) {
  const KEY = 'caqmoq-demo-v2';
  const HOLD_MS = 15 * 60 * 1000;
  const blank = () => ({ cart: [], saved: [], sold: [], bannerOff: false, order: null });

  function load() {
    try { return Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || '{}')); }
    catch { return blank(); }
  }

  let state = load();
  const listeners = [];

  function commit() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* xotirada qoladi */ }
    listeners.forEach(fn => fn(state));
  }

  C.store = {
    get state() { return state; },
    on: fn => listeners.push(fn),

    isSold: p => p.sold || state.sold.includes(p.id),
    inCart: id => state.cart.some(l => l.id === id),
    isSaved: id => state.saved.includes(id),

    add(id) {
      if (this.inCart(id) || this.isSold(C.byId(id))) return;
      state.cart.push({ id, until: Date.now() + HOLD_MS });
      commit();
    },
    remove(id) {
      const line = state.cart.find(l => l.id === id);
      state.cart = state.cart.filter(l => l.id !== id);
      commit();
      return line;
    },
    restore(line) {
      if (!this.inCart(line.id)) { state.cart.push(line); commit(); }
    },
    sweep() {
      const now = Date.now();
      const gone = state.cart.filter(l => l.until <= now);
      if (gone.length) {
        state.cart = state.cart.filter(l => l.until > now);
        commit();
      }
      return gone;
    },
    toggleSaved(id) {
      state.saved = this.isSaved(id) ? state.saved.filter(x => x !== id) : [...state.saved, id];
      commit();
    },
    setBannerOff() { state.bannerOff = true; commit(); },

    cartProducts: () => state.cart.map(l => Object.assign({}, C.byId(l.id), { until: l.until })),
    cartTotal: () => state.cart.reduce((s, l) => s + C.byId(l.id).price, 0),

    placeOrder(details) {
      const items = state.cart.map(l => l.id);
      const no = 'ÇQ-' + String(Date.now()).slice(-6);
      state.sold = [...state.sold, ...items];
      state.saved = state.saved.filter(id => !items.includes(id));
      state.order = { no, items, delivery: details.delivery, payment: details.payment, total: details.total };
      state.cart = [];
      commit();
      return state.order;
    },
    reset() {
      state = blank();
      commit();
    },
  };
})(window.Caqmoq = window.Caqmoq || {});
