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
  // T-krekls apdrukai bez tipa → nerādām; T-kreklu dzija → rādām
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

const fabric = by['100 % kokvilnas audums – lāči un sirsniņas (cena par 1 m)'];
assert.equal(fabric.price, '3.90');
assert.equal(fabric.in_stock, '44');
assert.equal(fabric.ean, '', 'automātiski ģenerētais kods nav EAN');
assert.equal(fabric.category_full, 'Audumi >> Kokvilnas audumi');
assert.equal(fabric.link, 'https://sarlotesaudumi.lv/products/kokvilnas-audums-laci');
assert.equal(fabric.delivery_latvija, '3.30');

const yarn = by['Dzijas Alize Lanagold 800 – 100 g / 730 m – Piena balta – #01'];
assert.equal(yarn.brand, 'Alize');
assert.equal(yarn.ean, '8693276000014');
assert.equal(yarn.link, 'https://sarlotesaudumi.lv/products/alize?variant=2001');
assert.equal(yarn.in_stock, '7');

assert.equal(by['Manekens šūšanai'].delivery_latvija, '15.90');
assert.equal(by['Bernette 33 šujmašīna'].delivery_latvija, '0.00');
assert.equal(by['Bernette 33 šujmašīna'].brand, 'Bernette');

assert.ok(!items.some((i) => i.name.startsWith('T-krekls ')), 'T-krekli nav failā');
assert.equal(stats.skipped['T-krekli/džemperi'], 1);
assert.ok(by['T-kreklu spageti dzijas – 700 g / 120 m'], 'T-kreklu dzija paliek');

const defect = by['Kokvilnas trikotāža ar defektu – balta (cena par 1 m)'];
assert.equal(defect.used, '1');
assert.equal(fabric.used, '');
assert.ok(toXml([defect]).includes('<used>1</used>'));
assert.ok(!toXml([fabric]).includes('<used>'));

assert.ok(by['Džinsu audums – melns – gabals 30 cm'], 'pēdējais gabaliņš → gabals');
assert.ok(by['Dzijas YarnArt Imperial Merino – 50 g / 100 m – 3315'], 'bez -neatjaunot');

assert.equal(by['Dzija Nr0'].category_full, 'Dzija >> DROPS-Air');
assert.equal(by['Dzija Nr5'].category_full, 'Dzija', 'SEO tags un viena produkta tags nav kategorija');
assert.equal(by['Audums Nr1 (cena par 1 m)'].category_full, 'Audums >> Siltināta trikotāža');
assert.equal(by['Audums Nr5 (cena par 1 m)'].category_full, 'Audums >> Kokvilnas trikotāža');
assert.equal(by['Audums Nr8 (cena par 1 m)'].category_full, 'Audums >> Bērnu audumi');

assert.equal(items.length, 5 + 3 + 2 + 12 + 12); // + spageti, defekts, džinss; merino ×2; dzijas; audumi
assert.equal(stats.skipped['atlikumā mazāk par 1 m'], 1);
assert.equal(stats.skipped['cena zem 3.00 €'], 1);
assert.equal(stats.skipped['0 atlikums'], 1);
assert.equal(stats.skipped['dāvanu karte'], 1);
assert.equal(stats.skipped['tips Customizer'], 1);
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
console.log(kp.split('\n').slice(0, 14).join('\n'));
console.log(xml.split('\n').slice(0, 16).join('\n'));
console.log('...\nVisas pārbaudes izietas:', stats);
