// Šarlotes audumi – Salidzini.lv XML ģenerēšanas noteikumi.
// Šis fails nezina, no kurienes nāk dati: tas saņem jau sakārtotus produktus
// un atgriež XML. Visi noteikumi ir šeit, CONFIG blokā, lai tos būtu viegli mainīt.

export const CONFIG = {
  shopUrl: 'https://sarlotesaudumi.lv',

  // Minimālā cena (EUR ar PVN). Metrā tirgotajām precēm – cena par 1 m.
  minPrice: 3.0,

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
  deliveryDaysShop: 0, // saņemšana veikalā Cēsīs – šodien

  // Zīmoli: meklējam produkta nosaukumā (pirmais atrastais), citādi – piegādātājs no saraksta.
  titleBrands: [
    'SCHMETZ', 'Milward', 'Prym', 'DROPS', 'Amanda', 'YarnArt', 'Alize', 'Bernette', 'Bernina',
    'Pony', 'Opry', 'Madeira', 'Burda', 'Ottobre', 'DMC', 'Addi', 'Hemline', 'KnitPro', 'Mettler',
    'Gütermann', 'Schachenmayr', 'Nako', 'Midara', 'Sew Mate', 'Janome', 'Brother', 'Singer', 'Juki',
  ],
  vendorBrands: ['SCHMETZ', 'DROPS', 'Amanda', 'Ariadna', 'Burda', 'Ottobre', 'Mettler', 'Rekol', 'MIDARA', 'Pāces vilnas fabrika'],

  // Tagi, kas neder kategorijas nosaukumam.
  genericTags: ['new', 'prece', 'decimal', 'apdruka', 'akcija', 'akcijas', 'jaunums', 'jaunumi', 'sale'],
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
