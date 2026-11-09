// Hind.ee (Igaunija) plūsmas pārbaudes: node test/test-hindee.mjs
import assert from 'node:assert/strict';
import { buildItems, toHindeeXml, CONFIG } from '../feed-core.mjs';
import { normalizeEe } from '../generate.mjs';

let n = 1;
const v = (o) => ({ id: `gid://shopify/ProductVariant/${8000 + n++}`, title: 'Default Title', price: 1, compareAtPrice: null, available: true,
  qty: 10, tracked: true, requiresShipping: true, grams: 100, image: '', barcode: '', categoryPath: [], ...o });
const p = (o) => ({ title: 'X', handle: `e${n++}`, productType: 'Audums', vendor: 'KJ', tags: [], isGiftCard: false, onlineStore: true,
  image: 'https://cdn.example/x.jpg', collections: [], description: 'Apraksts.', variants: [v({})], ...o });
const vid = (prod, i = 0) => Number(prod.variants[i].id.split('/').pop());

// Latvijas (Admin API) dati
const melns = p({ title: '100 % kokvilnas audums – melns', handle: 'kokvilnas-audums-melns', tags: ['decimal'],
  variants: [v({ price: 0.39, qty: 235, grams: 20 })] });
const mazs = p({ title: 'Audums 0,9 m', handle: 'mazs', tags: ['decimal'], variants: [v({ price: 0.5, qty: 9 })] });
const gabals = p({ title: 'Samts – purpursarkans – pēdējais gabaliņš 75cm', handle: 'samts', variants: [v({ price: 6.5, qty: 1 })] });
const drops = p({ title: 'Dzijas DROPS Air', handle: 'drops-air', productType: 'Dzija',
  variants: [v({ title: 'rozā', price: 5.3, qty: 4, barcode: '5901234123457' }), v({ title: 'zaļš', price: 5.3, qty: 3 })] });
const manekens = p({ title: 'Manekens', handle: 'manekens', productType: 'COURIER_ONLY', variants: [v({ price: 179.9, qty: 2, grams: 4500 })] });
const smags = p({ title: 'Smags audums', handle: 'smags', tags: ['decimal'], variants: [v({ price: 1.5, qty: 30, grams: 350 })] }); // 350 g par 0,1 m = 3,5 kg par 1 m
const loti = p({ title: 'Ļoti smags audums', handle: 'loti', tags: ['decimal'], variants: [v({ price: 2, qty: 30, grams: 3500 })] }); // 35 kg par 1 m
const defekts = p({ title: 'Trikotāža ar defektu', handle: 'def', tags: ['decimal'], variants: [v({ price: 0.79, qty: 50 })] });
const navEe = p({ title: 'Tikai Latvijā', handle: 'tikai-lv' });
const latviski = p({ title: 'Lentīte', handle: 'lentite', productType: 'Lentes', variants: [v({ price: 0.8, qty: 5 })] });
// Kategorija precei bez Shopify tipa: no citām precēm ar to pašu LV kategoriju (≥ 5, ≥ 60 %)
const kp = ['Audumi', 'Kokvilnas audumi'];
const kokv = [1, 2, 3, 4, 5].map((i) => p({ title: `Kokvilna ${i}`, handle: `kokv-${i}`, variants: [v({ price: 3, qty: 2, categoryPath: kp })] }));
const bezTipa = p({ title: 'Kokvilna bez tipa', handle: 'bez-tipa', productType: '', variants: [v({ price: 3, qty: 2, categoryPath: kp })] });
const vienreiz = p({ title: 'Reta lieta', handle: 'reta', productType: '', variants: [v({ price: 3, qty: 2, categoryPath: ['Retums'] })] });
const products = [melns, mazs, gabals, drops, manekens, smags, loti, defekts, navEe, latviski, ...kokv, bezTipa, vienreiz];

