// Google Merchant Center (google-lv.xml, google-ee-en.xml, google-lt-en.xml) pārbaudes: node test/test-google.mjs
import assert from 'node:assert/strict';
import { buildItems, toGoogleXml, googleGtin, googleColor, htmlToPlain, CONFIG } from '../feed-core.mjs';
import { normalizeLvStore } from '../generate.mjs';

let n = 1;
const v = (o) => ({ id: `gid://shopify/ProductVariant/${7000 + n++}`, title: 'Default Title', price: 1, compareAtPrice: null, available: true,
  qty: 10, tracked: true, requiresShipping: true, grams: 100, image: '', barcode: '', categoryPath: [], ...o });
const p = (o) => ({ id: `gid://shopify/Product/${100 + n++}`, title: 'X', handle: `g${n++}`, productType: 'Audums', vendor: 'STOK', tags: [],
  isGiftCard: false, onlineStore: true, image: 'https://cdn.example/x.jpg?v=1', collections: [], description: 'Īss apraksts no Admin.', variants: [v({})], ...o });
const vid = (prod, i = 0) => prod.variants[i].id.split('/').pop();
const pid = (prod) => prod.id.split('/').pop();
const check = (d) => { let s = 0; [...d].reverse().forEach((x, i) => { s += Number(x) * (i % 2 === 0 ? 3 : 1); }); return d + ((10 - (s % 10)) % 10); };

// Metrā: 0,39 € par 10 cm (Shopify vienība), 235 vienības = 23,5 m
const audums = p({ title: '100 % kokvilnas audums – bēšas rūtis 🌼', handle: 'kokvilnas-audums-bess', tags: ['decimal'],
  variants: [v({ price: 0.39, qty: 235, grams: 20, image: 'https://cdn.example/a1.jpg?v=5', categoryPath: ['Audumi', 'Kokvilnas audumi'] })] });
const mazs = p({ title: 'Audums 0,9 m', handle: 'mazs', tags: ['decimal'], variants: [v({ price: 0.5, qty: 9 })] });
// Dzija ar krāsu variantiem, EAN, zīmols nosaukumā
const drops = p({ title: 'Dzija DROPS Air – 50 g / 150 m', handle: 'drops-air', productType: 'Dzija', vendor: 'VH',
  variants: [v({ title: 'Rozā – #12', price: 5.3, qty: 4, barcode: '5901234123457', image: 'https://cdn.example/rozs.jpg' }),
    v({ title: '599', price: 5.3, qty: 3, image: 'https://cdn.example/599.jpg' }),
    v({ title: 'Zila', price: 5.3, qty: 0 })] });
// Tikai kurjers (smags) un parasta, bet > 30 kg prece
const manekens = p({ title: 'Manekens šūšanai', handle: 'manekens', productType: 'COURIER_ONLY', variants: [v({ price: 179.9, qty: 2, grams: 4500 })] });
const vieglsKurjers = p({ title: 'Galds', handle: 'galds', productType: 'COURIER_ONLY', variants: [v({ price: 59, qty: 2, grams: 0 })] });
const rullis = p({ title: 'Audumu rullis', handle: 'rullis', productType: 'Audums', variants: [v({ price: 400, qty: 1, grams: 35000 })] });
// Jaukts tips "Adatas": pēc nosaukuma
const drosibas = p({ title: 'Drošības adatas, saspraudes 20 mm', handle: 'drosibas', productType: 'Adatas', variants: [v({ price: 1.2, qty: 5 })] });
const schmetz = p({ title: 'Šujmašīnu adatas SCHMETZ Jersey Nr.80 – 5 gab.', handle: 'schmetz', productType: 'Adatas', variants: [v({ price: 3.5, qty: 5 })] });
// Akcija, XML speciālās rakstzīmes, EAN no ierobežotā diapazona (2…), bez apraksta nekur
const lineals = p({ title: 'Lineāls <30 cm> & "zīmulis"', handle: 'lineals', productType: 'Lineāli un mērinstrumenti', description: '',
  variants: [v({ price: 5, compareAtPrice: 7, qty: 3, barcode: check('200123456789') })] });
