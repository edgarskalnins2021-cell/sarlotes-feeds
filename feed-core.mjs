// Šarlotes audumi – Salidzini.lv XML ģenerēšanas noteikumi.
// Šis fails nezina, no kurienes nāk dati: tas saņem jau sakārtotus produktus
// un atgriež XML. Visi noteikumi ir šeit, CONFIG blokā, lai tos būtu viegli mainīt.

export const CONFIG = {
  shopUrl: 'https://sarlotesaudumi.lv',

  // Minimālā cena (EUR ar PVN). Metrā tirgotajām precēm – cena par 1 m.
  // 0 = minimālās cenas nav (rāda visas preces, kuru cena ir lielāka par 0). Agrāk bija 3.0.
  minPrice: 0,

  // Metrā tirgotās preces: Shopify glabā cenu un atlikumu par 0,1 m (10 cm).
  decimalTag: 'decimal',
  decimalStep: 0.1,
  minDecimalMeters: 1, // ja atlikumā ir mazāk par 1 m, preci nerādām
  decimalNameSuffix: ' (cena par 1 m)', // pievieno nosaukumam, lai pircējs saprot, ka cena ir par metru

  // Produktu tipi, ko nerādām vispār.
  excludeProductTypes: ['Dāvanu kartes', 'Customizer'],

  // Apģērbi apdrukai (T-krekli, džemperi) – nerādām, arī ja tiem nav tipa "Customizer".
  // ("T-kreklu dzija" un "Kreklu audums" netiek skarti.)
  excludeTitlePattern: /(^|\s)(T-krekls|Džemperis)(\s|$)/i,

  // Bojātas, lietotas, demo preces – Salidzini prasa <used>1</used>.
  usedPattern: /(ar defektu|defekts|bojāt|lietot[aāsi]\b|\bdemo\b|ekspozīcij)/i,

  // Nosaukumu tīrīšana: Salidzini neļauj noliktavas/reklāmas frāzes un iekšējas piezīmes.
  nameFixes: [
    [/\s*[-–]?\s*pēdējais gabaliņš\s*/gi, ' – gabals '],
    [/[-–\s]*neatjaunot\b/gi, ''],
    [/(\d)(cm|mm)\b/g, '$1 $2'],
    [/(\S)–\s/g, '$1 – '],
    [/\s–(\S)/g, ' – $1'],
  ],

  // Kategorija bez Google laukiem: produkta tips + konkrētākais tags.
  // Tagi, kas ir vairāk nekā pusei šī tipa produktu, ir meklētāju (SEO) tagi, nevis kategorija.
  categoryTagMaxShare: 0.5,
  categoryTagMinCount: 2,

  // Piegāde (Latvija).
  courierOnlyType: 'COURIER_ONLY',
  delivery: {
    cheapest: 3.3, // Omniva pakomāts
    freeFrom: 70, // Omniva bez maksas no 70 €
    courierLight: 11.9, // kurjers līdz 3 kg
    courierHeavy: 15.9, // kurjers virs 3 kg
    heavyGrams: 3000,
  },
  deliveryDaysLatvia: 3, // "1–3 darbadienas"
  deliveryDaysShop: 0, // saņemšana veikalā Cēsīs – šodien (Salidzini rāda "0d"; tas dod zaļo "Ātra piegāde", jo piegāde ir 3 d)

  // Zīmoli: meklējam produkta nosaukumā (pirmais atrastais), citādi – piegādātājs no saraksta.
  titleBrands: [
    'SCHMETZ', 'Milward', 'Prym', 'DROPS', 'Amanda', 'YarnArt', 'Alize', 'Bernette', 'Bernina',
    'Pony', 'Opry', 'Madeira', 'Burda', 'Ottobre', 'DMC', 'Addi', 'Hemline', 'KnitPro', 'Mettler',
    'Gütermann', 'Schachenmayr', 'Nako', 'Midara', 'Sew Mate', 'Janome', 'Brother', 'Singer', 'Juki',
  ],
  vendorBrands: ['SCHMETZ', 'DROPS', 'Amanda', 'Ariadna', 'Burda', 'Ottobre', 'Mettler', 'Rekol', 'MIDARA', 'Pāces vilnas fabrika'],

  // Tagi, kas neder kategorijas nosaukumam.
  genericTags: ['new', 'prece', 'decimal', 'apdruka', 'akcija', 'akcijas', 'jaunums', 'jaunumi', 'sale'],

  // Ceno.lv (ceno.xml). Cenas un piegāde – EUR ar PVN, par vienu piedāvājuma vienību
  // (metrā tirgotajām precēm – par 1 m). Skat. toCenoXml un README.
  ceno: {
    nameMax: 200,
    categorySeparator: ' > ',
    usedNew: '0', // jaunām precēm
    skipUsed: true, // ar defektu / demo / lietotas preces 1. versijā neiekļaujam
    // Ceno instrukcija (ceno.lv/pages/xml-file): "Ja kāda piegāde netiek atbalstīta, tad attiecīgais
    // tags jāatstāj tukšs" → piegādes tagi vienmēr ir, nepiedāvātajiem – <tag></tag>.
    // Pārējie neobligātie tagi bez vērtības netiek likti.
    keepEmptyTags: ['delivery_cost_riga', 'delivery_latvija', 'delivery_omniva', 'delivery_dpd_paku_bode',
      'delivery_latvijas_pasts', 'delivery_pasta_stacija', 'delivery_circlek', 'delivery_venipak'],
    // false: <price> = cena, ko pircējs maksā; price_sale netiek likts.
    // (Pārbaudīts 09.11.2026: Ceno kartiņā rāda tikai <price>, price_sale nerāda – ar true akcijas
    // preces izskatītos dārgākas, piem. 3.90 € vietā 3.30 €.)
    // true: price = sākotnējā cena (Shopify compareAtPrice), price_sale = akcijas cena.
    salePrice: false,
    // Piegādes veidi Latvijā (Shopify General profile → Latvija). null = veids netiek piedāvāts.
    delivery: {
      omniva: { price: 3.3, freeFrom: 70, maxGrams: 30000 }, // pakomāts; 0 € no 70 € pirkuma
      dpd: { price: 4.99, maxGrams: 30000 }, // DPD pakomāts
      courier: { light: 11.9, heavy: 15.9, heavyGrams: 3000 },
      latvijasPasts: null, pastaStacija: null, circlek: null, venipak: null,
    },
    // delivery_cost_riga / delivery_latvija: 'max' – dārgākais pieejamais veids (garantēti ne vairāk),
    // 'min' – lētākais.
    deliveryCostMode: 'max',
    deliveryDays: 3, // "1–3 darba dienas" (piegādes lapa)
    // Kolekcijas, kas nav preču kategorija (category_link tām netiek likts).
    genericCollections: /^(jaunumi|viss-sortiments|visi-|akcij|audumu-atgriezumi|audumu-izpardosana|dead-stock|2026-gada|bezmaksas|frontpage|all$)/,
  },

  // Hind.ee (hindee.xml) – Igaunijas veikals sharlottekangad.ee. Nosaukumi, saites, tips, apraksts un cena –
  // no Igaunijas veikala (igauņu valodā, Igaunijas cena ar PVN); atlikums, svars, attēli, EAN – kā LV failos.
  hindee: {
    shopUrl: 'https://sharlottekangad.ee',
    nameMax: 200,
    decimalNameSuffix: ' (hind 1 m kohta)', // "(cena par 1 m)"
    // "viimane tükk 50cm" = "pēdējais gabaliņš 50cm" → "tükk 50 cm" (kā LV failos)
    nameFixes: [
      [/\s*[-–]?\s*viimane tükk\s*/gi, ' – tükk '],
      [/(\d)(cm|mm)\b/g, '$1 $2'],
      [/(\S)–\s/g, '$1 – '],
      [/\s–(\S)/g, ' – $1'],
    ],
    // Tulkotais "tikai kurjers" tips (AINULT_KULLER, KULLER_AINULT u.c.) nav kategorija.
    technicalTypePattern: /KULLER|KURIER|COURIER/i,
    descMax: 500,
    // Piegāde uz Igauniju (Shopify General profile → Estonia; bez bezmaksas piegādes sliekšņa).
    delivery: {
      omniva: { price: 5.99, maxGrams: 30000 }, // pakiautomaat
      dpd: { price: 6.99, maxGrams: 30000 }, // pakiautomaat
      courier: 15.9, // kuller, bez svara robežas
    },
    // Darba dienas. Veikala Igaunijas preces lapā "Eeldatav tarneaeg" ir 2 darba dienas vēlāk nekā
    // Latvijā (09.11.2026: LV – 13.11., EE – 17.11.), tāpēc 3 + 2.
    deliveryDays: 5,
  },
};

