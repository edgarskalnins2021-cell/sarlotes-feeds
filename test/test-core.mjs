// Pārbauda noteikumus ar dažiem piemēriem: node test/test-core.mjs
import assert from 'node:assert/strict';
import { buildItems, toXml, toKurpirktXml, validGtin, CONFIG } from '../feed-core.mjs';

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

// Apģērbi: cenu portāliem viens ieraksts katrai krāsai (izmēri kopā), Google – katrs izmērs (Edgars 21.11.2026).
const sv = (id, color, size, o = {}) => v({ id: `gid://shopify/ProductVariant/${id}`, title: `${color} / ${size}`, position: id % 100,
  selectedOptions: [{ name: 'Krāsa', value: color }, { name: 'Izmērs', value: size }], image: `https://cdn.example/${color}.jpg`, ...o });
const app = buildItems([
  p({ id: 'gid://shopify/Product/77', title: 'Džemperis SOL’S COLUMBIA Unisex', handle: 'dz-col', productType: 'Apģērbi', variants: [
    sv(5103, 'Balta', 'L', { price: 24.9, qty: 4 }), sv(5101, 'Balta', 'S', { price: 24.9, qty: 2 }), sv(5104, 'Balta', '3XL', { price: 29.9, qty: 1 }),
    sv(5102, 'Balta', 'M', { price: 24.9, qty: 0 }), sv(5201, 'Melna', '3XL', { price: 29.9, qty: 3 })] }),
  p({ id: 'gid://shopify/Product/78', title: 'T-krekls “Auseklis”', handle: 'auseklis', productType: 'Customizer', variants: [
    v({ id: 'gid://shopify/ProductVariant/6101', title: 'T-krekls / Balta / XXS', position: 1, price: 29.9, tracked: false, qty: null, inventoryPolicy: 'CONTINUE',
      selectedOptions: [{ name: 'Available Product', value: 'T-krekls' }, { name: 'Krāsa', value: 'Balta' }, { name: 'Izmērs', value: 'XXS' }] }),
    v({ id: 'gid://shopify/ProductVariant/6102', title: 'T-krekls / Balta / XS', position: 2, price: 29.9, tracked: false, qty: null, inventoryPolicy: 'CONTINUE',
      selectedOptions: [{ name: 'Available Product', value: 'T-krekls' }, { name: 'Krāsa', value: 'Balta' }, { name: 'Izmērs', value: 'XS' }] }),
    // uzskaitīts, 0, bet pasūtīt drīkst (CONTINUE) → ir; uzskaitīts, 0, DENY → nav
    v({ id: 'gid://shopify/ProductVariant/6201', title: 'Priekšauts / Rozā / viens izmērs', position: 3, price: 24.9, tracked: true, qty: 0, inventoryPolicy: 'CONTINUE',
      selectedOptions: [{ name: 'Available Product', value: 'Priekšauts' }, { name: 'Krāsa', value: 'Rozā' }, { name: 'Izmērs', value: 'viens izmērs' }] }),
    v({ id: 'gid://shopify/ProductVariant/6301', title: 'Maisiņš / Melna / viens izmērs', position: 4, price: 14.9, tracked: true, qty: 0, inventoryPolicy: 'DENY',
      selectedOptions: [{ name: 'Available Product', value: 'Maisiņš' }, { name: 'Krāsa', value: 'Melna' }, { name: 'Izmērs', value: 'viens izmērs' }] })] }),
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
assert.equal(ausek.name, 'T-krekls “Auseklis” - T-krekls / Balta');
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
console.log(kp.split('\n').slice(0, 14).join('\n'));
console.log(xml.split('\n').slice(0, 16).join('\n'));
console.log('...\nVisas pārbaudes izietas:', stats);