// Igaunijas veikala /products.json (igauņu teksti, Igaunijas cenas ar 24 % PVN)
const eeJson = [
  { title: '100% puuvillane kangas – must', handle: 'puuvillane-kangas-must', product_type: 'Kangas', body_html: '<p>Puuvillane&nbsp;kangas &amp; <b>pehme</b></p>',
    variants: [{ id: vid(melns), title: 'Default Title', price: '0.40' }] },
  { title: 'Kangas 0,9 m', handle: 'kangas-09', product_type: 'Kangas', variants: [{ id: vid(mazs), title: 'Default Title', price: '0.51' }] },
  { title: 'Samet – purpurpunane toon – viimane tükk 75cm', handle: 'samet', product_type: 'Kangas', variants: [{ id: vid(gabals), title: 'Default Title', price: '6.66' }] },
  { title: 'Lõng DROPS Air', handle: 'long-drops-air', product_type: 'Lõng', body_html: 'Lõng',
    variants: [{ id: vid(drops, 0), title: 'Roosa', price: '5.43' }, { id: vid(drops, 1), title: 'Roheline', price: '5.43' }] },
  { title: 'Mannekeen', handle: 'mannekeen', product_type: 'AINULT_KULLER', variants: [{ id: vid(manekens), title: 'Default Title', price: '184.36' }] },
  { title: 'Raske kangas', handle: 'raske', product_type: 'Kangas', variants: [{ id: vid(smags), title: 'Default Title', price: '1.54' }] },
  { title: 'Väga raske kangas', handle: 'vaga-raske', product_type: 'Kangas', variants: [{ id: vid(loti), title: 'Default Title', price: '2.05' }] },
  { title: 'Trikoo defektiga', handle: 'trikoo', product_type: 'Kangas', variants: [{ id: vid(defekts), title: 'Default Title', price: '0.81' }] },
  { title: 'Lentīte', handle: 'lentite', product_type: 'Paelad', variants: [{ id: vid(latviski), title: 'Default Title', price: '0.82' }] },
  ...kokv.map((k, i) => ({ title: `Puuvill ${i}`, handle: `puuvill-${i}`, product_type: 'Kangas', variants: [{ id: vid(k), title: 'Default Title', price: '3.07' }] })),
  { title: 'Puuvill ilma tüübita', handle: 'ilma-tuubita', product_type: '', variants: [{ id: vid(bezTipa), title: 'Default Title', price: '3.07' }] },
  { title: 'Haruldane asi', handle: 'haruldane', product_type: '', variants: [{ id: vid(vienreiz), title: 'Default Title', price: '3.07' }] },
];

const { items } = buildItems(products, CONFIG);
const ee = normalizeEe(eeJson);
const { xml, stats } = toHindeeXml(items, ee, CONFIG);

