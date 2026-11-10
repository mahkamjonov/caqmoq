// Demo uchun koʻylak rasmlarini chizadi: har biriga old, orqa, yorliq va yaqin plan.
// Ishga tushirish: node tools/shirts.mjs <svg_papka>, keyin python tools/rasterize.py <svg_papka> assets/shirts
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), 'svg');
mkdirSync(OUT, { recursive: true });

const BG = '#E7DEC9';
const SEAM = 'rgba(20,16,10,.38)';

// ---------- matolar: har biri userSpaceOnUse pattern ichki qismi ----------
const fabrics = {
  plaid: ({ base, a, b, line, t = 132 }) => ({ t, svg: `
    <rect width="${t}" height="${t}" fill="${base}"/>
    <rect width="${t / 2}" height="${t}" fill="${a}" opacity=".62"/>
    <rect width="${t}" height="${t / 2}" fill="${a}" opacity=".62"/>
    <rect x="${t * .68}" width="${t * .14}" height="${t}" fill="${b}" opacity=".55"/>
    <rect y="${t * .68}" width="${t}" height="${t * .14}" fill="${b}" opacity=".55"/>
    <rect x="${t * .22}" width="3" height="${t}" fill="${line}" opacity=".8"/>
    <rect y="${t * .22}" width="${t}" height="3" fill="${line}" opacity=".8"/>` }),
  gingham: ({ base, a, t = 44 }) => ({ t, svg: `
    <rect width="${t}" height="${t}" fill="${base}"/>
    <rect width="${t / 2}" height="${t}" fill="${a}" opacity=".55"/>
    <rect width="${t}" height="${t / 2}" fill="${a}" opacity=".55"/>` }),
  stripes: ({ base, a, w = 8, t = 26 }) => ({ t, svg: `
    <rect width="${t}" height="${t}" fill="${base}"/>
    <rect width="${w}" height="${t}" fill="${a}"/>` }),
  cabana: ({ base, a, b, t = 150 }) => ({ t, svg: `
    <rect width="${t}" height="${t}" fill="${base}"/>
    <rect width="${t * .34}" height="${t}" fill="${a}"/>
    <rect x="${t * .44}" width="${t * .08}" height="${t}" fill="${b}"/>
    <rect x="${t * .6}" width="${t * .03}" height="${t}" fill="${a}"/>
    <rect x="${t * .68}" width="${t * .03}" height="${t}" fill="${a}"/>` }),
  dots: ({ base, a, r = 11, t = 60 }) => ({ t, svg: `
    <rect width="${t}" height="${t}" fill="${base}"/>
    <circle cx="${t * .25}" cy="${t * .25}" r="${r}" fill="${a}"/>
    <circle cx="${t * .75}" cy="${t * .75}" r="${r}" fill="${a}"/>` }),
  oxford: ({ base, a, t = 6 }) => ({ t, svg: `
    <rect width="${t}" height="${t}" fill="${base}"/>
    <rect width="${t / 2}" height="${t / 2}" fill="${a}" opacity=".5"/>
    <rect x="${t / 2}" y="${t / 2}" width="${t / 2}" height="${t / 2}" fill="${a}" opacity=".5"/>` }),
  twill: ({ base, a, b, t = 9 }) => ({ t, svg: `
    <rect width="${t}" height="${t}" fill="${base}"/>
    <path d="M-2 ${t + 2} L${t + 2} -2 M-2 2 L2 -2 M${t - 2} ${t + 2} L${t + 2} ${t - 2}" stroke="${a}" stroke-width="2.4" opacity=".8"/>
    <path d="M-2 ${t * .5 + 2} L${t * .5 + 2} -2 M${t * .5 - 2} ${t + 2} L${t + 2} ${t * .5 - 2}" stroke="${b}" stroke-width="1" opacity=".55"/>` }),
  cord: ({ base, a, b, t = 13 }) => ({ t, svg: `
    <rect width="${t}" height="${t}" fill="${base}"/>
    <rect width="4" height="${t}" fill="${a}" opacity=".85"/>
    <rect x="7" width="3" height="${t}" fill="${b}" opacity=".5"/>` }),
  aloha: ({ base, petal, petal2, leaf, core, t = 330 }) => {
    const flower = (x, y, s, r, c) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">${[0, 72, 144, 216, 288].map(a =>
      `<path transform="rotate(${a})" d="M0 0C20-10 42-30 26-56 14-72-14-72-26-56-42-30-20-10 0 0Z" fill="${c}"/><path transform="rotate(${a})" d="M0-6Q2-30 0-52" stroke="${core}" stroke-width="2" fill="none" opacity=".55"/>`).join('')}<circle r="8" fill="${core}"/><path d="M0 0L24-26" stroke="${core}" stroke-width="4" stroke-linecap="round"/><circle cx="26" cy="-28" r="4" fill="${petal2}"/></g>`;
    const frond = (x, y, s, r) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M0 0C24-30 26-82 0-118-26-82-24-30 0 0Z" fill="${leaf}"/><path d="M0 0V-108M0-24L15-44M0-24L-15-44M0-50L17-70M0-50L-17-70M0-76L12-92M0-76L-12-92" stroke="${base}" stroke-width="2.5" fill="none"/></g>`;
    return { t, svg: `<rect width="${t}" height="${t}" fill="${base}"/>
      ${frond(190, 128, .95, 38)}${frond(52, 302, .9, -28)}${frond(300, 238, .62, 118)}
      ${flower(88, 88, 1, 12, petal)}${flower(238, 240, 1.02, -30, petal)}${flower(226, 62, .46, 0, petal2)}${flower(84, 240, .5, 40, petal2)}` };
  },
  rings: ({ base, a, b, c, t = 170 }) => {
    const r = (x, y, ca, cb, cc) => `<g transform="translate(${x} ${y})"><circle r="40" fill="${ca}"/><circle r="28" fill="${cb}"/><circle r="16" fill="${cc}"/><circle r="6" fill="${base}"/></g>`;
    return { t, svg: `<rect width="${t}" height="${t}" fill="${base}"/>${r(43, 43, a, b, c)}${r(127, 127, c, a, b)}` };
  },
  memphis: ({ base, a, b, c, d, t = 230 }) => ({ t, svg: `<rect width="${t}" height="${t}" fill="${base}"/>
    <path d="M26 66L66 22L88 74Z" fill="${a}"/>
    <path d="M128 46q12-24 24 0t24 0t24 0" stroke="${b}" stroke-width="9" fill="none" stroke-linecap="round"/>
    <circle cx="176" cy="120" r="19" fill="${c}"/><circle cx="176" cy="120" r="7" fill="${base}"/>
    <rect x="42" y="124" width="58" height="14" transform="rotate(-24 71 131)" fill="${d}"/>
    <path d="M110 192l18-22 18 22 18-22 18 22" stroke="${a}" stroke-width="8" fill="none" stroke-linejoin="round"/>
    <circle cx="36" cy="196" r="9" fill="${b}"/><circle cx="118" cy="106" r="6" fill="${d}"/>` }),
  paisley: ({ base, a, b, c, t = 210 }) => {
    const m = (x, y, r, s, ca, cb) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M2-58C42-54 52-4 18 32 0 50-40 44-40 12-40-18-6-20 2-58Z" fill="${ca}"/><path d="M0-30C20-26 26 0 8 18-2 28-22 24-22 8-22-8-4-10 0-30Z" fill="${cb}"/><circle cy="4" cx="-4" r="6" fill="${c}"/></g>`;
    return { t, svg: `<rect width="${t}" height="${t}" fill="${base}"/>${m(62, 66, 22, .95, a, b)}${m(160, 158, 200, .9, b, a)}<circle cx="162" cy="48" r="8" fill="${c}"/><circle cx="50" cy="168" r="8" fill="${c}"/>` };
  },
};