// Izslēdzamās: ar defektu, bez attēla
const defekts = p({ title: 'Trikotāža ar defektu', handle: 'def', variants: [v({ price: 2, qty: 5 })] });
const bezAttela = p({ title: 'Bez attēla', handle: 'bez-att', image: '', variants: [v({ price: 2, qty: 5 })] });
// Bez tipa un bez LV kategorijas (nav ne product_type, ne google_product_category)
const bezTipa = p({ title: 'Lieta', handle: 'lieta', productType: '', variants: [v({ price: 2, qty: 5 })] });
// "pēdējais gabaliņš" (angliski "last piece")
const samts = p({ title: 'Samts – purpursarkans – pēdējais gabaliņš 75cm', handle: 'samts', variants: [v({ price: 6.5, qty: 1 })] });

const products = [audums, mazs, drops, manekens, vieglsKurjers, rullis, drosibas, schmetz, lineals, defekts, bezAttela, bezTipa, samts];
const { items } = buildItems(products, CONFIG);

// Latvijas veikala /products.json (pilns apraksts, attēli ar variantu piesaisti, opcijas)
const lvJson = [
  { id: Number(pid(audums)), handle: 'kokvilnas-audums-bess', options: [{ name: 'Title' }],
    body_html: '<p>Kokvilna&nbsp;100&nbsp;% &amp; mīksta.</p><ul><li>Platums: 150 cm</li><li>Svars: 120 g/m²</li></ul><p>Skat. https://sarlotesaudumi.lv/pages/x</p>',
    images: [{ src: 'https://cdn.example/a1.jpg?v=9', variant_ids: [] }, { src: 'https://cdn.example/a2.jpg', variant_ids: [] }],
    variants: [{ id: Number(vid(audums)), option1: 'Default Title' }] },
  { id: Number(pid(drops)), handle: 'drops-air', options: [{ name: 'Krāsa' }], body_html: '<p>Alpaka un merino.</p>',
    images: [{ src: 'https://cdn.example/kopeja.jpg', variant_ids: [] }, { src: 'https://cdn.example/rozs.jpg', variant_ids: [Number(vid(drops, 0))] },
      { src: 'https://cdn.example/599.jpg', variant_ids: [Number(vid(drops, 1))] }, { src: 'https://cdn.example/rozs-2.jpg', variant_ids: [Number(vid(drops, 0))] }],
    variants: [{ id: Number(vid(drops, 0)), option1: 'Rozā – #12' }, { id: Number(vid(drops, 1)), option1: '599' }, { id: Number(vid(drops, 2)), option1: 'Zila' }] },
  { id: Number(pid(manekens)), handle: 'manekens', options: [{ name: 'Title' }], body_html: '',
    images: Array.from({ length: 14 }, (_, i) => ({ src: `https://cdn.example/m${i}.jpg`, variant_ids: [] })),
    variants: [{ id: Number(vid(manekens)), option1: 'Default Title' }] },
];
const store = normalizeLvStore(lvJson);
const { xml, stats } = toGoogleXml(items, store, CONFIG);

// RSS 2.0 ar Google nosaukumtelpu
assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n<channel>\n'));
assert.ok(xml.endsWith('</channel>\n</rss>\n'));
assert.ok(!/&(?!(amp|lt|gt|quot|apos);)/.test(xml), 'visi & ir aizvietoti');
const rows = [...xml.matchAll(/<item>\n([\s\S]*?)\n<\/item>/g)].map((m) => {
  const body = m[1];
  const all = (t) => [...body.matchAll(new RegExp(`<g:${t}>([^<]*)</g:${t}>`, 'g'))].map((x) => x[1]);
  return { body, all, val: (t) => all(t)[0] };
});
assert.equal(rows.length, stats.items);
const by = (h) => rows.find((r) => r.val('link').includes(`/products/${h}`));
const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

