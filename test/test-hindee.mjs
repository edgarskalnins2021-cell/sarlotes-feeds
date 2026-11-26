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
assert.equal(must.name, '100% puuvillane kangas - must (hind 1 m kohta)');
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
assert.equal(by('samet').name, 'Samet - purpurpunane toon - tükk 75 cm');
// Varianti: igauņu varianta nosaukums, ?variant=, EAN, zīmols
const roosa = rows.find((r) => r.name === 'Lõng DROPS Air - Roosa');
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
// Neiztulkota prece (igauņu nosaukums = latviskais) netiek sūtīta, kamēr nav iztulkota (26.11.2026)
assert.equal(by('lentite'), undefined); assert.equal(stats.skipped['nav iztulkots'], 1);
assert.equal(stats.sameNameAsLv, 0);
{
  // Iztulkota – parādās; žurnāls (nosaukums visās valodās vienāds) – parādās arī neiztulkots
  const zurn = p({ title: 'Burda Easy 03/2025-DE', handle: 'burda', productType: 'Žurnāli', variants: [v({ price: 8.5, qty: 2 })] });
  const { items: zi } = buildItems([latviski, zurn], CONFIG);
  const tulk = normalizeEe([{ title: 'Paelake', handle: 'paelake', product_type: 'Paelad', variants: [{ id: vid(latviski), title: 'Default Title', price: '0.82' }] },
    { title: 'Burda Easy 03/2025-DE', handle: 'burda', product_type: 'Ajakirjad', variants: [{ id: vid(zurn), title: 'Default Title', price: '8.70' }] }]);
  const r = toHindeeXml(zi, tulk, CONFIG);
  assert.equal(r.stats.items, 2); assert.ok(r.xml.includes('<title><![CDATA[Paelake]]></title>'));
  assert.ok(r.xml.includes('<title><![CDATA[Burda Easy 03/2025-DE]]></title>')); assert.equal(r.stats.skipped['nav iztulkots'], undefined);
}
// Visas saites – Igaunijas domēns, unikālas; cenas formātā 0.00
assert.ok(rows.every((r) => r.link.startsWith('https://sharlottekangad.ee/products/')));
assert.equal(new Set(rows.map((r) => r.link)).size, rows.length);
assert.ok(rows.every((r) => /^\d+\.\d{2}$/.test(r.val('price'))));
assert.equal(stats.items, rows.length); assert.equal(stats.decimal, 3);
// Apģērbi (Edgars 21.11.2026): viens ieraksts katrai krāsai, nosaukumā bez izmēra, kategorija igauniski,
// apdrukas precēm bez atlikuma un piegāde + izgatavošana (5 + 2 = 7 d.d.).
{
  // katrai krāsai sava bilde → ieraksts katrai krāsai (viena maketa bilde – skat. bloku zemāk)
  const tv = (id, title) => v({ id: `gid://shopify/ProductVariant/${id}`, title, price: 29.9, tracked: false, qty: null, inventoryPolicy: 'CONTINUE',
    position: id % 10, image: `https://cdn.example/${title.split(' / ')[1]}.jpg`,
    selectedOptions: title.split(' / ').map((value, i) => ({ name: ['Available Product', 'Krāsa', 'Izmērs'][i], value })) });
  const tee = p({ title: 'T-krekls “Auseklis”', handle: 'auseklis', productType: 'Customizer', image: 'https://cdn.example/t.jpg',
    variants: [tv(9901, 'T-krekls / Balta / XXS'), tv(9902, 'T-krekls / Balta / XS'), tv(9903, 'T-krekls / Melna / XXS')] });
  const blank = p({ title: 'T-krekls SOL’S Legend Unisex', handle: 'sol', productType: 'Apģērbi',
    variants: [v({ id: 'gid://shopify/ProductVariant/9911', title: 'Balta / S', price: 12.9, qty: 5, position: 1,
      selectedOptions: [{ name: 'Krāsa', value: 'Balta' }, { name: 'Izmērs', value: 'S' }] })] });
  const { items: ai } = buildItems([tee, blank], CONFIG);
  const eeA = normalizeEe([
    { title: 'T-särk “Auseklis”', handle: 't-sark-auseklis', product_type: 'Kohandaja', variants: [
      { id: 9901, title: 'T-särk / Valge / XXS', price: '30.50' }, { id: 9902, title: 'T-särk / Valge / XS', price: '30.50' },
      { id: 9903, title: 'T-särk / Must / XXS', price: '30.50' }] },
    { title: 'T-särk SOL’S Legend Unisex', handle: 't-sark-sol', product_type: 'Apģērbi', variants: [{ id: 9911, title: 'Valge / S', price: '13.16' }] },
  ]);
  const ax = toHindeeXml(ai, eeA, CONFIG);
  assert.equal(ax.stats.items, 3, 'Valge + Must (apdruka) + tukšais krekls');
  assert.ok(ax.xml.includes('<title><![CDATA[T-särk “Auseklis” - Valge]]></title>'), 'nosaukumā bez izmēra un bez TeeInBlue opcijas');
  assert.ok(ax.xml.includes('<title><![CDATA[T-särk SOL’S Legend Unisex - Valge]]></title>'));
  assert.ok(!ax.xml.includes('<product id="9902">'), 'cits tās pašas krāsas izmērs netiek likts');
  assert.ok(ax.xml.includes('<category_name><![CDATA[T-särgid]]></category_name>'));
  assert.ok(!ax.xml.includes('Kohandaja') && !ax.xml.includes('Apģērbi'), 'tehniskais vai latviskais tips nav kategorija');
  const tBlock = ax.xml.split('<product id="9901">')[1].split('</product>')[0];
  assert.ok(tBlock.includes('<working_days>7</working_days>') && !tBlock.includes('<stock>'));
  const sBlock = ax.xml.split('<product id="9911">')[1].split('</product>')[0];
  assert.ok(sBlock.includes('<working_days>5</working_days>') && sBlock.includes('<stock>5</stock>'));
  assert.ok(ax.xml.includes("<manufacturer><![CDATA[SOL'S]]></manufacturer>"), 'zīmols no nosaukuma');

  // Shopify Google lauki (custom_label) dod LV kategoriju: "Bērnu T-krekli" → igauniski; nezināma vērtība → pēc nosaukuma, nevis vispārīgā.
  const kid = p({ title: 'T-krekls bērnu SOL’S Imperial Kids', handle: 'kids', productType: 'Apģērbi',
    variants: [v({ id: 'gid://shopify/ProductVariant/9921', title: 'Balta / 2 gadi', price: 9.9, qty: 3, position: 1,
      categoryPath: ['Gatavie izstrādājumi un apdruka', 'Bērnu T-krekli'],
      selectedOptions: [{ name: 'Krāsa', value: 'Balta' }, { name: 'Izmērs', value: '2 gadi' }] })] });
  const hood = p({ title: 'Džemperis “Saknes”', handle: 'hood', productType: 'Customizer',
    variants: [v({ id: 'gid://shopify/ProductVariant/9931', title: 'Džemperis / Hall / melanž / M', price: 36.9, tracked: false, qty: null,
      inventoryPolicy: 'CONTINUE', position: 1, categoryPath: ['Gatavie izstrādājumi un apdruka', 'Hūdiji'],
      selectedOptions: [{ name: 'Available Product', value: 'Džemperis' }, { name: 'Krāsa', value: 'Pelēks / melanžs' }, { name: 'Izmērs', value: 'M' }] })] });
  const { items: ki } = buildItems([kid, hood], CONFIG);
  const eeK = normalizeEe([
    { title: 'Laste T-särk SOL’S Imperial Kids', handle: 'laste', product_type: 'Apģērbi',
      variants: [{ id: 9921, title: 'Valge / 2 aastat', option1: 'Valge', option2: '2 aastat', price: '10.14' }] },
    { title: 'Pusa “Juured”', handle: 'pusa', product_type: 'Kohandaja',
      variants: [{ id: 9931, title: 'Pusa / Hall / melanž / M', option1: 'Pusa', option2: 'Hall / melanž', option3: 'M', price: '37.80' }] },
  ]);
  const kx = toHindeeXml(ki, eeK, CONFIG);
  assert.ok(kx.xml.split('<product id="9921">')[1].split('</product>')[0].includes('<category_name><![CDATA[Laste T-särgid]]></category_name>'));
  const hBlock = kx.xml.split('<product id="9931">')[1].split('</product>')[0];
  assert.ok(hBlock.includes('<category_name><![CDATA[Pusad]]></category_name>'), 'nezināma Shopify kategorija → pēc nosaukuma');
  assert.ok(hBlock.includes('<title><![CDATA[Pusa “Juured” - Hall / melanž]]></title>'), 'izmērs un TeeInBlue opcija izņemti pēc opcijas, " / " vērtībā saglabāts');
  assert.equal(kx.stats.defaultCategory, 0);

  // Viens ieraksts apdrukas produktam (viena maketa bilde visām krāsām): igauniski "(2 värvi, XXS-XS)", bērniem "a.".
  const mv = (id, colour, size) => v({ id: `gid://shopify/ProductVariant/${id}`, title: `T-krekls / ${colour} / ${size}`, price: 29.9, tracked: false,
    qty: null, inventoryPolicy: 'CONTINUE', position: id % 10, image: 'https://cdn.example/makets.jpg',
    selectedOptions: [{ name: 'Available Product', value: 'T-krekls' }, { name: 'Krāsa', value: colour }, { name: 'Izmērs', value: size }] });
  const mt = p({ title: 'T-krekls “Auseklis”', handle: 'm-auseklis', productType: 'Customizer',
    variants: [mv(9941, 'Balta', 'XXS'), mv(9942, 'Balta', 'XS'), mv(9943, 'Melna', 'XXS')] });
  const mk = p({ title: 'Bērnu T-krekls “Zoss”', handle: 'm-zoss', productType: 'Customizer',
    variants: [mv(9951, 'Balta', '2 gadi'), mv(9952, 'Rozā', '12 gadi')] });
  const { items: mi } = buildItems([mt, mk], CONFIG);
  const eeM = normalizeEe([
    { title: 'T-särk “Auseklis”', handle: 't-auseklis', product_type: 'Kohandaja', variants: [9941, 9942, 9943].map((id) => ({ id, title: 'x', price: '30.50' })) },
    { title: 'Laste T-särk “Hani”', handle: 'l-hani', product_type: 'Kohandaja', variants: [9951, 9952].map((id) => ({ id, title: 'x', price: '25.40' })) },
  ]);
  const mxx = toHindeeXml(mi, eeM, CONFIG);
  assert.equal(mxx.stats.items, 2);
  assert.ok(mxx.xml.includes('<title><![CDATA[T-särk “Auseklis” (2 värvi, XXS-XS)]]></title>'));
  assert.ok(mxx.xml.includes('<title><![CDATA[Laste T-särk “Hani” (2 värvi, 2-12 a.)]]></title>'));
  assert.ok(mxx.xml.includes('<product id="9941">') && mxx.xml.includes('<product id="9951">') && !mxx.xml.includes('<product id="9943">'));

  // Ne-apģērbiem LV kategorija (CONFIG.hindee.lvCategories) pirms Igaunijas veikala tipa (21.11.2026): GALA priekšauts
  // (tips "Auduma maisiņi"), krūze ("Tarvikud ja tööriistad"), apdrukas panelis (latvisks "Audums").
  const ov = (id, cat) => v({ id: `gid://shopify/ProductVariant/${id}`, price: 9.9, qty: 3, categoryPath: ['Gatavie izstrādājumi un apdruka', cat] });
  const { items: oi } = buildItems([
    p({ title: 'Priekšauts ar kabatām SOL’S GALA', handle: 'gala', productType: 'Auduma maisiņi', variants: [ov(9961, 'Priekšauti')] }),
    p({ title: 'Keramikas krūze “Sew Tasty”', handle: 'kruze', productType: 'Piederumi', variants: [ov(9962, 'Krūzes')] }),
    p({ title: 'Paneļa apdruka', handle: 'panelis', productType: 'Audums', variants: [ov(9963, 'Apdrukas paneļi')] }),
  ], CONFIG);
  const eeO = normalizeEe([
    { title: 'Põll taskutega SOL’S GALA', handle: 'p-gala', product_type: 'Riidest kotid', variants: [{ id: 9961, title: 'Default Title', price: '10.00' }] },
    { title: 'Keraamiline kruus “Sew Tasty”', handle: 'k-kruus', product_type: 'Tarvikud ja tööriistad', variants: [{ id: 9962, title: 'Default Title', price: '10.00' }] },
    { title: 'Paneeli trükk', handle: 'p-paneel', product_type: 'Audums', variants: [{ id: 9963, title: 'Default Title', price: '10.00' }] },
  ]);
  const ox = toHindeeXml(oi, eeO, CONFIG).xml;
  const cat = (id) => ox.split(`<product id="${id}">`)[1].split('</product>')[0].match(/<category_name><!\[CDATA\[(.*?)\]\]>/)[1];
  assert.deepEqual([cat(9961), cat(9962), cat(9963)], ['Põlled', 'Kruusid', 'Kangatrükk']);
}

console.log('Hind.ee pārbaudes izietas:', JSON.stringify(stats));
