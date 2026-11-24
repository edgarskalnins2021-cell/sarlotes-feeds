// Google Ads dinamiskā remarketinga plūsma "Pielāgoti" (Custom), google-ads-custom-lv.csv: node test/test-google-ads-custom.mjs
import assert from 'node:assert/strict';
import { buildItems, toGoogleAdsCustomCsv, validateGoogleAdsCustomCsv, parseCsv, CONFIG } from '../feed-core.mjs';

let n = 1;
const CDN = 'https://cdn.shopify.com/s/files/1/0517/4129/4751/files';
const v = (o) => ({ id: `gid://shopify/ProductVariant/${7000 + n++}`, title: 'Default Title', price: 1, compareAtPrice: null, available: true,
  qty: 10, tracked: true, requiresShipping: true, grams: 100, image: '', barcode: '', categoryPath: [], ...o });
const p = (o) => ({ id: `gid://shopify/Product/${100 + n++}`, title: 'X', handle: `g${n++}`, productType: 'Audums', vendor: 'STOK', tags: [],
  isGiftCard: false, onlineStore: true, image: `${CDN}/x.jpg?v=1`, collections: [], description: '', variants: [v({})], ...o });
const vid = (prod, i = 0) => prod.variants[i].id.split('/').pop();

// Dokumenta paraugs (Claude Doc "Latviskā Custom plūsma", sadaļa "Kolonnas"): DROPS Air 13 · rust mix un lins.
const drops = p({ title: 'Dzijas DROPS Air - 50 g / 150 m', handle: 'dzijas-drops-air', productType: 'Dzija',
  image: `${CDN}/kopeja.jpg?v=1`,
  variants: [v({ id: 'gid://shopify/ProductVariant/54765329219918', title: '13 · rust mix', price: 5.3, qty: 9, categoryPath: ['Dzija'],
    image: `${CDN}/Dzijas_DROPS_Air_-_50g_150m-8536.jpg?v=1757077024` }),
  v({ title: '06 · anthracite mix', price: 5.3, qty: 0 })] });
const lins = p({ title: '100 % mīkstināts lins - silts rožu tonis 205 g/m²', handle: 'lins-silts-rozu-tonis', tags: ['decimal'],
  image: `${CDN}/100-mikstinats-lins-silts-rozu-tonis-205-gm2-977084.jpg?v=1731272855`,
  variants: [v({ id: 'gid://shopify/ProductVariant/49716926873934', price: 1.89, qty: 40, categoryPath: ['Audumi', 'Lina audumi'] })] });
// Akcija gabalprecei un metrā precei; salīdzinājuma cena zemāka par cenu – nav akcija
const spradze = p({ title: 'Metāla sprādze jostai vai somai 30-40 mm', handle: 'spradze', productType: 'Furnitūra metāla',
  variants: [v({ title: '3 cm', price: 0.8, compareAtPrice: 1.5 }), v({ title: '4 cm', price: 0.88, compareAtPrice: 1.5 })] });
const zombiji = p({ title: 'Kokvilnas trikotāža - zombiji', handle: 'zombiji', tags: ['decimal'],
  variants: [v({ price: 0.79, compareAtPrice: 1.59, qty: 117, categoryPath: ['Audumi'] })] });
const perlites = p({ title: 'Stikla sēkliņpērlītes 8/0, 3 mm 450 g', handle: 'perlites', productType: 'Pērlītes un rotu furnitūra',
  variants: [v({ title: '2221 light pink', price: 11.98, compareAtPrice: 11.9 })] });
// Garie nosaukumi: zīmols vidū, skaitļu diapazons, nosaukums ar komatiem, prievārds beigās
const circus = p({ title: 'Tamboradatas DROPS Pro Circus, alumīnija silikona, izmēri 2 - 12 mm', handle: 'circus', productType: 'Tamboradatas',
  variants: [v({ title: '2 mm', price: 2.5 }), v({ title: '2,5 mm', price: 2.5 })] });
const perlitesMix = p({ title: 'Stikla pērlītšu mix, Ø3 - 20 mm, dažādi izmēri, 50 g - dažādu krāsu varianti', handle: 'mix',
  variants: [v({ title: 'Zilas', price: 1.9 }), v({ title: 'Sarkanas', price: 1.9 })] });
