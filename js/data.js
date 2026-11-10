/* Demo mahsulotlari. Narxlar, oʻlchamlar va tavsiflar namuna. */
(function (C) {
  const P = (id, title, type, era, size, price, color, fabric, origin, extra) =>
    Object.assign({ id, title, type, era, size, price, color, fabric, origin, sold: false }, extra);

  C.products = [
    P('jun-palto', 'Antrasit jun palto', 'Palto', '90-lar', 'L', 1650000, 'Kulrang', 'Jun va kashmir', 'Italiya', {
      desc: 'Uzun, toʻgʻri bichimli klassik palto. Toʻq vishnya rangli naqshli astari ochilganda butun koʻrinishini oʻzgartiradi.',
      note: 'Yaxshi holatda. Astarda yengil gʻijimlanish bor.',
      details: [{ label: 'Yoqa va astar', x: 50, y: 15, zoom: 2.2 }, { label: 'Yorliq va astar', x: 22, y: 72, zoom: 2.4 }],
    }),
    P('charm-trench', 'Qora charm trench', 'Palto', '80-lar', 'XL', 2350000, 'Qora', 'Tabiiy charm', 'AQSh', {
      desc: 'Ikki qator tugmali, kamarli va yelka qoplamali uzun trench. Charmi yillar davomida oʻziga xos yaltiroqlik olgan.',
      note: 'Yaxshi holatda. Charmda tabiiy eskirish izlari bor.',
      details: [{ label: 'Yelka qoplamasi', x: 50, y: 20, zoom: 2 }, { label: 'Kamar toʻqasi', x: 50, y: 48, zoom: 2.4 }],
    }),
    P('toqilgan-nimcha', 'Qoʻlda toʻqilgan nimcha', 'Nimcha', '70-lar', 'M', 490000, 'Jigarrang', '100% jun', 'Angliya', {
      desc: 'Savat naqshli qalin toʻqima va V-yoqa. Koʻylak ustidan ham, pidjak ostidan ham kiyiladi.',
      note: 'Juda yaxshi holatda. Nuqson topilmadi.',
      details: [{ label: 'V-yoqa', x: 51, y: 15, zoom: 2 }, { label: 'Savat naqshi', x: 50, y: 55, zoom: 2.4 }],
    }),
    P('vilvet-yoqa-kurtka', 'Vilvet yoqali kurtka', 'Kurtka', '2000-lar', 'L', 890000, 'Bej', 'Mikrozamsh, vilvet yoqa', 'AQSh', {
      desc: 'Bej rangdagi yumshoq mikrozamsh, toʻq jigarrang vilvet yoqa va ichi issiq astar. Kuz uchun tayyor kurtka.',
      note: 'Yaxshi holatda. Old qismida yengil rang oʻzgarishi bor. Yorligʻi: Weatherproof.',
      details: [{ label: 'Vilvet yoqa', x: 50, y: 21, zoom: 2.4 }, { label: 'Choʻntak', x: 72, y: 59, zoom: 2.4 }],
    }),
    P('vilvet-pidjak', 'Zaytun vilvet pidjak', 'Pidjak', '90-lar', 'L', 780000, 'Yashil', 'Paxta vilvet', 'Italiya', {
      desc: 'Uch tugmali, mayda chiziqli vilvet pidjak. Jinsi bilan ham, klassik shim bilan ham yarashadi.',
      note: 'Yaxshi holatda. Koʻkrak choʻntagi yonida yengil iz bor.',
      details: [{ label: 'Yoqa', x: 47, y: 23, zoom: 2 }, { label: 'Tugma va choʻntak', x: 60, y: 62, zoom: 2 }],
    }),
    P('zaytun-palto', 'Zaytun jun palto', 'Palto', '90-lar', 'M', 1390000, 'Yashil', 'Jun aralash', 'AQSh', {
      desc: 'Reglan yengli, yashirin tugmali keng palto. Yoqa ostida terrakota rangli astar koʻrinib turadi.',
      note: 'Juda yaxshi holatda. Yorligʻi: Marciano.',
      details: [{ label: 'Yoqa va yorliq', x: 46, y: 6, zoom: 2.4 }, { label: 'Yeng tasmasi', x: 24, y: 43, zoom: 2.4 }],
    }),
  ];

  C.byId = id => C.products.find(p => p.id === id);
  C.photo = p => `assets/products/${p.id}.webp`;
  // x va y: kadr markazi, foizda. Suratning oʻzi oʻzgarmaydi, faqat kattalashtirib koʻrsatiladi
  C.detailStyle = d => {
    const origin = c => Math.min(Math.max(c - 50 / d.zoom, 0), 100 - 100 / d.zoom) / (1 - 1 / d.zoom);
    return `transform-origin: ${origin(d.x)}% ${origin(d.y)}%; transform: scale(${d.zoom})`;
  };

  const eq = (field, values) => values.map(v => ({ key: v, label: v, test: p => p[field] === v }));

  C.groups = {
    tur: { label: 'Tur', options: eq('type', ['Palto', 'Kurtka', 'Pidjak', 'Nimcha']) },
    olcham: { label: 'Oʻlcham', options: eq('size', ['S', 'M', 'L', 'XL']) },
    davr: { label: 'Davr', options: eq('era', ['70-lar', '80-lar', '90-lar', '2000-lar']) },
    rang: { label: 'Rang', options: eq('color', ['Kulrang', 'Qora', 'Jigarrang', 'Bej', 'Yashil']) },
    narx: { label: 'Narx', options: [[0, 999999, '1 mln gacha'], [1000000, 1999999, '1–2 mln'], [2000000, 99999999, '2 mln dan yuqori']].map(([a, b, label]) => ({ key: `${a}-${b}`, label, test: p => p.price >= a && p.price <= b })) },
  };

  // Mahsuloti yoʻq variantlar filtrda koʻrinmaydi
  Object.values(C.groups).forEach(g => { g.options = g.options.filter(o => C.products.some(o.test)); });

  C.delivery = {
    kuryer: { label: 'Toshkent boʻylab kuryer', note: 'Ertasi kuni', fee: 25000, address: true },
    pochta: { label: 'Viloyatlarga pochta', note: '2–4 kun', fee: 35000, address: true },
    olish: { label: 'Oʻzim olib ketaman', note: 'Toshkent, doʻkondan', fee: 0, address: false },
  };
  C.payment = { click: 'Click', payme: 'Payme', naqd: 'Qabul qilganda naqd' };
})(window.Caqmoq = window.Caqmoq || {});