const BRAND_CANON = { prym: 'Prym', schmetz: 'SCHMETZ', drops: 'DROPS', opry: 'Opry', midara: 'MIDARA' };

function escapeXml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    // XML 1.0 neatļautās kontrolrakstzīmes
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
}

function money(n) {
  return (Math.round(n * 100) / 100).toFixed(2);
}

function cut(s, max) {
  s = String(s ?? '').replace(/\s+/g, ' ').trim();
  return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s;
}

// Derīgs EAN/GTIN (8, 12, 13 vai 14 cipari ar pareizu kontrolciparu).
export function validGtin(code, variantId) {
  const c = String(code ?? '').trim();
  if (!/^(\d{8}|\d{12,14})$/.test(c)) return null;
  // Shopify automātiski ģenerētie kodi = varianta ID pēdējie cipari – tie nav īsti EAN.
  if (variantId && String(variantId).endsWith(c)) return null;
  const digits = c.split('').map(Number);
  const check = digits.pop();
  let sum = 0;
  digits.reverse().forEach((d, i) => { sum += d * (i % 2 === 0 ? 3 : 1); });
  return (10 - (sum % 10)) % 10 === check ? c : null;
}

function detectBrand(product, cfg) {
  for (const b of cfg.titleBrands) {
    const re = new RegExp(`(^|[^\\p{L}])${b.replace(/\s+/g, '\\s+')}([^\\p{L}]|$)`, 'iu');
    if (re.test(product.title)) return BRAND_CANON[b.toLowerCase()] || b;
  }
  if (cfg.vendorBrands.includes(product.vendor)) return product.vendor;
  return '';
}

