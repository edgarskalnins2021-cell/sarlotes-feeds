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
const opt = (name, values, o = {}) => values.map((x) => v({ title: x, selectedOptions: [{ name, value: x }], ...o }));

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
assert.equal(row(vid(perlitesMix))['Item description'], 'Ø3 - 20 mm, dažādi izmēri', 'nosaukuma atlikums pirms daļas pēc " - "');
assert.deepEqual([row(vid(lente))['Item title'], row(vid(lente))['Item description']], ['Tautiskā lente', 'Josta Ūsiņš 12 mm']);
assert.equal(row(vid(filcs))['Item title'], 'Filca loksne, 1 mm');
assert.equal(row(vid(uzgalis))['Item title'], 'Auklas nobeiguma uzgalis');
assert.equal(row(vid(uzgalis))['Item description'], 'Ar fiksatoru Ø5 mm', 'nosaukuma atlikums ar "ar"');
assert.equal(row(vid(adatas))['Item description'], 'Ar krāsainu actiņu', 'prievārds "ar" paliek (bez tā – "Krāsainu actiņu")');
assert.deepEqual([row(vid(sprādzeLacis))['Item title'], row(vid(sprādzeLacis))['Item description']], ['Dekoratīva sprādze', 'Lāča dizains 20 × 40 mm']);
assert.ok(!/\p{Extended_Pictographic}/u.test(csv), 'bez emocijzīmēm');
assert.deepEqual([row(vid(satins))['Item title'], row(vid(satins))['Item description']], ['Kāzu kleitu satīns', 'Melns - gabals 115 cm']);
assert.equal(row(vid(komats))['Item title'], 'Lente "Zvaigzne", sarkana');
assert.ok(csv.includes('"Lente ""Zvaigzne"", sarkana"'), 'CSV pēdiņas pēc RFC 4180');
// Apdrukas preces
const k = row(vid(krekls));
assert.deepEqual([k['Item title'], k['Item subtitle'], k['Item description'], k['Item category']],
  ['T-krekls “TĒTI”', 'Balta / XXS', 'Organiskās kokvilnas', 'Gatavie izstrādājumi un apdruka']); // apzīmētājs netiek atmests pa pusei
assert.equal(k['Final URL'], `https://sarlotesaudumi.lv/products/teti?variant=${vid(krekls)}`);
assert.equal(k['Image URL'], `${CDN}/teti-XXS.webp?v=2&width=1200&format=pjpg`, 'WebP no Shopify CDN – piespiedu JPEG');
const m = row(vid(maisins));
assert.deepEqual([m['Item title'], m['Item subtitle'], m['Item description']], ['Maisiņš “Normāla zoss”', 'Dabīga / 38 × 42 cm', 'Kokvilnas auduma maisiņš'],
  'izlaistie vārdi pirms preces veida – aprakstā');
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
assert.equal(ok.warningCount, 0, `bez brīdinājumiem ("SCHMETZ" ir zīmols): ${ok.warnings.join('; ')}`);
assert.ok(bad((s) => s.replace('T-krekls “TĒTI”', 'KOKVILNAS T-KREKLS')).warnings
  .some((e) => /Item title tikai ar lielajiem burtiem: KOKVILNAS T-KREKLS/.test(e)));
