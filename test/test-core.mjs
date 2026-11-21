// Pārbauda noteikumus ar dažiem piemēriem: node test/test-core.mjs
import assert from 'node:assert/strict';
import { buildItems, toXml, toKurpirktXml, kurpirktCombinedItems, cenoCategory, validGtin, CONFIG } from '../feed-core.mjs';

const v = (o) => ({ id: 'gid://shopify/ProductVariant/1001', title: 'Default Title', price: 1, available: true, qty: 10,
  tracked: true, requiresShipping: true, grams: 100, image: '', barcode: '', categoryPath: [], ...o });
const p = (o) => ({ title: 'X', handle: 'x', productType: 'Audums', vendor: 'KJ', tags: [], isGiftCard: false,
  onlineStore: true, image: 'https://cdn.example/x.jpg', variants: [v({})], ...o });

const products = [
  // metrā: 0,39 € par 10 cm, 440 vienības → 3,90 €/m, 44 m
  p({ title: '100 % kokvilnas audums – lāči un sirsniņas', handle: 'kokvilnas-audums-laci', tags: ['decimal', 'Kokvilnas audumi'],
    variants: [v({ id: 'gid://shopify/ProductVariant/60987743568206', price: 0.39, qty: 440, barcode: '43568206', categoryPath: ['Audumi', 'Kokvilnas audumi'] })] }),
  // metrā, bet atlikumā tikai 0,9 m → nerādām
  p({ title: 'Audums atlikums', handle: 'a', tags: ['decimal'], variants: [v({ price: 2.69, qty: 9 })] }),
  // metrā, lēta lenta 0,08 € → 0,80 €/m → zem 3 €
  p({ title: 'Pom Pom lenta', handle: 'pp', productType: 'Lentas', tags: ['decimal'], variants: [v({ price: 0.08, qty: 500 })] }),
  // dzija ar variantiem, zīmols nosaukumā, derīgs EAN
  p({ title: 'Dzijas Alize Lanagold 800 – 100 g / 730 m', handle: 'alize', productType: 'Dzija', vendor: 'VH',
    variants: [v({ id: 'gid://shopify/ProductVariant/2001', title: 'Piena balta – #01', price: 4.5, qty: 7, barcode: '8693276000014', categoryPath: ['Dzija', 'Akrila dzija'] }),
               v({ id: 'gid://shopify/ProductVariant/2002', title: 'Ķiršu sarkana – #390', price: 4.5, qty: 0 })] }),
  p({ title: 'Dāvanu karte', handle: 'gc', productType: 'Dāvanu kartes', isGiftCard: true }),
  p({ title: 'T-krekls', handle: 't', productType: 'Customizer', variants: [v({ price: 29.9, tracked: false, qty: null })] }),
  p({ title: 'Digitāla piegrieztne', handle: 'd', productType: 'Piegrieztne', variants: [v({ price: 2.9, requiresShipping: false })] }),
  // tikai kurjers, smags
  p({ title: 'Manekens šūšanai', handle: 'm', productType: 'COURIER_ONLY', variants: [v({ price: 179.9, qty: 2, grams: 4500 })] }),
  // dārga prece → piegāde 0
  p({ title: 'Bernette 33 šujmašīna', handle: 'b', productType: 'Šujmašīnas', variants: [v({ price: 249, qty: 1 })] }),
  // dublikāts
  p({ title: 'Bernette 33 šujmašīna', handle: 'b2', productType: 'Šujmašīnas', variants: [v({ price: 249, qty: 1 })] }),
  // XML speciālās rakstzīmes
  p({ title: 'Lineāls <30 cm> & "zīmulis"', handle: 'l', productType: 'Lineāli un mērinstrumenti', variants: [v({ price: 5, qty: 3 })] }),
  // T-krekls apdrukai bez tipa → rādām (Edgars 21.11.2026); T-kreklu dzija → rādām
  p({ title: 'T-krekls SOL’S Legend Unisex 175 g/m²', handle: 'sol', productType: '', tags: ['apdruka'], variants: [v({ price: 9.9, qty: 5 })] }),
  p({ title: 'T-kreklu spageti dzijas – 700 g / 120 m', handle: 'spag', productType: 'Dzija', variants: [v({ price: 6.9, qty: 3 })] }),
  // ar defektu → <used>1</used>
  p({ title: 'Kokvilnas trikotāža ar defektu – balta', handle: 'def', tags: ['decimal'], variants: [v({ price: 0.79, qty: 50 })] }),
  // "pēdējais gabaliņš" un iekšēja piezīme nosaukumā
  p({ title: 'Džinsu audums – melns- pēdējais gabaliņš 30cm', handle: 'dz', variants: [v({ price: 4.5, qty: 1 })] }),
  p({ title: 'Dzijas YarnArt Imperial Merino – 50 g / 100 m', handle: 'ia', productType: 'Dzija',
    variants: [v({ id: 'gid://shopify/ProductVariant/3001', title: '3315-neatjaunot', price: 3.2, qty: 2 }), v({ id: 'gid://shopify/ProductVariant/3002', title: '3316', price: 3.2, qty: 2 })] }),
];
// Kategorijas: 12 dzijas ar SEO tagu "alpakas dzija" visām → tas nav kategorija
for (let i = 0; i < 12; i++) {
  products.push(p({ title: `Dzija Nr${i}`, handle: `y${i}`, productType: 'Dzija', tags: ['alpakas dzija', 'Dzija', i < 2 ? 'DROPS-Air' : `Cits-${i}`],
    variants: [v({ price: 4, qty: 1 })] }));
}
for (let i = 0; i < 12; i++) {
  products.push(p({ title: `Audums Nr${i}`, handle: `a${i}`, tags: ['decimal', 'Trikotāža', ...(i < 3 ? ['Siltināta trikotāža'] : i < 7 ? ['Kokvilnas trikotāža'] : ['Bērnu audumi', 'Prece', '-Ražots Latvijā-'])],
    variants: [v({ price: 0.9, qty: 100 })] }));
}