// Cik bieži katrs tags sastopams katra tipa produktos (lai atšķirtu kategoriju no SEO taga).
function tagStats(products) {
  const byType = new Map();
  for (const p of products) {
    const type = p.productType || '';
    if (!byType.has(type)) byType.set(type, { n: 0, tags: new Map() });
    const s = byType.get(type);
    s.n++;
    for (const t of new Set(p.tags || [])) s.tags.set(t, (s.tags.get(t) || 0) + 1);
  }
  return byType;
}

function categoryFor(product, variant, cfg, stats) {
  const parts = (variant.categoryPath || []).filter(Boolean);
  if (parts.length) return parts.join(' >> ');
  const type = product.productType === cfg.courierOnlyType ? '' : (product.productType || ''); // tehnisks tips, nav kategorija
  const generic = new Set(cfg.genericTags.map((t) => t.toLowerCase()));
  const s = stats?.get(product.productType || '');
  let best = '';
  let bestN = Infinity;
  for (const t of product.tags || []) {
    const lt = t.toLowerCase().trim();
    if (generic.has(lt) || t.length <= 2 || /^[-–]/.test(t) || lt === type.toLowerCase()) continue;
    const n = s?.tags.get(t) || 0;
    if (n < cfg.categoryTagMinCount) continue; // viena produkta tags nav kategorija
    if (s && s.n >= 10 && n / s.n > cfg.categoryTagMaxShare) continue; // SEO tags
    if (n < bestN || (n === bestN && t.length > best.length)) { best = t; bestN = n; } // konkrētākais
  }
  return [type, best].filter(Boolean).join(' >> ');
}