for (const r of rows) {
  for (const t of ['id', 'title', 'description', 'link', 'image_link', 'availability', 'price', 'condition']) assert.ok(r.val(t), `${t} obligāts`);
  assert.match(r.val('id'), /^shopify_ZZ_\d+_\d+$/);
  assert.ok(r.val('id').length <= 50);
  assert.ok(unesc(r.val('title')).length <= 150);
  assert.match(r.val('price'), /^\d+\.\d{2} EUR$/);
  assert.equal(r.val('availability'), 'in_stock');
  assert.equal(r.val('condition'), 'new');
  assert.ok(r.val('link').startsWith('https://sarlotesaudumi.lv/products/'));
  assert.ok(r.all('additional_image_link').length <= 10);
  assert.ok(r.val('gtin') || r.val('identifier_exists') === 'no', 'bez GTIN – identifier_exists=no');
  assert.equal(r.val('ships_from_country'), 'LV');
}
assert.equal(new Set(rows.map((r) => r.val('id'))).size, rows.length, 'ID unikāli');

// Metrā: cena par 10 cm kā preces lapā + vienības cena; nosaukumā nav "(cena par 1 m)"; bez emocijzīmēm
const a = by('kokvilnas-audums-bess');
assert.equal(a.val('id'), `shopify_ZZ_${pid(audums)}_${vid(audums)}`);
assert.equal(a.val('price'), '0.39 EUR');
assert.equal(a.val('unit_pricing_measure'), '10cm');
assert.equal(a.val('unit_pricing_base_measure'), '1m');
assert.equal(a.val('title'), '100 % kokvilnas audums – bēšas rūtis');
assert.equal(a.val('link'), 'https://sarlotesaudumi.lv/products/kokvilnas-audums-bess');
assert.equal(a.val('description'), 'Kokvilna 100 % &amp; mīksta.\n- Platums: 150 cm\n- Svars: 120 g/m²\n\nSkat.');
assert.deepEqual(a.all('additional_image_link'), ['https://cdn.example/a2.jpg'], 'galvenais attēls netiek atkārtots');
assert.equal(a.val('shipping_weight'), '20 g');
assert.equal(a.val('google_product_category'), '47');
assert.equal(a.val('product_type'), 'Audumi &gt; Kokvilnas audumi');
assert.equal(a.val('custom_label_0'), 'Audumi');
assert.equal(a.val('custom_label_1'), 'Kokvilnas audumi');
assert.equal(a.val('custom_label_2'), 'metrā');
assert.equal(a.val('custom_label_3'), 'līdz 5 €', 'cenu grupa pēc cenas par 1 m (3,90 €)');
assert.equal(a.val('item_group_id'), undefined);
assert.ok(!a.body.includes('<g:shipping>'), 'parastai precei – konta piegādes politika');
assert.equal(by('mazs'), undefined, 'zem 1 m – nerāda');

// Varianti: item_group_id, item_group_title, variant_option, krāsa bez koda; tikai savi + kopīgie attēli
const roza = rows.find((r) => r.val('id') === `shopify_ZZ_${pid(drops)}_${vid(drops, 0)}`);
assert.equal(roza.val('title'), 'Dzija DROPS Air – 50 g / 150 m – Rozā – #12');
assert.equal(roza.val('item_group_id'), `shopify_ZZ_${pid(drops)}`);
assert.equal(roza.val('item_group_title'), 'Dzija DROPS Air – 50 g / 150 m');
assert.ok(roza.body.includes('<g:variant_option><g:name>Krāsa</g:name><g:value>Rozā – #12</g:value></g:variant_option>'));
assert.equal(roza.val('color'), 'Rozā');
assert.equal(roza.val('link'), `https://sarlotesaudumi.lv/products/drops-air?variant=${vid(drops, 0)}`);
assert.equal(roza.val('image_link'), 'https://cdn.example/rozs.jpg');
assert.deepEqual(roza.all('additional_image_link'), ['https://cdn.example/kopeja.jpg', 'https://cdn.example/rozs-2.jpg']);
assert.equal(roza.val('gtin'), '5901234123457'); assert.equal(roza.val('identifier_exists'), undefined);
assert.equal(roza.val('brand'), 'DROPS');
assert.equal(roza.val('google_product_category'), '2669');
assert.equal(roza.val('custom_label_2'), 'gabalos');
const nr = rows.find((r) => r.val('id') === `shopify_ZZ_${pid(drops)}_${vid(drops, 1)}`);
assert.equal(nr.val('color'), undefined, 'tikai cipari – krāsa netiek norādīta');
assert.ok(nr.body.includes('<g:value>599</g:value>'));
assert.deepEqual(nr.all('additional_image_link'), ['https://cdn.example/kopeja.jpg']);
assert.ok(!rows.some((r) => r.val('id') === `shopify_ZZ_${pid(drops)}_${vid(drops, 2)}`), '0 atlikums – nerāda');