const lente = p({ title: 'Tautiskā lente, josta Ūsiņš 12 mm - dzeltena ar melnu - LV', handle: 'lente', productType: 'Lentas' });
const filcs = p({ title: 'Filca loksne, 1 mm, 20 × 30 cm - vaniļa', handle: 'filcs', productType: 'Filcs' });
const uzgalis = p({ title: 'Auklas nobeiguma uzgalis ar fiksatoru Ø5 mm, 4 gab. - praktisks un estētisks risinājums', handle: 'uzgalis',
  variants: [v({ title: 'Balta', price: 1 }), v({ title: 'Melna', price: 1 })] });
const adatas = p({ title: 'Pērļošanas adatas melnas ar krāsainu actiņu Nr. 10-12 (6 gab.) Pony', handle: 'adatas' });
const sprādzeLacis = p({ title: 'Dekoratīva sprādze- lāča dizains 20 × 40 mm 🐻', handle: 'lacis', variants: [v({ title: 'Balta' }), v({ title: 'Melna' })] });
const satins = p({ title: 'Kāzu kleitu satīns - melns - pēdējais gabaliņš 115 cm', handle: 'satins' });
const komats = p({ title: 'Lente "Zvaigzne", sarkana', handle: 'komats' });
// Apdrukas preces (TeeInBlue): dizaina nosaukums pēdiņās, tehniskā opcija "Available Product" nav apakšvirsrakstā, WebP attēls
const krekls = p({ title: 'Organiskās kokvilnas T-krekls “TĒTI”', handle: 'teti', productType: 'Customizer', image: `${CDN}/teti.webp?v=2`,
  variants: ['XXS', 'XS'].map((s, i) => v({ title: `T-krekls / Balta / ${s}`, price: 24.9, qty: 0, tracked: false, inventoryPolicy: 'CONTINUE',
    position: i + 1, image: `${CDN}/teti-${s}.webp?v=2`, categoryPath: ['Gatavie izstrādājumi un apdruka', 'T-krekli'],
    selectedOptions: [{ name: 'Available Product', value: 'T-krekls' }, { name: 'Krāsa', value: 'Balta' }, { name: 'Izmērs', value: s }] })) });
const maisins = p({ title: 'Kokvilnas auduma maisiņš “Normāla zoss”', handle: 'zoss', productType: 'Customizer', image: `${CDN}/zoss.png?v=3`,
  variants: [v({ title: 'Kokvilnas auduma maisiņš ar apdruku / Dabīga / 38 × 42 cm', price: 14.9, tracked: false, qty: 0, inventoryPolicy: 'CONTINUE',
    categoryPath: ['Gatavie izstrādājumi un apdruka', 'Auduma maisiņi'],
    selectedOptions: [{ name: 'Available Product', value: 'Kokvilnas auduma maisiņš ar apdruku' }, { name: 'Krāsa', value: 'Dabīga' },
      { name: 'Izmērs', value: '38 × 42 cm' }] })] });
const lielie = p({ title: 'KRĒMKRĀSAS LENTA - SATĪNA', handle: 'lielie', variants: [v({ title: 'BALTA / XL' }), v({ title: 'SCHMETZ' })] });
// Izslēdzamās: ar defektu, bez attēla, metrā bez zināma atlikuma, digitāla, digitālo materiālu tips, dāvanu karte,
// WebP ne no Shopify CDN
const defekts = p({ title: 'Kokvilnas trikotāža ar defektu - balta', handle: 'defekts' });
const bezAttela = p({ title: 'Bez attēla', handle: 'bez-att', image: '' });
const metrsBezAtlikuma = p({ title: 'Audums nezināms', handle: 'nezinams', tags: ['decimal'], variants: [v({ price: 0.5, qty: null, tracked: null })] });
const digitala = p({ title: 'Piegrieztne (digitāla)', handle: 'digi', productType: 'Piegrieztne', variants: [v({ requiresShipping: false })] });
const materiali = p({ title: 'Darba lapa', handle: 'lapa', productType: 'Digitālie materiāli' });
const davana = p({ title: 'Dāvanu karte', handle: 'davana', productType: 'Dāvanu kartes', isGiftCard: true });
const svesaWebp = p({ title: 'Prece ar svešu attēlu', handle: 'svesa', image: 'https://example.com/a.webp' });
const heic = p({ title: 'Šujmašīnu adatas DPx35', handle: 'heic', image: `${CDN}/FullSizeRender.heic?v=1` });
const svesaJpg = p({ title: 'Prece ar JPG citur', handle: 'svesa-jpg', image: 'https://example.com/b.jpg?x=1' });