// ---------- kiyim geometriyasi ----------
const BODY = 'M330 172 L222 226 C216 300 222 362 226 420 L215 866 Q400 906 585 866 L574 420 C578 362 584 300 578 226 L470 172 Q400 214 330 172Z';
const SLEEVE = {
  short: { l: 'M224 224 L84 372 Q118 416 164 442 L228 384 Q218 300 224 224Z', r: 'M576 224 L716 372 Q682 416 636 442 L572 384 Q582 300 576 224Z', cuffL: 'M92 362 L172 432', cuffR: 'M708 362 L628 432' },
  long: { l: 'M224 224 L122 470 L60 792 Q96 816 142 820 L198 574 L228 396 Q218 300 224 224Z', r: 'M576 224 L678 470 L740 792 Q704 816 658 820 L602 574 L572 396 Q582 300 576 224Z', cuffL: 'M70 738 Q108 762 154 766', cuffR: 'M730 738 Q692 762 646 766' },
};
const COLLAR = {
  point: { l: 'M398 216 L340 160 Q320 170 310 188 L352 262Z', r: 'M402 216 L460 160 Q480 170 490 188 L448 262Z', open: 'M340 164 Q400 138 460 164 L402 214 L398 214Z', placketTop: 214 },
  camp: { l: 'M396 282 L342 160 Q312 172 292 196 L322 258 L362 250Z', r: 'M404 282 L458 160 Q488 172 508 196 L478 258 L438 250Z', open: 'M342 164 Q400 136 458 164 L402 284 L398 284Z', placketTop: 284 },
  wide: { l: 'M396 244 L342 160 Q306 172 268 214 L330 318Z', r: 'M404 244 L458 160 Q494 172 532 214 L470 318Z', open: 'M342 164 Q400 136 458 164 L402 246 L398 246Z', placketTop: 246 },
};