// Noteikumu loģiku pārbaudām ar 3 € robežu; pašreizējā CONFIG minimālās cenas nav.
const { items, stats } = buildItems(products, { ...CONFIG, minPrice: 3 });
assert.equal(CONFIG.minPrice, 0);
assert.ok(buildItems(products, CONFIG).items.some((i) => i.name.startsWith('Pom Pom lenta')), 'bez minimālās cenas lētā lenta ir failā');
const by = Object.fromEntries(items.map((i) => [i.name, i]));

const fabric = by['100 % kokvilnas audums - lāči un sirsniņas (cena par 1 m)'];
assert.equal(fabric.price, '3.90');
assert.equal(fabric.in_stock, '44');
assert.equal(fabric.ean, '', 'automātiski ģenerētais kods nav EAN');
assert.equal(fabric.category_full, 'Audumi >> Kokvilnas audumi');
assert.equal(fabric.link, 'https://sarlotesaudumi.lv/products/kokvilnas-audums-laci');
assert.equal(fabric.delivery_latvija, '3.30');

const yarn = by['Dzijas Alize Lanagold 800 - 100 g / 730 m - Piena balta - #01'];
assert.equal(yarn.brand, 'Alize');
assert.equal(yarn.ean, '8693276000014');
assert.equal(yarn.link, 'https://sarlotesaudumi.lv/products/alize?variant=2001');
assert.equal(yarn.in_stock, '7');

assert.equal(by['Manekens šūšanai'].delivery_latvija, '15.90');
assert.equal(by['Bernette 33 šujmašīna'].delivery_latvija, '0.00');
assert.equal(by['Bernette 33 šujmašīna'].brand, 'Bernette');

assert.ok(by['T-krekls SOL’S Legend Unisex 175 g/m²'], 'T-krekli ir failā');
assert.equal(stats.skipped['T-krekli/džemperi'], undefined);
assert.ok(by['T-kreklu spageti dzijas - 700 g / 120 m'], 'T-kreklu dzija paliek');
// Apdrukas prece (Customizer, atlikums netiek uzskaitīts) – failā, bez atlikuma, termiņš ar izgatavošanu (1–2 d.d.)
const tee = by['T-krekls'];
assert.ok(tee, 'Customizer prece ir failā');
assert.equal(tee.in_stock, '', 'apdrukas precei atlikums netiek likts');
assert.equal(tee.delivery_days_latvija, '5');
assert.equal(tee.delivery_days_shop, '2');
assert.ok(!toXml([tee]).includes('<in_stock>') && toXml([tee]).includes('<delivery_days_latvija>5</delivery_days_latvija>'));
assert.equal(by['T-krekls SOL’S Legend Unisex 175 g/m²'].delivery_days_latvija, '3', 'tukšais krekls – parastais termiņš');

const defect = by['Kokvilnas trikotāža ar defektu - balta (cena par 1 m)'];
assert.equal(defect.used, '1');
assert.equal(fabric.used, '');
assert.ok(toXml([defect]).includes('<used>1</used>'));
assert.ok(!toXml([fabric]).includes('<used>'));

assert.ok(by['Džinsu audums - melns - gabals 30 cm'], 'pēdējais gabaliņš → gabals');
assert.ok(by['Dzijas YarnArt Imperial Merino - 50 g / 100 m - 3315'], 'bez -neatjaunot');

assert.equal(by['Dzija Nr0'].category_full, 'Dzija >> DROPS-Air');
assert.equal(by['Dzija Nr5'].category_full, 'Dzija', 'SEO tags un viena produkta tags nav kategorija');
assert.equal(by['Audums Nr1 (cena par 1 m)'].category_full, 'Audums >> Siltināta trikotāža');
assert.equal(by['Audums Nr5 (cena par 1 m)'].category_full, 'Audums >> Kokvilnas trikotāža');
assert.equal(by['Audums Nr8 (cena par 1 m)'].category_full, 'Audums >> Bērnu audumi');

assert.equal(items.length, 5 + 3 + 2 + 12 + 12 + 2); // + spageti, defekts, džinss; merino ×2; dzijas; audumi; 2 T-krekli
assert.equal(stats.items, items.length);
assert.equal(stats.skipped['atlikumā mazāk par 1 m'], 1);
assert.equal(stats.skipped['cena zem 3.00 €'], 1);
assert.equal(stats.skipped['0 atlikums'], 1);
assert.equal(stats.skipped['dāvanu karte'], 1);
assert.equal(stats.skipped['tips Customizer'], undefined);
assert.equal(stats.skipped['digitāla prece'], 1);
assert.equal(stats.skipped['dublikāts'], 1);

assert.equal(validGtin('5901234123457'), '5901234123457');
assert.equal(validGtin('5901234123458'), null);