const products = [drops, lins, spradze, zombiji, perlites, circus, perlitesMix, lente, filcs, uzgalis, adatas, sprādzeLacis, satins, komats,
  krekls, maisins, lielie, defekts, bezAttela, metrsBezAtlikuma, digitala, materiali, davana, svesaWebp, heic, svesaJpg];
const { items } = buildItems(products, CONFIG);
const { csv, stats, report } = toGoogleAdsCustomCsv(items, CONFIG);
const rows = parseCsv(csv);
const header = rows.shift();
const row = (id) => {
  const r = rows.find((x) => x[0] === String(id));
  return r && Object.fromEntries(header.map((h, i) => [h, r[i]]));
};

// --- Fails: galvene, kodējums, rindu beigas ---
assert.equal(csv.split('\n')[0], 'ID,Item title,Item subtitle,Item description,Item category,Final URL,Image URL,Price,Sale price,Formatted price,Formatted sale price,Contextual keywords');
assert.equal(header.length, 12);
assert.notEqual(csv.charCodeAt(0), 0xfeff, 'bez BOM');
assert.ok(!csv.includes('\r'), 'rindas beidzas ar LF');
assert.ok(csv.endsWith('\n'));
assert.equal(rows.length, stats.items);
assert.ok(rows.every((r) => r.length === 12));

// --- Dokumenta paraugi: tieši tādas pašas rindas ---
assert.equal(csv.split('\n').find((l) => l.startsWith('54765329219918,')),
  `54765329219918,DROPS Air,13 · rust mix,50 g / 150 m,Dzija,https://sarlotesaudumi.lv/products/dzijas-drops-air?variant=54765329219918,${CDN}/Dzijas_DROPS_Air_-_50g_150m-8536.jpg?v=1757077024&width=1200&format=pjpg,5.30 EUR,,,,`);
assert.equal(csv.split('\n').find((l) => l.startsWith('49716926873934,')),
  `49716926873934,100 % mīkstināts lins,,Silts rožu tonis 205 g/m²,Audumi,https://sarlotesaudumi.lv/products/lins-silts-rozu-tonis,${CDN}/100-mikstinats-lins-silts-rozu-tonis-205-gm2-977084.jpg?v=1731272855&width=1200&format=pjpg,18.90 EUR,,"18,90 € / m",,`);
assert.equal(row(vid(drops, 1)), undefined, 'variants bez atlikuma netiek iekļauts');

// --- Cenas ---
assert.deepEqual([row(vid(spradze)).Price, row(vid(spradze))['Sale price'], row(vid(spradze))['Formatted price']], ['1.50 EUR', '0.80 EUR', '']);
const z = row(vid(zombiji));
assert.deepEqual([z.Price, z['Sale price'], z['Formatted price'], z['Formatted sale price']], ['15.90 EUR', '7.90 EUR', '15,90 € / m', '7,90 € / m']);
assert.deepEqual([row(vid(perlites)).Price, row(vid(perlites))['Sale price']], ['11.98 EUR', ''], 'salīdzinājuma cena zemāka – nav akcija');
assert.ok(rows.every((r) => /^\d+\.\d{2} EUR$/.test(r[7])));