const stitch = (d, c = 'rgba(255,255,255,.55)', w = 2) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-dasharray="7 5"/>`;
const seam = (d, w = 2.4) => `<path d="${d}" fill="none" stroke="${SEAM}" stroke-width="${w}"/>`;

const button = (x, y, s) => s.kind === 'snap'
  ? `<circle cx="${x}" cy="${y}" r="10" fill="${s.color}" stroke="rgba(0,0,0,.45)" stroke-width="2"/><circle cx="${x}" cy="${y}" r="4.5" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="2"/>`
  : `<circle cx="${x}" cy="${y + 1.5}" r="9.5" fill="rgba(0,0,0,.28)"/><circle cx="${x}" cy="${y}" r="9" fill="${s.color}"/><circle cx="${x - 2.6}" cy="${y - 2.6}" r="1.5" fill="rgba(0,0,0,.6)"/><circle cx="${x + 2.6}" cy="${y - 2.6}" r="1.5" fill="rgba(0,0,0,.6)"/><circle cx="${x - 2.6}" cy="${y + 2.6}" r="1.5" fill="rgba(0,0,0,.6)"/><circle cx="${x + 2.6}" cy="${y + 2.6}" r="1.5" fill="rgba(0,0,0,.6)"/>`;

function defs(s) {
  const f = fabrics[s.fabric](s.colors);
  const tile = (id, rot, scale = 1, dx = 0) => `<pattern id="${id}" width="${f.t}" height="${f.t}" patternUnits="userSpaceOnUse" patternTransform="translate(${dx} 0) rotate(${rot}) scale(${scale})">${f.svg}</pattern>`;
  return `<defs>
    ${tile('body', 0)}${tile('sl', 34)}${tile('sr', -34)}${tile('coll', 40)}${tile('pock', 0, 1, 18)}${tile('zoom', 0, 2.6)}
    <clipPath id="bodyClip"><path d="${BODY}"/></clipPath>
    <filter id="soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="16"/></filter>
    <filter id="fold" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="9"/></filter>
    <pattern id="weave" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 .5H4" stroke="#000" stroke-opacity=".07"/><path d="M.5 0V4" stroke="#fff" stroke-opacity=".05"/></pattern>
    <linearGradient id="edge" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".26"/><stop offset=".13" stop-color="#000" stop-opacity="0"/><stop offset=".87" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".26"/></linearGradient>
  </defs>`;
}

function silhouette(s, sleeves) {
  return `<g opacity=".3" transform="translate(6 18)" filter="url(#soft)" fill="#20180c"><path d="${BODY}"/><path d="${sleeves.l}"/><path d="${sleeves.r}"/></g>`;
}

function folds() {
  return `<g clip-path="url(#bodyClip)" filter="url(#fold)" fill="none" stroke-linecap="round">
    <path d="M262 470 C290 560 270 680 290 820" stroke="#000" stroke-opacity=".18" stroke-width="20"/>
    <path d="M532 440 C510 560 540 690 516 830" stroke="#000" stroke-opacity=".16" stroke-width="22"/>
    <path d="M316 500 C330 610 316 720 336 810" stroke="#fff" stroke-opacity=".12" stroke-width="16"/>
    <path d="M474 500 C462 620 486 720 470 820" stroke="#fff" stroke-opacity=".1" stroke-width="16"/>
  </g>`;
}

function sleevesSvg(s, sl) {
  const shade = id => `<path d="${id}" fill="#000" opacity=".07"/>`;
  return `<path d="${sl.l}" fill="url(#sl)"/><path d="${sl.r}" fill="url(#sr)"/>${shade(sl.l)}${shade(sl.r)}
    ${seam(sl.cuffL)}${seam(sl.cuffR)}`;
}

function panels(s) {
  if (s.fabric && s.panel) {
    const c = s.panel;
    return `<g clip-path="url(#bodyClip)"><path d="M262 150 L330 150 L330 900 L262 900Z" fill="${c}"/><path d="M470 150 L538 150 L538 900 L470 900Z" fill="${c}"/></g>`;
  }
  return '';
}

function flames(s) {
  if (!s.flames) return '';
  const [a, b] = s.flames;
  const tongues = 'M200 900 L200 690 C222 640 236 700 246 740 C262 640 284 560 300 500 C318 590 322 680 344 730 C356 650 380 600 394 540 C410 620 412 690 438 736 C456 650 474 590 498 520 C512 610 520 680 548 730 C560 680 580 650 600 660 L600 900Z';
  return `<g clip-path="url(#bodyClip)"><path d="${tongues}" fill="${a}"/><path d="${tongues}" fill="${b}" transform="translate(0 92) scale(1 .9) translate(0 12)"/></g>`;
}

function yoke(s) {
  if (!s.western) return '';
  return `${seam('M226 300 Q300 322 330 290 Q362 330 400 372 Q438 330 470 290 Q500 322 574 300')}
    ${stitch('M226 308 Q300 330 332 300 Q364 340 400 382 Q436 340 468 300 Q500 330 574 308', s.thread)}`;
}

function pockets(s) {
  if (s.pocket === 'none') return '';
  const one = (x, flap) => {
    const w = 96, y = s.western ? 360 : 330, h = 104;
    const shape = `M${x} ${y} H${x + w} V${y + h - 14} L${x + w / 2} ${y + h} L${x} ${y + h - 14}Z`;
    return `<path d="${shape}" fill="url(#pock)"/><path d="${shape}" fill="#fff" opacity=".04"/>
      <path d="${shape}" fill="none" stroke="${SEAM}" stroke-width="2"/>${stitch(`M${x + 6} ${y + 8} H${x + w - 6} V${y + h - 18} L${x + w / 2} ${y + h - 6} L${x + 6} ${y + h - 18}Z`, s.thread, 1.6)}
      ${flap ? `<path d="M${x - 3} ${y - 6} H${x + w + 3} V${y + 18} L${x + w / 2} ${y + 36} L${x - 3} ${y + 18}Z" fill="url(#pock)" stroke="${SEAM}" stroke-width="2"/>${button(x + w / 2, y + 16, s.btn)}` : ''}`;
  };
  if (s.pocket === 'two') return one(250, s.western) + one(454, s.western);
  return one(454, false);
}

function collar(s, c, withLabel = true) {
  const inner = `<path d="${c.open}" fill="#1a150d" opacity=".82"/>`;
  const label = withLabel ? `<rect x="378" y="166" width="44" height="22" rx="1.5" fill="#EFE7D3"/><rect x="384" y="172" width="32" height="3" fill="#3a3326"/><rect x="390" y="179" width="20" height="3" fill="#3a3326"/>` : '';
  const f = s.collarColor || 'url(#coll)';
  return `${inner}${label}
    <path d="${c.l}" fill="${f}"/><path d="${c.r}" fill="${f}"/>
    <path d="${c.l}" fill="none" stroke="${SEAM}" stroke-width="2.4"/><path d="${c.r}" fill="none" stroke="${SEAM}" stroke-width="2.4"/>`;
}

function front(s) {
  const sl = SLEEVE[s.sleeve];
  const c = COLLAR[s.collar];
  const top = c.placketTop;
  const ys = []; const n = s.collar === 'camp' ? 5 : 6;
  const first = top + 26; const gap = (840 - first) / (n - 1);
  for (let i = 0; i < n; i++) ys.push(first + gap * i);
  return svg(`${defs(s)}${silhouette(s, sl)}
    ${sleevesSvg(s, sl)}
    <path d="${BODY}" fill="url(#body)"/>${panels(s)}${flames(s)}
    <rect x="200" y="160" width="400" height="760" fill="url(#edge)" clip-path="url(#bodyClip)"/>
    ${folds()}${yoke(s)}${pockets(s)}
    ${seam('M224 224 Q218 300 228 394')}${seam('M576 224 Q582 300 572 394')}
    <rect x="384" y="${top}" width="32" height="${880 - top}" fill="url(#body)" clip-path="url(#bodyClip)"/>
    ${seam(`M384 ${top} V884`)}${seam(`M416 ${top} V884`)}
    ${stitch(`M390 ${top + 4} V880`, s.thread, 1.5)}
    ${collar(s, c)}
    ${ys.map(y => button(400, y, s.btn)).join('')}
    <rect x="200" y="160" width="400" height="760" fill="url(#weave)" clip-path="url(#bodyClip)"/>`);
}

function back(s) {
  const sl = SLEEVE[s.sleeve];
  return svg(`${defs(s)}${silhouette(s, sl)}
    ${sleevesSvg(s, sl)}
    <path d="${BODY}" fill="url(#body)"/>${panels(s)}${flames(s)}
    <rect x="200" y="160" width="400" height="760" fill="url(#edge)" clip-path="url(#bodyClip)"/>
    ${folds()}
    <path d="M224 224 L330 172 Q400 214 470 172 L576 224 Q580 268 577 300 Q400 330 223 300 Q220 268 224 224Z" fill="url(#coll)"/>
    ${seam('M223 300 Q400 330 577 300')}${stitch('M223 308 Q400 338 577 308', s.thread, 1.5)}
    <path d="M388 318 L384 470 M412 318 L416 470" stroke="${SEAM}" stroke-width="2" fill="none"/>
    ${seam('M224 224 Q218 300 228 394')}${seam('M576 224 Q582 300 572 394')}
    <path d="M330 172 Q400 214 470 172 L478 196 Q400 244 322 196Z" fill="${s.collarColor || 'url(#sl)'}" stroke="${SEAM}" stroke-width="2.4"/>
    <rect x="200" y="160" width="400" height="760" fill="url(#weave)" clip-path="url(#bodyClip)"/>`);
}

function labelView(s, p) {
  return svg(`${defs(s)}
    <rect width="800" height="1000" fill="url(#zoom)"/>
    <rect width="800" height="1000" fill="#000" opacity=".16"/>
    <path d="M0 0 H800 V210 Q400 330 0 210Z" fill="${s.collarColor || 'url(#coll)'}"/>
    <path d="M0 210 Q400 330 800 210" fill="none" stroke="${SEAM}" stroke-width="5"/>
    ${stitch('M0 228 Q400 348 800 228', 'rgba(255,255,255,.7)', 3)}
    <g transform="translate(400 500) rotate(-1.5)">
      <rect x="-186" y="-156" width="378" height="330" fill="#000" opacity=".28" transform="translate(6 10)"/>
      <rect x="-190" y="-160" width="380" height="330" fill="#F1E9D6"/>
      <rect x="-174" y="-144" width="348" height="298" fill="none" stroke="#3a3326" stroke-width="2"/>
      <text x="0" y="-46" font-family="Georgia, 'Times New Roman', serif" font-size="92" font-weight="700" fill="#2a2418" text-anchor="middle">${p.size}</text>
      <text x="0" y="22" font-family="'Courier New', monospace" font-size="29" font-weight="700" fill="#2a2418" text-anchor="middle">${esc(p.fabricLabel)}</text>
      <text x="0" y="66" font-family="'Courier New', monospace" font-size="27" fill="#2a2418" text-anchor="middle">${esc(p.originLabel)}</text>
      <path d="M-70 112 h36 l-6 26 h-24z M-14 138 l18-30 18 30z M50 108 h28 v28 h-28z" fill="none" stroke="#2a2418" stroke-width="3"/>
    </g>
    <rect width="800" height="1000" fill="url(#weave)"/>`);
}

function detailView(s, p) {
  const flawed = Boolean(p.flaw);
  const mark = flawed ? `<g>
      <path d="M404 470c34-18 78-8 90 24s-8 66-44 74-74-4-84-34 6-50 38-64z" fill="#3e2a12" opacity=".34"/>
      <circle cx="430" cy="520" r="128" fill="none" stroke="#C92421" stroke-width="7" stroke-dasharray="20 13"/>
    </g>` : `<g>
      <rect x="296" y="0" width="208" height="1000" fill="url(#zoom)"/><rect x="296" y="0" width="208" height="1000" fill="#000" opacity=".06"/>
      <path d="M296 0V1000M504 0V1000" stroke="${SEAM}" stroke-width="5"/>${stitch('M322 0V1000', s.thread, 3.5)}${stitch('M478 0V1000', s.thread, 3.5)}
      <g transform="translate(400 300) scale(5)">${button(0, 0, s.btn)}</g><g transform="translate(400 800) scale(5)">${button(0, 0, s.btn)}</g>
    </g>`;
  return svg(`${defs(s)}<rect width="800" height="1000" fill="url(#zoom)"/>${mark}
    <rect width="800" height="1000" fill="url(#weave)"/>`);
}

const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/ʻ/g, "'");
const svg = inner => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000"><rect width="800" height="1000" fill="${BG}"/>${inner}</svg>\n`;