function cleanName(s, cfg) {
  for (const [re, to] of cfg.nameFixes || []) s = s.replace(re, to);
  return s;
}

/**
 * products: [{ title, handle, productType, vendor, tags[], isGiftCard, image, onlineStore (bool),
 *   variants: [{ id, title, price, available, qty (number|null), tracked (bool|null),
 *                requiresShipping, grams, image, barcode, categoryPath[] }] }]
 */
export function buildItems(products, cfg = CONFIG) {
  const stats = { products: products.length, items: 0, skipped: {} };
  const skip = (why) => { stats.skipped[why] = (stats.skipped[why] || 0) + 1; };
  const seenNames = new Set();
  const items = [];
  const tags = tagStats(products);

  for (const p of products) {
    if (p.onlineStore === false) { skip('nav publicēts veikalā'); continue; }
    if (p.isGiftCard || cfg.excludeProductTypes.includes(p.productType)) {
      skip(p.isGiftCard || p.productType === 'Dāvanu kartes' ? 'dāvanu karte' : `tips ${p.productType}`);
      continue;
    }
    if (cfg.excludeTitlePattern?.test(p.title)) { skip('T-krekli/džemperi'); continue; }
    const decimal = (p.tags || []).includes(cfg.decimalTag);
    const multi = p.variants.length > 1;

    for (const v of p.variants) {
      if (!v.requiresShipping) { skip('digitāla prece'); continue; }
      if (!(v.price > 0)) { skip('cena 0'); continue; }
      if (v.tracked === false) { skip('atlikums netiek uzskaitīts'); continue; }
      if (v.qty != null ? v.qty <= 0 : !v.available) { skip('0 atlikums'); continue; }

      const price = decimal ? v.price / cfg.decimalStep : v.price;
      let inStock = v.qty;
      if (decimal && v.qty != null) {
        inStock = Math.floor(v.qty * cfg.decimalStep + 1e-9);
        if (inStock < cfg.minDecimalMeters) { skip('atlikumā mazāk par 1 m'); continue; }
      }
      if (price < cfg.minPrice) { skip(`cena zem ${money(cfg.minPrice)} €`); continue; }

      const variantTitle = v.title && v.title !== 'Default Title' ? ` – ${v.title}` : '';
      const name = cut(cleanName(`${p.title}${variantTitle}`, cfg) + (decimal ? cfg.decimalNameSuffix : ''), 200);
      if (seenNames.has(name)) { skip('dublikāts'); continue; }
      seenNames.add(name);

      const courier = p.productType === cfg.courierOnlyType;
      const d = cfg.delivery;
      const delivery = courier
        ? ((v.grams || 0) > d.heavyGrams ? d.courierHeavy : d.courierLight)
        : (price >= d.freeFrom ? 0 : d.cheapest);

      const numericId = String(v.id).split('/').pop();
      items.push({
        name,
        link: cut(`${cfg.shopUrl}/products/${p.handle}${multi ? `?variant=${numericId}` : ''}`, 500),
        price: money(price),
        image: cut(v.image || p.image || '', 500),
        category_full: cut(categoryFor(p, v, cfg, tags), 200),
        brand: detectBrand(p, cfg),
        ean: validGtin(v.barcode, numericId) || '',
        in_stock: inStock != null ? String(inStock) : '',
        delivery_latvija: money(delivery),
        delivery_days_latvija: String(cfg.deliveryDaysLatvia),
        delivery_days_shop: String(cfg.deliveryDaysShop),
        used: cfg.usedPattern?.test(`${p.title} ${v.title || ''}`) ? '1' : '',
        _decimal: decimal,
        // Iekšējie lauki citām plūsmām (Ceno). toXml / toKurpirktXml tos neizvada.
        _baseName: cleanName(`${p.title}${variantTitle}`, cfg).replace(/\s+/g, ' ').trim(),
        _variantId: numericId,
        _priceNum: price,
        _compareAt: v.compareAtPrice > 0 ? (decimal ? v.compareAtPrice / cfg.decimalStep : v.compareAtPrice) : null,
        _grams: decimal ? (v.grams || 0) / cfg.decimalStep : (v.grams || 0), // Shopify svars ir par 0,1 m
        _courierOnly: courier,
        _collections: p.collections || [],
        _desc: p.description || '',
      });
    }
  }
  stats.items = items.length;
  return { items, stats };
}