// Piegāde: tikai kurjers / > 30 kg – sava piegāde (aizstāj konta politiku); maks. 10 papildu attēli
const ship = (r) => r.body.match(/<g:shipping>([\s\S]*?)<\/g:shipping>/)?.[1];
assert.equal(ship(by('manekens')), '<g:country>LV</g:country><g:service>Piegāde ar kurjeru</g:service><g:price>15.90 EUR</g:price>'
  + '<g:min_handling_time>0</g:min_handling_time><g:max_handling_time>1</g:max_handling_time>'
  + '<g:min_transit_time>1</g:min_transit_time><g:max_transit_time>2</g:max_transit_time>');
assert.ok(ship(by('galds')).includes('<g:price>11.90 EUR</g:price>'), 'tikai kurjers, līdz 3 kg');
assert.ok(ship(by('rullis')).includes('<g:price>15.90 EUR</g:price>'), '> 30 kg – pakomāts neder');
assert.equal(by('manekens').all('additional_image_link').length, 10);
assert.equal(by('manekens').val('product_type'), undefined, 'tehnisks tips nav kategorija');
assert.equal(by('manekens').val('description'), 'Īss apraksts no Admin.', 'tukšs body_html → Admin apraksts');
assert.equal(by('rullis').val('shipping_weight'), '35000 g');

// Kategorijas: jaukts tips "Adatas" – pēc nosaukuma
assert.equal(by('drosibas').val('google_product_category'), '6101');
assert.equal(by('schmetz').val('google_product_category'), '4579');
assert.equal(by('lieta').val('google_product_category'), undefined);
assert.equal(by('lieta').val('product_type'), undefined);

// XML rakstzīmes, ierobežotā diapazona EAN, akcija (pēc noklusējuma bez sale_price), apraksts = nosaukums
const l = by('lineals');
assert.equal(unesc(l.val('title')), 'Lineāls <30 cm> & "zīmulis"');
assert.equal(unesc(l.val('description')), 'Lineāls <30 cm> & "zīmulis"');
assert.equal(l.val('gtin'), undefined); assert.equal(l.val('identifier_exists'), 'no');
assert.equal(l.val('price'), '5.00 EUR'); assert.equal(l.val('sale_price'), undefined);
assert.equal(l.val('custom_label_4'), 'akcija');
assert.equal(l.val('google_product_category'), '6157');

// Izslēgtās
assert.equal(by('def'), undefined); assert.equal(by('bez-att'), undefined);
assert.equal(stats.skipped['ar defektu / demo / lietota'], 1);
assert.equal(stats.skipped['nav attēla'], 1);
assert.equal(stats.decimal, 1);
assert.equal(stats.enriched, 4);
assert.equal(stats.with.shipping, 3);

// salePrice: true → price = sākotnējā cena, sale_price = cena, ko maksā
const cfgSale = { ...CONFIG, google: { ...CONFIG.google, salePrice: true } };
const s = toGoogleXml(items, store, cfgSale).xml;
assert.ok(s.includes('<g:price>7.00 EUR</g:price>\n<g:sale_price>5.00 EUR</g:sale_price>'));

// Palīgfunkcijas
assert.equal(googleGtin('5901234123457'), '5901234123457');
assert.equal(googleGtin(check('200123456789')), '', 'veikala iekšējais (2…)');
assert.equal(googleGtin(check('40123456789')), '', 'UPC 4… (veikala iekšējais)');
assert.equal(googleGtin('0000000000000'), '');
assert.equal(googleGtin('96385074'), '96385074');
assert.equal(googleGtin('02345673'), '', 'EAN-8 ar 0');
assert.equal(googleColor('Balta – #650'), 'Balta');
assert.equal(googleColor('108 · pistachio ice cream uni colour'), 'pistachio ice cream uni colour');
assert.equal(googleColor('Perlamutra bēša 0018'), 'Perlamutra bēša');
assert.equal(googleColor('MIX 04 taupe'), 'taupe');
assert.equal(googleColor('Rozā 500-03'), 'Rozā');
assert.equal(googleColor('F33'), '');
assert.equal(googleColor('Daudzkrāsaina'), '');
assert.equal(htmlToPlain('<p>A&#8211;B &laquo;x&raquo;</p><p>www.piemers.lv</p>'), 'A–B «x»');
assert.equal(htmlToPlain('x '.repeat(4000), 5000).length <= 5000, true);

