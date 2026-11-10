// Ģenerē public/salidzini.xml, kurpirkt.xml, ceno.xml, cenueksperts.xml (Latvija), hindee.xml (Igaunija),
// kaina24.xml (Lietuva), google-lv.xml (Google Merchant Center, latviski) un google-ee-en.xml / google-lt-en.xml
// (Google Merchant Center Igaunijai un Lietuvai, angliski).
//
// Datu avots:
//  - ja ir iestatīti SHOPIFY_CLIENT_ID un SHOPIFY_CLIENT_SECRET → Shopify Admin API (pilni dati:
//    precīzs atlikums, kategorijas latviski, EAN);
//  - citādi → veikala publiskais /products.json (bez atlikuma skaita un EAN).
//
// Igaunijas un Lietuvas teksti un cenas – no valsts veikala publiskā /products.json (sharlottekangad.ee,
// sarlotesaudiniai.lt). Google failam pilnais apraksts, attēli un variantu opcijas – no sarlotesaudumi.lv/products.json.
//
// Palaišana: node generate.mjs   (Node 20+, bez papildu bibliotēkām)

import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { CONFIG, buildItems, toXml, toKurpirktXml, toCenoXml, toCenuekspertsXml, toHindeeXml, toKaina24Xml,
  toGoogleXml, htmlToPlain, BALTIC_LETTERS } from './feed-core.mjs';

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
      id title price compareAtPrice inventoryQuantity
      inventoryItem { tracked requiresShipping measurement { weight { value unit } } }
      lab0: metafield(namespace: "mm-google-shopping", key: "custom_label_0") { value }
      lab1: metafield(namespace: "mm-google-shopping", key: "custom_label_1") { value }
      media { edges { node { preview { image { url } } } } }
      barcodes { edges { node { value } } }
      product {
        id title handle productType vendor tags isGiftCard onlineStoreUrl
        featuredMedia { preview { image { url } } }
        description(truncateAt: 600)
        collections { edges { node { id handle title } } }
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

  return parseBulk(await (await fetchRetry(op.url)).text());
}