const xml = toXml(items);
assert.ok(xml.includes('Lineāls &lt;30 cm&gt; &amp; &quot;zīmulis&quot;'));
// Kurpirkt formāts
const kp = toKurpirktXml([fabric, yarn, defect]);
assert.ok(kp.startsWith("<?xml version='1.0' encoding='utf-8' ?>\n<root>"));
assert.ok(kp.includes('<category_full>Audumi &gt; Kokvilnas audumi</category_full>'));
assert.ok(kp.includes('<category>Kokvilnas audumi</category>'));
assert.ok(kp.includes('<manufacturer>Alize</manufacturer>'));
assert.ok(kp.includes('<manufacturer></manufacturer>'), 'tukšs zīmols paliek kā tukšs tags');
assert.ok(kp.includes('<delivery_cost_riga>3.30</delivery_cost_riga>'));
assert.ok(kp.includes('<used>1</used>') && kp.includes('<used>0</used>'));
assert.ok(kp.includes('<in_stock>44</in_stock>'));

// Salidzini/KurPirkt kategoriju nosaukumi (Edgara apstiprinājums J2, J3): tikai šajos divos failos un tikai pēdējais līmenis.
const ren = buildItems([
  p({ title: 'Dzijas DROPS Alaska – 50 g / 70 m', handle: 'alaska', productType: 'Dzija',
    variants: [v({ id: 'gid://shopify/ProductVariant/4001', price: 3.95, qty: 5, categoryPath: ['Dzija', 'Vilnas un dzīvnieku šķiedru dzija'] })] }),
  p({ title: 'Plecu polsteri 20 mm', handle: 'polsteri', productType: 'Polsteri',
    variants: [v({ id: 'gid://shopify/ProductVariant/4002', price: 1.2, qty: 5, categoryPath: ['Šūšanas materiāli', 'Citi šūšanas materiāli'] })] }),
  p({ title: 'Magnēta aizdare', handle: 'magnets', productType: 'Furnitūra metāla',
    variants: [v({ id: 'gid://shopify/ProductVariant/4003', price: 1.5, qty: 5, categoryPath: ['Šūšanas materiāli', 'Citi šūšanas materiāli'] })] }),
], CONFIG).items;
const rx = toXml(ren);
const rk = toKurpirktXml(ren);
assert.ok(rx.includes('<category_full>Dzija &gt;&gt; Vilnas dzijas</category_full>'));
assert.ok(rk.includes('<category>Vilnas dzijas</category>') && rk.includes('<category_full>Dzija &gt; Vilnas dzijas</category_full>'));
assert.ok(rx.includes('<category_full>Šūšanas materiāli &gt;&gt; Polsteri</category_full>'));
assert.ok(rk.includes('<category>Polsteri</category>'));
assert.ok(rx.includes('<category_full>Šūšanas materiāli &gt;&gt; Citi šūšanas materiāli</category_full>'), 'ne-polsteri paliek esošajā kategorijā');
assert.equal(ren[0].category_full, 'Dzija >> Vilnas un dzīvnieku šķiedru dzija', 'items (Ceno, Cenueksperts, Google, EE, LT) – Shopify nosaukums');
assert.ok(toXml([fabric]).includes('<category_full>Audumi &gt;&gt; Kokvilnas audumi</category_full>'), 'nepiesaistītās kategorijas nemainās');

// KurPirkt kopīgais ieraksts (CONFIG.kurpirktCombined, Edgara lēmumi 21.11.2026: DROPS Air, tad visas dzijas):
// tikai kurpirkt.xml, faila sākumā, krāsu ieraksti paliek; cita prece un citi faili nemainās.
assert.deepEqual(CONFIG.kurpirktCombined.productTypes, ['Dzija'], 'visas dzijas (Shopify tips "Dzija")');
const airV = (n, o = {}) => v({ id: `gid://shopify/ProductVariant/77${n}`, title: `0${n} · krāsa`, price: 5.3, qty: n * 10,
  image: `https://cdn.example/air-${n}.jpg`, categoryPath: ['Dzija', 'Vilnas un dzīvnieku šķiedru dzija'],
  selectedOptions: [{ name: 'Krāsa', value: `0${n} · krāsa` }], ...o });
const air = (variants, o = {}) => p({ id: 'gid://shopify/Product/777', title: 'Dzijas DROPS Air – 50 g / 150 m', handle: 'dzijas-drops-air',
  productType: 'Dzija', vendor: 'DROPS', image: 'https://cdn.example/air.jpg', variants, ...o });
