// Ceno.lv plūsmas pārbaudes: node test/test-ceno.mjs
import assert from 'node:assert/strict';
import { buildItems, toCenoXml, cenoDelivery, CONFIG } from '../feed-core.mjs';
import { parseBulk } from '../generate.mjs';

let n = 1;
const v = (o) => ({ id: `gid://shopify/ProductVariant/${9000 + n++}`, title: 'Default Title', price: 1, compareAtPrice: null,
  available: true, qty: 10, tracked: true, requiresShipping: true, grams: 100, image: '', barcode: '', categoryPath: [], ...o });
const p = (o) => ({ title: 'X', handle: `h${n++}`, productType: 'Audums', vendor: 'KJ', tags: [], isGiftCard: false,
  onlineStore: true, image: 'https://cdn.example/x.jpg', collections: [], variants: [v({})], ...o });

const products = [
  // 6. sadaļas piemēri (decimal: Shopify vienība = 0,1 m)
  p({ title: 'Audums A', handle: 'audums-a', tags: ['decimal'], variants: [v({ price: 1.29, qty: 235, grams: 20 })] }),
  p({ title: 'Audums B', handle: 'audums-b', tags: ['decimal'], variants: [v({ price: 0.39, qty: 12, grams: 20 })] }),
  p({ title: 'Audums C', handle: 'audums-c', tags: ['decimal'], variants: [v({ price: 0.5, qty: 9 })] }),
  p({ title: 'Lineāls', handle: 'linealas', productType: 'Lineāli', variants: [v({ price: 2.5, qty: 7 })] }),
  // 0 atlikums, nezināms atlikums (publiskais avots), gabals
  p({ title: 'Nav noliktavā', handle: 'nav', variants: [v({ price: 3, qty: 0 })] }),
  p({ title: 'Audums nezināms', handle: 'audums-nez', tags: ['decimal'], variants: [v({ price: 0.5, qty: null, tracked: null, available: true })] }),
  p({ title: 'Džinsu audums – gabals 50 cm', handle: 'gabals', variants: [v({ price: 4.5, qty: 1 })] }),
  // varianti, EAN, zīmols, trūkstošs attēls, XML rakstzīmes
  p({ title: 'Dzijas DROPS Air – 50 g / 150 m', handle: 'drops-air', productType: 'Dzija', image: '',
    variants: [v({ title: '01 · natur', price: 5.2, qty: 4, image: 'https://cdn.example/01.jpg', barcode: '5901234123457' }),
               v({ title: '02 · sniegs', price: 5.2, qty: 3, image: '' })] }),
  p({ title: 'Šķēres "A&B" <20 cm>', handle: 'skeres', productType: 'Šķēres', variants: [v({ price: 9.9, qty: 2 })] }),
  // piegāde: smags audums (350 g par 0,1 m → 3,5 kg par 1 m), tikai kurjers, bezmaksas Omniva
  p({ title: 'Smags audums', handle: 'smags', tags: ['decimal'], variants: [v({ price: 1.5, qty: 30, grams: 350 })] }),
  p({ title: 'Manekens', handle: 'manekens', productType: 'COURIER_ONLY', variants: [v({ price: 179.9, qty: 2, grams: 4500 })] }),
  p({ title: 'Šujmašīna', handle: 'sujmasina', productType: 'Šujmašīnas', variants: [v({ price: 249, qty: 1, grams: 2500 })] }),
  // akcija (compareAtPrice) un defekts
  p({ title: 'Akcijas audums', handle: 'akcija', tags: ['decimal'], variants: [v({ price: 0.35, compareAtPrice: 0.45, qty: 50, grams: 20 })] }),
  p({ title: 'Kokvilnas trikotāža ar defektu', handle: 'defekts', tags: ['decimal'], variants: [v({ price: 0.79, qty: 50 })] }),
  // kategorijas saite
  p({ title: 'Kokvilnas audums – lāči', handle: 'laci', tags: ['decimal'],
    collections: [{ handle: 'jaunumi', title: 'Jaunumi' }, { handle: 'audumi', title: 'Audumi' }, { handle: 'kokvilnas-audums', title: 'Kokvilnas audumi' }],
    variants: [v({ price: 0.39, qty: 100, grams: 20, categoryPath: ['Audumi', 'Kokvilnas audumi'] })] }),
  p({ title: 'Kokvilnas audums – nepublicēta kolekcija', handle: 'nepubl', tags: ['decimal'],
    collections: [{ handle: 'slepena', title: 'Kokvilnas audumi' }],
    variants: [v({ price: 0.39, qty: 100, grams: 20, categoryPath: ['Audumi', 'Kokvilnas audumi'] })] }),
  // ļoti garš nosaukums – vienības norāde paliek
  p({ title: 'Ļoti garš audums '.repeat(15).trim(), handle: 'garss', tags: ['decimal'], variants: [v({ price: 0.39, qty: 20 })] }),
];
const published = new Map([['jaunumi', { title: 'Jaunumi' }], ['audumi', { title: 'Audumi' }], ['kokvilnas-audums', { title: 'Kokvilnas audumi' }]]);

