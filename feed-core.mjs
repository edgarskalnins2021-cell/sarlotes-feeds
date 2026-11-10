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
  // Formāts – Hind.ee oficiālais paraugs https://www.hind.ee/xml/example.xml (tāds pats kā Kaina24).
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
    // category_name ir obligāts: ja nav ne tipa, ne LV kategorijas atbilsmes – vispārīgā kategorija.
    defaultCategory: 'Õmblus- ja käsitöötarbed',
    descMax: 1000,
    // Piegāde uz Igauniju (Shopify General profile → Estonia; bez bezmaksas piegādes sliekšņa):
    // pakiautomaat – lētākais (Omniva 5,99 €; DPD 6,99 €), līdz 30 kg, ne "tikai kurjers"; kuller 15,90 €.
    delivery: { parcelLocker: { price: 5.99, maxGrams: 30000 }, home: 15.9 },
    // Darba dienas. Veikala Igaunijas preces lapā "Eeldatav tarneaeg" ir 2 darba dienas vēlāk nekā
    // Latvijā (09.11.2026: LV – 13.11., EE – 17.11.), tāpēc 3 + 2.
    deliveryDays: '5',
    countryLabel: 'Igaunijas',
  },

  // Kaina24.lt (kaina24.xml) – Lietuvas veikals sarlotesaudiniai.lt. Tāpat kā Hind.ee: lietuviešu teksti
  // un Lietuvas cena no Lietuvas veikala, atlikums u.c. – kā LV failos. Kaina24 un Hind.ee ir viens uzņēmums
  // (UAB Elektroninės prekybos centras).
  kaina24: {
    shopUrl: 'https://sarlotesaudiniai.lt',
    countryLabel: 'Lietuvas',
    nameMax: 200,
    decimalNameSuffix: ' (kaina už 1 m)', // "(cena par 1 m)"
    // "paskutinis gabalėlis 50cm" = "pēdējais gabaliņš 50cm" → "gabalas 50 cm" (kā LV failos)
    nameFixes: [
      [/\s*[-–]?\s*paskutinis gabalėlis\s*/gi, ' – gabalas '],
      [/(\d)(cm|mm)\b/g, '$1 $2'],
      [/(\S)–\s/g, '$1 – '],
      [/\s–(\S)/g, ' – $1'],
    ],
    technicalTypePattern: /KURJER|KULLER|COURIER/i,
    // category_name ir obligāts: ja nav ne tipa, ne LV kategorijas atbilsmes – vispārīgā kategorija.
    defaultCategory: 'Siuvimo ir rankdarbių prekės',
    descMax: 1000,
    // Piegāde uz Lietuvu (Shopify General profile → Lithuania; bez bezmaksas piegādes sliekšņa):
    // pakomāts – lētākais (Omniva 5,99 €; DPD 6,99 €), līdz 30 kg, ne "tikai kurjers"; kurjers 15,90 €.
    delivery: { parcelLocker: { price: 5.99, maxGrams: 30000 }, home: 15.9 },
    // Veikala Lietuvas preču lapā "Numatomas pristatymo laikas" – tāpat kā Igaunijā (09.11.2026 → 17.11.).
    deliveryDays: '5',
  },

  // Google Merchant Center (google-lv.xml) – latviešu teksti un saites, Latvijai. Formāts: RSS 2.0 ar g: laukiem
  // (https://support.google.com/merchants/answer/7052112). Skat. toGoogleXml un README.
  google: {
    // Tādi paši ID kā Shopify Google & YouTube lietotnei (shopify_ZZ_{produkta ID}_{varianta ID}):
    // Google iesaka vienai precei visās valodās lietot vienu un to pašu ID.
    idPrefix: 'shopify_ZZ_',
    titleMax: 150,
    descMax: 5000,
    additionalImages: 10,
    // Metrā tirgotās preces: cena par Shopify vienību (10 cm) – tieši tāda, kā preces lapā un tās strukturētajos
    // datos (citādi Google atzīmē "cena nesakrīt ar lapu"); Google pats parāda arī cenu par 1 m.
    unitPricingMeasure: '10cm',
    unitPricingBaseMeasure: '1m',
    // false: g:price = cena, ko pircējs maksā (kā Ceno). true: g:price = compareAtPrice, g:sale_price = cena.
    salePrice: false,
    // Piegāde. Parastajām precēm – Merchant Center konta piegādes politika (Latvija: 3,30 €, no 70 € bez maksas,
    // 1–3 darba dienas) – Google iesaka vispirms izmantot konta iestatījumus. Precēm "tikai kurjers" un smagākām
    // par 30 kg pakomāts neder – tām failā ir sava piegāde (kurjers 11,90 € / virs 3 kg 15,90 €), kas šai precei
    // aizstāj konta iestatījumus. Cenas – kā ceno.delivery (Shopify General profile → Latvija).
    shipping: { country: 'LV', service: 'Piegāde ar kurjeru', handling: [0, 1], transit: [1, 2] },
    shipsFrom: 'LV',
    // Variantu opcijas (Shopify opcijas nosaukums) → Google krāsa / izmērs / raksts. Visas opcijas tiek
    // nodotas arī kā variant_option (nosaukums + vērtība).
    colorOption: /^(krāsa|krāsas|tonis|krāsu variants|colou?r|tone|shade)$/i,
    sizeOption: /^(izmērs|adatas izmērs|garums|diametrs|size|needle size|length|diameter)$/i,
    patternOption: /^(motīvs|raksts|pattern|motif)$/i,
    // custom_label_3 – cenu grupa (metrā tirgotajām – cena par 1 m)
    priceBands: [5, 20, 50],
    // Google produktu kategorija pēc Shopify produkta tipa. ID no oficiālās taksonomijas
    // https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt (versija 2021-09-21).
    // Tipiem, kuru šeit nav (jaukti vai neskaidri), kategoriju nosaka Google pats.
    categories: {
      'Audums': 47, 'Filcs': 47, 'Manžetes audums | Auduma mala': 47, // Textiles > Fabric
      'Līmaudums': 7076, // Textiles > Interfacing
      'Dzija': 2669, // Crafting Fibers > Yarn
      'Diegi': 49, 'Diegi Overlokam': 49, 'Mulinē diegi': 49, // Crafting Fibers > Thread & Floss
      'Vilna filcēšanai': 6140, // Crafting Fibers > Unspun Fiber
      'Auklas': 505382, // Crafting Fibers
      'Adatas šūšanai ar rokām': 5992, // Needles & Hooks > Hand-Sewing Needles
      'Adāmadatas': 6139, // Needles & Hooks > Knitting Needles
      'Tamboradatas': 6127, // Needles & Hooks > Crochet Hooks
      'Šujmašīnu adatas': 4579, 'Overloka adatas': 4579, // Needles & Hooks > Sewing Machine Needles
      'Kniepadatas': 6159, // Straight Pins
      'Filcēšanas adata': 6134, // Textile Craft Machines > Felting Needles & Machines
      'Filcēšanas paliktnis': 6133, // Felting Pads & Mats
      'Šujmašīnas': 615, 'Overloki': 615, 'Plakanšuves mašīnas': 615, // Textile Craft Machines > Sewing Machines
      'Šujmašīnu pēdiņas': 5120, // Art & Crafting Tool Accessories > Sewing Machine Feet
      'Šujmašīnu rezerves daļas': 503348, // Art & Crafting Tool Accessories > Sewing Machine Replacement Parts
      'Pogas': 4226, // Craft Fasteners & Closures > Buttons & Snaps
      'Rāvējslēdzēji': 4174, // Craft Fasteners & Closures > Zippers
      'Aizdares āķi': 505408, // Craft Fasteners & Closures > Clasps & Hooks
      'Furnitūra metāla': 505380, 'Furnitūra plastmasas': 505380, 'Somu furnitūra': 505380, // Craft Fasteners & Closures
      'Gumijas': 6146, // Embellishments & Trims > Elastic
      'Lentas': 505412, 'Mežģīnes': 505412, // Embellishments & Trims > Ribbons & Trim
      'Pildmateriāls': 505407, // Filling & Padding Material > Batting & Stuffing
      'Izšūšanas rāmis, riņķis': 6158, // Frames, Hoops & Stretchers
      'Lineāli un mērinstrumenti': 6157, // Craft Measuring & Marking Tools > Textile Art Gauges & Rulers
      'Paliktņi piegriešanai': 5137, // Cutting Mats
      'Diska naži': 504640, 'Šķēres un šuvju ārdītāji': 504640, // Craft Cutting & Embossing Tools
      'Krīti, ziepes, pildspalvas': 505392, // Craft Measuring & Marking Tools
      'Līmes': 503745, // Crafting Adhesives & Magnets > Craft & Office Glue
      'Audumu krāsas': 505415, // Craft Paint, Ink & Glaze > Craft Dyes
      'Otas': 18, // Craft Measuring & Marking Tools > Art Brushes
      'Piegrieztne': 3697, // Crafting Patterns & Molds > Sewing Patterns
      'Žurnāli': 543539, // Media > Magazines & Newspapers > Magazines
    },
    // Jauktiem tipiem – pēc nosaukuma ("Adatas": drošības adatas un šujmašīnu adatas).
    categoryByTitle: {
      'Adatas': [[/drošības adat/i, 6101], [/(šujmašīnu|overloka|koverloka)[^,]*adat/i, 4579]], // Safety Pins; Sewing Machine Needles
    },
  },

  // Google Merchant Center Igaunijai un Lietuvai – ANGLISKI (igauņu un lietuviešu valodu Google vēl neatbalsta).
  // Katram domēnam savs Merchant Center konts. Teksti, saites (/en/), cena un tips – no valsts veikala angļu versijas
  // (/en/products.json); preces, atlikums, svars, EAN, zīmols, Google kategorija – kā google-lv.xml. Piegāde – failā
  // katrai precei (Shopify General profile → Estonia / Lithuania, bez bezmaksas piegādes sliekšņa).
  googleMarkets: {
    ee: {
      file: 'google-ee-en.xml', shopUrl: 'https://sharlottekangad.ee', pathPrefix: '/en', country: 'EE',
      countryLabel: 'Igaunijas', storeName: 'Šarlotte kangad',
    },
    lt: {
      file: 'google-lt-en.xml', shopUrl: 'https://sarlotesaudiniai.lt', pathPrefix: '/en', country: 'LT',
      countryLabel: 'Lietuvas', storeName: 'Šarlotės audiniai',
    },
    // Kopīgie iestatījumi abām valstīm
    common: {
      // "last piece 50cm" (= "pēdējais gabaliņš") → "piece 50 cm" (kā LV failos; Google: bez steidzinoša teksta)
      nameFixes: [
        [/\s*[-–]?\s*last piece,?\s*/gi, ' – piece '],
        [/(\d)(cm|mm)\b/g, '$1 $2'],
        [/(\S)–\s/g, '$1 – '],
        [/\s–(\S)/g, ' – $1'],
      ],
      technicalTypePattern: /COURIER|KURJER|KULLER/i,
      // Pakomāts (lētākais – Omniva 5,99 €; DPD 6,99 €) līdz 30 kg, ne "tikai kurjers"; kurjers 15,90 €.
      shipping: {
        locker: { service: 'Omniva parcel locker', price: 5.99, maxGrams: 30000 },
        courier: { service: 'Courier', price: 15.9 },
        // Latvijā 1–3 darba dienas; Igaunijā un Lietuvā veikala lapā +2 dienas → 3–5 (kā Hind.ee / Kaina24: 5)
        handling: [0, 1], transit: [3, 4],
      },
      // Ja vairāk par šo daļu nosaukumu satur baltu burtus – /en/ nav angliski (droši vien pāradresācija) → nepublicē.
      maxNonEnglishShare: 0.25,
    },
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
        // Google failam: Shopify dati par vienu Shopify vienību (metrā tirgotajām – par 0,1 m), kā preces lapā.
        _productId: p.id != null ? String(p.id).split('/').pop() : '',
        _productTitle: cleanName(p.title, cfg).replace(/\s+/g, ' ').trim(),
        _lvTitle: p.title,
        _productType: p.productType || '',
        _variantCount: p.variants.length,
        _unitPrice: v.price,
        _unitCompareAt: v.compareAtPrice > 0 ? v.compareAtPrice : null,
        _unitGrams: v.grams || 0,
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

// ---------- Hind.ee (Igaunija) un Kaina24.lt (Lietuva) ----------
// Abi ir viens uzņēmums (UAB Elektroninės prekybos centras) ar vienu un to pašu XML formātu:
// https://www.hind.ee/xml/example.xml un https://www.kaina24.lt/xml/example.xml (pārbaudīts 09.11.2026).
// Obligāti: product id, title, price, condition, image_url, product_url, category_name.

/**
 * Kopīgais solis ārvalstu veikaliem (Igaunija, Lietuva): buildItems ieraksti (LV dati – atlikums, svars,
 * attēls, EAN, zīmols, metrā tirgotās preces) + attiecīgās valsts veikala teksti un cena.
 * store – Map(varianta ID → { title, variantTitle, handle, productType, price, description }) no
 *   valsts veikala /products.json (cena par Shopify vienību, ar tās valsts PVN).
 * h – valsts iestatījumi (CONFIG.hindee / CONFIG.kaina24). Atgriež { rows, stats }.
 */
function localizeItems(items, store, h, cfg) {
  const stats = { items: 0, decimal: 0, skipped: {}, sameNameAsLv: 0, withCategory: 0, categoryFromLv: 0 };
  const skip = (why) => { stats.skipped[why] = (stats.skipped[why] || 0) + 1; };
  const seenNames = new Set();
  const seenLinks = new Set();
  const rows = [];
  const localType = (it, e) => {
    const type = String(e?.productType || '').trim();
    return it._courierOnly || h.technicalTypePattern.test(type) ? '' : type;
  };

  // Precēm bez Shopify tipa: LV kategorija → vietējais tips, ko tai pašai LV kategorijai lieto citas preces
  // (tikai ja vismaz 5 preces un ≥ 60 % no tām ir ar vienu un to pašu tipu).
  const votes = new Map();
  for (const it of items) {
    const t = localType(it, store.get(String(it._variantId)));
    if (!t || !it.category_full) continue;
    if (!votes.has(it.category_full)) votes.set(it.category_full, new Map());
    const m = votes.get(it.category_full);
    m.set(t, (m.get(t) || 0) + 1);
  }
  const typeByLvCategory = new Map();
  for (const [cat, m] of votes) {
    const total = [...m.values()].reduce((a, b) => a + b, 0);
    const [best, n] = [...m].sort((a, b) => b[1] - a[1])[0];
    if (total >= 5 && n / total >= 0.6) typeByLvCategory.set(cat, best);
  }

  for (const it of items) {
    if (it.used === '1') { skip('ar defektu / demo / lietota'); continue; }
    if (!it.image) { skip('nav attēla'); continue; }
    if (it._decimal && it.in_stock === '') { skip('metrā tirgota, atlikums nav zināms'); continue; }
    const e = store.get(String(it._variantId));
    if (!e) { skip(`nav ${h.countryLabel} veikalā`); continue; }
    if (!(e.price > 0)) { skip(`nav ${h.countryLabel} cenas`); continue; }

    // Vietējā cena par Shopify vienību; metrā tirgotajām – par 1 m (Shopify vienība = 0,1 m).
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

    let category = localType(it, e);
    if (!category && typeByLvCategory.has(it.category_full)) {
      category = typeByLvCategory.get(it.category_full);
      stats.categoryFromLv++;
    }
    if (category) stats.withCategory++;
    if (it._decimal) stats.decimal++;
    stats.items++;
    rows.push({ it, name, link, price, category,
      description: cut(String(e.description || '').replace(/\s+/g, ' ').trim(), h.descMax) });
  }
  return { rows, stats };
}

const cdata = (s) => `<![CDATA[${String(s ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;

// Kopīgais XML (Hind.ee / Kaina24). k – valsts iestatījumi. Atgriež { xml, stats }.
function toProductsXml(items, store, k, cfg) {
  const { rows, stats } = localizeItems(items, store, k, cfg);
  stats.defaultCategory = 0;
  const out = ['<?xml version="1.0" encoding="UTF-8"?>', '<products>'];
  for (const r of rows) {
    const it = r.it;
    const g = it._grams || 0;
    const locker = !it._courierOnly && g <= k.delivery.parcelLocker.maxGrams;
    let category = r.category;
    if (!category) { category = k.defaultCategory; stats.defaultCategory++; }
    const tag = (name, val) => (val === '' || val == null ? '' : `<${name}>${escapeXml(val)}</${name}>`);
    out.push(`<product id="${escapeXml(it._variantId)}">`);
    out.push(tag('product_id', it._variantId));
    out.push(`<title>${cdata(r.name)}</title>`);
    out.push(tag('price', money(r.price)));
    out.push(tag('condition', 'new')); // preces ar defektu / demo / lietotas netiek iekļautas
    if (it.in_stock !== '') out.push(tag('stock', it.in_stock)); // metrā tirgotajām – pilni metri
    if (it.ean) out.push(tag('ean_code', it.ean));
    if (it.brand) out.push(`<manufacturer>${cdata(it.brand)}</manufacturer>`);
    out.push(`<image_url>${cdata(it.image)}</image_url>`);
    out.push(`<product_url>${cdata(r.link)}</product_url>`);
    out.push(`<category_name>${cdata(category)}</category_name>`);
    if (r.description) out.push(`<description>${cdata(r.description)}</description>`);
    out.push('<delivery>');
    out.push(`<home_delivery>${tag('working_days', k.deliveryDays)}${tag('price', money(k.delivery.home))}</home_delivery>`);
    if (locker) out.push(`<parcel_locker_delivery>${tag('working_days', k.deliveryDays)}${tag('price', money(k.delivery.parcelLocker.price))}</parcel_locker_delivery>`);
    out.push('</delivery>');
    out.push('</product>');
  }
  out.push('</products>', '');
  return { xml: out.filter(Boolean).join("\n") + "\n", stats };
}

/** Hind.ee: items + Igaunijas veikala dati (sharlottekangad.ee/products.json). */
export function toHindeeXml(items, ee, cfg = CONFIG) {
  return toProductsXml(items, ee, cfg.hindee, cfg);
}

/** Kaina24.lt: items + Lietuvas veikala dati (sarlotesaudiniai.lt/products.json). */
export function toKaina24Xml(items, lt, cfg = CONFIG) {
  return toProductsXml(items, lt, cfg.kaina24, cfg);
}

// ---------- Google Merchant Center (google-lv.xml) ----------
// Produktu datu specifikācija: https://support.google.com/merchants/answer/7052112 (pārbaudīts 10.11.2026).
// Tās pašas preces kā Salidzini (buildItems: noliktavā, metrā tirgotās – vismaz 1 m), latviešu teksti un saites
// uz latvisko veikalu. Pilnais apraksts, papildu attēli un variantu opcijas – no veikala /products.json (store).

const GOOGLE_NS = 'http://base.google.com/ns/1.0';
const ENTITIES = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", ndash: '–', mdash: '—', hellip: '…',
  laquo: '«', raquo: '»', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', bdquo: '„', deg: '°', times: '×', euro: '€',
  middot: '·', bull: '•', shy: '', zwj: '', zwnj: '', copy: '©', reg: '®', trade: '™', frac12: '½', frac14: '¼', frac34: '¾' };

// Teksts Google aprakstam: bez saitēm (Google: aprakstā nav saišu uz veikalu) un emocijzīmēm,
// rindiņu pārnesumi saglabāti, garums līdz max (pēdējais vārds netiek pārcirsts).
export function plainText(text, max = 5000) {
  let s = String(text ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ') // XML neatļautās kontrolrakstzīmes
    .replace(/https?:\/\/\S+|\bwww\.\S+/gi, ' ')
    .replace(/\p{Extended_Pictographic}|\uFE0F|\u200D/gu, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (s.length > max) s = s.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
  return s;
}

// HTML (Shopify body_html) → vienkāršs teksts.
export function htmlToPlain(html, max = 5000) {
  return plainText(String(html ?? '')
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr|ul|ol|table|blockquote)>/gi, '\n')
    .replace(/<li\b[^>]*>/gi, '- ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+\d*);/gi, (m, e) => {
      if (e[0] === '#') {
        const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : ' ';
      }
      return ENTITIES[e.toLowerCase()] ?? m;
    }), max);
}

// Google GTIN: pareizs kontrolcipars (validGtin) un ne no ierobežotajiem diapazoniem (veikala iekšējie,
// sveramās preces, kuponi: 02, 04, 05, 2x, 98, 99; EAN-8 ar 0 vai 2; GTIN-14 ar 9; tikai nulles).
export function googleGtin(ean) {
  const c = String(ean ?? '').trim();
  if (!/^(\d{8}|\d{12,14})$/.test(c) || /^0+$/.test(c)) return '';
  if (c.length === 8) return /^[02]/.test(c) ? '' : c;
  if (c.length === 14 && c[0] === '9') return '';
  const g13 = c.length === 14 ? c.slice(1) : c.padStart(13, '0');
  return /^(0[2459]|2|9[89])/.test(g13) ? '' : c;
}

// Krāsa Google laukam: bez krāsu kodiem ("Balta – #650", "108 · mauve", "Rozā 0082", "MIX 04 taupe").
// Ja paliek tikai kods vai cipari – tukšs (Google: krāsā nav ciparu un kodu).
export function googleColor(value) {
  const c = String(value ?? '')
    .replace(/\s*[–-]?\s*#\s*[\p{L}\d-]+\s*$/u, '')
    .replace(/^\s*(mix\s+)?(nr\.?\s*)?\p{L}{0,2}-?\d+\p{L}?\s*[·.:–-]?\s+/iu, '')
    .replace(/\s+[–-]?\s*(nr\.?\s*)?\d{2,}([-/]\d+)?\p{L}?\s*$/iu, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!/\p{L}{3,}/u.test(c) || /\d/.test(c) || c.length > 40 || /daudzkrās|multicolou?r|dažād/i.test(c)) return '';
  return c;
}

const noEmoji = (s) => String(s ?? '').replace(/\p{Extended_Pictographic}|\uFE0F|\u200D/gu, '')
  .replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
const imgKey = (u) => String(u ?? '').split('?')[0].replace(/^https?:/, '');

function googleCategory(it, g) {
  for (const [re, id] of g.categoryByTitle[it._productType] || []) if (re.test(it._baseName || '')) return String(id);
  const id = g.categories[it._productType];
  return id ? String(id) : '';
}

// Preces variantu opcijas (no /products.json): variant_option + krāsa / izmērs / raksts.
function googleVariant(e, g) {
  const out = { color: '', size: '', pattern: '', options: [] };
  for (const o of e?.options || []) {
    const name = String(o.name ?? '').replace(/\s+/g, ' ').trim();
    const value = String(o.value ?? '').replace(/\s+/g, ' ').trim();
    if (!name || !value || /^title$/i.test(name) || value === 'Default Title') continue;
    out.options.push({ name: cut(name, 250), value: cut(value, 250) });
    if (g.colorOption.test(name)) { if (!out.color) out.color = googleColor(value); }
    else if (g.sizeOption.test(name)) { if (!out.size) out.size = cut(value, 100); }
    else if (g.patternOption.test(name)) { if (!out.pattern) out.pattern = cut(value, 100); }
  }
  return out;
}

function priceBand(n, bands) {
  if (n < bands[0]) return `līdz ${bands[0]} €`;
  for (let i = 1; i < bands.length; i++) if (n < bands[i]) return `${bands[i - 1]}–${bands[i]} €`;
  return `virs ${bands[bands.length - 1]} €`;
}

const grams1 = (n) => String(Math.round(n * 10) / 10);

function priceBandEn(n, bands) {
  if (n < bands[0]) return `under ${bands[0]} €`;
  for (let i = 1; i < bands.length; i++) if (n < bands[i]) return `${bands[i - 1]}–${bands[i]} €`;
  return `over ${bands[bands.length - 1]} €`;
}

const normCmp = (s) => String(s ?? '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
export const BALTIC_LETTERS = /[āčēģīķļņšūžõäöüąęėįų]/i;

/**
 * Google Merchant Center XML (RSS 2.0, g: lauki) no buildItems ierakstiem.
 * store – Map(varianta ID → { productId, handle, title, variantTitle, productType, price, description,
 *   images: [{ src, variantIds[] }], options: [{ name, value }] }) no veikala /products.json.
 * Bez market – Latvija latviski (google-lv.xml): saites, cena, nosaukums – no Shopify Admin; no store tikai pilns
 *   apraksts, papildu attēli un variantu opcijas (ja preces tur nav – Admin apraksts līdz 600 zīmēm).
 * Ar market (CONFIG.googleMarkets.ee / .lt) – citas valsts domēns angliski: saite, nosaukums, apraksts, cena un tips –
 *   no tās valsts veikala /en/products.json (store); prece bez angliskā nosaukuma netiek iekļauta; piegāde katrai precei.
 * Atgriež { xml, stats }.
 */
export function toGoogleXml(items, store = new Map(), cfg = CONFIG, market = null) {
  const g = cfg.google;
  const m = market ? { ...cfg.googleMarkets.common, ...market } : null;
  const stats = { items: 0, decimal: 0, enriched: 0, skipped: {}, with: { gtin: 0, brand: 0, color: 0, size: 0, pattern: 0,
    variant_option: 0, item_group_id: 0, additional_image_link: 0, google_product_category: 0, shipping: 0, sale_price: 0 } };
  if (m) stats.descriptionIsTitle = 0;
  const skip = (why) => { stats.skipped[why] = (stats.skipped[why] || 0) + 1; };
  const seenIds = new Set();
  const seenLinks = new Set();
  const out = ['<?xml version="1.0" encoding="UTF-8"?>', `<rss version="2.0" xmlns:g="${GOOGLE_NS}">`, '<channel>'];
  if (m) {
    out.push(`<title>${escapeXml(m.storeName)}</title>`, `<link>${escapeXml(m.shopUrl + m.pathPrefix)}</link>`,
      `<description>${escapeXml(m.storeName)} – fabrics, yarn and sewing supplies (${m.country}, English)</description>`);
  } else {
    out.push('<title>Šarlotes audumi</title>', `<link>${escapeXml(cfg.shopUrl)}</link>`,
      '<description>Šarlotes audumi – audumi, dzija un šūšanas piederumi (Latvija, latviešu valodā)</description>');
  }
  const tag = (name, val) => (val === '' || val == null ? null : `<g:${name}>${escapeXml(val)}</g:${name}>`);
  const shippingTag = (country, service, price, s) => `<g:shipping><g:country>${country}</g:country><g:service>${escapeXml(service)}</g:service>`
    + `<g:price>${money(price)} EUR</g:price><g:min_handling_time>${s.handling[0]}</g:min_handling_time>`
    + `<g:max_handling_time>${s.handling[1]}</g:max_handling_time><g:min_transit_time>${s.transit[0]}</g:min_transit_time>`
    + `<g:max_transit_time>${s.transit[1]}</g:max_transit_time></g:shipping>`;

  for (const it of items) {
    if (it.used === '1') { skip('ar defektu / demo / lietota'); continue; }
    if (!it.image) { skip('nav attēla'); continue; }
    if (it._decimal && it.in_stock === '') { skip('metrā tirgota, atlikums nav zināms'); continue; }
    const e = store.get(String(it._variantId));
    if (m) {
      if (!e) { skip(`nav ${m.countryLabel} veikalā`); continue; }
      if (!(e.price > 0)) { skip(`nav ${m.countryLabel} cenas`); continue; }
      if (normCmp(e.title) === normCmp(it._lvTitle ?? it._productTitle)) { skip('nav iztulkots angliski'); continue; }
    }
    const productId = it._productId || e?.productId || '';
    if (!productId) { skip('nav produkta ID'); continue; }
    const id = `${g.idPrefix}${productId}_${it._variantId}`;
    const multi = (it._variantCount ?? 1) > 1 || String(it.link).includes('?variant=');
    const link = m ? cut(`${m.shopUrl}${m.pathPrefix}/products/${e.handle}${multi ? `?variant=${it._variantId}` : ''}`, 500) : it.link;
    if (seenIds.has(id)) { skip('dublikāts (ID)'); continue; }
    if (seenLinks.has(link)) { skip('dublikāts (saite)'); continue; }
    seenIds.add(id);
    seenLinks.add(link);

    let title;
    let description;
    let groupTitle;
    let unit;
    let productType;
    if (m) {
      const variantTitle = multi && e.variantTitle && e.variantTitle !== 'Default Title' ? ` – ${e.variantTitle}` : '';
      title = cut(noEmoji(cleanName(`${e.title}${variantTitle}`, m)), g.titleMax);
      groupTitle = cut(noEmoji(cleanName(e.title, m)), g.titleMax);
      // Apraksts, kas nav iztulkots (sakrīt ar latvisko), netiek likts – tā vietā angliskais nosaukums.
      const translated = e.description && normCmp(e.description).slice(0, 120) !== normCmp(it._desc).slice(0, 120);
      description = translated ? e.description : title;
      if (!translated) stats.descriptionIsTitle++;
      unit = e.price;
      productType = it._courierOnly || m.technicalTypePattern.test(e.productType || '') ? '' : (e.productType || '');
    } else {
      title = cut(noEmoji(it._baseName ?? it.name), g.titleMax);
      groupTitle = cut(noEmoji(it._productTitle || title), g.titleMax);
      description = (e && e.description) || plainText(it._desc, g.descMax) || title;
      unit = it._unitPrice ?? (it._decimal ? it._priceNum * cfg.decimalStep : it._priceNum);
      const parts = String(it.category_full || '').split(/\s*>>\s*/).filter(Boolean);
      productType = parts.length ? parts.join(' > ')
        : (it._courierOnly || it._productType === cfg.courierOnlyType ? '' : it._productType || '');
    }
    const compareAt = m ? null : (it._unitCompareAt ?? null);
    const sale = g.salePrice && compareAt != null && compareAt > unit + 0.004;
    const grams = it._unitGrams ?? 0;
    const v = multi ? googleVariant(e, g) : { color: '', size: '', pattern: '', options: [] };
    const gtin = googleGtin(it.ean);
    const category = googleCategory(it, g);
    const parts = String(it.category_full || '').split(/\s*>>\s*/).filter(Boolean);
    // Papildu attēli: bez galvenā; variantu precēm – tikai kopīgie un šī varianta attēli (ne citu krāsu).
    const main = imgKey(it.image);
    const extra = [];
    for (const im of e?.images || []) {
      if (extra.length >= g.additionalImages) break;
      const k = imgKey(im.src);
      if (!im.src || k === main || extra.some((x) => imgKey(x) === k)) continue;
      if (multi && im.variantIds?.length && !im.variantIds.includes(String(it._variantId))) continue;
      extra.push(im.src);
    }
    // Piegāde. Latvija: failā tikai precēm, kurām pakomāts neder (tikai kurjers vai > 30 kg); pārējām – konta politika.
    // Igaunija / Lietuva: katrai precei – pakomāts (ja der) un kurjers.
    const ships = [];
    if (m) {
      const s = m.shipping;
      if (!it._courierOnly && grams <= s.locker.maxGrams) ships.push(shippingTag(m.country, s.locker.service, s.locker.price, s));
      ships.push(shippingTag(m.country, s.courier.service, s.courier.price, s));
    } else {
      const lockerOk = !it._courierOnly && grams <= (cfg.ceno.delivery.omniva?.maxGrams ?? 30000);
      const courier = cfg.ceno.delivery.courier;
      if (!lockerOk) ships.push(shippingTag(g.shipping.country, g.shipping.service, grams > courier.heavyGrams ? courier.heavy : courier.light, g.shipping));
    }
    const salePrice = it._compareAt != null && it._compareAt > it._priceNum + 0.004;
    const perSaleUnit = m ? (it._decimal ? unit / cfg.decimalStep : unit) : it._priceNum;
    const labels = m
      ? [cut(productType, 100), '', it._decimal ? 'by the metre' : 'by the piece', priceBandEn(perSaleUnit, g.priceBands), salePrice ? 'sale' : '']
      : [cut(parts[0] || '', 100), cut(parts[1] || '', 100), it._decimal ? 'metrā' : 'gabalos', priceBand(it._priceNum, g.priceBands), salePrice ? 'akcija' : ''];

    const row = [
      '<item>',
      tag('id', id),
      tag('title', title),
      tag('description', description),
      tag('link', link),
      tag('image_link', it.image),
      ...extra.map((u) => tag('additional_image_link', u)),
      tag('availability', 'in_stock'),
      tag('price', `${money(sale ? compareAt : unit)} EUR`),
      sale ? tag('sale_price', `${money(unit)} EUR`) : null,
      it._decimal ? tag('unit_pricing_measure', g.unitPricingMeasure) : null,
      it._decimal ? tag('unit_pricing_base_measure', g.unitPricingBaseMeasure) : null,
      tag('condition', 'new'),
      tag('brand', it.brand),
      tag('gtin', gtin),
      gtin ? null : tag('identifier_exists', 'no'),
      multi ? tag('item_group_id', `${g.idPrefix}${productId}`) : null,
      multi ? tag('item_group_title', groupTitle) : null,
      ...v.options.map((o) => `<g:variant_option><g:name>${escapeXml(o.name)}</g:name><g:value>${escapeXml(o.value)}</g:value></g:variant_option>`),
      tag('color', v.color),
      tag('size', v.size),
      tag('pattern', v.pattern),
      tag('google_product_category', category),
      tag('product_type', cut(productType, 750)),
      ...ships,
      grams > 0 ? tag('shipping_weight', `${grams1(grams)} g`) : null,
      tag('ships_from_country', g.shipsFrom),
      ...labels.map((val, i) => tag(`custom_label_${i}`, val)),
      '</item>',
    ].filter(Boolean);
    out.push(row.join('\n'));

    stats.items++;
    if (it._decimal) stats.decimal++;
    if (e) stats.enriched++;
    const w = stats.with;
    if (gtin) w.gtin++;
    if (it.brand) w.brand++;
    if (v.color) w.color++;
    if (v.size) w.size++;
    if (v.pattern) w.pattern++;
    if (v.options.length) w.variant_option++;
    if (multi) w.item_group_id++;
    if (extra.length) w.additional_image_link++;
    if (category) w.google_product_category++;
    if (ships.length) w.shipping++;
    if (sale) w.sale_price++;
  }
  out.push('</channel>', '</rss>', '');
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