const kcfg = CONFIG;
const noComb = { ...CONFIG, kurpirktCombined: { ...CONFIG.kurpirktCombined, productTypes: [], productIds: [] } };
const airItems = buildItems([air([airV(1), airV(2), airV(3)]), p({ title: 'Cits', handle: 'cits', variants: [v({ price: 2, qty: 1 })] })], kcfg).items;
const kc = toKurpirktXml(airItems, kcfg);
const kItems = kc.match(/<item>[\s\S]*?<\/item>/g);
assert.equal(kItems.length, 5, '4 preces + 1 kopīgais');
assert.ok(kItems[0].includes('<name>Dzijas DROPS Air - 50 g / 150 m (3 krāsas)</name>'), kItems[0]);
assert.ok(kItems[0].includes('<link>https://sarlotesaudumi.lv/products/dzijas-drops-air</link>'), 'saite uz produkta lapu bez ?variant');
assert.ok(kItems[0].includes('<image>https://cdn.example/air.jpg</image>'), 'produkta galvenā bilde');
assert.ok(kItems[0].includes('<price>5.30</price>') && kItems[0].includes('<in_stock>60</in_stock>'), 'cena; atlikums – visu krāsu kopā');
assert.ok(kItems[0].includes('<category>Vilnas dzijas</category>') && kItems[0].includes('<manufacturer>DROPS</manufacturer>'));
assert.ok(kItems[1].includes('?variant=771') && kItems[3].includes('?variant=773'), 'krāsu ieraksti paliek aiz kopīgā');
assert.equal(kc.replace(`${kItems[0]}\n`, ''), toKurpirktXml(airItems, noComb), 'bez kopīgā ieraksta fails ir tāds pats kā līdz šim');
assert.equal(toXml(airItems, kcfg), toXml(airItems, noComb), 'Salidzini fails nemainās');
const comb = (prods, cfg = kcfg) => { const s = {}; const r = kurpirktCombinedItems(buildItems(prods, cfg).items, cfg, s); return { n: r.length, s, r }; };
assert.deepEqual(comb([air([airV(1), airV(2, { price: 5.9 })])]).s, { 'dažādas cenas': 1 }, 'dažādas cenas – kopīgā ieraksta nav');
assert.deepEqual(comb([air([airV(1), airV(2, { qty: 0 })])]).s, { 'mazāk par 2 krāsām': 1 }, 'atlikumā tikai viena krāsa – nav');
assert.deepEqual(comb([air([1, 2].map((n) => airV(n, { selectedOptions: [{ name: 'Krāsa un svars', value: `FM-${n}/135 g` }] })))]).s,
  { 'opcija nav krāsa': 1 }, 'opcija "Krāsa un svars" – nav (nosaukums "(N krāsas)" nebūtu patiess)');
assert.equal(comb([air([airV(1), airV(2)], { productType: 'Adāmadatas' })]).n, 0, 'cits tips – nav');
assert.equal(comb([air([airV(1), airV(2)], { productType: 'Adāmadatas' })], { ...CONFIG, kurpirktCombined: { ...CONFIG.kurpirktCombined, productIds: ['777'] } }).n, 1, 'productIds – arī cita tipa produkts');
assert.ok(comb([air(Array.from({ length: 21 }, (_, i) => airV(i + 1)))]).r[0].name.endsWith('(21 krāsa)'), 'skaitļa forma: 21 krāsa');
// 192 zīmes: krāsu nosaukumi (" - A", " - B") vēl atšķiras, kopīgajam ar " (2 krāsas)" jāsaīsina produkta nosaukums
{ const r = comb([air([airV(1, { title: 'A' }), airV(2, { title: 'B' })], { title: 'Dzijas ' + 'X'.repeat(185) })]).r[0];
  assert.ok(r.name.endsWith('… (2 krāsas)') && r.name.length <= 200, 'garam nosaukumam "(N krāsas)" paliek'); }
{ const r = comb([air([airV(1), airV(2), airV(3, { title: '03 · krāsa ar defektu' })])]).r[0];
  assert.ok(r.name.endsWith('(2 krāsas)') && r.in_stock === '30', 'krāsa ar defektu (used) netiek ieskaitīta'); }

// Apdrukas preču kategorijas (Edgara apstiprinājums 21.11.2026): pēc pasūtījuma izgatavotie → "Apģērbu apdruka >> … apdruka"
// Salidzini/KurPirkt/Ceno; sagataves (ar atlikumu) un citi portāli – bez izmaiņām.
const prn = buildItems([
  p({ id: 'gid://shopify/Product/901', title: 'T-krekla apdruka ar jūsu dizainu', handle: 'tk', productType: 'Customizer',
    variants: [v({ id: 'gid://shopify/ProductVariant/9011', price: 19.9, tracked: false, qty: null, categoryPath: ['Gatavie izstrādājumi un apdruka', 'T-krekli'] })] }),
  p({ id: 'gid://shopify/Product/902', title: 'T-krekls SOL’S Legend Unisex 175 g/m²', handle: 'sol2', productType: 'Apģērbi',
    variants: [v({ id: 'gid://shopify/ProductVariant/9021', price: 9.9, qty: 5, categoryPath: ['Gatavie izstrādājumi un apdruka', 'T-krekli'] })] }),
  p({ id: 'gid://shopify/Product/903', title: 'Personalizēts džemperis ar jūsu dizainu', handle: 'dz2', productType: 'Customizer',
    variants: [v({ id: 'gid://shopify/ProductVariant/9031', price: 39.9, tracked: false, qty: null, categoryPath: ['Gatavie izstrādājumi un apdruka', 'Džemperi'] })] }),
  p({ id: 'gid://shopify/Product/904', title: 'Kokvilnas paneļa apdruka ar jūsu dizainu', handle: 'pan', productType: 'Audums',
    variants: [v({ id: 'gid://shopify/ProductVariant/9041', price: 9.9, qty: 17, categoryPath: ['Gatavie izstrādājumi un apdruka', 'Apdrukas paneļi'] })] }),
  p({ id: 'gid://shopify/Product/905', title: 'Bērnu T-krekla apdruka ar jūsu dizainu', handle: 'btk', productType: 'Customizer',
    variants: [v({ id: 'gid://shopify/ProductVariant/9051', price: 16.9, tracked: false, qty: null, categoryPath: ['Gatavie izstrādājumi un apdruka', 'Bērnu T-krekli'] })] }),
], CONFIG).items;
const px = toXml(prn); const pk = toKurpirktXml(prn);
assert.ok(px.includes('<category_full>Apģērbu apdruka &gt;&gt; T-kreklu apdruka bērniem</category_full>'));
assert.deepEqual(prn.map((it) => cenoCategory(it)), ['Apģērbu apdruka >> T-kreklu apdruka', 'Gatavie izstrādājumi un apdruka >> T-krekli',
  'Apģērbu apdruka >> Džemperu apdruka', 'Gatavie izstrādājumi un apdruka >> Auduma apdruka', 'Apģērbu apdruka >> T-kreklu apdruka bērniem'],
  'Ceno: tie paši ceļi (panelis ar tipu "Audums" arī)');