// ---------- Igaunija angliski (google-ee-en.xml; Lietuva – tas pats kods ar citu domēnu) ----------
const enJson = [
  { id: Number(pid(audums)), title: '100% cotton fabric – beige checks', handle: 'cotton-fabric-beige-checks', product_type: 'Fabric',
    body_html: '<p>Cotton 100% &amp; soft.</p>', options: [{ name: 'Title' }], images: [],
    variants: [{ id: Number(vid(audums)), title: 'Default Title', option1: 'Default Title', price: '0.40' }] },
  { id: Number(pid(drops)), title: 'DROPS Air yarn – 50 g / 150 m', handle: 'drops-air-yarn', product_type: 'Yarn',
    body_html: '<p>Īss apraksts no Admin.</p>', options: [{ name: 'Color' }], images: [],
    variants: [{ id: Number(vid(drops, 0)), title: 'Pink – #12', option1: 'Pink – #12', price: '5.43' },
      { id: Number(vid(drops, 1)), title: '599', option1: '599', price: '5.43' }] },
  { id: Number(pid(manekens)), title: "Dressmaker's dummy", handle: 'dressmakers-dummy', product_type: 'COURIER_ONLY', body_html: '<p>Adjustable.</p>',
    options: [{ name: 'Title' }], images: [], variants: [{ id: Number(vid(manekens)), title: 'Default Title', option1: 'Default Title', price: '184.36' }] },
  { id: Number(pid(rullis)), title: 'Fabric roll', handle: 'fabric-roll', product_type: 'Fabric', body_html: '<p>Roll.</p>',
    options: [{ name: 'Title' }], images: [], variants: [{ id: Number(vid(rullis)), title: 'Default Title', option1: 'Default Title', price: '410.00' }] },
  { id: Number(pid(lineals)), title: 'Lineāls <30 cm> & "zīmulis"', handle: 'lineals', product_type: 'Rulers', body_html: '',
    options: [{ name: 'Title' }], images: [], variants: [{ id: Number(vid(lineals)), title: 'Default Title', option1: 'Default Title', price: '5.10' }] },
  { id: Number(pid(samts)), title: 'Velvet – purple – last piece, 75cm', handle: 'velvet-purple', product_type: 'Fabric', body_html: '<p>Velvet.</p>',
    options: [{ name: 'Title' }], images: [], variants: [{ id: Number(vid(samts)), title: 'Default Title', option1: 'Default Title', price: '6.66' }] },
];
const ee = toGoogleXml(items, normalizeLvStore(enJson), CONFIG, CONFIG.googleMarkets.ee);
assert.ok(ee.xml.includes('<channel>\n<title>Šarlotte kangad</title>\n<link>https://sharlottekangad.ee/en</link>\n'));
const eeRows = [...ee.xml.matchAll(/<item>\n([\s\S]*?)\n<\/item>/g)].map((mm) => {
  const body = mm[1];
  const all = (t) => [...body.matchAll(new RegExp(`<g:${t}>([^<]*)</g:${t}>`, 'g'))].map((x) => x[1]);
  return { body, all, val: (t) => all(t)[0] };
});
assert.equal(eeRows.length, ee.stats.items);
const ebi = (h) => eeRows.find((r) => r.val('link').includes(`/en/products/${h}`));
for (const r of eeRows) {
  assert.ok(r.val('link').startsWith('https://sharlottekangad.ee/en/products/'));
  assert.match(r.val('price'), /^\d+\.\d{2} EUR$/);
  assert.ok(r.body.includes('<g:shipping><g:country>EE</g:country><g:service>Courier</g:service><g:price>15.90 EUR</g:price>'), 'kurjers vienmēr');
  assert.equal(r.val('ships_from_country'), 'LV');
}
const ea = ebi('cotton-fabric-beige-checks');
assert.equal(ea.val('id'), `shopify_ZZ_${pid(audums)}_${vid(audums)}`, 'tas pats ID kā Latvijā');
assert.equal(ea.val('title'), '100% cotton fabric – beige checks');
assert.equal(ea.val('description'), 'Cotton 100% &amp; soft.');
assert.equal(ea.val('price'), '0.40 EUR', 'Igaunijas cena par 10 cm');
assert.equal(ea.val('unit_pricing_measure'), '10cm'); assert.equal(ea.val('unit_pricing_base_measure'), '1m');
assert.equal(ea.val('product_type'), 'Fabric'); assert.equal(ea.val('google_product_category'), '47');
assert.equal(ea.val('custom_label_0'), 'Fabric'); assert.equal(ea.val('custom_label_2'), 'by the metre');
assert.equal(ea.val('custom_label_3'), 'under 5 €', '4,00 € par 1 m');
assert.ok(ea.body.includes('<g:service>Omniva parcel locker</g:service><g:price>5.99 EUR</g:price><g:min_handling_time>0</g:min_handling_time>'
  + '<g:max_handling_time>1</g:max_handling_time><g:min_transit_time>3</g:min_transit_time><g:max_transit_time>4</g:max_transit_time>'));
