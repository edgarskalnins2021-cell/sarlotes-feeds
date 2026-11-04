// Ģenerē public/salidzini.xml no Shopify datiem.
//
// Datu avots:
//  - ja ir iestatīti SHOPIFY_CLIENT_ID un SHOPIFY_CLIENT_SECRET → Shopify Admin API (pilni dati:
//    precīzs atlikums, kategorijas latviski, EAN);
//  - citādi → veikala publiskais /products.json (bez atlikuma skaita un EAN).
//
// Palaišana: node generate.mjs   (Node 20+, bez papildu bibliotēkām)

import { mkdir, writeFile } from 'node:fs/promises';
import { CONFIG, buildItems, toXml, toKurpirktXml } from './feed-core.mjs';

const STORE = process.env.SHOPIFY_STORE || 'sarlotesaudumi.myshopify.com';
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2026-10';
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const OUT_DIR = process.env.OUT_DIR || 'public';

const PAGES_URL = process.env.PAGES_URL || 'https://edgarskalnins2021-cell.github.io/sarlotes-feeds';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Pieprasījums ar atkārtojumiem: ja Shopify/tīkls īslaicīgi atbild ar 429 vai 5xx, mēģina vēlreiz.
async function fetchRetry(url, options = {}, tries = 4) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { ...options, signal: AbortSignal.timeout(60_000) });
      if ((res.status === 429 || res.status >= 500) && attempt < tries) {
        const wait = Number(res.headers.get('retry-after')) * 1000 || 5_000 * attempt;
        console.log(`  ${res.status} – mēģinu vēlreiz pēc ${wait / 1000} s (${url.split('?')[0]})`);
        await sleep(wait);
        continue;
      }
      return res;
    } catch (err) {
      if (attempt >= tries) throw err;
      console.log(`  tīkla kļūda (${err.message}) – mēģinu vēlreiz`);
      await sleep(5_000 * attempt);
    }
  }
}

// ---------- Shopify Admin API ----------