const { items } = buildItems(products, CONFIG);
const { xml, stats } = toCenoXml(items, CONFIG, { publishedCollections: published });
const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
const rows = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) =>
  Object.fromEntries([...m[1].matchAll(/<(\w+)>([^<]*)<\/\1>/g)].map((x) => [x[1], unesc(x[2])])));
const by = (h) => rows.find((r) => r.link.endsWith(`/products/${h}`) || r.link.includes(`/products/${h}?`));

// decimal: cena par 1 m, atlikums pilnos metros, nepārrēķina divreiz
assert.equal(by('audums-a').price, '12.90'); assert.equal(by('audums-a').in_stock, '23');
assert.equal(by('audums-a').name, 'Audums A (cena par 1 m)');
assert.equal(by('audums-b').price, '3.90'); assert.equal(by('audums-b').in_stock, '1');
assert.equal(by('audums-c'), undefined, '0,9 m – izlaists');
assert.equal(by('linealas').price, '2.50'); assert.equal(by('linealas').in_stock, '7');
assert.equal(by('nav'), undefined);
assert.equal(by('audums-nez'), undefined, 'metrā, atlikums nezināms – izlaists');
assert.equal(stats.skipped['metrā tirgota, atlikums nav zināms'], 1);
assert.equal(by('gabals').price, '4.50', 'gabals paliek gabala cena');
assert.ok(!by('gabals').name.includes('cena par 1 m'));

// varianti, attēli, EAN, zīmols
assert.equal(by('drops-air').name, 'Dzijas DROPS Air – 50 g / 150 m – 01 · natur');
assert.ok(by('drops-air').link.endsWith('?variant=' + items.find((i) => i.name.includes('01 · natur'))._variantId));
assert.equal(by('drops-air').ean, '5901234123457');
assert.equal(by('drops-air').manufacturer, 'DROPS');
assert.equal(rows.filter((r) => r.name.includes('02 · sniegs')).length, 0, 'bez attēla – izlaists');
assert.equal(stats.skipped['nav attēla'], 1);
assert.equal(by('linealas').manufacturer, undefined, 'tukšs zīmols netiek likts');
assert.ok(xml.includes('Šķēres &quot;A&amp;B&quot; &lt;20 cm&gt;'));

// piegāde
const d = (h) => by(h);
assert.equal(d('audums-a').delivery_omniva, '3.30'); assert.equal(d('audums-a').delivery_dpd_paku_bode, '4.99');
assert.equal(d('audums-a').delivery_cost_riga, '11.90', 'max: kurjers līdz 3 kg');
assert.equal(d('smags').delivery_cost_riga, '15.90', '350 g par 0,1 m = 3,5 kg par 1 m → kurjers virs 3 kg');
assert.equal(d('manekens').delivery_omniva, '', 'tikai kurjers – pakomāts netiek apsolīts (tukšs tags)');
assert.equal(d('manekens').delivery_dpd_paku_bode, '');
assert.equal(d('manekens').delivery_latvija, '15.90');
assert.equal(d('sujmasina').delivery_omniva, '0.00', 'Omniva bez maksas no 70 €');
assert.equal(d('sujmasina').delivery_cost_riga, '11.90', 'kurjers nav bez maksas');
assert.equal(d('audums-a').delivery_latvijas_pasts, '', 'nepiedāvāts veids – tukšs tags, nevis 0.00');
assert.ok(xml.includes('<delivery_circlek></delivery_circlek>') && xml.includes('<delivery_venipak></delivery_venipak>'));
assert.ok(xml.startsWith('<?xml version="1.0" encoding="utf-8" ?>'));
assert.equal(d('audums-a').delivery_days_latvija, '3');
const minCfg = { ...CONFIG, ceno: { ...CONFIG.ceno, deliveryCostMode: 'min' } };
assert.equal(cenoDelivery(items.find((i) => i.link.endsWith('/audums-a')), minCfg).delivery_latvija, '3.30');