assert.ok(px.includes('<category_full>Apģērbu apdruka &gt;&gt; T-kreklu apdruka</category_full>'), 'apdrukāts krekls');
assert.ok(px.includes('<category_full>Gatavie izstrādājumi un apdruka &gt;&gt; T-krekli</category_full>'), 'sagatave paliek');
assert.ok(px.includes('<category_full>Apģērbu apdruka &gt;&gt; Džemperu apdruka</category_full>'));
assert.ok(px.includes('<category_full>Gatavie izstrādājumi un apdruka &gt;&gt; Auduma apdruka</category_full>'));
assert.ok(pk.includes('<category>T-kreklu apdruka</category>') && pk.includes('<category_full>Apģērbu apdruka &gt; T-kreklu apdruka</category_full>'));
assert.equal(prn[0].category_full, 'Gatavie izstrādājumi un apdruka >> T-krekli', 'items (Cenueksperts, Google, EE, LT) – Shopify nosaukums');


// Apģērbi: cenu portāliem viens ieraksts katrai krāsai (izmēri kopā), Google – katrs izmērs (Edgars 21.11.2026).
const sv = (id, color, size, o = {}) => v({ id: `gid://shopify/ProductVariant/${id}`, title: `${color} / ${size}`, position: id % 100,
  selectedOptions: [{ name: 'Krāsa', value: color }, { name: 'Izmērs', value: size }], image: `https://cdn.example/${color}.jpg`, ...o });
const app = buildItems([
  p({ id: 'gid://shopify/Product/77', title: 'Džemperis SOL’S COLUMBIA Unisex', handle: 'dz-col', productType: 'Apģērbi', variants: [
    sv(5103, 'Balta', 'L', { price: 24.9, qty: 4 }), sv(5101, 'Balta', 'S', { price: 24.9, qty: 2 }), sv(5104, 'Balta', '3XL', { price: 29.9, qty: 1 }),
    sv(5102, 'Balta', 'M', { price: 24.9, qty: 0 }), sv(5201, 'Melna', '3XL', { price: 29.9, qty: 3 })] }),
  p({ id: 'gid://shopify/Product/78', title: 'T-krekls “Auseklis”', handle: 'auseklis', productType: 'Customizer', variants: [
    // katrai krāsai sava bilde → ieraksts katrai krāsai (ne viena ieraksta režīms)
    v({ id: 'gid://shopify/ProductVariant/6101', title: 'T-krekls / Balta / XXS', position: 1, price: 29.9, tracked: false, qty: null, inventoryPolicy: 'CONTINUE',
      image: 'https://cdn.example/balta.jpg', selectedOptions: [{ name: 'Available Product', value: 'T-krekls' }, { name: 'Krāsa', value: 'Balta' }, { name: 'Izmērs', value: 'XXS' }] }),
    v({ id: 'gid://shopify/ProductVariant/6102', title: 'T-krekls / Balta / XS', position: 2, price: 29.9, tracked: false, qty: null, inventoryPolicy: 'CONTINUE',
      image: 'https://cdn.example/balta.jpg', selectedOptions: [{ name: 'Available Product', value: 'T-krekls' }, { name: 'Krāsa', value: 'Balta' }, { name: 'Izmērs', value: 'XS' }] }),
    // uzskaitīts, 0, bet pasūtīt drīkst (CONTINUE) → ir; uzskaitīts, 0, DENY → nav
    v({ id: 'gid://shopify/ProductVariant/6201', title: 'Priekšauts / Rozā / viens izmērs', position: 3, price: 24.9, tracked: true, qty: 0, inventoryPolicy: 'CONTINUE',
      image: 'https://cdn.example/roza.jpg', selectedOptions: [{ name: 'Available Product', value: 'Priekšauts' }, { name: 'Krāsa', value: 'Rozā' }, { name: 'Izmērs', value: 'viens izmērs' }] }),
    v({ id: 'gid://shopify/ProductVariant/6301', title: 'Maisiņš / Melna / viens izmērs', position: 4, price: 14.9, tracked: true, qty: 0, inventoryPolicy: 'DENY',
      image: 'https://cdn.example/melna.jpg', selectedOptions: [{ name: 'Available Product', value: 'Maisiņš' }, { name: 'Krāsa', value: 'Melna' }, { name: 'Izmērs', value: 'viens izmērs' }] })] }),
], CONFIG);
const appBy = Object.fromEntries(app.items.map((i) => [i._variantId, i]));
assert.equal(app.items.length, 4 + 3, 'Google: visi izmēri (bez 0 atlikuma DENY)');
assert.equal(app.stats.items, 2 + 2, 'portāliem: Balta, Melna, T-krekls Balta, Priekšauts Rozā');
assert.equal(app.stats.sizesInOneItem, 3);
assert.equal(app.stats.madeToOrder, 2);
assert.equal(app.stats.skipped['0 atlikums'], 2);
const white = appBy['5101'];
assert.equal(white.name, 'Džemperis SOL’S COLUMBIA Unisex - Balta', 'nosaukums bez izmēra');
assert.equal(white.link, 'https://sarlotesaudumi.lv/products/dz-col?variant=5101', 'saite uz lētāko un pirmo izmēru (S)');
assert.equal(white.price, '24.90');
assert.equal(white.in_stock, '2', 'atlikums – tā izmēra, uz kuru ved saite');
assert.equal(white.category_full, 'Gatavie izstrādājumi un apdruka >> Džemperi');
assert.ok(appBy['5103']._portalSkip && appBy['5104']._portalSkip && !appBy['5201']._portalSkip);
assert.equal(appBy['5201'].name, 'Džemperis SOL’S COLUMBIA Unisex - Melna');
assert.equal(appBy['5103']._baseName, 'Džemperis SOL’S COLUMBIA Unisex - Balta / L', 'Google nosaukums ar izmēru');
const ausek = appBy['6101'];
assert.equal(ausek.name, 'T-krekls “Auseklis” - Balta', 'TeeInBlue opcija "Available Product" nosaukumā netiek likta');
assert.equal(ausek.category_full, 'Gatavie izstrādājumi un apdruka >> T-krekli');
assert.equal(ausek.in_stock, '');
assert.equal(appBy['6201'].category_full, 'Gatavie izstrādājumi un apdruka >> Priekšauti');
assert.equal(appBy['6201'].in_stock, '', 'apdrukas priekšautam Shopify atlikums nav gatavu preču daudzums');
const ax = toXml(app.items);
assert.equal((ax.match(/<item>/g) || []).length, 4, 'Salidzini: viens ieraksts katrai krāsai');
assert.ok(!ax.includes('variant=5103') && !ax.includes('variant=6102'));
assert.equal((toKurpirktXml(app.items).match(/<item>/g) || []).length, 4, 'KurPirkt: viens ieraksts katrai krāsai');
assert.equal(white.brand, "SOL'S", 'zīmols no nosaukuma (SOL’S)');
// Metrā tirgota apdrukas prece – atlikuma noteikums (vismaz 1 m) paliek; publiskais avots – nepieejams variants netiek likts.
const edge = buildItems([
  p({ title: 'Apdrukāts audums', handle: 'apdr-audums', productType: 'Customizer', tags: ['decimal'],
    variants: [v({ id: 'gid://shopify/ProductVariant/7101', price: 2.5, qty: 5, tracked: true, inventoryPolicy: 'CONTINUE' })] }),
  p({ title: 'T-krekls RTP Apparel Cosmic Men', handle: 'rtp', productType: 'Customizer',
    variants: [v({ id: 'gid://shopify/ProductVariant/7201', title: 'Melna / M', price: 29.9, qty: null, tracked: null, available: false }),
      v({ id: 'gid://shopify/ProductVariant/7202', title: 'Melna / L', price: 29.9, qty: null, tracked: null, available: true })] }),
], CONFIG);
assert.equal(edge.stats.skipped['atlikumā mazāk par 1 m'], 1, 'decimal + Customizer: 0,5 m netiek rādīts');
assert.equal(edge.items.length, 1, 'publiskais avots: available=false netiek rādīts');
assert.equal(edge.items[0]._variantId, '7202');
assert.equal(edge.items[0].brand, 'RTP Apparel');

