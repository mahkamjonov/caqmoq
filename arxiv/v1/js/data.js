/* Demo mahsulotlari. Narxlar, oʻlchamlar va tavsiflar namuna.
   Haqiqiy suratlar kelganda faqat C.photo() ichidagi yoʻlni almashtirish kifoya. */
(function (C) {
  const P = (id, title, type, era, size, chest, length, shoulder, sleeve, cond, price, color, fabric, origin, extra) =>
    Object.assign({ id, title, type, era, size, chest, length, shoulder, sleeve, cond, price, color, fabric, origin,
      flaw: '', batch: false, sold: false }, extra);

  C.products = [
    P('qizil-katak-flanel', 'Qizil katak flanel', 'Flanel', '90-lar', 'L', 58, 76, 49, 63, 'A', 195000, 'Qizil', '100% paxta flanel', 'AQSh', { batch: true }),
    P('yashil-tartan-flanel', 'Yashil tartan flanel', 'Flanel', '80-lar', 'M', 54, 72, 46, 61, 'B', 165000, 'Yashil', '100% paxta flanel', 'Kanada', { flaw: 'Chap yengida kichik tuklanish bor.' }),
    P('asal-rang-flanel', 'Asal rang flanel', 'Flanel', '90-lar', 'XL', 62, 78, 52, 65, 'B', 175000, 'Sariq', 'Paxta va akril', 'AQSh', { flaw: 'Yoqa ichida yengil yuvilish izi bor.' }),
    P('dengiz-kok-flanel', 'Dengiz koʻk flanel', 'Flanel', '2000-lar', 'M', 52, 71, 45, 60, 'A', 150000, 'Koʻk', '100% paxta flanel', 'Turkiya', { batch: true }),
    P('qora-oq-flanel', 'Qora-oq flanel', 'Flanel', '90-lar', 'L', 56, 74, 48, 62, 'C', 110000, 'Qora', '100% paxta flanel', 'AQSh', { flaw: 'Pastki tugmasi almashtirilgan, oʻng yengida dogʻ izi bor.', sold: true }),

    P('moviy-gibiskus', 'Moviy gibiskus', 'Gavayi', '90-lar', 'L', 58, 74, 49, 25, 'A', 235000, 'Koʻk', '100% viskoza', 'Gavayi', { batch: true }),
    P('qizil-palma', 'Qizil palma', 'Gavayi', '80-lar', 'XL', 62, 76, 52, 26, 'B', 245000, 'Qizil', '100% viskoza', 'Yaponiya', { flaw: 'Choʻntak chetida ip chiqqan joyi bor.' }),
    P('yashil-tropik', 'Yashil tropik', 'Gavayi', '90-lar', 'M', 54, 72, 46, 24, 'A', 215000, 'Yashil', 'Viskoza va paxta', 'AQSh', { batch: true }),
    P('qora-gibiskus', 'Qora gibiskus', 'Gavayi', '2000-lar', 'S', 50, 69, 43, 23, 'A', 185000, 'Qora', '100% poliester', 'Tailand'),
    P('qaymoq-orkideya', 'Qaymoq orkideya', 'Gavayi', '70-lar', 'L', 56, 73, 47, 25, 'B', 265000, 'Oq', '100% viskoza', 'Gavayi', { flaw: 'Yelka choki yonida yengil rang oʻzgarishi bor.', sold: true }),

    P('garb-denimi', 'Gʻarb denimi', 'Denim', '80-lar', 'L', 57, 75, 48, 64, 'A', 285000, 'Koʻk', '100% paxta denim', 'AQSh', { batch: true }),
    P('och-chambray', 'Och chambray', 'Denim', '90-lar', 'M', 53, 72, 46, 62, 'A', 175000, 'Koʻk', '100% paxta chambray', 'Yaponiya'),
    P('toq-denim', 'Toʻq denim', 'Denim', '2000-lar', 'XL', 61, 77, 51, 65, 'B', 225000, 'Koʻk', 'Paxta denim', 'Italiya', { flaw: 'Oʻng tirsagida yengil ishqalanish bor.' }),
    P('qora-denim', 'Qora denim', 'Denim', '90-lar', 'M', 55, 73, 47, 62, 'C', 130000, 'Qora', '100% paxta denim', 'AQSh', { flaw: 'Rangi yuvilib ochargan, yoqa uchi yeyilgan.' }),

    P('oq-oksford', 'Oq oksford', 'Klassik', '90-lar', 'M', 54, 74, 46, 62, 'A', 120000, 'Oq', '100% paxta oksford', 'Angliya'),
    P('moviy-chiziqli', 'Moviy chiziqli', 'Klassik', '80-lar', 'L', 57, 76, 48, 64, 'B', 110000, 'Koʻk', 'Paxta poplin', 'Italiya', { flaw: 'Manjetida kichik sargʻish dogʻ bor.' }),
    P('pushti-katakcha', 'Pushti katakcha', 'Klassik', '2000-lar', 'S', 50, 70, 43, 60, 'A', 115000, 'Pushti', '100% paxta', 'Turkiya', { batch: true }),
    P('jigarrang-vilvet', 'Jigarrang vilvet', 'Klassik', '70-lar', 'L', 58, 75, 49, 63, 'B', 245000, 'Jigarrang', 'Paxta vilvet', 'Fransiya', { flaw: 'Tirsak qismi biroz silliqlangan.' }),
    P('qaymoq-chiziqli', 'Qaymoq chiziqli', 'Klassik', '70-lar', 'M', 52, 71, 45, 61, 'C', 95000, 'Oq', 'Paxta va poliester', 'Italiya', { flaw: 'Yoqa uchi yeyilgan, bitta tugma almashtirilgan.', sold: true }),

    P('qora-qizil-bouling', 'Qora-qizil bouling', 'Bouling', '90-lar', 'L', 59, 73, 50, 25, 'A', 275000, 'Qora', 'Viskoza gabardin', 'AQSh', { batch: true }),
    P('moviy-qaymoq-bouling', 'Moviy-qaymoq bouling', 'Bouling', '80-lar', 'M', 54, 71, 46, 24, 'B', 255000, 'Koʻk', 'Poliester gabardin', 'AQSh', { flaw: 'Orqa tomonida bosma izi yoʻqolgan joy bor.' }),
    P('alangali-bouling', 'Alangali bouling', 'Bouling', '2000-lar', 'XL', 62, 75, 52, 26, 'A', 295000, 'Qora', '100% poliester', 'Xitoy', { batch: true }),

    P('halqa-naqshli', 'Halqa naqshli', 'Retro', '70-lar', 'M', 53, 72, 45, 62, 'B', 275000, 'Sariq', '100% poliester', 'Fransiya', { flaw: 'Oʻng manjetida kichik tortilgan ip bor.' }),
    P('memfis-naqshli', 'Memfis naqshli', 'Retro', '90-lar', 'L', 57, 74, 48, 25, 'A', 205000, 'Yashil', 'Viskoza', 'Italiya', { batch: true }),
    P('paysli', 'Paysli', 'Retro', '70-lar', 'L', 55, 73, 47, 62, 'B', 255000, 'Jigarrang', '100% poliester', 'Angliya', { flaw: 'Yoqa ostida yengil dogʻ izi bor.' }),
    P('kabana-chiziqli', 'Kabana chiziqli', 'Retro', '70-lar', 'XL', 60, 73, 51, 26, 'A', 225000, 'Qizil', 'Paxta', 'Italiya', { batch: true }),
    P('nuqtali-viskoza', 'Nuqtali viskoza', 'Retro', '80-lar', 'S', 49, 68, 42, 23, 'A', 165000, 'Qora', '100% viskoza', 'Yaponiya', { batch: true }),
    P('pushti-nuqtali', 'Pushti nuqtali', 'Retro', '80-lar', 'M', 52, 70, 45, 24, 'B', 145000, 'Pushti', 'Viskoza', 'Italiya', { flaw: 'Pastki chokida kichik tikilgan joy bor.', sold: true }),
  ];

  C.byId = id => C.products.find(p => p.id === id);
  C.photo = (p, view) => `assets/shirts/${p.id}-${view}.webp`;

  C.conditions = {
    A: { name: 'Deyarli yangi', text: 'Koʻzga tashlanadigan izi yoʻq, rangi va matosi toza.' },
    B: { name: 'Yengil izlar bor', text: 'Kiyilgani seziladi, kichik izlari suratda koʻrsatilgan.' },
    C: { name: 'Nuqsoni bor', text: 'Nuqsoni aniq yozilgan va suratga olingan, narxi shunga yarasha.' },
  };

  C.groups = {
    tur: { label: 'Tur', options: ['Flanel', 'Gavayi', 'Denim', 'Klassik', 'Bouling', 'Retro'].map(v => ({ key: v, label: v, test: p => p.type === v })) },
    kokrak: { label: 'Koʻkrak kengligi', options: [[48, 51], [52, 55], [56, 59], [60, 99]].map(([a, b]) => ({ key: `${a}-${b}`, label: b === 99 ? `${a}+ sm` : `${a}–${b} sm`, test: p => p.chest >= a && p.chest <= b })) },
    davr: { label: 'Davr', options: ['70-lar', '80-lar', '90-lar', '2000-lar'].map(v => ({ key: v, label: v, test: p => p.era === v })) },
    holat: { label: 'Holat', options: ['A', 'B', 'C'].map(v => ({ key: v, label: `${v} · ${C.conditions[v].name}`, test: p => p.cond === v })) },
    rang: { label: 'Rang', options: ['Qizil', 'Koʻk', 'Yashil', 'Sariq', 'Pushti', 'Jigarrang', 'Qora', 'Oq'].map(v => ({ key: v, label: v, test: p => p.color === v })) },
    narx: { label: 'Narx', options: [[0, 149999, '150 mingacha'], [150000, 219999, '150–220 ming'], [220000, 9999999, '220 mingdan yuqori']].map(([a, b, label]) => ({ key: `${a}-${b}`, label, test: p => p.price >= a && p.price <= b })) },
    yeng: { label: 'Yeng', options: [{ key: 'kalta', label: 'Kalta', test: p => p.sleeve < 40 }, { key: 'uzun', label: 'Uzun', test: p => p.sleeve >= 40 }] },
  };

  C.delivery = {
    kuryer: { label: 'Toshkent boʻylab kuryer', note: 'Ertasi kuni', fee: 25000, address: true },
    pochta: { label: 'Viloyatlarga pochta', note: '2–4 kun', fee: 35000, address: true },
    olish: { label: 'Oʻzim olib ketaman', note: 'Toshkent, doʻkondan', fee: 0, address: false },
  };
  C.payment = { click: 'Click', payme: 'Payme', naqd: 'Qabul qilganda naqd' };
})(window.Caqmoq = window.Caqmoq || {});