const TAG_ORDER = ['name', 'link', 'price', 'image', 'category_full', 'brand', 'ean', 'in_stock',
  'delivery_latvija', 'delivery_days_latvija', 'delivery_days_shop', 'used'];

// Kurpirkt.lv formāts (https://www.kurpirkt.lv/veikaliem.php): tās pašas preces, citi lauku nosaukumi.
export function toKurpirktXml(items) {
  const out = ["<?xml version='1.0' encoding='utf-8' ?>", '<root>'];
  for (const it of items) {
    const parts = String(it.category_full || '').split(/\s*>>\s*/).filter(Boolean);
    const row = {
      name: it.name,
      link: it.link,
      price: it.price,
      image: it.image,
      manufacturer: it.brand,
      category: parts[parts.length - 1] || '',
      category_full: parts.join(' > '),
      in_stock: it.in_stock,
      delivery_cost_riga: it.delivery_latvija,
      used: it.used === '1' ? '1' : '0',
    };
    out.push('<item>');
    for (const [tag, val] of Object.entries(row)) {
      if ((val === '' || val == null) && ['in_stock', 'delivery_cost_riga'].includes(tag)) continue; // neobligātie
      out.push(`<${tag}>${escapeXml(val)}</${tag}>`);
    }
    out.push('</item>');
  }
  out.push('</root>', '');
  return out.join('\n');
}

// ---------- Ceno.lv ----------

const CENO_TAGS = ['name', 'link', 'price', 'price_sale', 'image', 'manufacturer', 'model', 'ean',
  'category', 'category_full', 'category_link', 'in_stock', 'used',
  'delivery_cost_riga', 'delivery_latvija', 'delivery_omniva', 'delivery_dpd_paku_bode',
  'delivery_latvijas_pasts', 'delivery_pasta_stacija', 'delivery_circlek', 'delivery_venipak',
  'delivery_days_riga', 'delivery_days_latvija'];

// Nosaukums ar garuma robežu, saglabājot vienības norādi beigās ("(cena par 1 m)").
function cutKeepSuffix(base, suffix, max) {
  return suffix ? cut(base, max - suffix.length) + suffix : cut(base, max);
}

const normTitle = (s) => String(s || '').toLowerCase()
  .replace(/\p{Extended_Pictographic}|️|‍/gu, '')
  .replace(/^\s*100\s*%\s*/, '')
  .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

// Kategorijas saite: tikai publicēta kolekcija, kurā prece tiešām ir un kuras nosaukums
// sakrīt ar kādu kategorijas līmeni (sākot ar konkrētāko). Citādi – tukšs.
function cenoCategoryLink(it, parts, cfg, published) {
  if (!published?.size) return '';
  const own = (it._collections || []).filter((c) => published.has(c.handle) && !cfg.ceno.genericCollections.test(c.handle));
  for (let i = parts.length - 1; i >= 0; i--) {
    const want = normTitle(parts[i]);
    const hit = own.find((c) => normTitle(published.get(c.handle).title || c.title) === want);
    if (hit) return `${cfg.shopUrl}/collections/${hit.handle}`;
  }
  return '';
}