// Viens ieraksts apdrukas produktam (Edgars 21.11.2026, 1. variants): vairākas krāsas, visām viena maketa bilde.
const mv = (id, colour, size, price = 29.9) => v({ id: `gid://shopify/ProductVariant/${id}`, title: `T-krekls / ${colour} / ${size}`, position: id % 100,
  price, tracked: false, qty: null, inventoryPolicy: 'CONTINUE', image: 'https://cdn.example/makets.jpg',
  selectedOptions: [{ name: 'Available Product', value: 'T-krekls' }, { name: 'Krāsa', value: colour }, { name: 'Izmērs', value: size }] });
const mg = buildItems([
  p({ id: 'gid://shopify/Product/81', title: 'T-krekls “Auseklis”', handle: 'auseklis', productType: 'Customizer', variants: [
    mv(8101, 'Balta', 'XXS'), mv(8102, 'Balta', 'XS'), mv(8103, 'Balta', '4XL'), mv(8104, 'Melna', 'XXS'), mv(8105, 'Melna', 'XS'), mv(8106, 'Haki', '4XL')] }),
  // nosaukumā nav preces veida → priekšā "T-krekls ar apdruku"
  p({ id: 'gid://shopify/Product/82', title: 'Ko es daru brīvos brīžos?', handle: 'ko-es', productType: 'Customizer', variants: [
    mv(8201, 'Balta', 'S'), mv(8202, 'Melna', 'M')] }),
  // bērnu izmēri gados
  p({ id: 'gid://shopify/Product/83', title: 'Bērnu kokvilnas T-krekls “Cukurgailītis”', handle: 'bernu', productType: 'Customizer', variants: [
    mv(8301, 'Balta', '2 gadi'), mv(8302, 'Balta', '4 gadi'), mv(8303, 'Zila', '12 gadi')] }),
  // tukšie krekli (tips Apģērbi) – katrai krāsai sava bilde → ieraksts katrai krāsai
  p({ id: 'gid://shopify/Product/84', title: 'T-krekls SOL’S Legend Unisex', handle: 'sol', productType: 'Apģērbi', variants: [
    sv(8401, 'Balta', 'S', { price: 12.9, qty: 3 }), sv(8402, 'Melna', 'S', { price: 12.9, qty: 2 })] }),
  // tags "viens-ieraksts" – viens ieraksts arī ar dažādām bildēm
  p({ id: 'gid://shopify/Product/85', title: 'T-krekls SOL’S Imperial Kids', handle: 'kids', productType: 'Apģērbi', tags: ['viens-ieraksts'], variants: [
    sv(8501, 'Balta', '2 gadi', { price: 9.9, qty: 3 }), sv(8502, 'Melna', '4 gadi', { price: 9.9, qty: 1 })] }),
], CONFIG);
const mgBy = Object.fromEntries(mg.items.map((i) => [i._variantId, i]));
assert.equal(mg.stats.mergedProducts, 4);
assert.equal(mg.items.length, 6 + 2 + 3 + 2 + 2, 'Google: visi varianti');
assert.equal(mg.stats.items, 1 + 1 + 1 + 2 + 1, 'portāliem: pa vienam ierakstam produktam, tukšajiem – katrai krāsai');
const aus = mgBy['8101'];
assert.equal(aus.name, 'T-krekls “Auseklis” (3 krāsas, XXS-4XL)');
assert.equal(aus.link, 'https://sarlotesaudumi.lv/products/auseklis?variant=8101', 'saite – pirmā krāsa (bildē), pirmais izmērs');
assert.equal(aus.color, 'Balta');
assert.equal(aus.in_stock, '');
assert.ok(['8102', '8103', '8104', '8105', '8106'].every((id) => mgBy[id]._portalSkip));
assert.equal(mgBy['8101']._baseName, 'T-krekls “Auseklis” - T-krekls / Balta / XXS', 'Google nosaukums – varianta');
assert.equal(mgBy['8201'].name, 'T-krekls ar apdruku “Ko es daru brīvos brīžos?” (2 krāsas, S-M)');
assert.equal(mgBy['8301'].name, 'Bērnu kokvilnas T-krekls “Cukurgailītis” (2 krāsas, 2-12 g.)');
assert.equal(mgBy['8401'].name, 'T-krekls SOL’S Legend Unisex - Balta', 'tukšie krekli – katrai krāsai');
assert.equal(mgBy['8402'].name, 'T-krekls SOL’S Legend Unisex - Melna');
assert.equal(mgBy['8401'].color, undefined);
assert.equal(mgBy['8501'].name, 'T-krekls SOL’S Imperial Kids (2 krāsas, 2-4 g.)', 'tags viens-ieraksts');
const mx = toXml(mg.items);
assert.equal((mx.match(/<item>/g) || []).length, 6);
assert.ok(mx.includes('<name>T-krekls “Auseklis” (3 krāsas, XXS-4XL)</name>') && mx.includes('<color>Balta</color>'));
assert.equal((mx.match(/<color>/g) || []).length, 4, '<color> tikai viena ieraksta precēm');
assert.equal((toKurpirktXml(mg.items).match(/<item>/g) || []).length, 6);
assert.ok(!toKurpirktXml(mg.items).includes('<color>'), 'KurPirkt formātā krāsas lauka nav');
// Makets ir balts: saite uz balto krāsu, arī ja Shopify pirmā krāsa ir cita; ja baltas nav – pirmā krāsa bez <color>.
const mc = buildItems([
  p({ id: 'gid://shopify/Product/86', title: 'T-krekla apdruka ar jūsu dizainu kreisajā pusē', handle: 'kreisa', productType: 'Customizer', variants: [
    mv(8601, 'Tumši sarkans', 'XXS'), mv(8602, 'Balta', 'XS'), mv(8603, 'Balta', 'XXS')] }),
  p({ id: 'gid://shopify/Product/87', title: 'Organiskās kokvilnas T-krekls “Piens”', handle: 'piens', productType: 'Customizer', variants: [
    mv(8701, 'Melna', 'S'), mv(8702, 'Haki', 'S')] }),
], CONFIG);
const mcBy = Object.fromEntries(mc.items.map((i) => [i._variantId, i]));
assert.ok(!mcBy['8602']._portalSkip && mcBy['8602'].color === 'Balta', 'saite uz balto (pirmais baltais pēc pozīcijas)');
assert.ok(mcBy['8601']._portalSkip && mcBy['8603']._portalSkip);
assert.equal(mcBy['8602'].name, 'T-krekla apdruka ar jūsu dizainu kreisajā pusē (2 krāsas, XXS-XS)');
assert.ok(!mcBy['8701']._portalSkip && mcBy['8701'].color === '', 'nav baltas – pirmā krāsa, bez <color>');
assert.equal(mc.stats.mergedWithoutMockupColour, 1);
assert.ok(!toXml(mc.items).includes('<color></color>') && toXml(mc.items).includes('<color>Balta</color>'));