// akcija: price = sākotnējā (compareAtPrice), price_sale = faktiskā; abas par 1 m
assert.equal(by('akcija').price, '4.50'); assert.equal(by('akcija').price_sale, '3.50');
assert.equal(stats.compareAtHigher, 1); assert.equal(stats.with.price_sale, 1);
assert.equal(by('audums-a').price_sale, undefined, 'bez akcijas price_sale nav');
const noSale = toCenoXml(items, { ...CONFIG, ceno: { ...CONFIG.ceno, salePrice: false } }, {}).xml;
assert.ok(/<price>3\.50<\/price>/.test(noSale) && !noSale.includes('<price_sale>'), 'izslēdzot – tikai faktiskā cena');

// defekts – 1. versijā izlaists; jaunām precēm used = 0
assert.equal(by('defekts'), undefined); assert.equal(stats.skipped['ar defektu / demo / lietota'], 1);
assert.equal(by('audums-a').used, '0');

// kategorija un saite
assert.equal(by('laci').category, 'Kokvilnas audumi');
assert.equal(by('laci').category_full, 'Audumi > Kokvilnas audumi');
assert.equal(by('laci').category_link, 'https://sarlotesaudumi.lv/collections/kokvilnas-audums');
assert.equal(by('nepubl').category_link, undefined, 'nepublicēta kolekcija netiek likta');
assert.equal(by('audums-a').category_link, undefined);

// garš nosaukums
const long = rows.find((r) => r.link.endsWith('/garss'));
assert.ok(long.name.length <= 200 && long.name.endsWith('… (cena par 1 m)'), long.name);

// dublikāti un skaits
assert.equal(new Set(rows.map((r) => r.link)).size, rows.length);
assert.equal(stats.items, rows.length);
assert.equal(stats.decimal, rows.filter((r) => r.name.endsWith('(cena par 1 m)')).length);

// parseBulk: kolekcijas rindas ar variantu vai produktu kā vecāku
const jsonl = [
  { id: 'gid://shopify/ProductVariant/1', title: 'Default Title', price: '0.39', compareAtPrice: '0.49', inventoryQuantity: 12,
    inventoryItem: { tracked: true, requiresShipping: true, measurement: { weight: { value: 20, unit: 'GRAMS' } } },
    lab0: { value: 'Audumi' }, lab1: null,
    product: { id: 'gid://shopify/Product/10', title: 'A', handle: 'a', productType: 'Audums', vendor: 'KJ', tags: ['decimal'],
      isGiftCard: false, onlineStoreUrl: 'https://x', featuredMedia: { preview: { image: { url: 'https://cdn/a.jpg' } } } } },
  { preview: { image: { url: 'https://cdn/v1.jpg' } }, __parentId: 'gid://shopify/ProductVariant/1' },
  { value: '4006000000001', __parentId: 'gid://shopify/ProductVariant/1' },
  { id: 'gid://shopify/Collection/5', handle: 'audumi', title: 'Audumi', __parentId: 'gid://shopify/ProductVariant/1' },
  { id: 'gid://shopify/Collection/6', handle: 'kokvilnas-audums', title: 'Kokvilnas audumi', __parentId: 'gid://shopify/Product/10' },
].map((r) => JSON.stringify(r)).join('\n');
const [pb] = parseBulk(jsonl);
assert.deepEqual(pb.collections.map((c) => c.handle), ['audumi', 'kokvilnas-audums']);
assert.equal(pb.variants[0].compareAtPrice, 0.49);
assert.equal(pb.variants[0].grams, 20);
assert.equal(pb.variants[0].image, 'https://cdn/v1.jpg');

console.log(xml.split('\n').slice(0, 26).join('\n'));
console.log('...\nCeno pārbaudes izietas:', JSON.stringify(stats));