assert.ok(bad((s) => s.replace('teti-XXS.webp?v=2&width=1200&format=pjpg', 'teti-XXS.webp?v=2&width=1200')).errors.some((e) => /Image URL/.test(e)));
assert.ok(bad((s) => s.replace(/\n[^\n]*\n$/, '\n1,a,b\n')).errors.some((e) => /kolonnas/.test(e)));
// Katrs pārbaudes noteikums (rindu un lauku līmenī)
const lineOf = (id) => csv.split('\n').find((l) => l.startsWith(`${id},`));
const withCell = (id, col, val) => (s) => {
  const r = parseCsv(`${lineOf(id)}\n`)[0];
  r[col] = val;
  return s.replace(lineOf(id), r.map((x) => (/[",\n\r]/.test(x) ? `"${x.replace(/"/g, '""')}"` : x)).join(','));
};
const D = '54765329219918';
for (const [col, val, re] of [
  [1, '', /tukšs Item title/],
  [1, ' DROPS Air', /atstarpi/],
  [1, 'DROPS\nAir', /rindas pārnesums/],
  [1, 'DROPS <b>Air</b>', /HTML/],
  [1, 'DROPS Air 🐻', /emocijzīme/],
  [1, 'DROPS Air 🇱🇻', /emocijzīme/],
  [2, 'Default Title', /Default Title/],
  [3, 'Lente…', /daudzpunkte/],
  [1, 'DROPS Air!!', /triku/],
  [1, 'DROPS\u0007Air', /vadības/],
  [2, 'x'.repeat(26), /Item subtitle garāks par 25/],
  [3, 'x'.repeat(26), /Item description garāks par 25/],
  [9, '123 456 789,00 € / m!', /Formatted price garāks par 20/],
  [7, '0.00 EUR', /Price formāts/],
  [8, '5.30 EUR', /Sale price/],
  [8, '5,30 EUR', /Sale price/],
  [10, '4,00 € / m', /Formatted sale price bez Sale price/],
  [6, `${CDN}/Dzijas_DROPS_Air_-_50g_150m-8536.jpg?v=1757077024`, /Image URL/],
  [6, `${CDN}/Dzijas_DROPS_Air_-_50g_150m-8536.jpg?v=1757077024&width=1200`, /Image URL/],
  [6, `${CDN}/Dzijas_DROPS_Air_-_50g_150m-8536.jpg?v=1757077024&format=pjpg&width=5000`, /Image URL/],
  [6, 'https://sarlotesaudumi.lv/cdn/shop/files/zoss.png?v=3', /Image URL/],
  [6, `${CDN}/a b.jpg?width=1200&format=pjpg`, /Image URL/],
]) {
  const r = bad(withCell(D, col, val));
  assert.ok(r.errors.some((e) => re.test(e)), `${header[col]}="${val}" → ${re}: ${r.errors.join('; ')}`);
}
assert.ok(bad(withCell(vid(lins), 10, '9,00 € / m')).errors.some((e) => /Formatted sale price bez Sale price/.test(e)));
assert.ok(bad(withCell(vid(lins), 10, '9,00 € / m / ļoti garš')).errors.some((e) => /Formatted sale price garāks par 20/.test(e)));
assert.equal(bad((s) => s.replace(/\n/g, '\r\n')).errorCount, 0, 'CRLF rindu beigas arī derīgas');
assert.ok(bad((s) => `${s}${lineOf(D).replace(D, '1')}\n`.replace(/(\n1,)DROPS Air/, '$1SCHMETZ PRO LINE')).warnings.some((e) => /SCHMETZ PRO LINE/.test(e)));
// Brīdinājumu kopskaits nav ierobežots ar 100
const many = [header.join(','), ...Array.from({ length: 150 }, (_, i) => lineOf(D).replace(D, String(i + 1)).replace(',DROPS Air,', ',LIELIE BURTI,'))].join('\n');
assert.equal(validateGoogleAdsCustomCsv(many, CONFIG).warningCount, 150);

// Viena prece ar "…" vai bojātu rakstzīmi neaptur failu: teksts iztīrīts vai rinda izlaista, pārbaude bez kļūdām
const odd = buildItems([
  p({ title: 'Pārsteiguma paka…', handle: 'paka' }),
  p({ title: 'Diegi', handle: 'diegi', variants: opt('Krāsa', ['Balts…', 'Za\uFFFDa']) }),
  p({ title: 'Lente satīna', handle: 'lente-vienada', variants: [v({ price: 2.5, compareAtPrice: 2.5 })] }),
  p({ title: 'Audums vienāda cena', handle: 'audums-vienada', tags: ['decimal'], variants: [v({ price: 1.5, compareAtPrice: 1.5, qty: 30 })] }),
], CONFIG).items;
const oddOut = toGoogleAdsCustomCsv(odd, CONFIG);
const oddCheck = validateGoogleAdsCustomCsv(oddOut.csv, CONFIG);
assert.equal(oddCheck.errorCount, 0, oddCheck.errors.join('; '));
assert.equal(oddOut.stats.items, 5);
assert.ok(!/…|\uFFFD/.test(oddOut.csv));
for (const r of parseCsv(oddOut.csv).slice(1).filter((x) => /vienada/.test(x[5]))) {
  assert.deepEqual([r[8], r[10]], ['', ''], 'salīdzinājuma cena = cena – nav akcija');
}

// --- Dubults ID – kļūda (Google: "IDs must be unique") ---
const dup = buildItems([drops], CONFIG).items;
assert.throws(() => toGoogleAdsCustomCsv([dup[0], { ...dup[0], link: `${dup[0].link}&x=1` }], CONFIG), /atkārtojas/);

// --- Pārskata atradumi (24.11.2026): teksti, kas citādi maldinātu vai būtu nepareizi ---
const T = {
  legingi: p({ title: 'Kokvilnas legingi bērniem', productType: 'Furnitūra', variants: opt('Izmērs', ['S', 'M', 'L', 'XL']) }),
  lenteMm: p({ title: 'Satīna lente 25 mm', productType: 'Furnitūra', variants: opt('Garums', ['2', '5', '25']) }),
  skaititajs: p({ title: 'Rindu skaitītājs Pony S un L izmērs', productType: 'Furnitūra', variants: opt('Izmērs', ['S', 'L']) }),
  zelts: p({ title: 'Dzija ar zelta pavedienu - 50 g / 200 m', productType: 'Dzija' }),
  pedina: p({ title: 'Šujmašīnas pēdiņa priekš Janome Memory Craft 9450', productType: 'Šujmašīnu piederumi' }),
  spolites: p({ title: 'Spolītes priekš Brother šujmašīnām, 10 gab.', productType: 'Šujmašīnu piederumi' }),
  spiedpogas: p({ title: 'Spiedpogas metāla bez šūšanas 12 mm, 10 gab.', productType: 'Furnitūra' }),
  ravejs: p({ title: 'Rāvējslēdzējs neatdalāms bez metāla zobiem 20 cm', productType: 'Furnitūra' }),
  zvaigzne: p({ title: 'Lente „Zvaigzne“ sarkana ar baltu maliņu, 25 mm', productType: 'Furnitūra' }),
  eglite: p({ title: 'Aplikācija „Ziemassvētku eglīte“ uzgludināma, 8 cm', productType: 'Furnitūra' }),
  riga: p({ title: 'T-krekls "Rīga - mana pilsēta"', productType: 'Furnitūra' }),
  pogas: p({ title: 'Pogas (koka - dabīgas) 15 mm', productType: 'Furnitūra' }),
  zwi: p({ title: 'Dubultā adata SCHMETZ 130/705 H ZWI, 2,0/80', productType: 'Šujmašīnu adatas' }),
  priekssauts: p({ title: 'Priekšauts ar kabatām SOL’S GALA', productType: 'Apģērbi', variants: [v({ title: 'Melna', selectedOptions: [{ name: 'Krāsa', value: 'Melna' }] })] }),
  cesis: p({ title: 'Unisex džemperis ar kapuci “Cēsis”', productType: 'Customizer', variants: [v({ qty: 0, tracked: false, inventoryPolicy: 'CONTINUE' })] }),
  pukis: p({ title: 'Bērnu T-krekls ar īsām piedurknēm “Mazais pūķis”', productType: 'Customizer', variants: [v({ qty: 0, tracked: false, inventoryPolicy: 'CONTINUE' })] }),
  lins2: p({ title: 'Lina- un kokvilnas audums - zils', productType: 'Audums' }),
  filcs2: p({ title: 'Filca loksne mīksta 20 × 30 cm', productType: 'Furnitūra' }),
  satins2: p({ title: 'Satīna lente 6, 10, 15 un 25 mm, balta', productType: 'Furnitūra' }),
  skeres: p({ title: 'Drēbnieka šķēres 10" ar mīkstiem rokturiem, melnas', productType: 'Furnitūra' }),
  komplekts: p({ title: 'Adīšanas komplekts: 5 adatas + 2 diegi + šķēres', productType: 'Furnitūra' }),
  o13: p({ title: 'Piešujamās spiedpogas Ø13 mm, sudraba krāsā', productType: 'Furnitūra' }),
  zekes: p({ title: 'Dzijas Vlna Hep Best Socks 4 kārtu zeķu dzija - 100 g / 420 m', productType: 'Dzija' }),
  karogs: p({ title: 'Atstarotājs Latvija 🇱🇻', productType: 'Furnitūra', variants: [v({ title: 'Sarkana 🇱🇻', selectedOptions: [{ name: 'Krāsa', value: 'Sarkana 🇱🇻' }] }), v({ title: 'Balta' , selectedOptions: [{ name: 'Krāsa', value: 'Balta' }] })] }),
  keycap: p({ title: 'Uzšuve 1️⃣ numurs', productType: 'Furnitūra' }),
  tonis: p({ title: 'Krūzīte 👍🏻 forša!!!', productType: 'Furnitūra' }),
  lietota: p({ title: 'Šujmašīna Janome lietotā', productType: 'Šujmašīnas' }),
  lietotas: p({ title: 'Lietotas adāmadatas komplekts', productType: 'Furnitūra' }),
};
const tItems = buildItems(Object.values(T), CONFIG).items;
const tOut = toGoogleAdsCustomCsv(tItems, CONFIG);
const tRows = parseCsv(tOut.csv).slice(1);
const tr = (prod, i = 0) => {
  const r = tRows.find((x) => x[0] === vid(prod, i));
  return r && { title: r[1], subtitle: r[2], description: r[3] };
};
assert.deepEqual(T.legingi.variants.map((_, i) => tr(T.legingi, i).subtitle), ['S', 'M', 'L', 'XL'], 'izmērs nav "kokvilnas" burts');
assert.deepEqual(T.lenteMm.variants.map((_, i) => tr(T.lenteMm, i).subtitle), ['2', '5', '25'], 'katram variantam savs apakšvirsraksts');
assert.deepEqual(T.skaititajs.variants.map((_, i) => tr(T.skaititajs, i).subtitle), ['S', 'L'], 'variantus var atšķirt');
assert.equal(tr(T.zelts).title, 'Dzija ar zelta pavedienu', '"Dzija" paliek pirms maza burta');
assert.ok(tr(T.pedina).title.startsWith('Šujmašīnas pēdiņa'), `piederums nav mašīna: ${tr(T.pedina).title}`);
assert.ok(!/priekš$/i.test(tr(T.pedina).description) && !/priekš$/i.test(tr(T.spolites).description));
assert.equal(tr(T.spolites).title, 'Spolītes priekš Brother');
assert.equal(tr(T.spiedpogas).description, 'Bez šūšanas 12 mm', '"bez" nav atmests');
assert.equal(tr(T.ravejs).description, 'Bez metāla zobiem 20 cm');
const balanced = (x) => {
  const q = (x.match(/[„“”"]/g) || []).length;
  return q % 2 === 0 && (x.match(/\(/g) || []).length === (x.match(/\)/g) || []).length;
};
for (const prod of [T.zvaigzne, T.eglite, T.riga, T.pogas]) {
  for (const [k, x] of Object.entries(tr(prod))) assert.ok(balanced(x), `${prod.title} ${k} "${x}" – nesapārotas pēdiņas vai iekavas`);
}
assert.equal(tr(T.zvaigzne).title, 'Lente „Zvaigzne“ sarkana');
assert.equal(tr(T.riga).description, '"Rīga - mana pilsēta"');
assert.equal(tr(T.pogas).title, 'Pogas (koka - dabīgas)');
assert.equal(tr(T.zwi).title, 'SCHMETZ 130/705 H ZWI', 'koda lielie burti paliek');
assert.equal(tr(T.priekssauts).title, 'Priekšauts ar kabatām', 'apģērbam – veids, ne sagataves zīmols');
assert.equal(tr(T.priekssauts).description, 'SOL’S Gala', 'daļa ar lielajiem burtiem – nosaukuma rakstībā');
assert.equal(tr(T.cesis).title, 'Unisex džemperis “Cēsis”');
assert.equal(tr(T.pukis).title, 'T-krekls “Mazais pūķis”');
assert.equal(tr(T.lins2).title, 'Lina- un kokvilnas audums', 'piekares domuzīme nav atdalītājs');
assert.deepEqual([tr(T.filcs2).title, tr(T.filcs2).description], ['Filca loksne mīksta', '20 × 30 cm']);
assert.deepEqual([tr(T.satins2).title, tr(T.satins2).description], ['Satīna lente', '6, 10, 15 un 25 mm, balta']);
assert.equal(tr(T.skeres).title, 'Drēbnieka šķēres 10"', 'collas nav pēdiņa');
assert.equal(tr(T.skeres).description, 'Ar mīkstiem rokturiem');
assert.equal(tr(T.komplekts).title, 'Adīšanas komplekts');
assert.equal(tr(T.o13).title, 'Piešujamās spiedpogas');
assert.equal(tr(T.zekes).title, 'Vlna Hep Best Socks', 'skaitlis bez sava lietvārda ("4 kārtu") – nost');
assert.deepEqual(tr(T.karogs), { title: 'Atstarotājs Latvija', subtitle: 'Sarkana', description: 'Furnitūra' });
assert.equal(tr(T.keycap).title, 'Uzšuve numurs');
assert.equal(tr(T.tonis).title, 'Krūzīte forša!');
assert.ok(!/\p{RGI_Emoji}|\p{Regional_Indicator}|\p{Emoji_Modifier}|⃣/v.test(tOut.csv), 'nekādu emocijzīmju');
assert.equal(tr(T.lietota), undefined, '"lietotā" – lietota prece');
assert.equal(tr(T.lietotas), undefined, '"Lietotas" – lietota prece');
// Pārbaude atrod emocijzīmes, "!!" un reklāmas frāzes
const tBad = (fn) => validateGoogleAdsCustomCsv(fn(tOut.csv), CONFIG);
assert.ok(tBad((s) => s.replace('Atstarotājs Latvija', 'Atstarotājs 🇱🇻')).errors.some((e) => /emocijzīme/.test(e)));
assert.ok(tBad((s) => s.replace('Uzšuve numurs', 'Uzšuve 1⃣')).errors.some((e) => /emocijzīme/.test(e)));
assert.ok(tBad((s) => s.replace('Krūzīte forša!', 'Krūzīte forša!!!')).errors.some((e) => /triku/.test(e)));
assert.ok(tBad((s) => s.replace('Krūzīte forša!', 'Krūzīte ★ forša')).errors.some((e) => /triku/.test(e)));
assert.ok(tBad((s) => s.replace('Krūzīte forša!', 'BEZMAKSAS piegāde')).warnings.some((e) => /reklāmas frāze/.test(e)));
assert.equal(validateGoogleAdsCustomCsv(tOut.csv, CONFIG).errorCount, 0);

// --- Saīsināšana pēc kataloga vārdu statistikas (24.11.2026): preces vārds paliek, apzīmētāji sākumā var iet nost ---
// Vārdu skaits veikala katalogā [frāzes beigās, pirms cita vārda] – "kokvilnas" gandrīz vienmēr ir apzīmētājs, "audums" – preces vārds.
const CATALOG_STATS = new Map(Object.entries({
  metāla: [22, 239], auklas: [15, 21], fiksators: [18, 0], schmetz: [120, 55], rūpniecisko: [0, 76], šujmašīnu: [2, 177], adatas: [157, 30],
  ādai: [36, 0], personalizēts: [0, 13], džemperis: [10, 3], ar: [247, 712], jūsu: [1, 28], logo: [3, 0], melns: [137, 17], dzijas: [78, 8],
  alize: [13, 0], apļa: [0, 7], adāmadatas: [18, 2], drops: [42, 3], izmērs: [30, 0], velūrs: [26, 0], burzījuma: [0, 11], efektu: [38, 1],
  dabīgā: [0, 8], liellopa: [0, 3], āda: [14, 0], rokdarbiem: [12, 0], mīksta: [2, 11], faktūru: [3, 0], un: [67, 221], elastīga: [3, 80],
  organiskās: [0, 47], kokvilnas: [8, 1081], konfeti: [1, 2], sirsniņas: [11, 0], ab: [0, 3], mikss: [3, 0], iepakojums: [208, 0],
  viskozes: [5, 143], audums: [910, 63], zilā: [6, 8], arabeska: [1, 0], ūdensizturīgs: [21, 12], lietusmēteļu: [0, 11], balts: [120, 5],
  palīgs: [3, 9], gumiju: [2, 0], lentu: [0, 6], ievēršanai: [8, 4], oranži: [3, 10], zili: [5, 25], tropu: [0, 16], ziedi: [129, 6],
  klipsis: [5, 1], brošu: [2, 0], sprādzīšu: [0, 2], izgatavošanai: [19, 1], komplektā: [78, 0], gaiši: [1, 170], zils: [140, 32],
  tvills: [9, 0], nelielu: [0, 2], defektu: [5, 0], francija: [4, 0], sarkana: [71, 7], dublēta: [0, 1], vilnas: [1, 41], trikotāža: [195, 0],
  mēteļiem: [2, 0], vilna: [16, 0], itālija: [14, 0], tumši: [4, 334], brūns: [49, 12], kleitām: [7, 0], blūzēm: [2, 0], sprādze: [20, 0],
  jostai: [5, 0], vai: [7, 13], somai: [6, 0], auduma: [3, 116], bērnu: [4, 19], amigurumi: [0, 4], komplekts: [60, 9],
  // Trešais skaitlis – cik reizes ar mazo burtu ("Roma" – nekad, tātad nosaukums).
  punto: [0, 11, 0], di: [17, 0, 16], roma: [0, 16, 0], trikotāžas: [0, 31, 23], krāsains: [0, 8, 8], raksts: [97, 2, 99],
  mākslīgās: [0, 18, 15], ādas: [5, 20, 21], slīpā: [0, 54, 54], diega: [4, 55, 58], lenta: [260, 2, 218], mm: [1554, 53, 1607],
  melna: [154, 25, 178], sintētiskā: [0, 2, 0], ahāta: [0, 3, 3], minerālu: [1, 5, 5], pērlītes: [61, 6, 65], gab: [554, 0, 554],
  slīdnis: [5, 1, 2], kuģītis: [0, 5, 5], spirālveida: [3, 0, 3], rāvējslēdzējam: [9, 0, 9], caurumu: [9, 7, 13], veidošanas: [1, 3, 4],
  knaibles: [8, 2, 8], prym: [39, 10, 0], pašlīmējoši: [1, 3, 0], velcro: [0, 9, 0], taisnstūri: [1, 0, 1], šujmašīnas: [0, 39, 0],
  pēdiņa: [53, 3, 56], abpusēja: [2, 0, 2], šaura: [4, 1, 5], rāvējslēdzēju: [1, 2, 2], iešūšanai: [4, 0, 4],
}));
const W = {
  fiksators: p({ title: 'Metāla auklas fiksators 14 × 17 mm, 10 gab.', productType: 'Furnitūra' }),
  schmetz: p({ title: 'DPx35 LR, 134-35 LR - SCHMETZ rūpniecisko šujmašīnu adatas ādai, 10 gab.', productType: 'Šujmašīnu adatas' }),
  jusu: p({ title: 'Personalizēts džemperis ar jūsu logo - melns', productType: 'Customizer' }),
  softy: p({ title: 'Dzijas Alize Softy Plus 100 g / 120 m', productType: 'Dzija' }),
  dropsRange: p({ title: 'Apļa adāmadatas DROPS 60 cm, izmērs 2,0 mm - 5,0 mm', productType: 'Adāmadatas' }),
  velurs: p({ title: 'Velūrs ar burzījuma efektu - melns', productType: 'Audums' }),
  numurs: p({ title: '3. Dabīgā liellopa āda rokdarbiem - mīksta ar faktūru un elastīga 0,9-1,1 mm', productType: 'Audums' }),
  pedinas: p({ title: 'Organiskās kokvilnas T-krekls"Kādreiz es biju noteicējs…"', productType: 'Customizer',
    variants: [v({ qty: 0, tracked: false, inventoryPolicy: 'CONTINUE' })] }),
  ab: p({ title: 'Konfeti sirsniņas ar AB efektu - mikss Nr. 3 (iepakojums)', productType: 'Dāvanu iesaiņojums' }),
  viskoze: p({ title: 'Viskozes un kokvilnas audums - zilā arabeska', productType: 'Audums' }),
  udens: p({ title: 'Ūdensizturīgs lietusmēteļu audums - balts', productType: 'Audums' }),
  paligs: p({ title: 'Palīgs gumiju un lentu ievēršanai', productType: 'Piederumi un instrumenti' }),
  tropu: p({ title: '100 % kokvilnas audums - oranži un zili tropu ziedi', productType: 'Audums' }),
  klipsis: p({ title: 'Klipsis brošu un sprādzīšu izgatavošanai 25 × 40 mm (komplektā 2 gab.)', productType: 'Pērlītes un rotu furnitūra' }),
  gaisi: p({ title: 'Gaiši zils viskozes tvills ar nelielu defektu - Francija', productType: 'Audums' }),
  sarkana: p({ title: 'Sarkana dublēta vilnas trikotāža mēteļiem - 80 % vilna, Itālija', productType: 'Audums' }),
  tumsi: p({ title: 'Tumši brūns viskozes tvills kleitām un blūzēm - Francija', productType: 'Audums' }),
  jostai: p({ title: 'Metāla sprādze jostai vai somai 30-40 mm', productType: 'Furnitūra' }),
  maisins: p({ title: 'Kokvilnas auduma maisiņš “Normāla zoss”', productType: 'Customizer',
    variants: [v({ qty: 0, tracked: false, inventoryPolicy: 'CONTINUE', categoryPath: ['Gatavie izstrādājumi un apdruka', 'Auduma maisiņi'] })] }),
  veggie: p({ title: 'DMC Amigurumi komplekts “Veggie” - Dārzeņu kolekcija', productType: 'Furnitūra' }),
  priekssauts: p({ title: 'Priekšauts tumši zaļš “Slepenā recepte”', productType: 'Customizer',
    variants: [v({ qty: 0, tracked: false, inventoryPolicy: 'CONTINUE' })] }),
  punto: p({ title: 'Punto di Roma trikotāžas audums - krāsains raksts', productType: 'Audums' }),
  maksliga: p({ title: 'Mākslīgās ādas slīpā diega lenta 30 mm - melna', productType: 'Furnitūra' }),
  sintetiska: p({ title: 'Sintētiskā ahāta minerālu pērlītes Ø6 mm, 10 gab.', productType: 'Pērlītes un rotu furnitūra' }),
  slidnis: p({ title: 'Slīdnis, kuģītis spirālveida rāvējslēdzējam Nr.5', productType: 'Furnitūra' }),
  caurumu: p({ title: 'Caurumu veidošanas knaibles PRYM', productType: 'Piederumi un instrumenti' }),
  velcro: p({ title: 'Pašlīmējoši Velcro taisnstūri 15 × 25 mm', productType: 'Furnitūra' }),
  iesusanai: p({ title: 'Šujmašīnas pēdiņa - abpusēja, šaura rāvējslēdzēju iešūšanai', productType: 'Šujmašīnu pēdiņas' }),
};
const wOut = toGoogleAdsCustomCsv(buildItems(Object.values(W), CONFIG).items, CONFIG, { wordStats: CATALOG_STATS });
const wRows = parseCsv(wOut.csv).slice(1);
const wr = (prod) => {
  const r = wRows.find((x) => x[0] === vid(prod));
  return r && `${r[1]} ¦ ${r[3]}`;
};
assert.equal(wr(W.fiksators), 'Metāla auklas fiksators ¦ 14 × 17 mm, 10 gab.', '"auklas" nav preces vārds');
assert.equal(wr(W.schmetz), 'DPx35 LR, 134-35 LR ¦ SCHMETZ adatas ādai', 'zīmols paliek, aprakstā – kam adatas ("ādai")');
assert.equal(wr(W.jusu), 'Personalizēts džemperis ¦ Ar jūsu logo, melns', 'nebeidzas ar "ar jūsu"');
assert.equal(wr(W.softy), 'Alize Softy Plus ¦ 100 g / 120 m', '"100 g" netiek atrauts no "/ 120 m"');
assert.equal(wr(W.dropsRange), 'Apļa adāmadatas DROPS ¦ 60 cm', 'diapazons "2,0 mm - 5,0 mm" nav pārgriezts, "izmērs" bez vērtības – nost');
assert.equal(wr(W.velurs), 'Velūrs ¦ Ar burzījuma efektu', 'nav "Velūrs ar burzījuma"');
assert.equal(wr(W.numurs), 'Dabīgā liellopa āda ¦ Rokdarbiem', 'kārtas numurs sākumā ("3.") nav nosaukuma daļa');
assert.equal(wr(W.pedinas), 'Kokvilnas T-krekls ¦ Kādreiz es biju noteicējs', 'pielipusi pēdiņa atdalīta, sauklis – vesels teikums');
assert.equal(wr(W.ab), 'Konfeti sirsniņas ¦ Ar AB efektu, mikss Nr. 3', 'nav "ar AB" bez lietvārda');
assert.equal(wr(W.viskoze), 'Viskozes un kokvilnas ¦ Audums, zilā arabeska', 'sastāvs netiek atmests pa pusei ("Kokvilnas audums" maldinātu)');
assert.equal(wr(W.udens), 'Lietusmēteļu audums ¦ Ūdensizturīgs, balts', 'īpašības vārds sākumā – nost, nevis viens pats; aprakstā kopā ar krāsu');
assert.equal(wr(W.paligs), 'Palīgs gumiju un lentu ¦ Ievēršanai', '"Palīgs" ir preces vārds, ne īpašības vārds');
assert.equal(wr(W.tropu), '100 % kokvilnas audums ¦ Tropu ziedi', 'abas krāsas nost kopā, ne pa vienai');
assert.equal(wr(W.klipsis), 'Klipsis ¦ Sprādzīšu izgatavošanai', '"brošu" ir lietvārds');
assert.equal(wr(W.gaisi), 'Viskozes tvills ¦ Ar nelielu defektu', 'nav "Zils …" bez "Gaiši"');
assert.equal(wr(W.sarkana), 'Dublēta vilnas trikotāža ¦ Mēteļiem, 80 % vilna', 'krāsa sākumā – nost, preces vārds paliek');
assert.equal(wr(W.tumsi), 'Viskozes tvills ¦ Kleitām un blūzēm', 'pāris "kleitām un blūzēm" kopā aprakstā');
assert.equal(wr(W.jostai), 'Metāla sprādze ¦ Jostai vai somai 30-40 mm');
assert.equal(wr(W.maisins), 'Maisiņš “Normāla zoss” ¦ Kokvilnas auduma maisiņš', 'atmestie sākuma vārdi ar preces veidu – aprakstā');
assert.equal(wr(W.priekssauts), '“Slepenā recepte” ¦ Priekšauts tumši zaļš', 'nosaukumā nav tikai krāsa "Zaļš" pirms dizaina');
assert.ok(!/Dārzeņu$/.test(wr(W.veggie)), `lielais burts aiz komata nav nosaukums: ${wr(W.veggie)}`);
assert.equal(wr(W.punto), 'Punto di Roma ¦ Trikotāžas audums', '"Roma" katalogā nekad nav ar mazo burtu – nosaukums, netiek atmests');
assert.equal(wr(W.maksliga), 'Slīpā diega lenta 30 mm ¦ Mākslīgās ādas, melna', 'nav "Ādas …" bez "Mākslīgās"; tas aprakstā');
assert.equal(wr(W.sintetiska), 'Minerālu pērlītes Ø6 mm ¦ Sintētiskā ahāta, 10 gab.', '"Sintētiskā" netiek pazaudēts');
assert.equal(wr(W.slidnis), 'Slīdnis, kuģītis ¦ Rāvējslēdzējam Nr.5', 'nav "Spirālveida" bez lietvārda');
assert.equal(wr(W.caurumu), 'Knaibles PRYM ¦ Caurumu veidošanas', '"Caurumu veidošanas" – tikai abi kopā');
assert.equal(wr(W.velcro), 'Velcro taisnstūri ¦ Pašlīmējoši, 15 × 25 mm', 'nosaukums nebeidzas ar zīmolu bez lietvārda');
assert.equal(wr(W.iesusanai), 'Šujmašīnas pēdiņa ¦ Rāvējslēdzēju iešūšanai', 'nav "Šaura rāvējslēdzēju"');
assert.equal(validateGoogleAdsCustomCsv(wOut.csv, CONFIG).errorCount, 0);

// --- Atskaite: iekļautie + izlaistie = visi varianti ---
const recon = buildItems([...products, ...Object.values(T)], CONFIG);
const rOut = toGoogleAdsCustomCsv(recon.items, CONFIG);
const allVariants = [...products, ...Object.values(T)].flatMap((x) => x.variants.map((y) => y.id.split('/').pop()));
const accounted = [...parseCsv(rOut.csv).slice(1).map((r) => r[0]), ...rOut.excluded.map((x) => x.id), ...recon.skippedVariants.map((x) => x.id)];
assert.deepEqual([...accounted].sort(), [...allVariants].sort(), 'katrs variants ir vai nu failā, vai izlaists ar iemeslu');
assert.ok(rOut.excluded.every((x) => x.id && x.reason) && recon.skippedVariants.every((x) => x.id && x.reason));
assert.equal(recon.skippedVariants.find((x) => x.id === vid(davana)).reason, 'dāvanu karte');

// --- generate.mjs importējas bez palaišanas ---
await import('../generate.mjs');

console.log(`Google Ads Custom: ${stats.items} rindas, izlaistas ${JSON.stringify(stats.skipped)}, piezīmes ${JSON.stringify(stats.notes)}`);
console.log('Visas Google Ads Custom pārbaudes izietas.');