// Robežgadījumi (neatkarīgā pārbaude 21.11.): izmēri pēc skalas, ne Shopify secības; dažādi preču veidi vienā produktā;
// metrā tirgota prece ar tagu; nosaukumu sadursme netiek skaitīta kā apvienošana.
const ov = (id, other, colour, size, price = 29.9, o = {}) => v({ id: `gid://shopify/ProductVariant/${id}`, title: `${other} / ${colour} / ${size}`,
  position: id % 100, price, tracked: false, qty: null, inventoryPolicy: 'CONTINUE', image: 'https://cdn.example/makets.jpg',
  selectedOptions: [{ name: 'Available Product', value: other }, { name: 'Krāsa', value: colour }, { name: 'Izmērs', value: size }], ...o });
const rb = buildItems([
  // sajaukta secība (kā 15861469512014) un pirmajai krāsai nav ne mazākā, ne lielākā izmēra
  p({ id: 'gid://shopify/Product/91', title: 'T-krekls “Kreisā puse”', handle: 'kp', productType: 'Customizer', variants: [
    ov(9101, 'T-krekls', 'Balta', 'XS'), ov(9102, 'T-krekls', 'Balta', 'XXL'), ov(9103, 'T-krekls', 'Balta', 'M'), ov(9104, 'T-krekls', 'Melna', '4XL'),
    ov(9105, 'T-krekls', 'Melna', 'XXS')] }),
  // divi preču veidi vienā produktā ar vienu bildi – katram savs ieraksts
  p({ id: 'gid://shopify/Product/92', title: 'Apdruka “Auseklis”', handle: 'ap', productType: 'Customizer', variants: [
    ov(9201, 'Hūdijs', 'Balta', 'M', 49.9), ov(9202, 'T-krekls', 'Balta', 'S'), ov(9203, 'T-krekls', 'Melna', 'S'), ov(9204, 'Hūdijs', 'Melna', 'L', 49.9)] }),
], CONFIG);
const rbBy = Object.fromEntries(rb.items.map((i) => [i._variantId, i]));
assert.equal(rbBy['9101'].name, 'T-krekls “Kreisā puse” (2 krāsas, XXS-4XL)', 'diapazons pēc izmēru skalas');
assert.equal(rb.stats.items, 3);
assert.equal(rbBy['9202'].name, 'T-krekls ar apdruku “Apdruka Auseklis” - T-krekls (2 krāsas, S)');
assert.equal(rbBy['9201'].name, 'Džemperis ar apdruku “Apdruka Auseklis” - Hūdijs (2 krāsas, M-L)', 'hūdijs – džemperu kategorija');
assert.equal(rbBy['9201'].price, '49.90', 'katram veidam sava cena');
const dc = buildItems([p({ id: 'gid://shopify/Product/93', title: 'T-krekls metrā', handle: 'dm', productType: 'Apģērbi', tags: ['decimal', 'viens-ieraksts'],
  variants: [sv(9301, 'Balta', 'S', { price: 1.5, qty: 30 }), sv(9302, 'Melna', 'S', { price: 1.5, qty: 30 })] })], CONFIG);