// --- Teksti līdz 25 zīmēm, bez pārgrieztiem vārdiem ---
for (const r of rows) {
  for (const i of [1, 2, 3]) {
    assert.ok(r[i].length <= 25, `${r[0]} ${header[i]} "${r[i]}" garāks par 25`);
    assert.ok(!/…$/.test(r[i]) && !/[,;:\-–/(]$/.test(r[i]), `${r[0]} ${header[i]} "${r[i]}" beidzas ar pieturzīmi`);
  }
  assert.ok(r[1].length > 0);
}
const c = row(vid(circus));
assert.deepEqual([c['Item title'], c['Item subtitle'], c['Item description']], ['DROPS Pro Circus', '2 mm', 'Tamboradatas']);
assert.equal(row(vid(perlitesMix))['Item title'], 'Stikla pērlītšu mix', '"Ø3 - 20 mm" nav nosaukuma daļu atdalītājs');
assert.equal(row(vid(perlitesMix))['Item description'], 'Dažādu krāsu varianti');
assert.deepEqual([row(vid(lente))['Item title'], row(vid(lente))['Item description']], ['Tautiskā lente', 'Dzeltena ar melnu - LV']);
assert.equal(row(vid(filcs))['Item title'], 'Filca loksne, 1 mm');
assert.equal(row(vid(uzgalis))['Item title'], 'Auklas nobeiguma uzgalis');
assert.equal(row(vid(uzgalis))['Item description'], 'Praktisks un estētisks', 'beigās nav "un"');
assert.equal(row(vid(adatas))['Item description'], 'Krāsainu actiņu Nr. 10-12', 'atmestās daļas sākumā nav "ar"');
assert.deepEqual([row(vid(sprādzeLacis))['Item title'], row(vid(sprādzeLacis))['Item description']], ['Dekoratīva sprādze', 'Lāča dizains 20 × 40 mm']);
assert.ok(!/\p{Extended_Pictographic}/u.test(csv), 'bez emocijzīmēm');
assert.deepEqual([row(vid(satins))['Item title'], row(vid(satins))['Item description']], ['Kāzu kleitu satīns', 'Melns - gabals 115 cm']);
assert.equal(row(vid(komats))['Item title'], 'Lente "Zvaigzne", sarkana');
assert.ok(csv.includes('"Lente ""Zvaigzne"", sarkana"'), 'CSV pēdiņas pēc RFC 4180');
// Apdrukas preces
const k = row(vid(krekls));
assert.deepEqual([k['Item title'], k['Item subtitle'], k['Item description'], k['Item category']],
  ['Kokvilnas T-krekls “TĒTI”', 'Balta / XXS', 'T-krekli', 'Gatavie izstrādājumi un apdruka']);
assert.equal(k['Final URL'], `https://sarlotesaudumi.lv/products/teti?variant=${vid(krekls)}`);
assert.equal(k['Image URL'], `${CDN}/teti-XXS.webp?v=2&width=1200&format=pjpg`, 'WebP no Shopify CDN – piespiedu JPEG');
const m = row(vid(maisins));
assert.deepEqual([m['Item title'], m['Item subtitle'], m['Item description']], ['Maisiņš “Normāla zoss”', 'Dabīga / 38 × 42 cm', 'Auduma maisiņi']);
assert.equal(m['Image URL'], `${CDN}/zoss.png?v=3&width=1200&format=pjpg`, 'PNG no Shopify CDN – piespiedu JPEG');
assert.equal(m.Price, '14.90 EUR');
// Lielie burti → teikums; zīmols un izmērs paliek
const l1 = row(vid(lielie));
const l2 = row(vid(lielie, 1));
assert.deepEqual([l1['Item title'], l1['Item subtitle'], l1['Item description']], ['Krēmkrāsas lenta', 'Balta / XL', 'Satīna']);
assert.equal(l2['Item subtitle'], 'SCHMETZ', 'zīmols paliek ar lielajiem burtiem');

// --- Izslēgtās preces ---
for (const prod of [defekts, bezAttela, metrsBezAtlikuma, digitala, materiali, davana, svesaWebp, heic]) {
  assert.equal(row(vid(prod)), undefined, `${prod.title} nedrīkst būt failā`);
}
assert.equal(stats.skipped['ar defektu / demo / lietota'], 1);
assert.equal(stats.skipped['nav attēla'], 1);
assert.equal(stats.skipped['metrā tirgota, atlikums nav zināms'], 1);
assert.equal(stats.skipped['tips Digitālie materiāli'], 1);
assert.equal(stats.skipped['attēls nav JPG/PNG/GIF/WebP'], 2, 'WebP ne no Shopify un HEIC');
assert.equal(row(vid(svesaJpg))['Image URL'], 'https://example.com/b.jpg?x=1', 'ne Shopify attēls – bez izmaiņām');
assert.ok(rows.filter((r) => r[6].startsWith('https://cdn.shopify.com/')).every((r) => /[?&]width=1200&format=pjpg$/.test(r[6])),
  'visiem Shopify attēliem width=1200 un format=pjpg');
// Visi buildItems ieraksti = rindas + izlaistās
assert.equal(items.length, stats.items + Object.values(stats.skipped).reduce((a, b) => a + b, 0));
assert.equal(new Set(rows.map((r) => r[0])).size, rows.length, 'ID unikāli');
assert.ok(rows.every((r) => /^[0-9]+$/.test(r[0])));
assert.ok(rows.every((r) => r[5].startsWith('https://sarlotesaudumi.lv/products/')));
assert.ok(rows.every((r) => r[11] === ''), 'Contextual keywords tukšs (tikai no Edgara tabulas)');

// --- Atskaite: saīsinātās un mainītās rindas ---
assert.ok(report.some((x) => x.id === vid(circus) && /nosaukums no zīmola/.test(x.notes)));
assert.ok(report.some((x) => x.id === vid(lielie) && /lielie burti/.test(x.notes)));
assert.ok(!report.some((x) => x.id === '54765329219918'), 'DROPS Air nav saīsināts (tikai bez veida vārda)');
assert.equal(stats.with.formatted_price, 2);
assert.equal(stats.decimal, 2);

// --- Pārbaude (validateGoogleAdsCustomCsv) ---
const ok = validateGoogleAdsCustomCsv(csv, CONFIG);
assert.equal(ok.errorCount, 0, ok.errors.join('\n'));
assert.equal(ok.rows, rows.length);
const bad = (fn) => validateGoogleAdsCustomCsv(fn(csv), CONFIG);
assert.ok(bad((s) => `﻿${s}`).errors.some((e) => /BOM/.test(e)));
assert.ok(bad((s) => s.replace('ID,Item title', 'Id,Item title')).errors.some((e) => /galvene/.test(e)));
assert.ok(bad((s) => s.replace('54765329219918,DROPS Air', '54765329219918,DROPS Air un vēl ļoti garš teksts')).errors.some((e) => /garāks par 25/.test(e)));
assert.ok(bad((s) => s.replace('5.30 EUR', '5.3 EUR')).errors.some((e) => /Price formāts/.test(e)));
assert.ok(bad((s) => s.replace('15.90 EUR,7.90 EUR', '7.90 EUR,15.90 EUR')).errors.some((e) => /Sale price/.test(e)));
assert.ok(bad((s) => s.replace('49716926873934,', '54765329219918,')).errors.some((e) => /atkārtojas/.test(e)));
assert.ok(bad((s) => s.replace('54765329219918,', 'shopify_ZZ_1_54765329219918,')).errors.some((e) => /tikai cipari/.test(e)));
assert.ok(bad((s) => s.replace('https://sarlotesaudumi.lv/products/lins', 'https://example.com/products/lins')).errors.some((e) => /Final URL/.test(e)));
assert.ok(bad((s) => s.replace('Kokvilnas T-krekls “TĒTI”', 'KOKVILNAS T-KREKLS')).warnings.some((e) => /lielajiem burtiem/.test(e)));
assert.ok(bad((s) => s.replace('teti-XXS.webp?v=2&width=1200&format=pjpg', 'teti-XXS.webp?v=2&width=1200')).errors.some((e) => /Image URL/.test(e)));
assert.ok(bad((s) => s.replace(/\n[^\n]*\n$/, '\n1,a,b\n')).errors.some((e) => /kolonnas/.test(e)));

// --- Dubults ID – kļūda (Google: "IDs must be unique") ---
const dup = buildItems([drops], CONFIG).items;
assert.throws(() => toGoogleAdsCustomCsv([dup[0], { ...dup[0], link: `${dup[0].link}&x=1` }], CONFIG), /atkārtojas/);

// --- generate.mjs importējas bez palaišanas ---
await import('../generate.mjs');

console.log(`Google Ads Custom: ${stats.items} rindas, izlaistas ${JSON.stringify(stats.skipped)}, piezīmes ${JSON.stringify(stats.notes)}`);
console.log('Visas Google Ads Custom pārbaudes izietas.');
