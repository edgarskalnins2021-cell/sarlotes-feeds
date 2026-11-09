// Kaina24.lt (Lietuva) plūsmas pārbaudes: node test/test-kaina24.mjs
import assert from 'node:assert/strict';
import { buildItems, toKaina24Xml, CONFIG } from '../feed-core.mjs';
import { normalizeStore } from '../generate.mjs';

let n = 1;
const v = (o) => ({ id: `gid://shopify/ProductVariant/${6000 + n++}`, title: 'Default Title', price: 1, compareAtPrice: null, available: true,
  qty: 10, tracked: true, requiresShipping: true, grams: 100, image: 'https://cdn.example/v.jpg', barcode: '', categoryPath: [], ...o });
const p = (o) => ({ title: 'X', handle: `l${n++}`, productType: 'Audums', vendor: 'KJ', tags: [], isGiftCard: false, onlineStore: true,
  image: 'https://cdn.example/x.jpg', collections: [], description: 'Apraksts.', variants: [v({})], ...o });
const vid = (prod, i = 0) => Number(prod.variants[i].id.split('/').pop());

const melns = p({ title: '100 % kokvilnas audums – melns', tags: ['decimal'], variants: [v({ price: 0.39, qty: 235, grams: 20 })] });
const mazs = p({ title: 'Audums 0,9 m', tags: ['decimal'], variants: [v({ price: 0.5, qty: 9 })] });
const gabals = p({ title: 'Samts – pēdējais gabaliņš 75cm', variants: [v({ price: 6.5, qty: 1 })] });
const drops = p({ title: 'Dzijas DROPS Air', productType: 'Dzija',
  variants: [v({ title: 'rozā', price: 5.3, qty: 4, barcode: '5901234123457' }), v({ title: 'zaļš', price: 5.3, qty: 3 })] });
const manekens = p({ title: 'Manekens', productType: 'COURIER_ONLY', variants: [v({ price: 179.9, qty: 2, grams: 4500 })] });
const bezTipa = p({ title: 'Lieta bez tipa', productType: '', variants: [v({ price: 2, qty: 3, categoryPath: ['Retums'] })] });
const xmlZimes = p({ title: 'Šķēres "A&B"', productType: 'Šķēres', variants: [v({ price: 9.9, qty: 2 })] });
const products = [melns, mazs, gabals, drops, manekens, bezTipa, xmlZimes];

const ltJson = [
  { title: '100 % medvilninis audinys – juodas', handle: 'medvilninis-audinys-juodas', product_type: 'Audinys', body_html: '<p>Medvilnė &amp; <b>minkšta</b> ]]> testas</p>',
    variants: [{ id: vid(melns), title: 'Default Title', price: '0.39' }] },
  { title: 'Audinys 0,9 m', handle: 'audinys-09', product_type: 'Audinys', variants: [{ id: vid(mazs), title: 'Default Title', price: '0.50' }] },
  { title: 'Aksomas – paskutinis gabalėlis 75cm', handle: 'aksomas', product_type: 'Audinys', variants: [{ id: vid(gabals), title: 'Default Title', price: '6.50' }] },
  { title: 'DROPS Air siūlai', handle: 'drops-air-siulai', product_type: 'Mezgimo siūlai',
    variants: [{ id: vid(drops, 0), title: 'Rožinė', price: '5.30' }, { id: vid(drops, 1), title: 'Žalia', price: '5.30' }] },
  { title: 'Manekenas', handle: 'manekenas', product_type: 'TIK_KURJERIU', variants: [{ id: vid(manekens), title: 'Default Title', price: '179.90' }] },
  { title: 'Daiktas be tipo', handle: 'be-tipo', product_type: '', variants: [{ id: vid(bezTipa), title: 'Default Title', price: '2.00' }] },
  { title: 'Žirklės "A&B" <20 cm>', handle: 'zirkles', product_type: 'Žirklės', variants: [{ id: vid(xmlZimes), title: 'Default Title', price: '9.90' }] },
];

const { items } = buildItems(products, CONFIG);
const { xml, stats } = toKaina24Xml(items, normalizeStore(ltJson), CONFIG);

// Struktūra kā oficiālajā paraugā (kaina24.lt/xml/example.xml)
assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<products>\n<product id="'));
assert.ok(xml.endsWith('</products>\n'));
const prods = [...xml.matchAll(/<product id="(\d+)">([\s\S]*?)<\/product>/g)].map((m) => {
  const body = m[2];
  const val = (t) => { const x = body.match(new RegExp(`<${t}>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([^<]*))</${t}>`)); return x ? (x[1] ?? x[2]) : undefined; };
  return { id: m[1], body, val };
});
const by = (h) => prods.find((r) => (r.val('product_url') || '').includes(`/products/${h}`));
for (const r of prods) {
  for (const t of ['product_id', 'title', 'price', 'condition', 'image_url', 'product_url', 'category_name']) assert.ok(r.val(t), `${t} obligāts (${r.id})`);
  assert.equal(r.val('product_id'), r.id);
  assert.match(r.val('price'), /^\d+\.\d{2}$/);
  assert.equal(r.val('condition'), 'new');
  assert.ok(r.val('product_url').startsWith('https://sarlotesaudiniai.lt/products/'));
}
const juodas = by('medvilninis-audinys-juodas');
assert.equal(juodas.val('title'), '100 % medvilninis audinys – juodas (kaina už 1 m)');
assert.equal(juodas.val('price'), '3.90');
assert.equal(juodas.val('stock'), '23');
assert.equal(juodas.val('category_name'), 'Audinys');
assert.match(juodas.body, /<home_delivery><working_days>5<\/working_days><price>15\.90<\/price><\/home_delivery>/);
assert.match(juodas.body, /<parcel_locker_delivery><working_days>5<\/working_days><price>5\.99<\/price><\/parcel_locker_delivery>/);
assert.ok(juodas.body.includes('<![CDATA[Medvilnė & minkšta ]]]]><![CDATA[> testas]]>'), 'CDATA ar "]]>" iekšā');
assert.equal(by('audinys-09'), undefined, 'zem 1 m – nerāda');
assert.equal(by('aksomas').val('title'), 'Aksomas – gabalas 75 cm');
const rozine = prods.find((r) => r.val('title') === 'DROPS Air siūlai – Rožinė');
assert.ok(rozine.val('product_url').endsWith(`?variant=${vid(drops, 0)}`));
assert.equal(rozine.val('ean_code'), '5901234123457'); assert.equal(rozine.val('manufacturer'), 'DROPS');
const mk = by('manekenas');
assert.ok(!mk.body.includes('parcel_locker_delivery'), 'tikai kurjers – bez pakomāta');
assert.equal(mk.val('category_name'), CONFIG.kaina24.defaultCategory, 'tehnisks tips – vispārīgā kategorija');
assert.equal(by('be-tipo').val('category_name'), CONFIG.kaina24.defaultCategory);
assert.equal(by('zirkles').val('title'), 'Žirklės "A&B" <20 cm>');
assert.equal(stats.defaultCategory, 2);
assert.equal(stats.items, prods.length); assert.equal(stats.decimal, 1);
console.log('Kaina24 pārbaudes izietas:', JSON.stringify(stats));