// Struktūra kā Hind.ee oficiālajā paraugā (hind.ee/xml/example.xml – tāds pats kā Kaina24)
assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<products>\n<product id="'));
assert.ok(xml.endsWith('</products>\n'));
const rows = [...xml.matchAll(/<product id="(\d+)">([\s\S]*?)<\/product>/g)].map((m) => {
  const body = m[2];
  const val = (t) => { const x = body.match(new RegExp(`<${t}>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([^<]*))</${t}>`)); return x ? (x[1] ?? x[2]) : undefined; };
  const del = (t) => { const x = body.match(new RegExp(`<${t}><working_days>([^<]*)</working_days><price>([^<]*)</price></${t}>`)); return x ? { days: x[1], price: x[2] } : undefined; };
  return { id: m[1], body, val, del, link: val('product_url'), name: val('title') };
});
const by = (h) => rows.find((r) => r.link.endsWith(`/products/${h}`) || r.link.includes(`/products/${h}?`));
for (const r of rows) {
  for (const t of ['product_id', 'title', 'price', 'condition', 'image_url', 'product_url', 'category_name']) assert.ok(r.val(t), `${t} obligāts (${r.id})`);
  assert.equal(r.val('product_id'), r.id); assert.equal(r.val('condition'), 'new');
}
// Metrā tirgotās: Igaunijas cena × 10 (nevis LV cena), atlikums metros, "(hind 1 m kohta)"
const must = by('puuvillane-kangas-must');
assert.equal(must.val('price'), '4.00', 'EE cena 0,40 € par 0,1 m → 4,00 € par 1 m');
assert.equal(must.name, '100% puuvillane kangas – must (hind 1 m kohta)');
assert.equal(must.val('stock'), '23');
assert.equal(must.link, 'https://sharlottekangad.ee/products/puuvillane-kangas-must');
assert.equal(must.val('category_name'), 'Kangas');
assert.equal(must.val('description'), 'Puuvillane kangas & pehme');
assert.equal(must.id, String(vid(melns)));
// Zem 1 m – nerāda (buildItems), defekti – nerāda, nav Igaunijas veikalā – nerāda
assert.equal(by('kangas-09'), undefined);
assert.equal(by('trikoo'), undefined); assert.equal(stats.skipped['ar defektu / demo / lietota'], 1);
assert.equal(stats.skipped['nav Igaunijas veikalā'], 1);
// "viimane tükk 75cm" → "tükk 75 cm"
assert.equal(by('samet').name, 'Samet – purpurpunane toon – tükk 75 cm');
// Varianti: igauņu varianta nosaukums, ?variant=, EAN, zīmols
const roosa = rows.find((r) => r.name === 'Lõng DROPS Air – Roosa');
assert.ok(roosa); assert.equal(roosa.link, `https://sharlottekangad.ee/products/long-drops-air?variant=${vid(drops, 0)}`);
assert.equal(roosa.val('price'), '5.43'); assert.equal(roosa.val('ean_code'), '5901234123457'); assert.equal(roosa.val('manufacturer'), 'DROPS');
// Piegāde uz Igauniju: kuller 15,90; pakiautomaat (lētākais, Omniva) 5,99 – ne "tikai kurjers" un ne > 30 kg; 5 darba dienas
assert.deepEqual(must.del('home_delivery'), { days: '5', price: '15.90' });
assert.deepEqual(must.del('parcel_locker_delivery'), { days: '5', price: '5.99' });
const mk = by('mannekeen');
assert.deepEqual(mk.del('home_delivery'), { days: '5', price: '15.90' }); assert.equal(mk.del('parcel_locker_delivery'), undefined);
assert.equal(mk.val('category_name'), CONFIG.hindee.defaultCategory, 'tehnisks tips – vispārīgā kategorija');
assert.deepEqual(by('raske').del('parcel_locker_delivery'), { days: '5', price: '5.99' }, '3,5 kg – pakiautomaat līdz 30 kg');
assert.equal(by('vaga-raske').del('parcel_locker_delivery'), undefined, '35 kg – tikai kuller');
assert.ok(!xml.includes('store_pickup'), 'saņemšana Cēsīs Igaunijas pircējiem netiek piedāvāta');
// Kategorija: bez tipa – pēc LV kategorijas; citādi vispārīgā
assert.equal(by('ilma-tuubita').val('category_name'), 'Kangas'); assert.equal(by('haruldane').val('category_name'), CONFIG.hindee.defaultCategory);
assert.equal(stats.categoryFromLv, 1); assert.equal(stats.defaultCategory, 2);
// Nosaukums, kas sakrīt ar LV, tiek uzskaitīts (drošības pārbaudei)
assert.equal(stats.sameNameAsLv, 1);
// Visas saites – Igaunijas domēns, unikālas; cenas formātā 0.00
assert.ok(rows.every((r) => r.link.startsWith('https://sharlottekangad.ee/products/')));
assert.equal(new Set(rows.map((r) => r.link)).size, rows.length);
assert.ok(rows.every((r) => /^\d+\.\d{2}$/.test(r.val('price'))));
assert.equal(stats.items, rows.length); assert.equal(stats.decimal, 3);
console.log('Hind.ee pārbaudes izietas:', JSON.stringify(stats));