// Piegādes cenas vienai piedāvājuma vienībai. '' = veids šai precei netiek piedāvāts.
export function cenoDelivery(it, cfg = CONFIG) {
  const d = cfg.ceno.delivery;
  const g = it._grams || 0;
  const price = it._priceNum;
  const lockerOk = (m) => m && !it._courierOnly && g <= m.maxGrams;
  const out = {
    omniva: lockerOk(d.omniva) ? (d.omniva.freeFrom && price >= d.omniva.freeFrom ? 0 : d.omniva.price) : null,
    dpd: lockerOk(d.dpd) ? d.dpd.price : null,
    courier: d.courier ? (g > d.courier.heavyGrams ? d.courier.heavy : d.courier.light) : null,
  };
  const offered = Object.values(out).filter((v) => v != null);
  const total = offered.length ? (cfg.ceno.deliveryCostMode === 'min' ? Math.min(...offered) : Math.max(...offered)) : null;
  const m = (v) => (v == null ? '' : money(v));
  return {
    delivery_cost_riga: m(total),
    delivery_latvija: m(total),
    delivery_omniva: m(out.omniva),
    delivery_dpd_paku_bode: m(out.dpd),
    delivery_latvijas_pasts: m(d.latvijasPasts),
    delivery_pasta_stacija: m(d.pastaStacija),
    delivery_circlek: m(d.circlek),
    delivery_venipak: m(d.venipak),
  };
}

/**
 * Ceno.lv XML no buildItems ierakstiem. Cenas un atlikumi jau ir pārrēķināti uz pārdošanas
 * vienību (metrā tirgotajām – 1 m), tāpēc šeit tos otrreiz nepārrēķina.
 * ctx.publishedCollections: Map(handle → { title }) – veikalā publicētās kolekcijas (category_link).
 * Atgriež { xml, stats }.
 */
export function toCenoXml(items, cfg = CONFIG, ctx = {}) {
  const c = cfg.ceno;
  const stats = { items: 0, decimal: 0, skipped: {}, with: { ean: 0, manufacturer: 0, category_link: 0, price_sale: 0 }, compareAtHigher: 0 };
  const skip = (why) => { stats.skipped[why] = (stats.skipped[why] || 0) + 1; };
  const seenLinks = new Set();
  const out = ['<?xml version="1.0" encoding="utf-8" ?>', '<root>']; // kā Ceno paraugā

  for (const it of items) {
    if (c.skipUsed && it.used === '1') { skip('ar defektu / demo / lietota'); continue; }
    if (!it.image) { skip('nav attēla'); continue; }
    if (it._decimal && it.in_stock === '') { skip('metrā tirgota, atlikums nav zināms'); continue; }
    if (seenLinks.has(it.link)) { skip('dublikāts (saite)'); continue; }
    seenLinks.add(it.link);

    const parts = String(it.category_full || '').split(/\s*>>\s*/).filter(Boolean);
    const sale = it._compareAt != null && it._compareAt > it._priceNum + 0.004;
    if (sale) stats.compareAtHigher++;
    const row = {
      name: cutKeepSuffix(it._baseName ?? it.name, it._decimal ? cfg.decimalNameSuffix : '', c.nameMax),
      link: it.link,
      // Akcija: price = sākotnējā cena, price_sale = cena, ko pircējs maksā (abas par to pašu vienību).
      price: c.salePrice && sale ? money(it._compareAt) : it.price,
      price_sale: c.salePrice && sale ? it.price : '',
      image: it.image,
      manufacturer: it.brand,
      model: '',
      ean: it.ean,
      category: parts[parts.length - 1] || '',
      category_full: parts.join(c.categorySeparator),
      category_link: cenoCategoryLink(it, parts, cfg, ctx.publishedCollections),
      in_stock: it.in_stock,
      used: c.usedNew,
      ...cenoDelivery(it, cfg),
      delivery_days_riga: String(c.deliveryDays),
      delivery_days_latvija: String(c.deliveryDays),
    };
    for (const k of ['ean', 'manufacturer', 'category_link', 'price_sale']) if (row[k]) stats.with[k]++;
    if (it._decimal) stats.decimal++;
    stats.items++;

    out.push('<item>');
    for (const tag of CENO_TAGS) {
      const val = row[tag];
      if ((val === '' || val == null) && !c.keepEmptyTags.includes(tag)) continue;
      out.push(`<${tag}>${escapeXml(val)}</${tag}>`);
    }
    out.push('</item>');
  }
  out.push('</root>', '');
  return { xml: out.join('\n'), stats };
}