// Bulk JSONL → produkti ar variantiem. Bērnu rindas: attēli, svītrkodi un produkta kolekcijas
// (kolekcijas rindas __parentId var būt gan variants, gan produkts – derīgs ir abi).
export function parseBulk(text) {
  const variants = new Map();
  const children = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    const row = JSON.parse(line);
    if (row.__parentId) children.push(row); else variants.set(row.id, row);
  }
  const productCollections = new Map(); // produkta id → Map(handle → title)
  for (const c of children) {
    if (String(c.id || '').startsWith('gid://shopify/Collection/')) {
      const productId = variants.get(c.__parentId)?.product?.id || c.__parentId;
      if (!productCollections.has(productId)) productCollections.set(productId, new Map());
      productCollections.get(productId).set(c.handle, c.title);
      continue;
    }
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
        id: p.id, title: p.title, handle: p.handle, productType: p.productType || '', vendor: p.vendor || '',
        tags: p.tags || [], isGiftCard: !!p.isGiftCard, onlineStore: !!p.onlineStoreUrl,
        image: p.featuredMedia?.preview?.image?.url || '', variants: [], description: p.description || '',
        collections: [...(productCollections.get(p.id) || [])].map(([handle, title]) => ({ handle, title })),
      });
    }
    products.get(p.id).variants.push({
      id: v.id,
      title: v.title,
      price: parseFloat(v.price),
      compareAtPrice: v.compareAtPrice != null ? parseFloat(v.compareAtPrice) : null,
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

// Veikalā publicētās kolekcijas (publiskais /collections.json) – Ceno category_link pārbaudei.
// Ja neizdodas, category_link vienkārši netiek likts.
async function fetchPublishedCollections() {
  const map = new Map();
  try {
    for (let page = 1; page <= 20; page++) {
      const res = await fetchRetry(`${CONFIG.shopUrl}/collections.json?limit=250&page=${page}`, {
        headers: { 'User-Agent': 'sarlotes-salidzini-feed/1.0' },
      }, 2);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { collections } = await res.json();
      if (!collections?.length) break;
      for (const c of collections) map.set(c.handle, { title: c.title, count: c.products_count });
      await sleep(500);
    }
  } catch (err) {
    console.log(`Kolekciju sarakstu nevarēja nolasīt (${err.message}) – ceno.xml būs bez category_link.`);
    return new Map();
  }
  return map;
}

// ---------- Publiskais /products.json ----------

const htmlToText = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ').trim().slice(0, 600);

export function normalizeStorefront(list) {
  return list.map((p) => ({
    id: p.id, title: p.title, handle: p.handle, productType: p.product_type || '', vendor: p.vendor || '',
    tags: p.tags || [], isGiftCard: p.product_type === 'Dāvanu kartes', onlineStore: true,
    image: p.images?.[0]?.src || '', collections: [],
    description: htmlToText(p.body_html),
    variants: p.variants.map((v) => ({
      id: v.id, title: v.title, price: parseFloat(v.price), available: !!v.available,
      compareAtPrice: v.compare_at_price != null ? parseFloat(v.compare_at_price) : null,
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

// ---------- Igaunija (sharlottekangad.ee) un Lietuva (sarlotesaudiniai.lt) ----------

// Valsts veikala /products.json → Map(varianta ID → vietējie teksti un vietējā cena).
export function normalizeEe(list) {
  const map = new Map();
  for (const p of list) {
    const description = htmlToText(p.body_html);
    for (const v of p.variants || []) {
      map.set(String(v.id), { title: p.title, variantTitle: v.title, handle: p.handle, productType: p.product_type || '',
        price: parseFloat(v.price), description });
    }
  }
  return map;
}
export const normalizeStore = normalizeEe;

// prefix – valodas ceļš (piem. '/en'); ja veikals pāradresē uz citu domēnu vai prom no šī ceļa – kļūda.
async function fetchStoreRaw(shopUrl, lang, prefix = '') {
  const host = new URL(shopUrl).hostname;
  const all = [];
  for (let page = 1; page <= 200; page++) {
    const res = await fetchRetry(`${shopUrl}${prefix}/products.json?limit=250&page=${page}`, {
      headers: { 'User-Agent': 'sarlotes-salidzini-feed/1.0', 'Accept-Language': lang },
    });
    if (!res.ok) throw new Error(`${host}${prefix}/products.json lapa ${page}: ${res.status}`);
    const final = new URL(res.url);
    if (final.hostname !== host || !final.pathname.startsWith(`${prefix}/products.json`)) throw new Error(`${host}${prefix} pāradresēja uz ${res.url}`);
    const { products } = await res.json();
    if (!products?.length) break;
    all.push(...products);
    await sleep(500);
  }
  return all;
}

async function fetchStore(shopUrl, lang) {
  return normalizeStore(await fetchStoreRaw(shopUrl, lang));
}

// ---------- Google Merchant Center (google-lv.xml, google-ee-en.xml, google-lt-en.xml) ----------

// Veikala /products.json → Map(varianta ID → teksti, cena, pilns apraksts, attēli, variantu opcijas) Google failiem.
export function normalizeGoogleStore(list) {
  const map = new Map();
  for (const p of list) {
    const description = htmlToPlain(p.body_html, CONFIG.google.descMax);
    const images = (p.images || []).filter((im) => im?.src).map((im) => ({ src: im.src, variantIds: (im.variant_ids || []).map(String) }));
    const names = (p.options || []).map((o) => o.name);
    for (const v of p.variants || []) {
      const options = names.map((name, i) => ({ name, value: v[`option${i + 1}`] })).filter((o) => o.value != null && o.value !== '');
      map.set(String(v.id), { productId: String(p.id), handle: p.handle, title: p.title, variantTitle: v.title,
        productType: p.product_type || '', price: parseFloat(v.price), description, images, options });
    }
  }
  return map;
}
export const normalizeLvStore = normalizeGoogleStore;

// google-lv.xml: ja Latvijas veikala /products.json nav nolasāms vai rezultāts aizdomīgs – paliek iepriekšējā
// versija (ja tādas nav – fails bez papildu attēliem un variantu opcijām, apraksts no Shopify Admin).
async function buildGoogle(items, prev) {
  const file = 'google-lv.xml';
  try {
    const store = normalizeLvStore(await fetchStoreRaw(CONFIG.shopUrl, 'lv'));
    if (store.size < 100) throw new Error(`aizdomīgi maz variantu veikala /products.json (${store.size})`);
    const r = toGoogleXml(items, store, CONFIG);
    if (r.stats.items < 100) throw new Error(`aizdomīgi maz preču (${r.stats.items})`);
    if (r.stats.enriched < r.stats.items * 0.5) throw new Error(`/products.json atrastas tikai ${r.stats.enriched} no ${r.stats.items} precēm`);
    if (prev?.google?.items && r.stats.items < prev.google.items * 0.5 && process.env.FORCE !== '1') {
      throw new Error(`preču skaits nokrities no ${prev.google.items} uz ${r.stats.items}`);
    }
    return r;
  } catch (err) {
    console.log(`::warning title=${file}::${err.message} – paliek iepriekšējā versija`);
    try {
      const old = await fetchRetry(`${PAGES_URL}/${file}`, { cache: 'no-store' }, 2);
      if (old.ok && prev?.google?.items) {
        return { xml: await old.text(), stats: { ...prev.google, carriedOver: true, error: err.message } };
      }
    } catch { /* nav iepriekšējās versijas */ }
    const r = toGoogleXml(items, new Map(), CONFIG);
    if (r.stats.items < 100) { console.log(`${file} šoreiz netiek izveidots.`); return null; }
    return { xml: r.xml, stats: { ...r.stats, error: err.message } };
  }
}

// google-ee-en.xml / google-lt-en.xml: valsts domēna angļu versija (/en/products.json). Ja neizdodas vai rezultāts
// aizdomīgs (maz preču, teksti nav angliski) – paliek iepriekšējā versija; ja tādas nav – fails šoreiz netiek izveidots.
async function buildGoogleMarket({ key, file, market }, items, prev) {
  try {
    const list = await fetchStoreRaw(market.shopUrl, 'en', market.pathPrefix);
    const nonEnglish = list.filter((p) => BALTIC_LETTERS.test(p.title || '')).length;
    if (list.length && nonEnglish > list.length * CONFIG.googleMarkets.common.maxNonEnglishShare) {
      throw new Error(`${nonEnglish} no ${list.length} nosaukumiem nav angliski`);
    }
    const r = toGoogleXml(items, normalizeGoogleStore(list), CONFIG, market);
    if (r.stats.items < 100) throw new Error(`aizdomīgi maz preču (${r.stats.items})`);
    if (prev?.[key]?.items && r.stats.items < prev[key].items * 0.5 && process.env.FORCE !== '1') {
      throw new Error(`preču skaits nokrities no ${prev[key].items} uz ${r.stats.items}`);
    }
    return r;
  } catch (err) {
    console.log(`::warning title=${file}::${err.message} – paliek iepriekšējā versija`);
    try {
      const old = await fetchRetry(`${PAGES_URL}/${file}`, { cache: 'no-store' }, 2);
      if (old.ok && prev?.[key]?.items) {
        return { xml: await old.text(), stats: { ...prev[key], carriedOver: true, error: err.message } };
      }
    } catch { /* nav iepriekšējās versijas */ }
    console.log(`${file} šoreiz netiek izveidots.`);
    return null;
  }
}

const GOOGLE_MARKETS = [
  { key: 'googleEe', title: 'Google EE (EN)', market: CONFIG.googleMarkets.ee },
  { key: 'googleLt', title: 'Google LT (EN)', market: CONFIG.googleMarkets.lt },
].map((f) => ({ ...f, file: f.market.file }));

// Ārvalstu fails (hindee.xml, kaina24.xml): ja neizdodas (veikals neatbild, aizdomīgi maz preču, nosaukumi
// nav attiecīgajā valodā), Latvijas faili tiek izvietoti kā parasti, bet šis fails paliek iepriekšējā versija.
async function buildForeign({ key, file, shopUrl, lang, langName, render }, items, prev) {
  try {
    const r = render(items, await fetchStore(shopUrl, lang), CONFIG);
    if (r.stats.items < 100) throw new Error(`aizdomīgi maz preču (${r.stats.items})`);
    if (r.stats.sameNameAsLv > r.stats.items * 0.5) {
      throw new Error(`nosaukumi nav ${langName} valodā (${r.stats.sameNameAsLv} no ${r.stats.items} sakrīt ar latviešu)`);
    }
    if (prev?.[key]?.items && r.stats.items < prev[key].items * 0.5 && process.env.FORCE !== '1') {
      throw new Error(`preču skaits nokrities no ${prev[key].items} uz ${r.stats.items}`);
    }
    return r;
  } catch (err) {
    console.log(`::warning title=${file}::${err.message} – paliek iepriekšējā versija`);
    try {
      const old = await fetchRetry(`${PAGES_URL}/${file}`, { cache: 'no-store' }, 2);
      if (old.ok && prev?.[key]?.items) {
        return { xml: await old.text(), stats: { ...prev[key], carriedOver: true, error: err.message } };
      }
    } catch { /* nav iepriekšējās versijas */ }
    console.log(`${file} šoreiz netiek izveidots.`);
    return null;
  }
}

const FOREIGN = [
  { key: 'hindee', file: 'hindee.xml', title: 'Hind.ee', shopUrl: CONFIG.hindee.shopUrl, lang: 'et', langName: 'igauņu', render: toHindeeXml },
  { key: 'kaina24', file: 'kaina24.xml', title: 'Kaina24', shopUrl: CONFIG.kaina24.shopUrl, lang: 'lt', langName: 'lietuviešu', render: toKaina24Xml },
];

// ---------- Galvenā daļa ----------

async function main() {
  const useAdmin = !!(CLIENT_ID && CLIENT_SECRET);
  console.log(`Datu avots: ${useAdmin ? 'Shopify Admin API' : 'publiskais /products.json'}`);
  const products = useAdmin ? await fromAdminApi() : await fromStorefront();
  const { items, stats } = buildItems(products, CONFIG);
  if (items.length < 100) throw new Error(`Aizdomīgi maz preču (${items.length}) – fails netiek pārrakstīts.`);

  const ceno = toCenoXml(items, CONFIG, { publishedCollections: await fetchPublishedCollections() });
  if (ceno.stats.items < 100) throw new Error(`Aizdomīgi maz Ceno preču (${ceno.stats.items}) – faili netiek pārrakstīti.`);
  const cenu = toCenuekspertsXml(items, CONFIG);
  if (cenu.stats.items < 100) throw new Error(`Aizdomīgi maz Cenueksperts preču (${cenu.stats.items}) – faili netiek pārrakstīti.`);

  // Drošība: ja preču pēkšņi ir uz pusi mazāk nekā iepriekšējā reizē, kaut kas nav kārtībā
  // (piem. Shopify atdeva nepilnus datus) – tad atstājam vecos failus. Apiet var ar FORCE=1.
  let prev = null;
  try {
    prev = await (await fetchRetry(`${PAGES_URL}/stats.json`, { cache: 'no-store' }, 2)).json();
    if (prev?.items && items.length < prev.items * 0.5 && process.env.FORCE !== '1') {
      throw new Error(`Preču skaits nokrities no ${prev.items} uz ${items.length} – fails netiek pārrakstīts.`);
    }
    if (prev?.ceno?.items && ceno.stats.items < prev.ceno.items * 0.5 && process.env.FORCE !== '1') {
      throw new Error(`Preču skaits (Ceno) nokrities no ${prev.ceno.items} uz ${ceno.stats.items} – faili netiek pārrakstīti.`);
    }
    if (prev?.cenueksperts?.items && cenu.stats.items < prev.cenueksperts.items * 0.5 && process.env.FORCE !== '1') {
      throw new Error(`Preču skaits (Cenueksperts) nokrities no ${prev.cenueksperts.items} uz ${cenu.stats.items} – faili netiek pārrakstīti.`);
    }
  } catch (err) {
    if (err.message.startsWith('Preču skaits')) throw err;
    console.log(`Iepriekšējo statistiku nevarēja nolasīt (${err.message}) – turpinu.`);
  }

  const foreign = [];
  for (const f of FOREIGN) foreign.push({ ...f, result: await buildForeign(f, items, prev) });
  // Google Merchant Center (latviski) – tāds pats ieraksts kā ārvalstu failiem (fails, saite, skaits).
  foreign.push({ key: 'google', file: 'google-lv.xml', title: 'Google', result: await buildGoogle(items, prev) });
  // Google Merchant Center Igaunijai un Lietuvai (angliski, katrai savs konts un domēns).
  for (const f of GOOGLE_MARKETS) foreign.push({ ...f, result: await buildGoogleMarket(f, items, prev) });

  // Latvijas faili tiek rakstīti tikai tad, ja visi ir izveidoti (citādi izvietošana nenotiek
  // un publiski paliek iepriekšējā versija).
  const now = new Date().toISOString();
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(`${OUT_DIR}/salidzini.xml`, toXml(items), 'utf8');
  await writeFile(`${OUT_DIR}/kurpirkt.xml`, toKurpirktXml(items), 'utf8');
  await writeFile(`${OUT_DIR}/ceno.xml`, ceno.xml, 'utf8');
  await writeFile(`${OUT_DIR}/cenueksperts.xml`, cenu.xml, 'utf8');
  for (const f of foreign) if (f.result) await writeFile(`${OUT_DIR}/${f.file}`, f.result.xml, 'utf8');
  // "items" = Salidzini/Kurpirkt preču skaits (to izmanto drošības pārbaude); pārējie – atsevišķi.
  const all = { ...stats, ceno: ceno.stats, cenueksperts: cenu.stats };
  for (const f of foreign) if (f.result) all[f.key] = f.result.stats;
  await writeFile(`${OUT_DIR}/stats.json`, JSON.stringify({ generated: now, source: useAdmin ? 'admin' : 'storefront', ...all }, null, 2));
  const made = foreign.filter((f) => f.result);
  const links = made.map((f) => ` · <a href="${f.file}">${f.file}</a>`).join('');
  const counts = made.map((f) => `, ${f.title}: ${f.result.stats.items}`).join('');
  await writeFile(`${OUT_DIR}/index.html`, `<!doctype html><meta charset="utf-8"><title>Šarlotes audumi – XML</title><p><a href="salidzini.xml">salidzini.xml</a> · <a href="kurpirkt.xml">kurpirkt.xml</a> · <a href="ceno.xml">ceno.xml</a> · <a href="cenueksperts.xml">cenueksperts.xml</a>${links} · ${items.length} preces (Ceno: ${ceno.stats.items}, Cenueksperts: ${cenu.stats.items}${counts}) · ${now}</p>`);
  console.log(JSON.stringify(all, null, 2));
}

// Palaiž tikai tad, ja failu izpilda tieši (node generate.mjs), nevis importē testos.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