// ---------- koʻylaklar ----------
const PEARL = { color: '#EDE7D8' }; const WOOD = { color: '#7A5230' }; const INK = { color: '#22201b' };
const SNAP = { kind: 'snap', color: '#C9C2B2' }; const CREAM = { color: '#D9CDB0' };

const shirts = {
  'qizil-katak-flanel': { fabric: 'plaid', colors: { base: '#B62A22', a: '#1C1512', b: '#D9CFBA', line: '#E7C24A' }, sleeve: 'long', collar: 'point', pocket: 'two', btn: WOOD, thread: 'rgba(255,240,210,.5)' },
  'yashil-tartan-flanel': { fabric: 'plaid', colors: { base: '#2E5A3C', a: '#14233F', b: '#C8B25A', line: '#D9CFBA', t: 110 }, sleeve: 'long', collar: 'point', pocket: 'two', btn: CREAM, thread: 'rgba(255,240,210,.45)' },
  'asal-rang-flanel': { fabric: 'plaid', colors: { base: '#C98F26', a: '#5A3414', b: '#EADBB0', line: '#2C1B0C', t: 120 }, sleeve: 'long', collar: 'point', pocket: 'two', btn: WOOD, thread: 'rgba(255,240,210,.5)' },
  'dengiz-kok-flanel': { fabric: 'plaid', colors: { base: '#2C5C92', a: '#10203C', b: '#C5D2DE', line: '#E8E2D2', t: 96 }, sleeve: 'long', collar: 'point', pocket: 'one', btn: PEARL, thread: 'rgba(255,255,255,.45)' },
  'qora-oq-flanel': { fabric: 'plaid', colors: { base: '#D9D3C4', a: '#191714', b: '#6E6A60', line: '#191714', t: 140 }, sleeve: 'long', collar: 'point', pocket: 'two', btn: INK, thread: 'rgba(255,255,255,.4)' },

  'moviy-gibiskus': { fabric: 'aloha', colors: { base: '#1560A0', petal: '#F3D21E', petal2: '#F6F0E2', leaf: '#0B3F70', core: '#C92421' }, sleeve: 'short', collar: 'camp', pocket: 'one', btn: PEARL, thread: 'rgba(255,255,255,.4)' },
  'qizil-palma': { fabric: 'aloha', colors: { base: '#A9231E', petal: '#F2E7CF', petal2: '#F3B51E', leaf: '#6E1511', core: '#2A1A0E', t: 300 }, sleeve: 'short', collar: 'camp', pocket: 'one', btn: WOOD, thread: 'rgba(255,240,210,.4)' },
  'yashil-tropik': { fabric: 'aloha', colors: { base: '#17614E', petal: '#EE7F4B', petal2: '#F4E2B5', leaf: '#0C4032', core: '#3A1C0E', t: 340 }, sleeve: 'short', collar: 'camp', pocket: 'one', btn: CREAM, thread: 'rgba(255,255,255,.35)' },
  'qora-gibiskus': { fabric: 'aloha', colors: { base: '#191815', petal: '#D9352C', petal2: '#EFD309', leaf: '#2F3A2C', core: '#EFD309', t: 320 }, sleeve: 'short', collar: 'camp', pocket: 'one', btn: INK, thread: 'rgba(255,255,255,.3)' },
  'qaymoq-orkideya': { fabric: 'aloha', colors: { base: '#EFE4C8', petal: '#C8577E', petal2: '#E59A3C', leaf: '#6F8B58', core: '#5A1E33', t: 310 }, sleeve: 'short', collar: 'camp', pocket: 'one', btn: WOOD, thread: 'rgba(60,40,20,.35)' },

  'garb-denimi': { fabric: 'twill', colors: { base: '#2D4F78', a: '#3F6792', b: '#1D3656' }, sleeve: 'long', collar: 'point', pocket: 'two', btn: SNAP, thread: 'rgba(233,178,74,.9)', western: true },
  'och-chambray': { fabric: 'twill', colors: { base: '#8FAECB', a: '#A9C3DA', b: '#6F90AF' }, sleeve: 'long', collar: 'point', pocket: 'two', btn: PEARL, thread: 'rgba(255,255,255,.75)' },
  'toq-denim': { fabric: 'twill', colors: { base: '#1E3350', a: '#2C4567', b: '#122238' }, sleeve: 'long', collar: 'point', pocket: 'two', btn: SNAP, thread: 'rgba(233,178,74,.85)', western: true },
  'qora-denim': { fabric: 'twill', colors: { base: '#2B2B2C', a: '#3D3D3E', b: '#1B1B1C' }, sleeve: 'long', collar: 'point', pocket: 'two', btn: INK, thread: 'rgba(200,200,190,.5)' },

  'oq-oksford': { fabric: 'oxford', colors: { base: '#F2EEE2', a: '#DAD6CB' }, sleeve: 'long', collar: 'point', pocket: 'one', btn: PEARL, thread: 'rgba(90,80,60,.35)' },
  'moviy-chiziqli': { fabric: 'stripes', colors: { base: '#EEF0EC', a: '#3D73AE', w: 7, t: 20 }, sleeve: 'long', collar: 'point', pocket: 'one', btn: PEARL, thread: 'rgba(40,70,110,.35)' },
  'pushti-katakcha': { fabric: 'gingham', colors: { base: '#F4EDE2', a: '#D66B8C' }, sleeve: 'long', collar: 'point', pocket: 'one', btn: PEARL, thread: 'rgba(120,50,70,.3)' },
  'jigarrang-vilvet': { fabric: 'cord', colors: { base: '#6C4423', a: '#4F2F16', b: '#8A5B33' }, sleeve: 'long', collar: 'wide', pocket: 'two', btn: WOOD, thread: 'rgba(240,210,160,.5)' },
  'qaymoq-chiziqli': { fabric: 'stripes', colors: { base: '#EEE3C7', a: '#B9783A', w: 4, t: 18 }, sleeve: 'long', collar: 'wide', pocket: 'none', btn: WOOD, thread: 'rgba(100,60,20,.35)' },

  'qora-qizil-bouling': { fabric: 'oxford', colors: { base: '#1B1A18', a: '#28261F' }, panel: '#B8251F', collarColor: '#B8251F', sleeve: 'short', collar: 'camp', pocket: 'one', btn: PEARL, thread: 'rgba(255,255,255,.4)' },
  'moviy-qaymoq-bouling': { fabric: 'oxford', colors: { base: '#EFE4C8', a: '#E3D7B8' }, panel: '#1F6FB2', collarColor: '#1F6FB2', sleeve: 'short', collar: 'camp', pocket: 'one', btn: INK, thread: 'rgba(40,40,40,.35)' },
  'alangali-bouling': { fabric: 'oxford', colors: { base: '#191815', a: '#23211D' }, flames: ['#D9352C', '#EFA51E'], collarColor: '#D9352C', sleeve: 'short', collar: 'camp', pocket: 'none', btn: INK, thread: 'rgba(255,255,255,.35)' },

  'halqa-naqshli': { fabric: 'rings', colors: { base: '#E8C84A', a: '#A8481C', b: '#F2E7CF', c: '#3B5A3A' }, sleeve: 'long', collar: 'wide', pocket: 'none', btn: WOOD, thread: 'rgba(80,40,10,.35)' },
  'memfis-naqshli': { fabric: 'memphis', colors: { base: '#129488', a: '#F3D21E', b: '#F6F0E2', c: '#E2455F', d: '#1C1B18' }, sleeve: 'short', collar: 'camp', pocket: 'one', btn: INK, thread: 'rgba(255,255,255,.4)' },
  'paysli': { fabric: 'paisley', colors: { base: '#5B2E17', a: '#C97B2C', b: '#E8D29A', c: '#2F6A68' }, sleeve: 'long', collar: 'wide', pocket: 'none', btn: CREAM, thread: 'rgba(240,210,160,.4)' },
  'kabana-chiziqli': { fabric: 'cabana', colors: { base: '#F1E7CF', a: '#C23A2A', b: '#1F5E8C' }, sleeve: 'short', collar: 'camp', pocket: 'one', btn: WOOD, thread: 'rgba(60,40,20,.35)' },
  'nuqtali-viskoza': { fabric: 'dots', colors: { base: '#1A1917', a: '#EFE7D3', r: 8, t: 46 }, sleeve: 'short', collar: 'point', pocket: 'none', btn: PEARL, thread: 'rgba(255,255,255,.3)' },
  'pushti-nuqtali': { fabric: 'dots', colors: { base: '#E58BA4', a: '#F6F0E2', r: 10, t: 54 }, sleeve: 'short', collar: 'point', pocket: 'none', btn: PEARL, thread: 'rgba(255,255,255,.5)' },
};

// data.js bilan bir xil yorliq maʼlumoti
globalThis.window = globalThis;
await import(new URL('../js/data.js', import.meta.url));
const products = globalThis.Caqmoq.products;

let bytes = 0;
for (const p of products) {
  const s = shirts[p.id];
  if (!s) throw new Error(`Rasm taʼrifi yoʻq: ${p.id}`);
  const meta = { size: p.size, flaw: p.flaw, fabricLabel: p.fabric.toUpperCase().slice(0, 22), originLabel: p.origin.toUpperCase() };
  const files = { front: front(s), back: back(s), label: labelView(s, meta), detail: detailView(s, meta) };
  for (const [view, content] of Object.entries(files)) {
    writeFileSync(join(OUT, `${p.id}-${view}.svg`), content);
    bytes += content.length;
  }
}
console.log(`${products.length} ta koʻylak, ${products.length * 4} ta rasm, ${(bytes / 1024).toFixed(0)} KB`);