// ---------- Cenueksperts.lv ----------
// Formāts: https://static.guenstiger.de/download/productfileexample.xml (saite no w.cenueksperts.lv/buj).
// Obligāti: nosaukums, cena, URL, apraksts, attēla URL. Cenas un atlikumi jau ir par pārdošanas vienību.

const CENUEKSPERTS_TAGS = ['item_unique_id', 'item_manufacturer', 'item_name', 'item_category', 'item_short_desc',
  'item_page_url', 'item_image_url', 'item_upc', 'item_price', 'item_inventory', 'item_condition', 'item_shipping_charge'];

export function toCenuekspertsXml(items, cfg = CONFIG) {
  const stats = { items: 0, decimal: 0, skipped: {} };
  const skip = (why) => { stats.skipped[why] = (stats.skipped[why] || 0) + 1; };
  const seen = new Set();
  const out = ['<?xml version="1.0" encoding="utf-8" ?>', '<DataFeeds>'];
  for (const it of items) {
    if (it.used === '1') { skip('ar defektu / demo / lietota'); continue; }
    if (!it.image) { skip('nav attēla'); continue; }
    const desc = cut(String(it._desc || '').replace(/\s+/g, ' ').trim(), 500);
    if (!desc) { skip('nav apraksta'); continue; }
    if (seen.has(it.link)) { skip('dublikāts (saite)'); continue; }
    seen.add(it.link);
    const row = {
      item_unique_id: it._variantId,
      item_manufacturer: it.brand,
      item_name: it.name,
      item_category: String(it.category_full || '').split(/\s*>>\s*/).filter(Boolean).join(' / '),
      item_short_desc: desc,
      item_page_url: it.link,
      item_image_url: it.image,
      item_upc: it.ean,
      item_price: it.price, // cena, ko pircējs maksā (metrā tirgotajām – par 1 m)
      item_inventory: 'AVAILABLE', // failā ir tikai preces, kas ir noliktavā
      item_condition: 'New',
      item_shipping_charge: it.delivery_latvija, // lētākā piegāde Latvijā (kā Salidzini)
    };
    out.push('<item_data>');
    for (const tag of CENUEKSPERTS_TAGS) {
      const val = row[tag];
      if (val === '' || val == null) continue;
      out.push(`<${tag}>${escapeXml(val)}</${tag}>`);
    }
    out.push('</item_data>');
    stats.items++;
    if (it._decimal) stats.decimal++;
  }
  out.push('</DataFeeds>', '');
  return { xml: out.join('\n'), stats };
}

// ---------- Hind.ee (Igaunija) ----------
// Hind.ee XML apraksts nav publisks (pieejams pēc reģistrācijas), tāpēc pagaidām Baltijā ierasts
// <root><item> formāts ar skaidriem lauku nosaukumiem; kad Hind.ee atsūtīs savu aprakstu, pielāgo HINDEE_TAGS.

const HINDEE_TAGS = ['id', 'name', 'link', 'price', 'image', 'category', 'manufacturer', 'ean', 'in_stock',
  'description', 'delivery_cost', 'delivery_omniva', 'delivery_dpd', 'delivery_courier', 'delivery_days'];

// Piegādes cenas uz Igauniju vienai piedāvājuma vienībai. null = veids šai precei netiek piedāvāts.
export function hindeeDelivery(it, cfg = CONFIG) {
  const d = cfg.hindee.delivery;
  const g = it._grams || 0;
  const lockerOk = (m) => m && !it._courierOnly && g <= m.maxGrams;
  const out = { omniva: lockerOk(d.omniva) ? d.omniva.price : null, dpd: lockerOk(d.dpd) ? d.dpd.price : null, courier: d.courier ?? null };
  const offered = Object.values(out).filter((v) => v != null);
  return { ...out, cheapest: offered.length ? Math.min(...offered) : null };
}

/**
 * items – buildItems ieraksti (LV dati: atlikums, svars, attēls, EAN, zīmols, metrā tirgotās preces).
 * ee – Map(varianta ID → { title, variantTitle, handle, productType, price, description }) no
 *   Igaunijas veikala (sharlottekangad.ee/products.json): igauņu teksti un Igaunijas cena par Shopify vienību.
 * Atgriež { xml, stats }.
 */