async function getToken() {
  const res = await fetchRetry(`https://${STORE}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
  });
  if (!res.ok) throw new Error(`Shopify token pieprasījums neizdevās: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

async function gql(token, query, variables = {}) {
  const res = await fetchRetry(`https://${STORE}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL kļūda: ${res.status} ${await res.text()}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(`GraphQL kļūda: ${JSON.stringify(json.errors)}`);
  return json.data;
}

const BULK_QUERY = `{
  productVariants(query: "product_status:active") {
    edges { node {
      id title price inventoryQuantity
      inventoryItem { tracked requiresShipping measurement { weight { value unit } } }
      lab0: metafield(namespace: "mm-google-shopping", key: "custom_label_0") { value }
      lab1: metafield(namespace: "mm-google-shopping", key: "custom_label_1") { value }
      media { edges { node { preview { image { url } } } } }
      barcodes { edges { node { value } } }
      product {
        id title handle productType vendor tags isGiftCard onlineStoreUrl
        featuredMedia { preview { image { url } } }
      }
    } }
  }
}`;

function grams(w) {
  if (!w) return 0;
  const f = { GRAMS: 1, KILOGRAMS: 1000, OUNCES: 28.3495, POUNDS: 453.592 }[w.unit] || 1;
  return w.value * f;
}

async function fromAdminApi() {
  const token = await getToken();
  const start = await gql(token, `mutation($q: String!) {
    bulkOperationRunQuery(query: $q, groupObjects: false) {
      bulkOperation { id status } userErrors { field message }
    }
  }`, { q: BULK_QUERY });
  const { bulkOperation, userErrors } = start.bulkOperationRunQuery;
  if (userErrors?.length) throw new Error(`Bulk kļūda: ${JSON.stringify(userErrors)}`);

  let op;
  for (let i = 0; i < 180; i++) { // līdz 30 min
    await sleep(10_000);
    op = (await gql(token, `query($id: ID!) { bulkOperation(id: $id) { status errorCode objectCount url } }`,
      { id: bulkOperation.id })).bulkOperation;
    if (['COMPLETED', 'FAILED', 'CANCELED', 'EXPIRED'].includes(op.status)) break;
  }
  if (op.status !== 'COMPLETED') throw new Error(`Bulk operācija beidzās ar ${op.status} ${op.errorCode || ''}`);
  if (!op.url) return [];

  const text = await (await fetchRetry(op.url)).text();
  const variants = new Map();
  const children = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    const row = JSON.parse(line);
    if (row.__parentId) children.push(row); else variants.set(row.id, row);
  }
  for (const c of children) {
    const v = variants.get(c.__parentId);
    if (!v) continue;
    if (c.preview?.image?.url && !v._image) v._image = c.preview.image.url;
    if (c.value && !v._barcode) v._barcode = c.value;
  }

  const products = new Map();
  for (const v of variants.values()) {
    const p = v.product;
    if (!products.has(p.id)) {
      products.set(p.id, {
        title: p.title, handle: p.handle, productType: p.productType || '', vendor: p.vendor || '',
        tags: p.tags || [], isGiftCard: !!p.isGiftCard, onlineStore: !!p.onlineStoreUrl,
        image: p.featuredMedia?.preview?.image?.url || '', variants: [],
      });
    }
    products.get(p.id).variants.push({
      id: v.id,
      title: v.title,
      price: parseFloat(v.price),
      available: v.inventoryQuantity > 0,
      qty: v.inventoryItem?.tracked ? v.inventoryQuantity : null,
      tracked: v.inventoryItem ? !!v.inventoryItem.tracked : null,
      requiresShipping: v.inventoryItem ? v.inventoryItem.requiresShipping !== false : true,
      grams: grams(v.inventoryItem?.measurement?.weight),
      image: v._image || '',
      barcode: v._barcode || '',
      categoryPath: [v.lab0?.value, v.lab1?.value].filter(Boolean),
    });
  }
  return [...products.values()];
}

// ---------- Publiskais /products.json ----------

export function normalizeStorefront(list) {
  return list.map((p) => ({
    title: p.title, handle: p.handle, productType: p.product_type || '', vendor: p.vendor || '',
    tags: p.tags || [], isGiftCard: p.product_type === 'Dāvanu kartes', onlineStore: true,
    image: p.images?.[0]?.src || '',
    variants: p.variants.map((v) => ({
      id: v.id, title: v.title, price: parseFloat(v.price), available: !!v.available,
      qty: null, tracked: null, requiresShipping: v.requires_shipping !== false, grams: v.grams || 0,
      image: v.featured_image?.src || '', barcode: '', categoryPath: [],
    })),
  }));
}

async function fromStorefront() {
  const all = [];
  for (let page = 1; page <= 200; page++) {
    const res = await fetchRetry(`${CONFIG.shopUrl}/products.json?limit=250&page=${page}`, {
      headers: { 'User-Agent': 'sarlotes-salidzini-feed/1.0' },
    });
    if (!res.ok) throw new Error(`/products.json lapa ${page}: ${res.status}`);
    const { products } = await res.json();
    if (!products.length) break;
    all.push(...products);
    await sleep(500);
  }
  return normalizeStorefront(all);
}

// ---------- Galvenā daļa ----------

const useAdmin = !!(CLIENT_ID && CLIENT_SECRET);
console.log(`Datu avots: ${useAdmin ? 'Shopify Admin API' : 'publiskais /products.json'}`);
const products = useAdmin ? await fromAdminApi() : await fromStorefront();
const { items, stats } = buildItems(products, CONFIG);
if (items.length < 100) throw new Error(`Aizdomīgi maz preču (${items.length}) – fails netiek pārrakstīts.`);

// Drošība: ja preču pēkšņi ir uz pusi mazāk nekā iepriekšējā reizē, kaut kas nav kārtībā
// (piem. Shopify atdeva nepilnus datus) – tad atstājam veco failu. Apiet var ar FORCE=1.
try {
  const prev = await (await fetchRetry(`${PAGES_URL}/stats.json`, { cache: 'no-store' }, 2)).json();
  if (prev?.items && items.length < prev.items * 0.5 && process.env.FORCE !== '1') {
    throw new Error(`Preču skaits nokrities no ${prev.items} uz ${items.length} – fails netiek pārrakstīts.`);
  }
} catch (err) {
  if (err.message.startsWith('Preču skaits')) throw err;
  console.log(`Iepriekšējo statistiku nevarēja nolasīt (${err.message}) – turpinu.`);
}

await mkdir(OUT_DIR, { recursive: true });
await writeFile(`${OUT_DIR}/salidzini.xml`, toXml(items), 'utf8');
await writeFile(`${OUT_DIR}/kurpirkt.xml`, toKurpirktXml(items), 'utf8');
await writeFile(`${OUT_DIR}/stats.json`, JSON.stringify({ generated: new Date().toISOString(), source: useAdmin ? 'admin' : 'storefront', ...stats }, null, 2));
await writeFile(`${OUT_DIR}/index.html`, `<!doctype html><meta charset="utf-8"><title>Šarlotes audumi – XML</title><p><a href="salidzini.xml">salidzini.xml</a> · <a href="kurpirkt.xml">kurpirkt.xml</a> · ${items.length} preces · ${new Date().toISOString()}</p>`);
console.log(JSON.stringify(stats, null, 2));