assert.equal(dc.items.find((i) => !i._portalSkip).name, 'T-krekls metrā (2 krāsas, S) (cena par 1 m)');
const col = buildItems([
  p({ id: 'gid://shopify/Product/94', title: 'T-krekls “Mamma”', handle: 'm1', productType: 'Customizer', variants: [ov(9401, 'T-krekls', 'Balta', 'S'), ov(9402, 'T-krekls', 'Melna', 'S')] }),
  p({ id: 'gid://shopify/Product/95', title: 'T-krekls “Mamma” (2 krāsas, S)', handle: 'm2', productType: 'Audums', variants: [v({ id: 'gid://shopify/ProductVariant/9501', price: 5, qty: 1 })] }),
], CONFIG);
assert.equal(col.stats.mergedProducts, 0);
assert.equal(col.stats.mergedNameCollision, 1, 'sadursme netiek skaitīta kā apvienošana');

// TeeInBlue "Available Product" portālu nosaukumos netiek likts; krāsa netiek atkārtota, ja tā jau ir nosaukumā (Edgars 21.11.).
const ap1 = (id, title, apv, colour) => p({ id: `gid://shopify/Product/${id}`, title, handle: `h${id}`, productType: 'Customizer', variants: [
  v({ id: `gid://shopify/ProductVariant/${id}1`, title: `${apv} / ${colour} / viens izmērs`, price: 24.9, tracked: false, qty: null, inventoryPolicy: 'CONTINUE',
    selectedOptions: [{ name: 'Available Product', value: apv }, { name: 'Color', value: colour }, { name: 'Size', value: 'viens izmērs' }] })] });
const tb = buildItems([
  ap1(961, 'Priekšauts “Super mamma”', 'Priekšauts ar Tavu apdruku-tumši zaļš', 'Tumši zaļa'),
  ap1(962, 'Priekšauts tumši zaļš “Slepenā recepte”', 'Priekšauts ar Tavu apdruku-tumši zaļš', 'Tumši zaļa'),
  ap1(963, 'Džemperis balts "Te ir manas mājas"', 'Džemperis-balts', 'Balta'),
  ap1(964, 'Kokvilnas auduma maisiņš “Normāla zoss”', 'Kokvilnas auduma maisiņš ar apdruku', 'Dabīga'),
  ap1(965, 'Priekšauts ar jūsu apdruku - rozā', 'Priekšauts ar Tavu apdruku-rozā', 'Rozā'),
], CONFIG).items;
assert.deepEqual(tb.map((i) => i.name), [
  'Priekšauts “Super mamma” - Tumši zaļa',
  'Priekšauts tumši zaļš “Slepenā recepte”',
  'Džemperis balts "Te ir manas mājas"',
  'Kokvilnas auduma maisiņš “Normāla zoss” - Dabīga',
  'Priekšauts ar jūsu apdruku - rozā',
]);
assert.ok(tb.every((i) => !/Tavu apdruku|Džemperis-balts|maisiņš ar apdruku \//.test(i.name)));
assert.equal(tb[0]._baseName, 'Priekšauts “Super mamma” - Priekšauts ar Tavu apdruku-tumši zaļš / Tumši zaļa / viens izmērs', 'Google – kā līdz šim');
console.log(kp.split('\n').slice(0, 14).join('\n'));
console.log(xml.split('\n').slice(0, 16).join('\n'));
console.log('...\nVisas pārbaudes izietas:', stats);