export function toHindeeXml(items, ee, cfg = CONFIG) {
  const h = cfg.hindee;
  const stats = { items: 0, decimal: 0, skipped: {}, sameNameAsLv: 0, withCategory: 0 };
  const skip = (why) => { stats.skipped[why] = (stats.skipped[why] || 0) + 1; };
  const seenNames = new Set();
  const seenLinks = new Set();
  const out = ['<?xml version="1.0" encoding="utf-8" ?>', '<root>'];

  for (const it of items) {
    if (it.used === '1') { skip('ar defektu / demo / lietota'); continue; }
    if (!it.image) { skip('nav attēla'); continue; }
    if (it._decimal && it.in_stock === '') { skip('metrā tirgota, atlikums nav zināms'); continue; }
    const e = ee.get(String(it._variantId));
    if (!e) { skip('nav Igaunijas veikalā'); continue; }
    if (!(e.price > 0)) { skip('nav Igaunijas cenas'); continue; }

    // Igaunijas cena par Shopify vienību; metrā tirgotajām – par 1 m (Shopify vienība = 0,1 m).
    const price = it._decimal ? e.price / cfg.decimalStep : e.price;
    if (price < cfg.minPrice) { skip(`cena zem ${money(cfg.minPrice)} €`); continue; }
    const variantTitle = e.variantTitle && e.variantTitle !== 'Default Title' ? ` – ${e.variantTitle}` : '';
    const base = cleanName(`${e.title}${variantTitle}`, h).replace(/\s+/g, ' ').trim();
    if (base === it._baseName) stats.sameNameAsLv++;
    const name = cutKeepSuffix(base, it._decimal ? h.decimalNameSuffix : '', h.nameMax);
    if (seenNames.has(name)) { skip('dublikāts (nosaukums)'); continue; }
    const multi = String(it.link).includes('?variant=');
    const link = cut(`${h.shopUrl}/products/${e.handle}${multi ? `?variant=${it._variantId}` : ''}`, 500);
    if (seenLinks.has(link)) { skip('dublikāts (saite)'); continue; }
    seenNames.add(name);
    seenLinks.add(link);

    const type = String(e.productType || '').trim();
    const category = it._courierOnly || h.technicalTypePattern.test(type) ? '' : type;
    const d = hindeeDelivery(it, cfg);
    const m = (v) => (v == null ? '' : money(v));
    const row = {
      id: it._variantId,
      name,
      link,
      price: money(price),
      image: it.image,
      category,
      manufacturer: it.brand,
      ean: it.ean,
      in_stock: it.in_stock, // metrā tirgotajām – pilni metri
      description: cut(String(e.description || '').replace(/\s+/g, ' ').trim(), h.descMax),
      delivery_cost: m(d.cheapest),
      delivery_omniva: m(d.omniva),
      delivery_dpd: m(d.dpd),
      delivery_courier: m(d.courier),
      delivery_days: String(h.deliveryDays),
    };
    if (category) stats.withCategory++;
    if (it._decimal) stats.decimal++;
    stats.items++;

    out.push('<item>');
    for (const tag of HINDEE_TAGS) {
      const val = row[tag];
      if (val === '' || val == null) continue;
      out.push(`<${tag}>${escapeXml(val)}</${tag}>`);
    }
    out.push('</item>');
  }
  out.push('</root>', '');
  return { xml: out.join('\n'), stats };
}

export function toXml(items) {
  const out = ['<?xml version="1.0" encoding="utf-8" ?>', '<root>'];
  for (const it of items) {
    out.push('<item>');
    for (const tag of TAG_ORDER) {
      const val = it[tag];
      if (val === '' || val == null) continue;
      out.push(`<${tag}>${escapeXml(val)}</${tag}>`);
    }
    out.push('</item>');
  }
  out.push('</root>', '');
  return out.join('\n');
}