const pink = eeRows.find((r) => r.val('id') === `shopify_ZZ_${pid(drops)}_${vid(drops, 0)}`);
assert.equal(pink.val('title'), 'DROPS Air yarn – 50 g / 150 m – Pink – #12');
assert.equal(pink.val('link'), `https://sharlottekangad.ee/en/products/drops-air-yarn?variant=${vid(drops, 0)}`);
assert.equal(pink.val('item_group_title'), 'DROPS Air yarn – 50 g / 150 m');
assert.ok(pink.body.includes('<g:variant_option><g:name>Color</g:name><g:value>Pink – #12</g:value></g:variant_option>'));
assert.equal(pink.val('color'), 'Pink');
assert.equal(pink.val('description'), pink.val('title'), 'neiztulkots apraksts → angliskais nosaukums');
const dm = ebi('dressmakers-dummy');
assert.ok(!dm.body.includes('Omniva'), 'tikai kurjers'); assert.equal(dm.val('product_type'), undefined);
assert.ok(!ebi('fabric-roll').body.includes('Omniva'), '> 30 kg – tikai kurjers');
assert.equal(ebi('velvet-purple').val('title'), 'Velvet – purple – piece 75 cm');
assert.equal(ebi('lineals'), undefined, 'neiztulkots nosaukums – nerāda');
assert.equal(ee.stats.skipped['nav iztulkots angliski'], 1);
assert.ok(ee.stats.skipped['nav Igaunijas veikalā'] >= 1);
assert.equal(ee.stats.descriptionIsTitle, 2);
// Lietuva: tā pati loģika, cits domēns un valsts
const lt = toGoogleXml(items, normalizeLvStore(enJson), CONFIG, CONFIG.googleMarkets.lt);
assert.ok(lt.xml.includes('<g:link>https://sarlotesaudiniai.lt/en/products/cotton-fabric-beige-checks</g:link>'));
assert.ok(lt.xml.includes('<g:country>LT</g:country>') && !lt.xml.includes('<g:country>EE</g:country>'));
assert.ok(lt.xml.includes('<title>Šarlotės audiniai</title>'));
// Atgriešanas izņēmums "cut-to-length" – visām un tikai metrā tirgotajām, tikai Lietuvas failā
const ltRows = [...lt.xml.matchAll(/<item>\n([\s\S]*?)\n<\/item>/g)].map((mm) => mm[1]);
const ltMetre = ltRows.filter((b) => b.includes('<g:custom_label_2>by the metre</g:custom_label_2>'));
const ltCut = ltRows.filter((b) => b.includes('<g:return_policy_label>cut-to-length</g:return_policy_label>'));
assert.ok(ltMetre.length >= 1, 'LT failā ir metrā tirgota prece');
assert.deepEqual(ltCut, ltMetre, 'LT: return_policy_label tieši metrā tirgotajām');
assert.ok(!ee.xml.includes('return_policy_label') && !xml.includes('return_policy_label'), 'EE un LV failos izņēmuma vēl nav');

console.log('Google pārbaudes izietas:', JSON.stringify(stats), '| EE:', JSON.stringify(ee.stats));
