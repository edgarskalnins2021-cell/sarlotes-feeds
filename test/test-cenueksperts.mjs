// Cenueksperts.lv plūsmas pārbaudes: node test/test-cenueksperts.mjs
import assert from 'node:assert/strict';
import { buildItems, toCenuekspertsXml, CONFIG } from '../feed-core.mjs';

let n = 1;
const v = (o) => ({ id: `gid://shopify/ProductVariant/${7000 + n++}`, title: 'Default Title', price: 1, compareAtPrice: null, available: true,
  qty: 10, tracked: true, requiresShipping: true, grams: 100, image: '', barcode: '', categoryPath: [], ...o });
const p = (o) => ({ title: 'X', handle: `c${n++}`, productType: 'Audums', vendor: 'KJ', tags: [], isGiftCard: false, onlineStore: true,
  image: 'https://cdn.example/x.jpg', collections: [], description: 'Apraksts.', variants: [v({})], ...o });
const products = [
  p({ title: 'Audums A', handle: 'a', tags: ['decimal'], variants: [v({ price: 1.29, qty: 235, categoryPath: ['Audumi', 'Kokvilnas audumi'] })] }),
  p({ title: 'Dzijas DROPS Air', handle: 'air', productType: 'Dzija', image: '', description: 'Dzija & <adīšanai>',
    variants: [v({ title: '01', price: 5.2, qty: 4, image: 'https://cdn.example/01.jpg', barcode: '5901234123457' }), v({ title: '02', price: 5.2, qty: 3 })] }),
  p({ title: 'Bez apraksta', handle: 'bez', description: '   ' }),
  p({ title: 'Trikotāža ar defektu', handle: 'def', tags: ['decimal'], variants: [v({ price: 0.79, qty: 50 })] }),
  p({ title: 'Šujmašīna', handle: 'sm', productType: 'Šujmašīnas', variants: [v({ price: 249, qty: 1 })] }),
  p({ title: 'Garš', handle: 'gars', description: 'vārds '.repeat(200) }),
];
const { items } = buildItems(products, CONFIG);
const { xml, stats } = toCenuekspertsXml(items, CONFIG);
const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
const rows = [...xml.matchAll(/<item_data>([\s\S]*?)<\/item_data>/g)].map((m) =>
  Object.fromEntries([...m[1].matchAll(/<(\w+)>([^<]*)<\/\1>/g)].map((x) => [x[1], unesc(x[2])])));
const by = (h) => rows.find((r) => r.item_page_url.endsWith(`/products/${h}`) || r.item_page_url.includes(`/products/${h}?`));

assert.ok(xml.startsWith('<?xml version="1.0" encoding="utf-8" ?>\n<DataFeeds>'));
assert.equal(by('a').item_price, '12.90'); assert.equal(by('a').item_name, 'Audums A (cena par 1 m)');
assert.equal(by('a').item_category, 'Audumi / Kokvilnas audumi');
assert.equal(by('a').item_inventory, 'AVAILABLE'); assert.equal(by('a').item_condition, 'New');
assert.equal(by('a').item_shipping_charge, '3.30');
assert.equal(by('sm').item_shipping_charge, '0.00', 'Omniva bez maksas no 70 €');
assert.equal(by('air').item_short_desc, 'Dzija & <adīšanai>');
assert.equal(by('air').item_upc, '5901234123457'); assert.equal(by('air').item_manufacturer, 'DROPS');
assert.ok(/^\d+$/.test(by('air').item_unique_id));
assert.equal(rows.filter((r) => r.item_name.endsWith('02')).length, 0, 'bez attēla – izlaists');
assert.equal(by('bez'), undefined); assert.equal(stats.skipped['nav apraksta'], 1);
assert.equal(by('def'), undefined); assert.equal(stats.skipped['ar defektu / demo / lietota'], 1);
assert.ok(by('gars').item_short_desc.length <= 500);
assert.equal(new Set(rows.map((r) => r.item_unique_id)).size, rows.length);
assert.equal(stats.items, rows.length); assert.equal(stats.decimal, 1);
console.log('Cenueksperts pārbaudes izietas:', JSON.stringify(stats));
