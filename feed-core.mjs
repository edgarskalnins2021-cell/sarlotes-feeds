// Šarlotes audumi – Salidzini.lv XML ģenerēšanas noteikumi.
// Šis fails nezina, no kurienes nāk dati: tas saņem jau sakārtotus produktus
// un atgriež XML. Visi noteikumi ir šeit, CONFIG blokā, lai tos būtu viegli mainīt.

// Apdrukas preču kategorijas (Edgara apstiprinājums 21.11.2026; visas_preces/kategorijas_apdruka/GALA_IETEIKUMS.md):
// apdrukātais apģērbs (izgatavo pēc pasūtījuma) → virsgrupa "Apģērbu apdruka" (Mega2 r7: 260) ar apdrukas apakšgrupu
// (r4 "t kreklu apdruka" 720, r48 "t kreklu apdruka bērniem" 20, r11 "džemperu apdruka" 110); paneļi – r17 "auduma apdruka" 70.
// SOL'S/RTP sagataves (ar atlikumu, ne pēc pasūtījuma) paliek esošajā kategorijā. Salidzini, KurPirkt un Ceno.
const PRINT_CATEGORIES = {
  'Gatavie izstrādājumi un apdruka >> T-krekli': { to: 'Apģērbu apdruka >> T-kreklu apdruka', madeToOrder: true },
  'Gatavie izstrādājumi un apdruka >> Bērnu T-krekli': { to: 'Apģērbu apdruka >> T-kreklu apdruka bērniem', madeToOrder: true },
  'Gatavie izstrādājumi un apdruka >> Džemperi': { to: 'Apģērbu apdruka >> Džemperu apdruka', madeToOrder: true },
  'Gatavie izstrādājumi un apdruka >> Apdrukas paneļi': { to: 'Gatavie izstrādājumi un apdruka >> Auduma apdruka' },
};

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
  // Edgars 21.11.2026: T-krekli, džemperi un apdrukas preces (tips "Customizer") tiek rādīti visos failos
  // (agrāk – excludeProductTypes 'Customizer' un nosaukuma filtrs "T-krekls" / "Džemperis").
  excludeProductTypes: ['Dāvanu kartes'],

  // Apdrukas preces (TeeInBlue, tips "Customizer") izgatavo pēc pasūtījuma: Shopify atlikumu parasti neuzskaita
  // (vai uzskaita sagataves), pārdošana ir atļauta arī bez atlikuma (CONTINUE). Tāpēc atlikumu failā neliekam
  // (Salidzini: "neobligāta vērtība"; tukšs – nevis izdomāts skaitlis), bet piegādes termiņam pieskaitām izgatavošanu.
  madeToOrder: {
    productTypes: ['Customizer'],
    productionDays: [1, 2], // Edgars 21.11.2026: izgatavošana 1–2 darba dienas
  },

  // Apģērbi (T-krekli, džemperi, priekšauti, maisiņi – tukšie un ar apdruku).
  // Cenu portāliem – viens ieraksts katrai krāsai (visi izmēri kopā; saite uz lētāko, tad pirmo izmēru), jo
  // Salidzini: "viena prece norādīta tikai vienu reizi" (Edgars 21.11.2026). Google failos – katrs izmērs atsevišķi.
  // Kategorija – pēc nosaukuma (produkts + variants), jo tips "Customizer" ir tehnisks, nevis preču kategorija.
  // Tā pati grupa, kurā jau ir SOL'S GALA priekšauti, maisiņi un apdrukas paneļi (Shopify custom_label_0/1).
  apparel: {
    types: ['Customizer', 'Apģērbi'],
    sizeOption: /^(izmērs|size)$/i,
    categories: [
      [/džemper|hūdij/i, 'Gatavie izstrādājumi un apdruka >> Džemperi'],
      [/priekšaut/i, 'Gatavie izstrādājumi un apdruka >> Priekšauti'],
      [/maisiņ/i, 'Gatavie izstrādājumi un apdruka >> Auduma maisiņi'],
      [/krekl/i, 'Gatavie izstrādājumi un apdruka >> T-krekli'],
    ],
    fallback: 'Gatavie izstrādājumi un apdruka',
    colorOption: /^(krāsa|color|colour)$/i,
    // Tehniskas opcijas, ko portālu nosaukumos neliekam (TeeInBlue "Available Product": "Priekšauts ar Tavu apdruku-…").
    // Edgars 21.11.2026. Shopify produktā un Google failos opcija paliek.
    hiddenOptions: /^available product$/i,
    // Apdrukas preces ar vienu maketa bildi visām krāsām (Edgars 21.11.2026, 1. variants): cenu portālos viens ieraksts
    // produktam – "Nosaukums (12 krāsas, XXS-4XL)"; saite un <color> – maketa krāsai (mockupColour), cena – lētākā
    // tās krāsas izmēra cena. Krāsu skaits un izmēri – no variantiem katrā palaidienā. Kad Shopify krāsām būs savas
    // bildes, prece automātiski atgriežas pie ieraksta katrai krāsai. Google failos – kā līdz šim (katrs variants).
    // Tags `mergeTag` – viens ieraksts arī precēm ar dažādām bildēm (rokas slēdzis).
    mergeOneImage: true,
    mergeTag: 'viens-ieraksts',
    // Maketi ir balti krekli (pārbaudīts 21.11.2026: 78/78 bildes). Saite un <color> – uz balto krāsu, ja tāda ir;
    // ja nav – pirmā krāsa bez <color> (bilde tad rāda krāsu, ko nevar nopirkt – jālabo bilde Shopify).
    mockupColour: /^(balta|balts|white)$/i,
    // Ja nosaukumā nav preces veida (Salidzini: nosaukumā jābūt precei), priekšā – veids pēc kategorijas.
    typePattern: /krekl|džemper|hūdij|maisiņ|priekšaut/i,
    typeWords: { 'Bērnu T-krekli': 'Bērnu T-krekls', 'T-krekli': 'T-krekls', 'Džemperi': 'Džemperis',
      'Priekšauti': 'Priekšauts', 'Auduma maisiņi': 'Auduma maisiņš' },
    mergedWords: { lang: 'lv', colour: ['krāsa', 'krāsas', 'krāsu'], years: 'g.' },
  },

  // Bojātas, lietotas, demo preces – Salidzini prasa <used>1</used>.
  // Robežas ar \p{L}, ne \b (\b ir tikai ASCII: "lietotā" un "lietotas" ar to netika atrasti).
  usedPattern: /(ar defektu|defekts|bojāt|(?<!\p{L})lietot(a|ā|as|ās|s|i|ie|o|ai|u|ais|ajā)(?!\p{L})|(?<!\p{L})demo(?!\p{L})|ekspozīcij)/iu,

  // Nosaukumu tīrīšana: Salidzini neļauj noliktavas/reklāmas frāzes un iekšējas piezīmes.
  // Domuzīme "–" visur kļūst par "-" (veikala stils kopš 18.11.2026); atstarpes ap to tiek sakārtotas.
  nameFixes: [
    [/\s*[-–]?\s*pēdējais gabaliņš\s*/gi, ' - gabals '],
    [/[-–\s]*neatjaunot\b/gi, ''],
    [/(\d)(cm|mm)\b/g, '$1 $2'],
    [/(\S)–\s/g, '$1 - '],
    [/\s–(\S)/g, ' - $1'],
    [/–/g, '-'],
  ],

  // Kategorija bez Google laukiem: produkta tips + konkrētākais tags.
  // Tagi, kas ir vairāk nekā pusei šī tipa produktu, ir meklētāju (SEO) tagi, nevis kategorija.
  categoryTagMaxShare: 0.5,
  categoryTagMinCount: 2,

  // Salidzini.lv un KurPirkt.lv kategoriju nosaukumi pēc atslēgvārdu audita (Edgara apstiprinājums 20.11.2026, J2 un J3)
  // un apdrukas precēm (21.11.2026, PRINT_CATEGORIES – arī virsgrupa). Maina tikai šo divu portālu failus (salidzini.xml,
  // kurpirkt.xml); Shopify lauki, Cenueksperts, Google, Hind.ee un Kaina24 paliek ar Shopify nosaukumu (Ceno – savs
  // saraksts ceno.categoryNames). `to` – pilns jaunais ceļš. `when` – tikai precēm, kuru nosaukums atbilst;
  // `madeToOrder` – tikai precēm, ko izgatavo pēc pasūtījuma (pārējās paliek esošajā kategorijā).
  portalCategoryNames: {
    'Dzija >> Vilnas un dzīvnieku šķiedru dzija': { to: 'Dzija >> Vilnas dzijas' }, // J2
    'Šūšanas materiāli >> Citi šūšanas materiāli': { to: 'Šūšanas materiāli >> Polsteri', when: /polster/i }, // J3: grupā tikai polsteri
    ...PRINT_CATEGORIES,
  },

  // KurPirkt (Edgara lēmumi 21.11.2026 – tests ar DROPS Air, tad "visām dzijām"): papildus kopīgs ieraksts dzijas
  // produktam – visas krāsas vienā kartītē ("Dzijas DROPS Air - 50 g / 150 m (19 krāsas)"), faila sākumā; krāsu
  // ieraksti paliek kā līdz šim. Tikai kurpirkt.xml: Salidzini (r.22, r.49) un Ceno noteikumi aizliedz vienu preci
  // norādīt vairākas reizes.
  kurpirktCombined: {
    productTypes: ['Dzija'], // visi šī Shopify tipa produkti
    productIds: [], // un/vai konkrēti produkti
    // Tikai produkti, kuru vienīgā opcija ir krāsa – lai "(N krāsas)" būtu patiesība (ne "Krāsa un svars", "Tonis" ar svaru).
    colourOption: /^(krāsa|color|colour)$/i,
    words: { lang: 'lv', colour: ['krāsa', 'krāsas', 'krāsu'] },
  },

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
    'SOL’S', "SOL'S", 'RTP Apparel', // apģērbu sagatavju ražotāji (T-krekli, džemperi, priekšauti)
  ],
  vendorBrands: ['SCHMETZ', 'DROPS', 'Amanda', 'Ariadna', 'Burda', 'Ottobre', 'Mettler', 'Rekol', 'MIDARA', 'Pāces vilnas fabrika'],

  // Tagi, kas neder kategorijas nosaukumam.
  genericTags: ['new', 'prece', 'decimal', 'apdruka', 'akcija', 'akcijas', 'jaunums', 'jaunumi', 'sale'],

  // Ceno.lv (ceno.xml). Cenas un piegāde – EUR ar PVN, par vienu piedāvājuma vienību
  // (metrā tirgotajām precēm – par 1 m). Skat. toCenoXml un README.
  ceno: {
    nameMax: 200,
    categorySeparator: ' > ',
    // Ceno rāda un meklē tikai pēdējo kategorijas līmeni (<category>) – apdrukas precēm tajā jābūt "… apdruka"
    // (tā pati karte kā Salidzini/KurPirkt; dzijas u.c. Ceno paliek ar Shopify nosaukumu).
    categoryNames: PRINT_CATEGORIES,
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
      [/\s*[-–]?\s*viimane tükk\s*/gi, ' - tükk '],
      [/(\d)(cm|mm)\b/g, '$1 $2'],
      [/(\S)–\s/g, '$1 - '],
      [/\s–(\S)/g, ' - $1'],
      [/–/g, '-'],
    ],
    // Tulkotais "tikai kurjers" tips (AINULT_KULLER, KULLER_AINULT u.c.) nav kategorija.
    technicalTypePattern: /KULLER|KURIER|COURIER/i,
    // category_name ir obligāts: ja nav ne tipa, ne LV kategorijas atbilsmes – vispārīgā kategorija.
    defaultCategory: 'Õmblus- ja käsitöötarbed',
    // Apģērbi (CONFIG.apparel): LV kategorija → igauniski (Igaunijas veikala tips ir "Kohandaja" vai latvisks "Apģērbi").
    apparelCategories: { 'Gatavie izstrādājumi un apdruka >> T-krekli': 'T-särgid', 'Gatavie izstrādājumi un apdruka >> Džemperi': 'Pusad',
      'Gatavie izstrādājumi un apdruka >> Priekšauti': 'Põlled', 'Gatavie izstrādājumi un apdruka >> Auduma maisiņi': 'Riidest kotid',
      'Gatavie izstrādājumi un apdruka >> Bērnu T-krekli': 'Laste T-särgid', 'Gatavie izstrādājumi un apdruka': 'Rõivad' },
    // Citām precēm (ne apģērbiem): LV kategorija → igauniski, pirms Igaunijas veikala tipa (tips tām ir maldinošs vai
    // latvisks: GALA priekšauti – "Auduma maisiņi", krūzes – "Tarvikud ja tööriistad", paneļi – "Audums"). 21.11.2026.
    lvCategories: { 'Gatavie izstrādājumi un apdruka >> Priekšauti': 'Põlled', 'Gatavie izstrādājumi un apdruka >> Krūzes': 'Kruusid',
      'Gatavie izstrādājumi un apdruka >> Apdrukas paneļi': 'Kangatrükk' },
    // Viens ieraksts apdrukas produktam (CONFIG.apparel): "(12 värvi, XXS-4XL)", bērniem "2-12 a." (aastat)
    mergedWords: { lang: 'et', colour: ['värv', 'värvi', 'värvi'], years: 'a.' },
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
      [/\s*[-–]?\s*paskutinis gabalėlis\s*/gi, ' - gabalas '],
      [/(\d)(cm|mm)\b/g, '$1 $2'],
      [/(\S)–\s/g, '$1 - '],
      [/\s–(\S)/g, ' - $1'],
      [/–/g, '-'],
    ],
    technicalTypePattern: /KURJER|KULLER|COURIER/i,
    // category_name ir obligāts: ja nav ne tipa, ne LV kategorijas atbilsmes – vispārīgā kategorija.
    defaultCategory: 'Siuvimo ir rankdarbių prekės',
    // Apģērbi (CONFIG.apparel): LV kategorija → lietuviski (Lietuvas veikala tips ir "Konfigūratorius" u.c. vai latvisks "Apģērbi").
    apparelCategories: { 'Gatavie izstrādājumi un apdruka >> T-krekli': 'Marškinėliai', 'Gatavie izstrādājumi un apdruka >> Džemperi': 'Džemperiai',
      'Gatavie izstrādājumi un apdruka >> Priekšauti': 'Prijuostės', 'Gatavie izstrādājumi un apdruka >> Auduma maisiņi': 'Medžiaginiai maišeliai',
      'Gatavie izstrādājumi un apdruka >> Bērnu T-krekli': 'Vaikiški marškinėliai', 'Gatavie izstrādājumi un apdruka': 'Drabužiai' },
    // Citām precēm (ne apģērbiem): LV kategorija → lietuviski, pirms Lietuvas veikala tipa (kā Hind.ee). 21.11.2026.
    lvCategories: { 'Gatavie izstrādājumi un apdruka >> Priekšauti': 'Prijuostės', 'Gatavie izstrādājumi un apdruka >> Krūzes': 'Puodeliai',
      'Gatavie izstrādājumi un apdruka >> Apdrukas paneļi': 'Spauda ant audinio' },
    // Viens ieraksts apdrukas produktam (CONFIG.apparel): "(12 spalvų, XXS-4XL)", bērniem "2-12 m." (metai)
    mergedWords: { lang: 'lt', colour: ['spalva', 'spalvos', 'spalvų'], years: 'm.' },
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

  // Google Ads dinamiskā remarketinga plūsma, tips "Pielāgoti" (Custom), latviski (B ceļš, Edgars 24.11.2026).
  // Specifikācija: support.google.com/google-ads/answer/6053288 (sadaļa Custom). Kolonnu kopu pēc pirmās ielādes mainīt
  // nevar (vajag jaunu plūsmu), tāpēc tukšās kolonnas paliek failā. ID = Shopify varianta ciparu ID: Google atļauj tikai
  // burtus un ciparus, un tam jāsakrīt ar taga items[].id (Shopify pielāgotais pikselis, google_business_vertical 'custom').
  googleAdsCustom: {
    file: 'google-ads-custom-lv.csv',
    columns: ['ID', 'Item title', 'Item subtitle', 'Item description', 'Item category', 'Final URL', 'Image URL',
      'Price', 'Sale price', 'Formatted price', 'Formatted sale price', 'Contextual keywords'],
    textMax: 25, // Item title, Item subtitle, Item description
    formattedMax: 20, // Formatted price, Formatted sale price
    currency: 'EUR',
    // Shopify CDN atdod attēlu šajā platumā (Google: līdz 6 miljoniem pikseļu; daži oriģināli ir 2500×2500 un vairāk).
    imageWidth: 1200,
    imageExt: /\.(jpe?g|png|gif)$/i, // Google: tikai JPG, PNG, GIF (WebP nav atbalstīts)
    // Shopify CDN pēc Accept galvenes JPG, PNG un WebP oriģinālus klientiem, kas pieņem WebP, atdod kā WebP (Google to
    // Custom plūsmai neatbalsta); ar format=pjpg – JPEG visiem (pārbaudīts 24.11.2026). Izņēmums: PNG ar caurspīdīgu fonu
    // un HEIC Shopify uz JPEG nepārveido (atdod PNG vai WebP), tāpēc HEIC (iPhone foto) netiek likts – jāaugšupielādē JPG.
    shopifyImageExt: /\.(jpe?g|png|gif|webp)$/i,
    shopifyForceJpeg: 'pjpg',
    // Papildus buildItems filtriem (requiresShipping, dāvanu kartes): ne-fiziskas preces pēc tipa – drošībai.
    excludeProductTypes: ['Dāvanu kartes', 'Digitālie materiāli', 'Meistarklases'],
    // Sākuma vārds, kas nosaukumā tikai pasaka preces veidu ("Dzijas DROPS Air" → "DROPS Air"); veids paliek Item category.
    leadingTypeWords: /^[Dd]zijas?\s+(?=\p{Lu})/u, // bez i karoga: ar to \p{Lu} der arī mazajiem burtiem
    // Metrā tirgotās preces: Price = cena par 1 m, Formatted price "18,90 € / m".
    perMetre: ' / m',
    // Vārdi, ar kuriem saīsināts teksts nedrīkst beigties ("Lente ar" → "Lente").
    danglingWords: ['un', 'ar', 'no', 'uz', 'par', 'bez', 'pie', 'pēc', 'līdz', 'priekš', 'vai', 'ir', 'kā', 'ko', 'pret', 'starp', 'nr.', 'nr', 'ø', '⌀',
      'and', 'with', 'for', 'of', 'the', 'in', 'on', 'to', 'x', '×'],
    // Google Ads 25.11.2026 (kampaņa 24538296924) noraidīja "Rokdarbu nazis", "TEXI Diska nazis", "Šuvju ārdītājs / Nazis"
    // u.c. kā "Bīstams vai aizvainojošs saturs" (politika par naida saturu) – visticamāk "nazis/nazi" tiek lasīts kā angļu
    // "Nazis". Ads tekstos (Shopify un saite nemainās) vārds "nazis" visos locījumos → "griezējs"; lielais sākumburts paliek.
    wordSwap: { nazis: 'griezējs', naža: 'griezēja', nazim: 'griezējam', nazi: 'griezēju', nazī: 'griezējā',
      naži: 'griezēji', nažu: 'griezēju', nažiem: 'griezējiem', nažus: 'griezējus', nažos: 'griezējos' },
    // Attēli ar augšupielādes bultas ikonu un "TAVS DIZAINS ŠEIT" – Google Ads 25.11.2026 noraidīja kā "Maldinošs reklāmu
    // dizains" (Bērnu T-krekla apdruka, Personalizēts džemperis). Shopify faila nosaukums → tās pašas preces foto bez ikonas
    // (katrs pārbaudīts ar aci 25.11.2026); null – preci Ads plūsmā neliek, kamēr Shopify nav foto bez ikonas.
    iconImages: {
      '69a193aad9940.webp': null, // T-krekla apdruka ar jūsu dizainu (abi foto ar ikonu)
      '69a193e5c05bd.webp': null,
      't-krekla-apdruka-ar-tavu-dizainu-kreisaja-puse-individuali-apdrukats-t-krekls-ar-logo-sarlotes-audumi-5232235.webp': null,
      'bernu-t-krekla-apdruka-ar-tavu-dizainu-bernu-t-krekla-apdruka-ar-tavu-dizainu-sarlotes-audumi-8881226.webp': null,
      'bernu-t-krekla-apdruka-ar-tavu-dizainu-bernu-t-krekla-apdruka-ar-tavu-dizainu-sarlotes-audumi-4157621.webp': null,
      'bernu-t-krekla-apdruka-ar-tavu-logo-bernu-t-krekla-apdruka-ar-tavu-logo-sarlotes-audumi-4108282.webp': null,
      'bernu-t-krekla-apdruka-ar-tavu-logo-bernu-t-krekla-apdruka-ar-tavu-logo-sarlotes-audumi-2081464.webp': null,
      'premium-kokvilnas-auduma-panela-apdruka-ar-tavu-dizainu-30-40-cm-2404551.jpg': null, // 2 paneļu preces
      'kanvas-auduma-panela-apdruka-ar-tavu-dizainu-30-40-cm-4475169.jpg': null,
      'prieksauts-ar-tavu-apdruku-prieksauts-1999711.webp': null, // melns
      'prieksauts-ar-tavu-apdruku-tumsi-zals-prieksauts-ar-tavu-apdruku-tumsi-zals-7320653.webp': null,
      'kokvilnas-auduma-maisins-ar-personalizetu-apdruku-melns-kokvilnas-auduma-maisins-ar-apdruku-melns-2068015.webp': null,
      'personalizets-dzemperis-ar-tavu-dizainu-dzemperis-balts-6264347.webp':
        'personalizets-dzemperis-ar-tavu-dizainu-dzemperis-balts-6054733.webp',
      'personalizets-dzemperis-ar-tavu-dizainu-melns-dzemperis-melns-3843014.webp':
        'personalizets-dzemperis-ar-tavu-dizainu-melns-dzemperis-melns-7841486.webp',
      'personalizets-dzemperis-ar-tavu-logo-dzemperis-balts-7179531.webp':
        'personalizets-dzemperis-ar-tavu-logo-dzemperis-balts-9392963.webp',
      'personalizets-dzemperis-ar-tavu-logo-melns-dzemperis-melns-1390722.webp':
        'personalizets-dzemperis-ar-tavu-logo-melns-dzemperis-melns-4035225.webp',
      'personalizets-dzemperis-ar-tavu-logo-melns-dzemperis-melns-4958087.webp':
        'personalizets-dzemperis-ar-tavu-logo-melns-dzemperis-melns-4035225.webp',
      'prieksauts-ar-tavu-apdruku-roza-prieksauts-ar-tavu-apdruku-roza-8360656.webp':
        'prieksauts-ar-tavu-apdruku-roza-prieksauts-ar-tavu-apdruku-roza-9041470.jpg',
      'prieksauts-ar-tavu-apdruku-peleks-prieksauts-ar-tavu-apdruku-peleks-6920854.webp':
        'prieksauts-ar-tavu-apdruku-peleks-prieksauts-ar-tavu-apdruku-peleks-6619448.webp',
      'prieksauts-ar-tavu-apdruku-peleks-prieksauts-ar-tavu-apdruku-peleks-8180880.webp':
        'prieksauts-ar-tavu-apdruku-peleks-prieksauts-ar-tavu-apdruku-peleks-6619448.webp',
      'biezs-kokvilnas-auduma-maisins-ar-apdruku-kokvilnas-auduma-maisins-ar-apdruku-4775952.webp':
        'biezs-kokvilnas-auduma-maisins-ar-apdruku-kokvilnas-auduma-maisins-ar-apdruku-4576687.webp',
      'kokvilnas-auduma-maisins-ar-tavu-apdruku-kokvilnas-auduma-maisins-ar-apdruku-7212101.webp':
        'kokvilnas-auduma-maisins-ar-tavu-apdruku-kokvilnas-auduma-maisins-ar-apdruku-1935558.webp',
    },
  },

  // Google Merchant Center Igaunijai un Lietuvai – ANGLISKI (igauņu un lietuviešu valodu Google vēl neatbalsta).
  // Katram domēnam savs Merchant Center konts. Teksti, saites (/en/), cena un tips – no valsts veikala angļu versijas
  // (/en/products.json); preces, atlikums, svars, EAN, zīmols, Google kategorija – kā google-lv.xml. Piegāde – failā
  // katrai precei (Shopify General profile → Estonia / Lithuania, bez bezmaksas piegādes sliekšņa).
  googleMarkets: {
    ee: {
      file: 'google-ee-en.xml.gz', shopUrl: 'https://sharlottekangad.ee', pathPrefix: '/en', country: 'EE',
      countryLabel: 'Igaunijas', storeName: 'Šarlotte kangad',
    },
    lt: {
      file: 'google-lt-en.xml.gz', shopUrl: 'https://sarlotesaudiniai.lt', pathPrefix: '/en', country: 'LT',
      countryLabel: 'Lietuvas', storeName: 'Šarlotės audiniai',
      // Metrā tirgotās preces nogriež pēc pircēja izvēles – noteikumos tās atpakaļ nepieņem (tikai bojātas / ne tās).
      // Merchant Center LT kontā tam ir atgriešanas izņēmums ar šo etiķeti (tikai bojātas preces, maiņa nav).
      returnPolicyLabelCut: 'cut-to-length',
    },
    // Kopīgie iestatījumi abām valstīm
    common: {
      // "last piece 50cm" (= "pēdējais gabaliņš") → "piece 50 cm" (kā LV failos; Google: bez steidzinoša teksta)
      nameFixes: [
        [/\s*[-–]?\s*last piece,?\s*/gi, ' - piece '],
        [/(\d)(cm|mm)\b/g, '$1 $2'],
        [/(\S)–\s/g, '$1 - '],
        [/\s–(\S)/g, ' - $1'],
        [/–/g, '-'],
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
      // Tipi, kuru nosaukums visās valodās ir vienāds (žurnālu nosaukumi, piem. "Burda Easy 03/2025-DE") –
      // angļu nosaukums, kas sakrīt ar latvisko, nenozīmē "nav iztulkots". 24.11.2026.
      sameNameTypes: ['Žurnāli'],
    },
  },
};

const BRAND_CANON = { prym: 'Prym', schmetz: 'SCHMETZ', drops: 'DROPS', opry: 'Opry', midara: 'MIDARA', 'sol’s': "SOL'S", "sol's": "SOL'S",
  'rtp apparel': 'RTP Apparel' };

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

// Apģērba kategorija pēc nosaukuma (CONFIG.apparel.categories). Ja Shopify ir Google Shopping lauki (custom_label_0/1),
// LV failos noteicošie ir tie (piem. "… >> Bērnu T-krekli"); šī kategorija tad noder EE/LT kategorijai kā rezerve.
function apparelCategory(product, variant, cfg) {
  const s = `${product.title} ${variant.title || ''}`;
  for (const [re, cat] of cfg.apparel.categories) if (re.test(s)) return cat;
  return cfg.apparel.fallback;
}

// Skaitļa forma: lv/lt – 1, 21… (ne 11) vienskaitlis; lt – 2–9 "spalvos", 10–20, 30… "spalvų"; et – 1 / vairāk.
function countWord(n, w) {
  const [one, few, many] = w.colour;
  if (w.lang === 'et') return n === 1 ? one : few;
  if (n % 10 === 1 && n % 100 !== 11) return one;
  if (w.lang === 'lt') return n % 10 === 0 || (n % 100 >= 11 && n % 100 <= 19) ? many : few;
  return few;
}

// Vai krāsa jau ir nosaukumā ("Priekšauts tumši zaļš …" + "Tumši zaļa"): katram krāsas vārdam vārda sākums nosaukumā.
export function colourInTitle(title, colour) {
  const words = String(title ?? '').toLowerCase().split(/[^\p{L}]+/u).filter(Boolean);
  const cw = String(colour ?? '').toLowerCase().split(/[^\p{L}]+/u).filter((w) => w.length >= 3);
  return cw.length > 0 && cw.every((w) => { const s = w.slice(0, Math.min(4, w.length - 1)); return words.some((t) => t.startsWith(s)); });
}

// Izmēru skala (diapazonam "mazākais-lielākais" neatkarīgi no Shopify variantu secības).
const SIZE_RANK = { XXS: 1, XS: 2, S: 3, M: 4, L: 5, XL: 6, XXL: 7, '2XL': 7, XXXL: 8, '3XL': 8, '4XL': 9, '5XL': 10, '6XL': 11 };
const yearsOf = (s) => Number(String(s).match(/^(\d+)\s*gad/i)?.[1] || 0);
function orderSizes(sizes) {
  if (sizes.length && sizes.every((s) => yearsOf(s) > 0)) return { sizes: [...sizes].sort((a, b) => yearsOf(a) - yearsOf(b)), kind: 'years' };
  const rank = (s) => SIZE_RANK[String(s).trim().toUpperCase()];
  if (sizes.length && sizes.every(rank)) return { sizes: [...sizes].sort((a, b) => rank(a) - rank(b)), kind: 'scale' };
  return { sizes, kind: 'other' }; // nezināmi izmēri – Shopify secībā
}

// "(12 krāsas, XXS-4XL)" / bērniem "(6 krāsas, 2-12 g.)" – no variantu krāsām un izmēriem (izmēru skalas secībā).
// Ārzemju failos neparastus (latviskus) izmēru nosaukumus ("viens izmērs", "86/94 cm ~ 2 gadi") neliekam.
export function mergedSuffix(m, w) {
  const parts = [`${m.colours} ${countWord(m.colours, w)}`];
  const { sizes, kind } = orderSizes(m.sizes);
  if (kind === 'years') {
    const y = sizes.map(yearsOf);
    parts.push(y.length > 1 ? `${y[0]}-${y[y.length - 1]} ${w.years}` : `${y[0]} ${w.years}`);
  } else if (kind === 'scale' || w.lang === 'lv') {
    if (sizes.length > 1) parts.push(`${sizes[0]}-${sizes[sizes.length - 1]}`);
    else if (sizes.length === 1) parts.push(sizes[0]);
  }
  return `(${parts.join(', ')})`;
}

function categoryFor(product, variant, cfg, stats) {
  const parts = (variant.categoryPath || []).filter(Boolean);
  if (parts.length) return parts.join(' >> ');
  if (cfg.apparel?.types?.includes(product.productType)) return apparelCategory(product, variant, cfg);
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

// Varianta nosaukums Google Ads Custom (Item subtitle): opciju vērtības bez tehniskajām (TeeInBlue "Available Product",
// CONFIG.apparel.hiddenOptions); bez opcijām – Shopify varianta nosaukums. "Default Title" → tukšs.
function adsVariantTitle(v, cfg) {
  const opts = v.selectedOptions || [];
  const raw = opts.length
    ? opts.filter((o) => !cfg.apparel?.hiddenOptions?.test(String(o.name ?? '').trim()))
      .map((o) => String(o.value ?? '').trim()).filter((x) => x && x !== 'Default Title').join(' / ')
    : (v.title && v.title !== 'Default Title' ? v.title : '');
  return cleanName(raw, cfg).replace(/\s+/g, ' ').trim();
}

function cleanName(s, cfg) {
  for (const [re, to] of cfg.nameFixes || []) s = s.replace(re, to);
  return s;
}

/**
 * products: [{ title, handle, productType, vendor, tags[], isGiftCard, image, onlineStore (bool),
 *   variants: [{ id, title, price, available, qty (number|null), tracked (bool|null), inventoryPolicy ('DENY'|'CONTINUE'|null),
 *                position, selectedOptions: [{ name, value }], requiresShipping, grams, image, barcode, categoryPath[] }] }]
 * items – visi varianti (Google). Ieraksti ar _portalSkip ir citi tās pašas krāsas izmēri (CONFIG.apparel): cenu
 * portālu faili tos neizvada. stats.items – cenu portālu (Salidzini/KurPirkt) preču skaits.
 */
export function buildItems(products, cfg = CONFIG) {
  const stats = { products: products.length, items: 0, skipped: {}, madeToOrder: 0, sizesInOneItem: 0 };
  // skippedVariants – katrs izlaistais variants ar iemeslu (atskaitēm: iekļautie + izlaistie = visi varianti).
  const skippedVariants = [];
  const skip = (why, p, vs) => {
    stats.skipped[why] = (stats.skipped[why] || 0) + 1;
    for (const v of vs) skippedVariants.push({ id: String(v.id).split('/').pop(), product: p.title, variant: v.title, reason: why });
  };
  const seenNames = new Set();
  const items = [];
  const tags = tagStats(products);
  const groups = new Map(); // apģērbi: produkts + opcijas bez izmēra → tās pašas krāsas izmēri
  const mtoDays = cfg.madeToOrder?.productionDays || [0, 0];

  for (const p of products) {
    if (p.onlineStore === false) { skip('nav publicēts veikalā', p, p.variants); continue; }
    if (p.isGiftCard || cfg.excludeProductTypes.includes(p.productType)) {
      skip(p.isGiftCard || p.productType === 'Dāvanu kartes' ? 'dāvanu karte' : `tips ${p.productType}`, p, p.variants);
      continue;
    }
    if (cfg.excludeTitlePattern?.test(p.title)) { skip('T-krekli/džemperi', p, p.variants); continue; }
    const decimal = (p.tags || []).includes(cfg.decimalTag);
    const multi = p.variants.length > 1;
    // Metrā tirgotajām precēm vienmēr der atlikuma noteikums (vismaz 1 m), arī ja tips ir "Customizer".
    const mto = !decimal && !!cfg.madeToOrder?.productTypes?.includes(p.productType);
    const apparel = !!cfg.apparel?.types?.includes(p.productType);
    // Apģērbiem – Shopify secībā (XXS, XS, S…), lai saite vestu uz pirmo izmēru.
    const variants = apparel ? [...p.variants].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)) : p.variants;
    // Viens ieraksts produktam (CONFIG.apparel.mergeOneImage / mergeTag): apdrukas prece, vairākas krāsas, visām viena bilde.
    const colourOf = (v) => (v.selectedOptions || []).find((o) => cfg.apparel?.colorOption?.test(String(o.name ?? '').trim()))?.value;
    // Citas opcijas (ne krāsa, ne izmērs, piem. TeeInBlue "Available Product") – dažādi preču veidi netiek apvienoti kopā.
    const othersOf = (v) => (v.selectedOptions || []).filter((o) => {
      const n = String(o.name ?? '').trim();
      return !cfg.apparel?.colorOption?.test(n) && !cfg.apparel?.sizeOption?.test(n);
    }).map((o) => String(o.value ?? '').trim()).filter((x) => x && x !== 'Default Title').join(' / ');
    const multiOther = apparel && new Set(p.variants.map(othersOf)).size > 1;
    let merge = false;
    if (apparel) {
      const colours = new Set(p.variants.map(colourOf).filter((x) => x != null && x !== ''));
      const imgs = new Set(p.variants.map((v) => String(v.image || p.image || '').split('?')[0]));
      const tagged = !!cfg.apparel.mergeTag && (p.tags || []).includes(cfg.apparel.mergeTag);
      merge = colours.size >= 2 && (tagged || (!!cfg.apparel.mergeOneImage && mto && imgs.size === 1));
    }

    for (const v of variants) {
      if (!v.requiresShipping) { skip('digitāla prece', p, [v]); continue; }
      if (!(v.price > 0)) { skip('cena 0', p, [v]); continue; }
      if (mto) {
        // Pēc pasūtījuma: atlikums nav gatavu preču daudzums. Izlaižam tikai, ja Shopify šo variantu pasūtīt neļauj.
        if (v.tracked !== false && v.qty != null && v.qty <= 0 && v.inventoryPolicy !== 'CONTINUE') { skip('0 atlikums', p, [v]); continue; }
        // Publiskais /products.json (rezerves avots): uzskaites nav, der tikai "available".
        if (v.tracked == null && v.qty == null && v.available === false) { skip('0 atlikums', p, [v]); continue; }
      } else {
        if (v.tracked === false) { skip('atlikums netiek uzskaitīts', p, [v]); continue; }
        if (v.qty != null ? v.qty <= 0 : !v.available) { skip('0 atlikums', p, [v]); continue; }
      }

      const price = decimal ? v.price / cfg.decimalStep : v.price;
      let inStock = mto ? null : v.qty;
      if (decimal && inStock != null) {
        inStock = Math.floor(inStock * cfg.decimalStep + 1e-9);
        if (inStock < cfg.minDecimalMeters) { skip('atlikumā mazāk par 1 m', p, [v]); continue; }
      }
      if (price < cfg.minPrice) { skip(`cena zem ${money(cfg.minPrice)} €`, p, [v]); continue; }

      const variantTitle = v.title && v.title !== 'Default Title' ? ` - ${v.title}` : '';
      const name = cut(cleanName(`${p.title}${variantTitle}`, cfg) + (decimal ? cfg.decimalNameSuffix : ''), 200);
      if (seenNames.has(name)) { skip('dublikāts', p, [v]); continue; }
      seenNames.add(name);

      const courier = p.productType === cfg.courierOnlyType;
      const d = cfg.delivery;
      const delivery = courier
        ? ((v.grams || 0) > d.heavyGrams ? d.courierHeavy : d.courierLight)
        : (price >= d.freeFrom ? 0 : d.cheapest);

      const numericId = String(v.id).split('/').pop();
      const extraDays = mto ? mtoDays[1] : 0; // izgatavošana (maksimums) + parastais piegādes termiņš
      const item = {
        name,
        link: cut(`${cfg.shopUrl}/products/${p.handle}${multi ? `?variant=${numericId}` : ''}`, 500),
        price: money(price),
        image: cut(v.image || p.image || '', 500),
        category_full: cut(categoryFor(p, v, cfg, tags), 200),
        // Kategorija pēc Shopify tipa/tagiem (bez mm-google-shopping etiķetēm) – Contextual keywords grupām (adsKeywords),
        // lai rezultāts nav atkarīgs no avota (Admin API ar etiķetēm "Audumi" / publiskais /products.json – "Audums").
        _typeCategory: cut(categoryFor(p, { ...v, categoryPath: [] }, cfg, tags), 200),
        brand: detectBrand(p, cfg),
        ean: validGtin(v.barcode, numericId) || '',
        in_stock: inStock != null ? String(inStock) : '',
        delivery_latvija: money(delivery),
        delivery_days_latvija: String(cfg.deliveryDaysLatvia + extraDays),
        delivery_days_shop: String(cfg.deliveryDaysShop + extraDays),
        used: cfg.usedPattern?.test(`${p.title} ${v.title || ''}`) ? '1' : '',
        _decimal: decimal,
        _madeToOrder: mto,
        _apparel: apparel,
        _apparelCategory: apparel ? apparelCategory(p, v, cfg) : '',
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
        _productImage: p.image || '', // produkta galvenā bilde (KurPirkt kopīgajam ierakstam)
        _options: (v.selectedOptions || []).map((o) => String(o.name ?? '').trim()).filter(Boolean), // opciju nosaukumi
        _productTitle: cleanName(p.title, cfg).replace(/\s+/g, ' ').trim(),
        _variantTitle: adsVariantTitle(v, cfg), // Google Ads Custom: Item subtitle
        _lvTitle: p.title,
        _productType: p.productType || '',
        _variantCount: p.variants.length,
        _unitPrice: v.price,
        _unitCompareAt: v.compareAtPrice > 0 ? v.compareAtPrice : null,
        _unitGrams: v.grams || 0,
      };
      items.push(item);

      // Apģērbi: tās pašas krāsas (visas opcijas, izņemot izmēru) varianti – vienā grupā;
      // viena ieraksta precēm (merge) – visi produkta varianti vienā grupā.
      if (apparel) {
        const opts = v.selectedOptions || [];
        const si = opts.findIndex((o) => cfg.apparel.sizeOption.test(String(o.name ?? '').trim()));
        if (merge || si >= 0) {
          const rest = opts.filter((_, i) => i !== si).map((o) => String(o.value ?? '').trim()).filter((x) => x && x !== 'Default Title');
          const other = othersOf(v);
          const otherIdx = opts.map((_, i) => i).filter((i) => i !== si && !cfg.apparel.colorOption?.test(String(opts[i].name ?? '').trim()));
          const key = merge ? `${p.id ?? p.handle}|*|${other}` : `${p.id ?? p.handle}|${rest.join(' / ')}`;
          if (!groups.has(key)) {
            // Nosaukumam: opcijas bez izmēra un bez tehniskajām (hiddenOptions); krāsu neatkārto, ja tā jau ir nosaukumā.
            const ci = opts.findIndex((o) => cfg.apparel.colorOption?.test(String(o.name ?? '').trim()));
            let keepIdx = opts.map((_, i) => i).filter((i) => i !== si && !cfg.apparel.hiddenOptions?.test(String(opts[i].name ?? '').trim())
              && String(opts[i].value ?? '').trim() && opts[i].value !== 'Default Title');
            if (ci >= 0 && colourInTitle(p.title, opts[ci].value)) keepIdx = keepIdx.filter((i) => i !== ci);
            groups.set(key, { title: p.title, rest, sizeIndex: si, merge, other: multiOther ? other : '', otherIdx: multiOther ? otherIdx : [],
              keepIdx, colourIdx: ci, shown: keepIdx.map((i) => String(opts[i].value).trim()), colours: [], sizes: [], items: [] });
          }
          const g = groups.get(key);
          const col = colourOf(v);
          item._colour = col ?? '';
          if (col != null && col !== '' && !g.colours.includes(col)) g.colours.push(col);
          const size = si >= 0 ? String(opts[si].value ?? '').trim() : '';
          if (size && !g.sizes.includes(size)) g.sizes.push(size);
          g.items.push(item);
        }
      }
    }
  }

  // Cenu portāliem viens ieraksts katrai krāsai: lētākais izmērs (vienādai cenai – pirmais), nosaukums bez izmēra.
  // Pārējie izmēri paliek items (Google), bet ar _portalSkip.
  const portalNames = new Set(items.map((it) => it.name));
  stats.mergedProducts = 0;
  for (const g of groups.values()) {
    // Viena ieraksta precei – maketa krāsa (balta; ja nav – pirmā), tās lētākais izmērs; citādi – lētākais izmērs.
    const mockCol = g.merge ? (g.colours.find((c) => cfg.apparel.mockupColour?.test(String(c).trim())) ?? null) : null;
    const repCol = g.merge ? (mockCol ?? g.colours[0]) : null;
    const pool = g.merge ? g.items.filter((it) => it._colour === repCol) : g.items;
    const rep = (pool.length ? pool : g.items).reduce((a, b) => (b._priceNum < a._priceNum - 0.004 ? b : a));
    for (const it of g.items) if (it !== rep) { it._portalSkip = true; portalNames.delete(it.name); }
    stats.sizesInOneItem += g.items.length - 1;
    if (g.merge) {
      const typeWord = cfg.apparel.typeWords?.[String(rep.category_full).split(/\s*>>\s*/).pop()];
      const titled = cfg.apparel.typePattern.test(g.title) || !typeWord ? g.title : `${typeWord} ar apdruku “${g.title.replace(/[“”"„«»]/g, '')}”`;
      // Ja produktā ir vairāki preču veidi (cita opcija), katram – savs ieraksts ar veidu nosaukumā.
      const withOther = g.other ? `${titled} - ${g.other}` : titled;
      const merged = { colours: g.colours.length, sizes: g.sizes, title: withOther, otherIdx: g.otherIdx };
      const base = cleanName(`${withOther} ${mergedSuffix(merged, cfg.apparel.mergedWords)}`, cfg).replace(/\s+/g, ' ').trim();
      const name = cut(base + (rep._decimal ? cfg.decimalNameSuffix : ''), 200);
      if (!portalNames.has(name)) {
        portalNames.delete(rep.name);
        portalNames.add(name);
        Object.assign(rep, { name, _portalBaseName: base, _merged: merged, color: mockCol ? rep._colour : '' });
        stats.mergedProducts++;
        if (!mockCol) stats.mergedWithoutMockupColour = (stats.mergedWithoutMockupColour || 0) + 1;
      } else {
        stats.mergedNameCollision = (stats.mergedNameCollision || 0) + 1; // paliek varianta nosaukums (ar izmēru)
      }
      continue;
    }
    const base = cleanName(`${g.title}${g.shown.length ? ` - ${g.shown.join(' / ')}` : ''}`, cfg).replace(/\s+/g, ' ').trim();
    const name = cut(base + (rep._decimal ? cfg.decimalNameSuffix : ''), 200);
    if (name === rep.name || !portalNames.has(name)) {
      portalNames.delete(rep.name);
      portalNames.add(name);
      Object.assign(rep, { name, _portalBaseName: base, _sizeIndex: g.sizeIndex, _sizes: g.items.length, _keepIdx: g.keepIdx, _colourIdx: g.colourIdx });
    } // citādi (sakrīt ar citas preces nosaukumu) – paliek varianta nosaukums ar izmēru
  }
  const portal = items.filter((it) => !it._portalSkip);
  stats.items = portal.length;
  stats.madeToOrder = portal.filter((it) => it._madeToOrder).length;
  return { items, stats, skippedVariants };
}

// Ieraksti cenu portālu failiem (bez citiem tās pašas krāsas izmēriem, skat. buildItems).
export const portalItems = (items) => items.filter((it) => !it._portalSkip);

// color – tikai viena ieraksta apdrukas precēm (bildes un saites krāsa); citām precēm tukšs → netiek likts.
const TAG_ORDER = ['name', 'link', 'price', 'image', 'category_full', 'brand', 'color', 'ean', 'in_stock',
  'delivery_latvija', 'delivery_days_latvija', 'delivery_days_shop', 'used'];

// Kategorija pēc kartes { category_full: { to, when?, madeToOrder? } }; ja nosacījums neizpildās – category_full.
function mappedCategory(it, map) {
  const r = map?.[it.category_full];
  if (!r || (r.when && !r.when.test(it._baseName ?? it.name)) || (r.madeToOrder && !it._madeToOrder)) return it.category_full;
  return r.to;
}
// Salidzini/KurPirkt kategorija (CONFIG.portalCategoryNames); pārējiem portāliem – category_full bez izmaiņām.
export function portalCategory(it, cfg = CONFIG) {
  return mappedCategory(it, cfg.portalCategoryNames);
}
// Ceno kategorija (CONFIG.ceno.categoryNames).
export function cenoCategory(it, cfg = CONFIG) {
  return mappedCategory(it, cfg.ceno?.categoryNames);
}

// KurPirkt kopīgie ieraksti (CONFIG.kurpirktCombined): viens ieraksts produktam ar visām tā krāsām – saite uz produkta
// lapu (bez ?variant), produkta galvenā bilde, atlikums – visu krāsu kopā. Produkti: productTypes un/vai productIds.
// Tikai tad, ja failā ir vismaz 2 produkta ieraksti, produkta vienīgā opcija ir krāsa (colourOption) un visiem ir
// vienāda cena un kategorija (citādi kartītes cena neatbilstu preces lapai) – citādi netiek likts (skip – iemesli).
export function kurpirktCombinedItems(items, cfg = CONFIG, skip = {}) {
  const k = cfg.kurpirktCombined;
  if (!k) return [];
  const ids = new Set((k.productIds || []).map(String));
  const types = new Set(k.productTypes || []);
  const groups = new Map(); // produkta ID → tā ieraksti (faila secībā)
  for (const it of items) {
    if (it._portalSkip || it.used === '1' || !it._productId || !(ids.has(it._productId) || types.has(it._productType))) continue;
    if (!groups.has(it._productId)) groups.set(it._productId, []);
    groups.get(it._productId).push(it);
  }
  const no = (why) => { skip[why] = (skip[why] || 0) + 1; };
  const out = [];
  for (const its of groups.values()) {
    if (its.length < 2) { no('mazāk par 2 krāsām'); continue; }
    if (k.colourOption && !its.every((it) => it._options?.length === 1 && k.colourOption.test(it._options[0]))) { no('opcija nav krāsa'); continue; }
    if (new Set(its.map((it) => it.price)).size > 1) { no('dažādas cenas'); continue; }
    if (new Set(its.map((it) => portalCategory(it, cfg))).size > 1) { no('dažādas kategorijas'); continue; }
    const f = its[0];
    // Garam nosaukumam saīsina produkta nosaukumu, ne "(N krāsas)".
    const name = cutKeepSuffix(f._productTitle, ` (${its.length} ${countWord(its.length, k.words)})`
      + (f._decimal ? cfg.decimalNameSuffix : ''), 200);
    const stock = its.every((it) => /^\d+$/.test(it.in_stock)) ? String(its.reduce((s, it) => s + Number(it.in_stock), 0)) : '';
    out.push({ ...f, name, _baseName: f._productTitle, link: f.link.split('?')[0], image: cut(f._productImage || f.image, 500),
      in_stock: stock, ean: '', _combined: its.length });
  }
  return out;
}

// Kurpirkt.lv formāts (https://www.kurpirkt.lv/veikaliem.php): tās pašas preces, citi lauku nosaukumi.
// Faila sākumā – kopīgie ieraksti (kurpirktCombinedItems), tad visas preces kā Salidzini failā.
export function toKurpirktXml(items, cfg = CONFIG) {
  const out = ["<?xml version='1.0' encoding='utf-8' ?>", '<root>'];
  for (const it of [...kurpirktCombinedItems(items, cfg), ...items]) {
    if (it._portalSkip) continue; // cits tās pašas krāsas izmērs
    const parts = String(portalCategory(it, cfg) || '').split(/\s*>>\s*/).filter(Boolean);
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
    if (it._portalSkip) continue; // cits tās pašas krāsas izmērs
    if (c.skipUsed && it.used === '1') { skip('ar defektu / demo / lietota'); continue; }
    if (!it.image) { skip('nav attēla'); continue; }
    if (it._decimal && it.in_stock === '') { skip('metrā tirgota, atlikums nav zināms'); continue; }
    if (seenLinks.has(it.link)) { skip('dublikāts (saite)'); continue; }
    seenLinks.add(it.link);

    const parts = String(cenoCategory(it, cfg) || '').split(/\s*>>\s*/).filter(Boolean);
    const sale = it._compareAt != null && it._compareAt > it._priceNum + 0.004;
    if (sale) stats.compareAtHigher++;
    const row = {
      name: cutKeepSuffix(it._portalBaseName ?? it._baseName ?? it.name, it._decimal ? cfg.decimalNameSuffix : '', c.nameMax),
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
      // Apdrukas precēm (pēc pasūtījuma) – ar izgatavošanu.
      delivery_days_riga: String(c.deliveryDays + (it._madeToOrder ? cfg.madeToOrder.productionDays[1] : 0)),
      delivery_days_latvija: String(c.deliveryDays + (it._madeToOrder ? cfg.madeToOrder.productionDays[1] : 0)),
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
    if (it._portalSkip) continue; // cits tās pašas krāsas izmērs
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
      item_inventory: 'AVAILABLE', // failā ir tikai preces, ko var pasūtīt (noliktavā vai apdruka pēc pasūtījuma)
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
    if (it._portalSkip || it._apparel) continue; // apģērbiem kategorija – h.apparelCategories
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
    if (it._portalSkip) continue; // cits tās pašas krāsas izmērs
    if (it.used === '1') { skip('ar defektu / demo / lietota'); continue; }
    if (!it.image) { skip('nav attēla'); continue; }
    if (it._decimal && it.in_stock === '') { skip('metrā tirgota, atlikums nav zināms'); continue; }
    const e = store.get(String(it._variantId));
    if (!e) { skip(`nav ${h.countryLabel} veikalā`); continue; }
    if (!(e.price > 0)) { skip(`nav ${h.countryLabel} cenas`); continue; }

    // Vietējā cena par Shopify vienību; metrā tirgotajām – par 1 m (Shopify vienība = 0,1 m).
    const price = it._decimal ? e.price / cfg.decimalStep : e.price;
    if (price < cfg.minPrice) { skip(`cena zem ${money(cfg.minPrice)} €`); continue; }
    // Apģērbi (viens ieraksts katrai krāsai): varianta nosaukumā bez izmēra (Shopify: opciju vērtības ar " / ").
    let vt = e.variantTitle;
    if (it._sizes && it._sizeIndex != null && vt) {
      // Opciju vērtības (ja ir) – droši arī tad, ja kādā vērtībā ir " / "; citādi – nosaukuma daļas.
      const segs = e.optionValues?.length > it._sizeIndex ? [...e.optionValues] : String(vt).split(' / ');
      if (it._keepIdx && segs.length > Math.max(-1, ...it._keepIdx, it._sizeIndex)) {
        // Tās pašas opcijas kā LV nosaukumā (bez izmēra un tehniskajām); vietējo krāsu neatkārto, ja tā ir vietējā nosaukumā.
        let keep = [...it._keepIdx];
        if (keep.includes(it._colourIdx) && colourInTitle(e.title, segs[it._colourIdx])) keep = keep.filter((i) => i !== it._colourIdx);
        vt = keep.map((i) => segs[i]).filter(Boolean).join(' / ');
      } else if (segs.length > it._sizeIndex) { segs.splice(it._sizeIndex, 1); vt = segs.join(' / '); }
    }
    const variantTitle = vt && vt !== 'Default Title' ? ` - ${vt}` : '';
    // Viena ieraksta apdrukas prece: vietējais produkta nosaukums + "(12 värvi, XXS-4XL)" / "(12 spalvų, XXS-4XL)".
    // Vairāki preču veidi vienā produktā – vietējā veida vērtība no tās pašas opcijas pozīcijas.
    const otherLocal = it._merged?.otherIdx?.length && e.optionValues?.length
      ? it._merged.otherIdx.map((i) => e.optionValues[i]).filter(Boolean).join(' / ') : '';
    const base = it._merged && h.mergedWords
      ? cleanName(`${e.title}${otherLocal ? ` - ${otherLocal}` : ''} ${mergedSuffix(it._merged, h.mergedWords)}`, h).replace(/\s+/g, ' ').trim()
      : cleanName(`${e.title}${variantTitle}`, h).replace(/\s+/g, ' ').trim();
    if (base === (it._portalBaseName ?? it._baseName)) stats.sameNameAsLv++;
    const name = cutKeepSuffix(base, it._decimal ? h.decimalNameSuffix : '', h.nameMax);
    if (seenNames.has(name)) { skip('dublikāts (nosaukums)'); continue; }
    const multi = String(it.link).includes('?variant=');
    const link = cut(`${h.shopUrl}/products/${e.handle}${multi ? `?variant=${it._variantId}` : ''}`, 500);
    if (seenLinks.has(link)) { skip('dublikāts (saite)'); continue; }
    seenNames.add(name);
    seenLinks.add(link);

    // Apģērbi: LV kategorija (Shopify lauki) → vietējā; ja tādas kartē nav – pēc nosaukuma noteiktā (nevis vispārīgā).
    let category = it._apparel
      ? (h.apparelCategories?.[it.category_full] || h.lvCategories?.[it.category_full] || h.apparelCategories?.[it._apparelCategory] || '')
      : (h.lvCategories?.[it.category_full] || localType(it, e));
    if (it._apparel && !h.apparelCategories?.[it.category_full]) stats.apparelCategoryByName = (stats.apparelCategoryByName || 0) + 1;
    if (!category && typeByLvCategory.has(it.category_full)) {
      category = typeByLvCategory.get(it.category_full);
      stats.categoryFromLv++;
    }
    if (category) stats.withCategory++;
    if (it._decimal) stats.decimal++;
    stats.items++;
    rows.push({ it, name, link, price, category,
      description: cut(String(e.description || '').replace(/–/g, '-').replace(/\s+/g, ' ').trim(), h.descMax) });
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
    // Apdrukas precēm (pēc pasūtījuma) – ar izgatavošanu.
    const days = it._madeToOrder ? String(Number(k.deliveryDays) + cfg.madeToOrder.productionDays[1]) : k.deliveryDays;
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
    out.push(`<home_delivery>${tag('working_days', days)}${tag('price', money(k.delivery.home))}</home_delivery>`);
    if (locker) out.push(`<parcel_locker_delivery>${tag('working_days', days)}${tag('price', money(k.delivery.parcelLocker.price))}</parcel_locker_delivery>`);
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
    .replace(/–/g, '-') // domuzīme → "-" (veikala stils)
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
  // Google (answer/6324487): tikai krāsa, nevis apraksts vai varianta numurs ("2. variants" → "variants");
  // vairākas krāsas – līdz 3, atdalītas ar "/", nevis " - " vai komatu. Citādi – netiek likts (paliek variant_option).
  if (/[.,;:!?]/.test(c) || /^(variants?|tonis|tone|dizains|design)$/i.test(c)) return '';
  const parts = c.split(/\s+[–-]\s+/);
  return parts.length > 3 ? '' : parts.join('/');
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
    const name = String(o.name ?? '').replace(/–/g, '-').replace(/\s+/g, ' ').trim();
    const value = String(o.value ?? '').replace(/–/g, '-').replace(/\s+/g, ' ').trim();
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
  if (m) { stats.descriptionIsTitle = 0; stats.typeNotTranslated = 0; }
  const skip = (why) => { stats.skipped[why] = (stats.skipped[why] || 0) + 1; };
  const seenIds = new Set();
  const seenLinks = new Set();
  const out = ['<?xml version="1.0" encoding="UTF-8"?>', `<rss version="2.0" xmlns:g="${GOOGLE_NS}">`, '<channel>'];
  if (m) {
    out.push(`<title>${escapeXml(m.storeName)}</title>`, `<link>${escapeXml(m.shopUrl + m.pathPrefix)}</link>`,
      `<description>${escapeXml(m.storeName)} - fabrics, yarn and sewing supplies (${m.country}, English)</description>`);
  } else {
    out.push('<title>Šarlotes audumi</title>', `<link>${escapeXml(cfg.shopUrl)}</link>`,
      '<description>Šarlotes audumi - audumi, dzija un šūšanas piederumi (Latvija, latviešu valodā)</description>');
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
      if (normCmp(e.title) === normCmp(it._lvTitle ?? it._productTitle) && !m.sameNameTypes?.includes(it._productType)) {
        skip('nav iztulkots angliski'); continue;
      }
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
      const variantTitle = multi && e.variantTitle && e.variantTitle !== 'Default Title' ? ` - ${e.variantTitle}` : '';
      title = cut(noEmoji(cleanName(`${e.title}${variantTitle}`, m)), g.titleMax);
      groupTitle = cut(noEmoji(cleanName(e.title, m)), g.titleMax);
      // Apraksts, kas nav iztulkots (sakrīt ar latvisko), netiek likts – tā vietā angliskais nosaukums.
      const translated = e.description && normCmp(e.description).slice(0, 120) !== normCmp(it._desc).slice(0, 120);
      description = translated ? e.description : title;
      if (!translated) stats.descriptionIsTitle++;
      unit = e.price;
      productType = it._courierOnly || m.technicalTypePattern.test(e.productType || '') ? '' : (e.productType || '');
      // Tips bez angļu tulkojuma (sakrīt ar latvisko) netiek likts (arī custom_label_0) – Google: vienā avotā viena valoda.
      if (productType && !/\p{L}{2,}/u.test(productType)) productType = ''; // bojāts tulkojums, piem. ")"
      if (productType && normCmp(productType) === normCmp(it._productType)) { productType = ''; stats.typeNotTranslated++; }
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
    // Apdrukas precēm (pēc pasūtījuma) apstrādes laikam pieskaita izgatavošanu (CONFIG.madeToOrder.productionDays).
    const pd = it._madeToOrder ? cfg.madeToOrder.productionDays : null;
    const hs = (s) => (pd ? { ...s, handling: [s.handling[0] + pd[0], s.handling[1] + pd[1]] } : s);
    const ships = [];
    let handling = null; // Latvija ar konta piegādes politiku: apstrādes laiks kā atsevišķs lauks
    if (m) {
      const s = hs(m.shipping);
      if (!it._courierOnly && grams <= s.locker.maxGrams) ships.push(shippingTag(m.country, s.locker.service, s.locker.price, s));
      ships.push(shippingTag(m.country, s.courier.service, s.courier.price, s));
    } else {
      const lockerOk = !it._courierOnly && grams <= (cfg.ceno.delivery.omniva?.maxGrams ?? 30000);
      const courier = cfg.ceno.delivery.courier;
      if (!lockerOk) ships.push(shippingTag(g.shipping.country, g.shipping.service, grams > courier.heavyGrams ? courier.heavy : courier.light, hs(g.shipping)));
      else if (pd) handling = hs(g.shipping).handling;
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
      handling ? tag('min_handling_time', String(handling[0])) : null,
      handling ? tag('max_handling_time', String(handling[1])) : null,
      grams > 0 ? tag('shipping_weight', `${grams1(grams)} g`) : null,
      tag('ships_from_country', g.shipsFrom),
      m?.returnPolicyLabelCut && it._decimal ? tag('return_policy_label', m.returnPolicyLabelCut) : null,
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

// ---------- Google Ads Custom (dinamiskā remarketinga plūsma, CSV) ----------

// CSV lauks (RFC 4180): pēdiņās, ja tajā ir komats, pēdiņas vai rindas pārnesums.
const csvField = (s) => {
  const t = String(s ?? '');
  return /[",\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};

// CSV teksts → rindas (lauku masīvi), pēdiņas pēc RFC 4180. Pēdējā tukšā rinda netiek skaitīta.
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let f = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch !== '"') f += ch;
      else if (text[i + 1] === '"') { f += '"'; i++; } else quoted = false;
    } else if (ch === '"' && f === '') quoted = true;
    else if (ch === ',') { row.push(f); f = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(f); rows.push(row); row = []; f = '';
    } else f += ch;
  }
  if (f !== '' || row.length) { row.push(f); rows.push(row); }
  return rows;
}

// Teksts tikai ar lielajiem burtiem (Google: šāda reklāma tiek noraidīta). Īsi kodi (XL, LV) – nav.
const isAllCaps = (s) => (String(s).match(/\p{L}/gu) || []).length >= 4 && !/\p{Ll}/u.test(String(s));
// Pirmais burts lielais, arī aiz pēdiņas ("“labākais…”" → "“Labākais…”"); aiz iekavas – nē ("(hotfix), 4 mm").
const upperFirst = (s) => String(s).replace(/^([„“”"«]*)(\p{Ll})/u, (_, a, b) => a + b.toUpperCase());

// Emocijzīmes visās formās: secības (1️⃣, 👍🏻, 🇱🇻), karogu burti, ādas toņi, keycap, tagi (\p{Extended_Pictographic} tās
// neaptver visas). Dekoratīvas zīmes (★, ✔, ►) – Google "triku" noteikumi.
const ADS_EMOJI = /\p{RGI_Emoji}|\p{Extended_Pictographic}|\p{Regional_Indicator}|\p{Emoji_Modifier}|[⃣️‍]|[\u{E0020}-\u{E007F}]/v;
const ADS_DECOR = /[★☆✓✔✗✘♥♡►◄▶◀●○■□▪▫→←⇒⇐✦✧✪✯✰※❗❕‼⁉]/u;

/**
 * Iekavu un pēdiņu pāri: ( ) un pēdiņas „ “ ” " « » jebkurā kombinācijā („…“, “…”, “…", "…"). Pēdiņa aiz burta aizver,
 * aiz atstarpes vai bez atvērtas pēdiņas – atver (tā pati " vai “ pēc atvērtas " / “, arī “ pēc „ – vienmēr aizver);
 * „ vienmēr atver.
 * " aiz cipara ir collas (10"), nevis pēdiņa.
 * Atgriež { cut: pirmā neaizvērtā atvērēja vieta vai -1, strays: lieku aizvērēju vietas }.
 */
function bracketScan(t) {
  const stack = [];
  const strays = [];
  const QUOTES = '„“”"«»';
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    const prev = i ? t[i - 1] : ' ';
    const top = stack[stack.length - 1];
    const quoteOpen = !!top && QUOTES.includes(top.ch);
    const opens = /[\s(]/.test(prev);
    if (ch === '(' || ch === '„' || ch === '«') stack.push({ ch, i });
    else if (ch === ')') { if (top && top.ch === '(') stack.pop(); else strays.push(i); }
    else if (ch === '»' || ch === '”') { if (quoteOpen) stack.pop(); else strays.push(i); }
    else if (ch === '“' || ch === '"') {
      if (ch === '"' && /\d/.test(prev)) continue;
      if (quoteOpen && (!opens || top.ch === ch || top.ch === '„')) stack.pop(); // '"Made with love "', „…“
      else stack.push({ ch, i }); // arī pielipusi pie vārda: 'kokvilnas“Rūķi”'
    }
  }
  return { cut: stack.length ? stack[0].i : -1, strays };
}
// Bez liekiem aizvērējiem ("Eglīte“ uzgludināma" → "Eglīte uzgludināma").
const dropStrays = (t) => {
  const { strays } = bracketScan(t);
  for (const i of strays.reverse()) t = t.slice(0, i) + t.slice(i + 1);
  return t.replace(/\s+/g, ' ').trim();
};

// Nosaukuma daļas, atdalītas ar " - ". Skaitļu diapazons ("izmēri 2 - 12 mm", "Ø3 - 20 mm", "2,0 mm - 5,0 mm") un " - " pēdiņās vai iekavās
// ('T-krekls "Rīga - mana pilsēta"') nav atdalītājs.
function titleParts(s) {
  const parts = [];
  const re = /\s+[-–]\s+/g;
  let start = 0;
  let m;
  while ((m = re.exec(s))) {
    if (adsNumberRange(s.slice(0, m.index), s.slice(m.index + m[0].length))) continue;
    if (bracketScan(s.slice(0, m.index)).cut >= 0) continue;
    parts.push(s.slice(start, m.index));
    start = m.index + m[0].length;
  }
  parts.push(s.slice(start));
  return parts.map((x) => x.trim()).filter(Boolean);
}

const ADS_BOUNDARY = /,\s+|;\s+|\s+[-–]\s+|\s+\/\s+|\s+\(|(?<=[.!?])\s+(?=\p{Lu})/gu;
// Lielie burti, kas paliek arī teikumā: izmēri (XS, M, 2XL) un kodi ar cipariem (#12, A4), valstu kodi.
const ADS_CODE = /^(\(?(X{0,3}S|M|X{0,4}L|\d+XL|LV|EE|LT|EU)\)?[,.;/]?|\S*\d\S*)$/;
const ADS_UNIT = /^(mm|cm|m|km|g|kg|ml|l|gab\.?|m²|cm²|g\/m²|%|mm\)|cm\)|m\)|g\))[,.;)]*$/i;
// Skaitlis vai izmērs bez mērvienības ("20", "6,", "Ø13", "10x15", '10"'); savienotājs skaitļu virknē ("×", "+", "un").
const ADS_NUM = /^[Ø⌀#~±]?\d[\d.,/×x–-]*["”]?[,;:]?$/i;
const ADS_JOIN = /^(×|x|\+|un|vai|and|or|līdz|\/)$/i;
const ADS_DASH = /^[-–]$/;
// Vārdi, ko var atmest atlikuma sākumā ("un karabīnēm" → "Karabīnēm"). Prievārdi paliek: "Ar spīdumiem", ne "Spīdumiem";
// "Šūšanas 12 mm" no "bez šūšanas" nozīmētu pretējo, "Brother šujmašīnām" no "priekš Brother…" – citu preci.
const ADS_LEAD_DROP = new Set(['un', 'vai', 'ir', 'kā', 'and', 'or', 'x', '×', '&', '+']);
// Prievārdi un saikļi: aiz tiem sākas jauna frāze (vārds pirms tiem var būt frāzes beigas).
const ADS_PREP = new Set(['ar', 'bez', 'uz', 'priekš', 'no', 'līdz', 'pret', 'par', 'pa', 'pie', 'pēc', 'zem', 'virs', 'ap', 'caur', 'starp',
  'aiz', 'pirms', 'with', 'for', 'of', 'in', 'on', 'to']);
const ADS_LINK = new Set([...ADS_PREP, 'un', 'vai', 'ir', 'kā', 'and', 'or', '-', '–', '/', 'x', '×', '+', '&']);
// Prievārdi ar akuzatīvu: aiz tiem frāze beidzas ar "-u", "-i" vai daudzskaitļa "-iem/-ām/-ēm" ("ar jūsu dizainu"),
// nevis ar ģenitīvu ("ar burzījuma", "ar vārda", "ar “kaķa acs”" – pārgriezts).
const ADS_ACC_PREP = new Set(['ar', 'par', 'pa', 'ap', 'caur']);
// Datīvs ("ādai", "rokdarbiem", "somām") aiz lietvārda – tā papildinātājs ("adatas ādai"), ne frāzes galvenais vārds.
const ADS_DATIVE = /(iem|ām|ēm|īm|ai|am|im)$/u;
// Īpašības vārdu un divdabju izskaņas ("dekoratīvas", "pašlīmējošs", "atverams", "personalizēts", "organiskās", "rūpniecisko").
const ADS_ADJ = /((īg|isk|ain|oš|am|ām|ēt|āt|ot|īv|ūt)(s|š|a|i|as|ā|ās|ais|ie|o|u|ai|am|ām|iem)|ajā|ajām|ajiem|ajai|ajam|ajos|ajās|ais)$|^(plān|biez|mīkst|smalk|viegl|smag|liel|maz|plat|šaur|ciet|stingr|jaun|tīr|elegant|modern|interesant|grezn|skaist|krāšņ)(s|a|i|as|ā|ās|ais|ie|o|u|ai|am|ām|iem)$|^(premium|super|extra|eko|bio)$/u;
// Krāsas un pakāpes apstākļa vārdi – apzīmētāji ("Gaiši zils | viskozes tvills", "Sarkana | dublēta vilnas trikotāža").
const ADS_COLOR = /((balt|meln|zil|sarkan|zaļ|dzelten|brūn|pelēk|violet|oranž|bēš)(s|š|a|i|as|ā|ās|ais|ie|o|u|ai|am|ām|iem|ajā|ajām|ajiem)|^(gaiši|tumši|koši|maigi|spilgti|bāli|dziļi|silti|auksti|smalki|bordo)|rozā|lillā)$/u;
// Lietvārdu izskaņas, kas nav ģenitīvs ("piekariņš", "rāvējslēdzējs", "audums") – var būt frāzes beigas arī tad, ja katalogā
// aiz tiem bieži seko nosaukums ("piekariņš četrlapu āboliņš").
const ADS_SHADE = /^(gaiši|tumši|koši|maigi|spilgti|bāli|dziļi|silti|auksti|smalki)$/u; // krāsas apstākļa vārds
const ADS_INDECL = /.(veida|tipa)$/u; // "spirālveida", "spageti tipa" – apzīmētājs
const ADS_NOUN = /(iņš|iņi|ītis|īši|tājs|tāji|ējs|ēji|ums|umi|nieks|nieki)$/u;
// Teksts nevar beigties ar piederības vietniekvārdu ("T-krekla apdruka ar jūsu") ...
const ADS_NOT_ADJ = /^(palīg|disk|risk|aparāt|formāt|motīv|pilot|robot|klot|kost|broš)/u; // lietvārdi ar īpašības vārda galotni
// Lietvārdi, kurus ADS_ADJ galotnes dēļ uzskatītu par īpašības vārdiem ("dizainu", "tēta", "plastikāta", "ahāta").
const ADS_NOUN_LIKE = /^(ahāt|citāt|dizain|jenot|kvadrāt|kāt|magnēt|pilsēt|plastikāt|terakot|tēt|fot)(s|a|i|is|as|u|am|ām|ai|im|iem|ā|e|es|os)?$/u;
const adsAdj = (x) => ADS_ADJ.test(x) && !ADS_NOUN_LIKE.test(x);
// Apzīmētāji, kurus nedrīkst atmest – bez tiem teksts nozīmē ko citu ("Mākslīgās ādas etiķetes" ≠ "Ādas etiķetes").
const ADS_KEEP = /^(mākslīg|sintētisk|neīst|imitēt|imitācij|viltot)/u;
// Materiāla apzīmētāji – attiecas uz nākamo vārdu ("Organiskās kokvilnas"), ne uz preci.
const ADS_MATERIAL_ADJ = /^(organisk|dabīg|mākslīg|sintētisk|merserizēt|pārstrādāt|ekoloģisk|bioloģisk)/u;
const ADS_HOLD = new Set(['jūsu', 'savu', 'sava', 'savas', 'savā', 'savām', 'saviem', 'mūsu', 'tavu', 'tava', 'manu', 'mana', 'your', 'my',
  'ļoti', 'īpaši', 'sevišķi', 'pārāk', 'nedaudz', 'mazliet', 'diezgan', 'iepriekš']);
// ... un ar apzīmējumu, kam seko tā vērtība ("35 cm, izmēri" no "… izmēri 2,25 mm - 7 mm").
const ADS_LABEL = new Set(['izmēri', 'izmērs', 'izmērā', 'garums', 'garumā', 'platums', 'platumā', 'biezums', 'diametrs', 'svars', 'tilpums']);

// Vārds bez pēdiņām, iekavām un pieturzīmēm, mazajiem burtiem ("“Kaķis”," → "kaķis").
const adsKey = (w) => String(w ?? '').replace(/^[“„"«(]+/u, '').replace(/[,;:.!?)”“"»]+$/u, '').toLowerCase();

/**
 * Kataloga vārdu statistika saīsināšanai: Map vārds → [cik reizes frāzes beigās, cik reizes aiz tā seko vēl vārds,
 * cik reizes rakstīts ar mazo burtu].
 * Frāzes beigas – aiz vārda pieturzīme, prievārds vai saiklis, skaitlis, pēdiņa, iekava, vārds ar lielo sākumburtu (zīmols,
 * modelis), datīvs ("adatas ādai") vai nosaukuma beigas. Preces vārds ("pērlītes", "lente", "audums") parasti ir frāzes
 * beigās, apzīmētājs ("kokvilnas", "plastmasas", "rūpniecisko") – gandrīz nekad.
 */
export function adsWordStats(titles) {
  const stats = new Map();
  for (const title of titles) {
    const toks = String(title ?? '').split(/\s+/).filter(Boolean);
    toks.forEach((raw, i) => {
      const w = adsKey(raw);
      if (!/^\p{Ll}[\p{Ll}-]*$/u.test(w)) return;
      const next = toks[i + 1] || '';
      const nk = adsKey(next);
      const dative = ADS_DATIVE.test(nk) && !w.endsWith('u') && w.slice(-2) !== nk.slice(-2);
      const end = !next || /[,;:.!?)”"»]$/u.test(raw) || ADS_LINK.has(nk) || /^[\d#Ø⌀~±“”„"«(]/u.test(next)
        || (/^\p{Lu}/u.test(next) && !/^\p{Lu}-/u.test(next)) || dative;
      const s = stats.get(w) || [0, 0, 0];
      s[end ? 0 : 1]++;
      if (/^\p{Ll}/u.test(raw.replace(/^[“„"«(]+/u, ''))) s[2]++; // cik reizes ar mazo burtu ("Roma" – nekad, "Kokvilnas" – bieži)
      stats.set(w, s);
    });
  }
  return stats;
}

/**
 * Vai tekstu (words[0..k)) var beigt ar words[k - 1], ja aiz tā ir words[k]: tas nav apzīmētājs bez sava lietvārda
 * ("Plastmasas auklas" no "… auklas fiksators", "SCHMETZ rūpniecisko", "Dekoratīvas vistas"), prievārds, "jūsu",
 * ģenitīvs aiz "ar" ("Velūrs ar burzījuma") vai vienrangu locekļu pirmā puse ("Metāla sprādze jostai" no "jostai vai somai").
 * Vērtē pēc kataloga statistikas (ctx.stats), ja vārds tajā ir vismaz 3 reizes, citādi pēc vārda formas.
 * relaxed – vienrangu locekļu noteikums netiek pārbaudīts (ja citas vietas nav).
 */
function adsPhraseEnd(words, k, ctx, relaxed = false) {
  const raw = words[k - 1] || '';
  const w = adsKey(raw);
  if (!w || ctx.dangling.has(w) || ADS_HOLD.has(w)) return false;
  const next = words[k] || '';
  const nk = adsKey(next);
  if (ADS_LABEL.has(w) && /^[Ø⌀]?\d/u.test(next)) return false;
  const bare = raw.replace(/^[“„"«(]+/u, '').replace(/[,;:.!?)”“"»]+$/u, '');
  // Īss kods pirms lietvārda ("ar AB | efektu", "ar 3D | ziediem", "pērlītes H | formā") – nepabeigts.
  if (/^[\p{Lu}\d]{1,3}$/u.test(bare) && raw === bare && /^\p{Ll}[\p{Ll}-]*$/u.test(adsKey(words[k] || '')) && /^\p{Ll}/u.test(words[k] || '')
    && !ADS_LINK.has(adsKey(words[k])) && !ADS_UNIT.test(words[k])) return false;
  // Skaitlis, kods, zīmols vai nosaukums ("Alfie", "KARTOPU", "DBx1") – vārdšķira nav jāvērtē; aizvērta iekava vai pēdiņa
  // ("(koka - dabīgas)") – frāzes beigas.
  // "kanāla/tuneļa | lentīte" – vērtē pēc pēdējā vārda.
  const sl = bare.match(/^\p{Ll}[\p{Ll}-]*\/(\p{Ll}[\p{Ll}-]*)$/u);
  if (sl) {
    const ws = [...words];
    ws[k - 1] = raw.replace(bare, sl[1]);
    return adsPhraseEnd(ws, k, ctx, relaxed);
  }
  // Vārds ar lielo burtu nosaukuma vidū, kas katalogā ir parasts vārds ("Organiskā Kokvilnas trikotāža", "Biezs Kokvilnas auduma
  // maisiņš") – vērtē kā mazo burtu vārdu; zīmoli un reti vārdi ("Alfie", "Ūsiņš") paliek nosaukumi.
  const common = (x) => {
    const st = ctx.stats?.get(adsKey(x));
    const b = String(x || '').replace(/^[“„"«(]+/u, '').replace(/[,;:.!?)”“"»]+$/u, '');
    return /^\p{Lu}\p{Ll}+$/u.test(b) && !ctx.brands?.has(b.toUpperCase())
      && !!st && st[0] + st[1] >= 5 && st[1] >= 1 && (st[2] || 0) >= 3;
  };
  const low = (x) => /^\p{Ll}/u.test(x) || common(x);
  const nextPlain = !!next && low(next) && /^\p{Ll}[\p{Ll}-]*$/u.test(nk) && !ADS_LINK.has(nk) && !ctx.dangling.has(nk);
  if (k > 1 && /^\d+\.$/u.test(words[k - 2]) && nextPlain) return false; // kārtas skaitlis: "3. krāsu | variants"
  if (/^\d+\.$/u.test(raw) && nextPlain) return false; // "3. | krāsu variants"
  if (/^(formas|veida|tipa)$/u.test(nk) && /^\p{Ll}/u.test(next)) return false; // "sirds | formas pērlītes"
  // Nosaukums pēdiņās aiz "ar", aiz tā lietvārds: "ar “kaķa acs” | efektu" – nepabeigts.
  if (/[”"»]$/u.test(raw) && nextPlain) {
    let q = k - 1;
    while (q > 0 && !/^[“„"«]/u.test(words[q])) q--;
    if (q > 0 && ADS_ACC_PREP.has(adsKey(words[q - 1]))) return false;
  }
  // Lielais burts aiz komata ir jaunas daļas sākums, ne nosaukums ("“Veggie”, Dārzeņu | kolekcija"); ģenitīvs ar lielo burtu
  // pirms cita vārda ("Slīpētas Čehu | stikla pērlītes") – apzīmētājs.
  if (!/^\p{L}[\p{Ll}-]*$/u.test(bare) || /[)”»"]$/u.test(raw)
    || (k > 1 && /^\p{Lu}/u.test(bare) && !common(raw) && !/[,;:]$/u.test(words[k - 2]) && !(/(u|as|es)$/u.test(w) && nextPlain)
      && !(nextPlain && (k === 2 || /^\p{Ll}/u.test(words[k - 2])) && adsAdj(adsKey(words[k - 2])) && !ADS_NOT_ADJ.test(adsKey(words[k - 2]))))) return true; // "Pašlīmējoši Velcro | taisnstūri"
  // Prievārds tuvāk par komatu: ar akuzatīvu – "ar vārda" (vietu) nepabeigts; ar ģenitīvu – "no mākslīgās ādas" pabeigts.
  let genPrep = false;
  for (let i = k - 2; i >= Math.max(0, k - 4); i--) {
    if (/[,;:]$/.test(words[i])) break;
    const pk = adsKey(words[i]);
    if (ADS_ACC_PREP.has(pk)) {
      if (/(a|as|es|is|us|s|š)$/u.test(w)) return false;
      break;
    }
    if (ADS_PREP.has(pk)) { genPrep = true; break; }
  }
  // Aiz prievārda ar ģenitīvu daudzskaitļa ģenitīvs pirms cita vārda – apzīmētājs ("uz ogu | rozā fona").
  if (genPrep && w.endsWith('u') && /^\p{Ll}/u.test(next) && /^\p{Ll}[\p{Ll}-]*$/u.test(nk) && !ADS_LINK.has(nk) && !ctx.dangling.has(nk)) return false;
  if (ADS_UNIT.test(raw.replace(/[,;:]$/, ''))) return true; // "15 mm", "100 g" – mērvienība (atrautu skaitli pārbauda adsSplitsNumber)
  const plain = nextPlain;
  const noun = plain && !ADS_DATIVE.test(nk);
  const st = ctx.stats?.get(w);
  const seen = st ? st[0] + st[1] : 0;
  const ratio = seen ? st[0] / seen : 0;
  const ns = noun ? ctx.stats?.get(nk) : null;
  const strongNext = !!ns && ns[0] + ns[1] >= 3 && ns[0] / (ns[0] + ns[1]) >= 0.7; // "auklas | fiksators", "flizelīna | lente"
  const adj = adsAdj(w) || ADS_COLOR.test(w) || ADS_INDECL.test(w);
  // "spirālveida | rāvējslēdzējam", "Spageti tipa | dzija", "sirds formas | pērlītes" – apzīmētājs bez sava lietvārda.
  if ((ADS_INDECL.test(w) || /^(formas|veida|tipa)$/u.test(w)) && plain) return false;
  // Ģenitīvs pirms darbības lietvārda (tas ir tā papildinātājs): "caurumu | izspiešanas presformas", "rāvējslēdzēju | iešūšanai".
  if (w.endsWith('u') && nextPlain && /šan(as|ai|ā)$/u.test(nk)) return false;
  // Noteiktais īpašības vārds ģenitīvā + lietvārds pirms cita vārda: "nerūsējošā tērauda | gredzeni", "slīpā diega | lentas".
  const pw = k > 1 ? adsKey(words[k - 2]) : '';
  if (nextPlain && !ADS_DATIVE.test(nk) && (k === 2 || /^\p{Ll}/u.test(words[k - 2] || '')) && adsAdj(pw) && !ADS_NOT_ADJ.test(pw) && /(ā|ās)$/u.test(pw)
    && /(a|as|es|u)$/u.test(w) && !adsAdj(w)) return false;
  // Īpašības vārds vīriešu dzimtē vai datīvā, aiz kura tikai ģenitīvi – tā lietvārds vēl nav sasniegts:
  // "Elegants krāsu | pārejas dizains", "pilnīgai gaismas | bloķēšanai", "Personalizēts ģimenes | T-krekls".
  if (/(u|as|es|a)$/u.test(w) && !adsAdj(w) && !ADS_COLOR.test(w)) {
    for (let j = k - 2; j >= Math.max(0, k - 4); j--) {
      const x = adsKey(words[j]);
      if ((j > 0 && !/^\p{Ll}/u.test(words[j])) || /[,;:]$/u.test(words[j])) break; // "Personalizēts ģimenes | T-krekls"
      if (adsAdj(x) && !ADS_NOT_ADJ.test(x)) {
        if (/([^aeiouāēīūo][sš]|ais)$/u.test(x) || ADS_DATIVE.test(x)) return false;
        break;
      }
      if (!/(u|as|es|a)$/u.test(x)) break;
    }
  }
  // Bieži beigu vārds pirms "un" ("Metāla sprādze jostai | vai somai") der, bet nosaukumā labāk bez tā, ja viss
  // pāris ("Jostai vai somai") ietilpst aprakstā; bez prievārda aprakstā citādi paliktu tikai "Somai".
  const y = words[k + 1] || '';
  const coordFits = !!ctx.coordMax && /^\p{Ll}/u.test(y) && (ADS_DATIVE.test(adsKey(y)) || adsKey(y).slice(-2) === w.slice(-2))
    && `${w} ${nk} ${adsKey(y)}`.length <= ctx.coordMax && !words.slice(0, k - 1).some((x) => ADS_PREP.has(adsKey(x)));
  // Vienrangu daudzskaitļa ģenitīvi, to lietvārds vēl priekšā: "pogcaurumu | un pogu novietošanai".
  const z = words[k + 2] || '';
  if (w.endsWith('u') && !adj && (nk === 'un' || nk === 'vai') && /^\p{Ll}/u.test(y) && adsKey(y).endsWith('u')
    && /^\p{Ll}[\p{Ll}-]*$/u.test(z) && !adsKey(z).endsWith('u') && !ADS_LINK.has(adsKey(z)) && !ctx.dangling.has(adsKey(z))
    && !words.slice(Math.max(0, k - 3), k - 1).some((x) => ADS_ACC_PREP.has(adsKey(x)))) return false; // ne "ar vilnu | un ģeometrisku rakstu"
  if ((nk === 'un' || nk === 'vai') && (adj || (!relaxed && /(ai|am|iem|ām|ēm|īm|ā|ē|os|ās|ēs)$/u.test(w) && !(seen >= 3 && ratio >= 0.65 && !coordFits)))) {
    return false; // "ar bēšu | un brūnu punktu rakstu", "jostai | vai somai" (pēdējais – ja citas vietas nav, der)
  }
  if (noun && adj) return false; // "Pašlīmējošs ūdensizturīgs | ielāps", "Gaiši zils | viskozes"
  // Īpašības vārds pirms nosaukuma ar lielo burtu, aiz kura lietvārds: "Pašlīmējoši | Velcro taisnstūri".
  const y2 = words[k + 1] || '';
  if (adj && /^\p{Lu}\p{Ll}+$/u.test(next) && /^\p{Ll}[\p{Ll}-]*$/u.test(y2) && !ADS_LINK.has(adsKey(y2)) && !ctx.dangling.has(adsKey(y2))) return false;
  if (plain && adj && w.slice(-2) === nk.slice(-2)) return false; // "ar pieskaņotiem | paneļiem"
  if (ADS_NOUN.test(w)) return true;
  if (noun && ADS_NOUN.test(nk)) return false; // "Atstarojošs lāča | piekariņš"
  if (seen >= 3) {
    if (ratio < 0.25 && !genPrep) return false;
    if (ratio >= 0.65) return true;
    return !strongNext;
  }
  if (strongNext) return false;
  if (w.endsWith('u') && (nk.endsWith('u') || !words.slice(0, k - 1).some((x) => ADS_PREP.has(adsKey(x))))) return false; // "šujmašīnu"
  if (plain && w.length > 3 && nk.length > 3 && w.slice(-2) === nk.slice(-2)) return false; // "vistas | spalvas", "smalkiem | audumiem"
  // Lokatīvs vai noteiktais īpašības vārds pirms cita vārda ("ar pelītēm un mežā | zemenītēm", "rozā | bantēs").
  if (/[āē]$/u.test(w) && next && /^\p{Ll}[\p{Ll}-]*$/u.test(nk) && /^\p{Ll}/u.test(next) && !ADS_LINK.has(nk) && !ctx.dangling.has(nk)) return false;
  return true;
}

// Vai griezums aiz words[n - 1] atrauj skaitli no mērvienības vai pārgriež skaitļu virkni / diapazonu
// ("Filca loksne 20" no "20 × 30 cm", "100 g" no "100 g / 120 m", "2,25 mm" no "2,25 mm - 7 mm", "poga ar 2" no "ar 2 caurumiem").
function adsSplitsNumber(words, n, dangling) {
  const last = words[n - 1] || '';
  const next = words[n];
  if (!next) return false;
  const join = (w) => ADS_JOIN.test(w) || ADS_DASH.test(w);
  if (ADS_NUM.test(last) && (ADS_UNIT.test(next) || ADS_NUM.test(next) || join(next))) {
    // Domuzīme aiz nosaukuma numura ("Lanagold 800 - 100 g", "SPIRIT 2 - 100 ml") – nosaukuma daļa, ne diapazons.
    return !(ADS_DASH.test(next) && /^\p{Lu}\p{L}/u.test(words[n - 2] || ''));
  }
  if (join(last) && /^[Ø⌀]?\d/u.test(next) && (ADS_NUM.test(words[n - 2] || '') || ADS_UNIT.test(words[n - 2] || ''))) return true;
  if (ADS_UNIT.test(last) && !/[,;]$/.test(last) && join(next) && /^[Ø⌀]?\d/u.test(words[n + 1] || '')) return true;
  // "100 % | vilna" – procenti pieder pie materiāla.
  if (/^\d*%$/u.test(last) && /^\p{Ll}/u.test(next) && !ADS_LINK.has(adsKey(next))) return true;
  // Izmēru saraksts ar vienu mērvienību: "7 mm, | 10 mm, 13 mm" – nepārgriež (citādi šķiet, ka ir tikai 7 mm).
  const u = (x) => String(x || '').replace(/[,;.]+$/u, '').toLowerCase();
  if (ADS_UNIT.test(last) && /,$/u.test(last) && ADS_NUM.test(next) && u(words[n + 1]) === u(last)) return true;
  if (ADS_NUM.test(last) && /:$/.test(words[n - 2] || '')) return true; // "komplekts: 5" no "… 5 adatas"
  if (ADS_NUM.test(last) && dangling.has((words[n - 2] || '').toLowerCase())) return true;
  // Skaitlis, kas atrauts no sava lietvārda ("Best Socks 4" no "… 4 kārtu zeķu dzija"); ne "Nr. 30".
  return /^\d+$/.test(last) && /^\p{Ll}/u.test(next) && !/^(nr\.?|no\.?|#)$/i.test(words[n - 2] || '');
}

// Vai teksts pirms atdalītāja beidzas ar skaitli (arī ar mērvienību) un aiz tā sākas skaitlis: diapazons vai saraksts
// ("Ø3 - 20 mm", "2,0 mm - 5,0 mm", "100 g / 120 m"), ne atdalītājs.
function adsNumberRange(left, right, withUnit = true) {
  if (!/^[Ø⌀]?\s?\d/u.test(right)) return false;
  const ws = left.trim().split(' ');
  const a = ws[ws.length - 1] || '';
  return /\d$/.test(a) || (withUnit && ADS_UNIT.test(a) && ADS_NUM.test(ws[ws.length - 2] || ''));
}

/**
 * Teksts līdz max zīmēm bez pārgrieztiem vārdiem un bez daudzpunktes: vispirms garākā daļa līdz frāzes robežai
 * (", ", " - ", " / ", " ("), ja tā nav pārāk īsa; citādi pa veseliem vārdiem. Beigās nepaliek pieturzīmes,
 * saikļi un prievārdi ("ar", "un"), apzīmētājs bez sava lietvārda ("Plastmasas auklas" no "… auklas fiksators"; skat.
 * adsPhraseEnd), skaitlis, kas atrauts no mērvienības vai otra izmēra ("20" no "20 × 30 cm"), neaizvērta iekava vai pēdiņa.
 * Teksts netiek griezts skaitļu virknes vai diapazona vidū ("6, 10, 15 un 25 mm", "2,0 mm - 5,0 mm").
 * Ja teksta sākumā ir tikai apzīmētāji ("Dekoratīvas vistas spalvas", "SCHMETZ rūpniecisko šujmašīnu adatas"), tie var tikt
 * izlaisti ("Vistas spalvas 6-20 cm", "SCHMETZ šujmašīnu adatas"); izlaistie vārdi – dropped.
 * ctx: { dangling: Set, stats?: adsWordStats(), brands?: Set (lielajiem burtiem) }.
 * strict – ja pabeigtas frāzes vietas nav, text = '' (aprakstam: labāk cits teksts nekā pārgriezts); citādi – vecā kārtība.
 * Atgriež { text, rest, dropped } – rest ir atmestā beigu daļa (var izmantot citā kolonnā). text = '' – nevar saīsināt.
 */
function fitText(s, max, ctx, strict = false) {
  if (!strict) ctx = { ...ctx, coordMax: max }; // nosaukumam: "X un Y" var pāriet uz aprakstu (adsPhraseEnd)
  const { dangling } = ctx;
  s = dropStrays(String(s ?? '').trim());
  if (s.length <= max && bracketScan(s).cut < 0) return { text: s, rest: '', dropped: '' };
  const tidy = (t) => {
    let prev;
    do {
      prev = t;
      t = t.replace(/[\s,;:\-–/(&+·…]+$/u, '');
      const { cut } = bracketScan(t);
      if (cut >= 0) t = t.slice(0, cut);
      const words = t.split(' ');
      if (words.length > 1 && dangling.has(words[words.length - 1].toLowerCase())) t = words.slice(0, -1).join(' ');
    } while (t !== prev);
    return t.trim();
  };
  const min = Math.min(10, max);
  const words = s.split(' ');
  // Garākais derīgais teksts no vārdiem ws (griezums tikai tur, kur frāze pabeigta).
  const fit = (ws, relaxed = false) => {
    let n = 0;
    let len = 0;
    while (n < ws.length && len + (n ? 1 : 0) + ws[n].length <= max) { len += (n ? 1 : 0) + ws[n].length; n++; }
    for (let k = n; k > 0; k--) {
      const t = tidy(ws.slice(0, k).join(' '));
      if (!t) continue;
      const kt = t.split(' ').length;
      if (adsSplitsNumber(ws, kt, dangling) || !adsPhraseEnd(ws, kt, ctx, relaxed)) continue;
      return t;
    }
    return '';
  };
  let text = '';
  let from = 0; // izlaisto sākuma vārdu skaits
  let skip = 0; // izlaisti vārdi aiz pirmā (zīmols paliek: "SCHMETZ šujmašīnu adatas")
  for (const m of s.matchAll(ADS_BOUNDARY)) {
    const sep = m[0].trim();
    const left = s.slice(0, m.index);
    const right = s.slice(m.index + m[0].length);
    // Skaitļu diapazons vai saraksts ("Ø3 - 20 mm", "2,0 mm - 5,0 mm", "lente 6, 10, 15 mm") – nav robeža. Ir robeža, ja
    // kreisais skaitlis ir apzīmējums: aiz liela burta vārda vai "nr." ("Arena Nr. 30, 150 m", "SERV 7, 16x231") vai ar
    // zīmēm ("8/0, 3 mm"); aiz komata mērvienība – divas īpašības ("Ø 6 mm, 30 cm").
    if (sep !== '(' && /^[Ø⌀]?\s?\d/u.test(right)) {
      const lw = left.split(' ');
      const [a, b] = [lw[lw.length - 1], lw[lw.length - 2] || ''];
      if (/\d$/.test(a)) {
        if (/^[Ø⌀]?\d+([.,]\d+)?$/.test(a) && !/^\p{Lu}\p{L}/u.test(b) && !/^(nr|no)\.?$/i.test(b)) continue;
      } else if (/^[-–/]$/.test(sep) && ADS_UNIT.test(a) && ADS_NUM.test(b)) continue;
      else if (sep === ',' && ADS_UNIT.test(a) && ADS_NUM.test(b) && right.match(/^[Ø⌀]?\s?[\d.,]+\s+(\S+?)[,;.]?(\s|$)/u)?.[1]?.toLowerCase() === a.toLowerCase()) continue;
    }
    const t = tidy(left);
    if (t.length > max || t.length <= text.length) continue;
    const tw = t.split(' ');
    if (adsPhraseEnd(tw, tw.length, ctx)) text = t;
  }
  if (text.length < min) text = '';
  // Teksts tikai no skaitļiem un kodiem ("100 %" no "100 % kokvilnas audums") – nav nosaukums.
  const wordy = (t) => /\p{L}{3,}/u.test(t);
  if (!text) {
    const head = fit(words);
    if (head.length >= min && wordy(head)) text = head;
    else {
      // Sākumā tikai apzīmētāji – izlaiž līdz 3 vārdiem (īpašības vārdus, krāsas, ģenitīvus; ne prievārdu, skaitli, preces
      // vārdu); zīmols sākumā paliek ("SCHMETZ šujmašīnu adatas"). Teksts nesākas ar "un" / "vai".
      const brand = ctx.brands?.has(adsKey(words[0]).toUpperCase()) || /^\p{Lu}{2,}$/u.test(words[0]);
      // Vietas, no kurām var sākt: aiz apzīmētājiem, aiz "100 %", aiz "X un" ("Viskozes un kokvilnas audums" → "Kokvilnas audums").
      const starts = [];
      for (let i = brand ? 1 : 0; i < words.length - 1 && starts.length < 3;) {
        const w = words[i];
        const k = adsKey(w);
        const st = ctx.stats?.get(k);
        const ratio = st && st[0] + st[1] >= 3 ? st[0] / (st[0] + st[1]) : null;
        if (/^\d+([.,]\d+)?$/u.test(w) && words[i + 1] === '%' && i + 2 < words.length) { i += 2; starts.push(i); continue; } // "Plāns 100 % | kokvilnas …"
        // Divi vienāda locījuma datīvi: "skaistām un | vienmērīgām adītām zeķēm".
        if (ADS_DATIVE.test(k) && /^(un|vai)$/u.test(words[i + 1] || '') && adsKey(words[i + 2]).slice(-2) === k.slice(-2) && i + 3 < words.length) {
          i += 2; starts.push(i); continue;
        }
        const pk = adsKey(words[i - 1] || '');
        if (/^(un|vai)$/i.test(w) && i > 0 && starts.includes(i)) {
          const y = words[i + 1] || '';
          const yk = adsKey(y);
          const z = words[i + 2] || '';
          // Abas krāsas kopā ("oranžas un pelēkas | spalvas" → "Spalvas"); krāsu pa pusei nē ("rozā un | ceriņu …").
          const j = ADS_SHADE.test(yk) ? i + 2 : i + 1;
          if (ADS_COLOR.test(pk) && ADS_COLOR.test(adsKey(words[j] || '')) && !ADS_SHADE.test(adsKey(words[j] || '')) && j < words.length - 1) {
            i = j + 1; starts.push(i); continue;
          }
          if (ADS_COLOR.test(pk)) break;
          // Divi materiāli vai apzīmētāji – tikai abi kopā ("Minerāla un stikla | sirds formas pērlītes"); viens pats
          // nozīmētu citu sastāvu ("Viskozes dzija" no "kokvilnas un viskozes dzija").
          const gen = (x) => /(a|as|es|u)$/u.test(x) && !ADS_DATIVE.test(x) && !adsAdj(x);
          if (gen(pk) && gen(yk) && /^\p{Ll}/u.test(y) && /^\p{Ll}/u.test(z) && !ADS_DATIVE.test(adsKey(z)) && !ADS_LINK.has(adsKey(z))) {
            i += 2; starts.push(i); continue;
          }
          // Viens no pāra: daudzskaitļa ģenitīvs ("brošu un | sprādzīšu izgatavošanai", "nošu un | latviskā raksta") vai
          // tāds pats datīvs ("skaistām un | vienmērīgām adītām zeķēm").
          if ((pk.endsWith('u') && (!adsAdj(pk) || ADS_NOT_ADJ.test(pk))) || (ADS_DATIVE.test(pk) && pk.slice(-2) === yk.slice(-2))) {
            i++; starts.push(i); continue;
          }
          break;
        }
        if (ADS_LINK.has(k) || dangling.has(k) || /[\d“”„"«»()]/u.test(w) || ADS_NOUN.test(k)) break;
        // Krāsa vai īpašības vārds sākumā ir apzīmētājs ("Rozā rūtains …", "Ūdensizturīgs lietusmēteļu audums"), izņemot
        // lietvārdus ar tādu pašu galotni ("Palīgs gumiju …", "Griešanas disks", "Pogu aparāts").
        // Aiz noteiktā īpašības vārda ģenitīvā ("Sintētiskā", "Nerūsējošā") – ģenitīvs neatkarīgi no galotnes
        // ("Sintētiskā mēnessakmens | pērlītes", "Nerūsējošā tērauda | savienojošie gredzeni").
        const pk0 = i > 0 ? adsKey(words[i - 1]) : '';
        const afterKeep = i > 0 && (ADS_KEEP.test(pk0) || (adsAdj(pk0) && !ADS_NOT_ADJ.test(pk0))) && /(ā|ās)$/u.test(pk0);
        const modifier = ((adsAdj(k) || ADS_COLOR.test(k) || ADS_INDECL.test(k)) && !ADS_NOT_ADJ.test(k))
          || (/(a|as|es|is|u|ā|ās|ēs|o|i|ais|ie)$/u.test(k) && (ratio === null || ratio < 0.25))
          || (afterKeep && /^\p{Ll}/u.test(w) && (ratio === null || ratio < 0.5))
          || (k.endsWith('u') && /^(un|vai)$/u.test(words[i + 1] || '') && adsKey(words[i + 2] || '').endsWith('u')) // "pogcaurumu un pogu …"
          || (/šanas$/u.test(k) && /^\p{Ll}[\p{Ll}-]*$/u.test(words[i + 1] || '') && !ADS_LINK.has(adsKey(words[i + 1]))) // "Caurumu izspiešanas | presformas …"
          || (k.endsWith('u') && /šan(as|ai|ā)$/u.test(adsKey(words[i + 1] || ''))); // "Caurumu | izspiešanas …"
        if (!modifier || (!/^(un|vai)$/u.test(words[i + 1] || '') && adsPhraseEnd(words, i + 1, ctx))) break; // "Minerāla | un stikla …"
        i++;
        // "Gaiši | zils …" – apstākļa vārdu bez krāsas neatstāj ("Zils viskozes tvills" nozīmētu ko citu); "Mākslīgās | ādas …" –
        // tikai kopā ar nākamo vārdu ("Slīpā diega lenta", ne "Ādas slīpā diega lenta").
        if (ADS_SHADE.test(k) || ADS_KEEP.test(k)) continue;
        if (k.endsWith('u') && /šan(as|ai|ā)$/u.test(adsKey(words[i] || ''))) continue; // "Caurumu | veidošanas …" – tikai abi kopā
        if (/^(formas|veida|tipa)$/u.test(adsKey(words[i] || ''))) continue; // "Spageti | tipa …" – tikai kopā ar "tipa"
        starts.push(i);
      }
      const okStart = (f) => !/^(un|vai|and|or)$/i.test(words[f] || '');
      // Zīmols sākumā paliek: "SCHMETZ šujmašīnu adatas", "BOHIN rullītis 15 cm".
      if (brand) {
        // Aprakstā – tas, kas aptver vairāk ("SCHMETZ adatas ādai", ne "SCHMETZ šujmašīnu adatas"); nosaukumā – pirmais derīgais
        // (atlikums paliek aprakstam).
        let best = -1;
        for (const f of starts) {
          if (!okStart(f)) continue;
          const t = fit([words[0], ...words.slice(f)]);
          if (t.length < min || t.split(' ').length < 2) continue;
          const reach = f + t.split(' ').length - 1;
          if (reach > best) { best = reach; text = t; skip = f - 1; }
          if (!strict) break;
        }
      }
      for (const f of brand ? [] : starts) {
        if (text) break;
        if (!okStart(f)) continue;
        const t = fit(words.slice(f));
        if (t.length >= min && wordy(t)) { text = t; from = f; }
      }
      if (!text && (strict ? head : wordy(head))) text = head;
      if (!text) text = fit(words, true);
      if (strict && text.length < min && text !== head) text = ''; // "Skaistām" no "skaistām un vienmērīgām …"
      if (!text && strict) return { text: '', rest: s, dropped: '' };
      if (!text || (!strict && !wordy(text))) {
        // Vecā kārtība: pa vārdiem, skaitlis netiek atrauts no mērvienības, beigās nav "izmēri" bez vērtības.
        let n = 0;
        let len = 0;
        while (n < words.length && len + (n ? 1 : 0) + words[n].length <= max) { len += (n ? 1 : 0) + words[n].length; n++; }
        const n0 = n;
        while (n > 1 && (adsSplitsNumber(words, n, dangling) || ADS_LABEL.has(adsKey(words[n - 1])))) n--;
        text = tidy(words.slice(0, n || n0).join(' '));
      }
    }
  }
  if (!text) return { text: '', rest: s, dropped: '' };
  let dropped = '';
  let restStart;
  if (skip) {
    dropped = words.slice(1, 1 + skip).join(' ');
    const kept = text.split(' ').length; // zīmols + vārdi no words[1 + skip]
    restStart = words.slice(0, 1 + skip + kept - 1).join(' ').length;
  } else {
    dropped = words.slice(0, from).join(' ');
    restStart = (from ? dropped.length + 1 : 0) + text.length;
    if (/\s(un|vai)$/u.test(dropped)) dropped = ''; // "Auduma un" (ādas caurumotājs) – aprakstam neder
  }
  let rest = s.slice(restStart).replace(/^[\s,;:\-–/)·]+/u, '').trim();
  // "… trikotāža ar vilnu | un ģeometrisku rakstu" → "ar ģeometrisku rakstu" (tas pats prievārds, ne "Ģeometrisku rakstu").
  if (/^(un|vai)\s/u.test(rest)) {
    const kept = text.split(' ');
    for (let i = kept.length - 2; i >= Math.max(0, kept.length - 4); i--) {
      if (/[,;:]$/.test(kept[i])) break;
      if (ADS_PREP.has(kept[i].toLowerCase())) { rest = `${kept[i].toLowerCase()} ${rest.replace(/^\S+\s+/u, '')}`; break; }
    }
  }
  for (let w = rest.split(' '); w.length > 1 && ADS_LEAD_DROP.has(w[0].toLowerCase()); w = rest.split(' ')) rest = w.slice(1).join(' ');
  return { text, rest: dropStrays(rest), dropped };
}

// ---------- Contextual keywords (Google Ads Custom) ----------
// Dati: data/google-ads-atslegvardi.json – no Edgara atslēgvārdu tabulas (Mega 2 klasteris), rakstība 1:1.
//  grupas: { "<preču grupa>": { kolekcijas[], kategorijas[], nosaukums[] (regex), nav_nosaukums[] (regex),
//            visparigs (bool – grupas vārdi pēdējie), atslegvardi: [ "vārds" | { kw, ja[] (visiem regex jāatbilst), nav[] } ] } }
//  atslegvardi: { "<vārds>": { tips, svarigums (A/B/C), meklejumi } } – kārtošanai.
// Prece ir grupā, ja tā ir kādā grupas kolekcijā, tās kategorija pēc Shopify tipa (_typeCategory, nevis Item category
// no mm-google-shopping etiķetēm) ir grupas kategorijās vai nosaukums
// atbilst grupas regex. Nosacījumus ("ja", "nav") pārbauda pret produkta nosaukumu + to kolekciju nosaukumiem, kas
// minētas kādā grupā (citas kolekcijas, piem. "Jaunumi", netiek ņemtas vērā; arī ne kolekcijas_bez_teksta – plašas
// kolekcijas kā "Dzija adīšanai un tamborēšanai", kuru nosaukums neko nepasaka par konkrēto preci). Kārtība: konkrētās grupas pirms vispārīgās,
// preces nosaukums/īpašība/zīmols, tad lietojums, izstrādājums, pērle; nosacītie pirms vispārīgajiem; A pirms B pirms C;
// vairāk meklējumu pirms mazāk. Ne vairāk kā max vārdu.
const ADS_KW_TYPE = { 'Produkts 1:1': 0, 'Produkts + īpašība': 0, 'Zīmols (mums ir)': 0, 'Lietojums (kam der)': 1,
  'Materiāls → izstrādājums': 2, 'Pērle': 3 };
const ADS_KW_SV = { A: 0, B: 1, C: 2 };
const adsKwCache = new WeakMap();

function adsKwCompile(data) {
  let c = adsKwCache.get(data);
  if (c) return c;
  const re = (x) => new RegExp(x, 'iu');
  const listed = new Set();
  const noText = new Set(data.kolekcijas_bez_teksta || []);
  const groups = Object.entries(data.grupas).map(([name, g]) => {
    for (const h of g.kolekcijas || []) listed.add(h);
    return {
      name, general: !!g.visparigs,
      cols: new Set(g.kolekcijas || []), cats: new Set(g.kategorijas || []),
      onlyCats: g.tikai_kategorijas ? new Set(g.tikai_kategorijas) : null,
      title: (g.nosaukums || []).map(re), notTitle: (g.nav_nosaukums || []).map(re),
      words: g.atslegvardi.map((a) => (typeof a === 'string' ? { kw: a, ja: [], nav: [] }
        : { kw: a.kw, ja: (a.ja || []).map(re), nav: (a.nav || []).map(re) })),
    };
  });
  for (const g of groups) for (const w of g.words) {
    if (!data.atslegvardi[w.kw]) throw new Error(`Contextual keywords: "${w.kw}" nav atslēgvārdu sarakstā`);
  }
  c = { groups, listed, noText, max: data.max || 10 };
  adsKwCache.set(data, c);
  return c;
}

/** Contextual keywords vienam ierakstam: atslēgvārdu masīvs (tukšs, ja neviens neder). */
export function adsKeywords(it, data) {
  if (!data) return [];
  const { groups, listed, noText, max } = adsKwCompile(data);
  const cols = (it._collections || []).filter((x) => listed.has(x.handle));
  const handles = new Set(cols.map((x) => x.handle));
  const title = String(it._productTitle || it._lvTitle || it.name || '');
  const text = [title, ...cols.filter((x) => !noText.has(x.handle)).map((x) => x.title || '').sort()].join(' | ');
  const category = String(it._typeCategory ?? it.category_full ?? '').split(/\s*>>\s*/)[0];
  const found = new Map();
  for (const g of groups) {
    const inGroup = [...g.cols].some((h) => handles.has(h)) || g.cats.has(category) || g.title.some((r) => r.test(title));
    if (!inGroup || (g.onlyCats && !g.onlyCats.has(category)) || g.notTitle.some((r) => r.test(title))) continue;
    for (const w of g.words) {
      if (w.ja.length && !w.ja.every((r) => r.test(text))) continue;
      if (w.nav.some((r) => r.test(text))) continue;
      const m = data.atslegvardi[w.kw];
      const key = [g.general ? 1 : 0, ADS_KW_TYPE[m.tips] ?? 4, w.ja.length ? 0 : 1, ADS_KW_SV[m.svarigums] ?? 3, -(m.meklejumi || 0)];
      const old = found.get(w.kw);
      if (!old || adsKwLess(key, old)) found.set(w.kw, key);
    }
  }
  return [...found].sort((a, b) => (adsKwLess(a[1], b[1]) ? -1 : adsKwLess(b[1], a[1]) ? 1 : 0)).slice(0, max).map(([kw]) => kw);
}
const adsKwLess = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i]; return false; };

// Vārdi, ko Google Ads tekstā noraida (CONFIG.googleAdsCustom.wordSwap): vesels vārds jebkurā rakstībā.
const adsSwapCache = new WeakMap();
function adsSwapRe(c) {
  const words = Object.keys(c.wordSwap || {});
  if (!words.length) return /(?!)/u;
  if (!adsSwapCache.has(c)) {
    adsSwapCache.set(c, new RegExp(`(?<![\\p{L}\\d])(${words.sort((a, b) => b.length - a.length).join('|')})(?![\\p{L}\\d])`, 'giu'));
  }
  const re = adsSwapCache.get(c);
  re.lastIndex = 0;
  return re;
}
function adsSwapWord(w, c) {
  const to = c.wordSwap[w.toLowerCase()];
  if (!to) return w;
  if (w.length > 1 && w === w.toUpperCase()) return to.toUpperCase();
  return w[0] === w[0].toUpperCase() ? upperFirst(to) : to;
}

// Attēls ar augšupielādes ikonu (CONFIG.googleAdsCustom.iconImages): undefined – nav sarakstā; '' – preci neliek;
// citādi – tās pašas preces cita foto adrese (tajā pašā Shopify mapē).
function adsIconFix(url, c) {
  const s = String(url ?? '');
  const file = s.split(/[?#]/)[0].split('/').pop();
  if (!c.iconImages || !Object.hasOwn(c.iconImages, file)) return undefined;
  const alt = c.iconImages[file];
  return alt ? s.split(/[?#]/)[0].replace(/[^/]+$/, alt) : '';
}

// Attēla adrese: tikai https un JPG/PNG/GIF; Shopify CDN – ar platumu imageWidth (Google: līdz 6 milj. pikseļu).
// Shopify CDN – vienmēr ar format=pjpg (JPEG arī klientiem, kas pieņem WebP; skat. CONFIG.googleAdsCustom.shopifyForceJpeg).
function adsImage(url, c) {
  let u;
  try { u = new URL(String(url ?? '').trim()); } catch { return ''; }
  if (u.protocol !== 'https:') return '';
  const shopify = u.hostname === 'cdn.shopify.com' || u.pathname.startsWith('/cdn/shop/');
  if (!shopify) return c.imageExt.test(u.pathname) ? u.toString() : '';
  if (!c.shopifyImageExt.test(u.pathname)) return '';
  if (c.imageWidth) u.searchParams.set('width', String(c.imageWidth));
  if (c.shopifyForceJpeg) u.searchParams.set('format', c.shopifyForceJpeg);
  return u.toString();
}

// Vai attēla adrese der Google: https un JPG/PNG/GIF; Shopify CDN – tikai ar piespiedu JPEG un platumu līdz imageWidth
// (bez tiem PNG/JPG klientiem, kas pieņem WebP, nāk kā WebP, un oriģināls var būt virs 6 milj. pikseļu).
function adsImageOk(url, c) {
  let u;
  try { u = new URL(url); } catch { return false; }
  if (u.protocol !== 'https:') return false;
  const shopify = u.hostname === 'cdn.shopify.com' || u.pathname.startsWith('/cdn/shop/');
  if (!shopify) return c.imageExt.test(u.pathname);
  const width = Number(u.searchParams.get('width'));
  return c.shopifyImageExt.test(u.pathname) && (!c.shopifyForceJpeg || u.searchParams.get('format') === c.shopifyForceJpeg)
    && (!c.imageWidth || (width > 0 && width <= c.imageWidth));
}

// Vai vārdu virkne needle ir haystack kā veseli vārdi ("s" nav "kokvilnas" daļa, "2" nav "25" daļa).
const hasWords = (haystack, needle) => {
  const n = normCmp(needle);
  return !!n && ` ${normCmp(haystack)} `.includes(` ${n} `);
};

/**
 * Item title / Item subtitle / Item description (katrs līdz textMax zīmēm) no Shopify nosaukuma.
 *   Item title – produkta nosaukuma pirmā daļa (līdz " - "), bez sākuma veida vārda ("Dzijas DROPS Air" → "DROPS Air");
 *     ja par garu un vidū ir zināms zīmols ar modeli ("Tamboradatas DROPS Pro Circus, …") – no zīmola (ne tad, ja zīmols
 *     ir piederums citai precei: "pēdiņa priekš Janome …", un ne apģērbiem: "Priekšauts … SOL’S"); apdrukas precēm –
 *     preces veids + dizaina nosaukums pēdiņās; tad saīsināts pa frāzēm / vārdiem tā, lai preces vārds nepazūd
 *     ("Dekoratīvas vistas spalvas …" → "Vistas spalvas 6-20 cm", nevis "Dekoratīvas vistas"; skat. fitText).
 *   Item subtitle – varianta nosaukums (krāsa, izmērs), ja tas nav tieši tāds pats kā nosaukums.
 *   Item description – pirmais no: dizaina sauklis (vesels teikums), daļa pirms zīmola (+ daļa pēc " - "), nosaukuma
 *     atmestā daļa + daļa pēc " - " ("Traktors, tumši zils"), daļa pēc " - ", daļa pirms zīmola, atmestā daļa, izlaistie
 *     sākuma vārdi ("Organiskās kokvilnas"), kategorija; neatkārto virsrakstu vai apakšvirsrakstu.
 * Ja viss Shopify teksts ir ar lielajiem burtiem ("BALTA"), tas kļūst par teikumu ("Balta"); zīmoli (DROPS, SCHMETZ) un
 * kodi (XL, 90/14) paliek. Ja Shopify tekstā ir arī mazie burti, lielie burti paliek (zīmols, modelis) – validators brīdina.
 * ctx: { brandRe, brandCase, stats } no toGoogleAdsCustomCsv. Atgriež null, ja nosaukumu nevar saīsināt bez pārgriezta vārda.
 */
function adsTexts(it, cfg, ctx) {
  const c = cfg.googleAdsCustom;
  const max = c.textMax;
  const { brandRe, brandCase } = ctx;
  const fctx = { dangling: new Set(c.danglingWords), stats: ctx.stats, brands: new Set([...brandCase.keys(), String(it.brand || '').toUpperCase()]) };
  const dangling = fctx.dangling;
  const typeRe = cfg.apparel?.typePattern;
  const notes = [];
  const clean = (s) => noEmoji(String(s ?? '').replace(/<[^>]*>/g, ' ').replace(new RegExp(ADS_EMOJI.source, 'gv'), ' ')
    .replace(new RegExp(ADS_DECOR.source, 'gu'), ' '))
    .replace(/([!?])[!?]+/g, '$1')
    .replace(/[�\u0080-\u009F]/g, ' ')
    .replace(/…(?=["”“»]?\s*$)/u, '') // daudzpunkte beigās izskatītos pēc pārgriezta teksta ("Jē… skola" paliek)
    .replace(/(\S)\s+(["”“»])(?=$|[\s,.;:!?)])/gu, '$1$2') // '"Made with love "' → '"Made with love"'
    .replace(/(\p{L})"\s+(?=\p{L}[^"]*"(?:\s|$))/gu, (m0, a, i, str) => ((str.slice(0, i).match(/"/g) || []).length % 2 ? m0 : `${a} "`))
    // ↑ 'T-krekls" Tētis dara tēta lietas"' → 'T-krekls "Tētis dara tēta lietas"' (taisnā pēdiņa, kas atver, pielipusi vārdam)
    .replace(/“([^“”"„]+)"(?=$|[\s,.;:!?)])/gu, '“$1”') // '“Te ir manas mājas"' → '“Te ir manas mājas”'
    .replace(/\)-(?=\s*\d)/g, ') - ') // "(kārsums)-5 g" → "(kārsums) - 5 g"
    .replace(/–/g, '-')
    .replace(/(\p{L})-\s+(?!(?:un|vai|ir|and|or)\s)/gu, '$1 - ') // "sprādze- lāča" → " - "; "Lina- un kokvilnas" paliek
    .replace(/^[\s,;:\-–/·]+/u, '') // varianta "- #1000" → "#1000"
    .replace(/^\d{1,2}\.\s+(?=\p{Lu})/u, '') // numurs sarakstā: "1. Dabīgā liellopa āda" → "Dabīgā liellopa āda"
    .replace(/\s+/g, ' ').trim()
    .replace(adsSwapRe(c), (w) => adsSwapWord(w, c)); // "TEXI Diska nazis" → "TEXI Diska griezējs" (skat. wordSwap)
  // Neaizvērta pēdiņa beigās ('T-krekls “Chaotic Barbie Mood') – aizver.
  const closeQuote = (s) => {
    const { cut } = bracketScan(s);
    const pair = { '„': '“', '“': '”', '"': '"', '«': '»' }[s[cut]];
    return cut >= 0 && pair && bracketScan(`${s}${pair}`).cut < 0 ? `${s}${pair}` : s;
  };
  const fixCaps = (s, what, src) => {
    if (!isAllCaps(s) || brandCase.has(s.toUpperCase())) return s;
    notes.push(`${what}: lielie burti`);
    const keep = (w) => brandCase.get(w.toUpperCase()) ?? (ADS_CODE.test(w) ? w : null);
    // Viss Shopify teksts ar lielajiem burtiem ("BALTA LENTE") → teikums ("Balta lente"). Tikai daļa ("Šķēres … - TEXI
    // TITANIUM CRAFT") – tas ir nosaukums: vārdi no 4 burtiem ar lielo sākumburtu ("Texi Titanium Craft"), īsie (LED) paliek.
    if (isAllCaps(src)) return upperFirst(s.split(' ').map((w) => keep(w) ?? w.toLowerCase()).join(' '));
    return s.split(' ').map((w) => keep(w) ?? ((w.match(/\p{L}/gu) || []).length >= 4
      ? w.toLowerCase().replace(/\p{L}/u, (x) => x.toUpperCase()) : w)).join(' ');
  };
  // Sauklis pēdiņās netiek pārgriezts teikuma vidū ("Supervaronim nevajag"): viss vai pirmais teikums, kas ietilpst.
  const sentence = (q) => {
    if (q.length <= max) return q;
    for (const sn of q.split(/(?<=[.!?…])\s+/u)) if (sn.length >= 8 && sn.length <= max) return sn;
    return '';
  };
  const full = closeQuote(clean(it._productTitle || it._baseName || it.name));
  let parts = titleParts(full);
  if (parts.length > 1 && parts[0].length < 5 && !parts[0].includes(' ')) parts = [`${parts[0]} - ${parts[1]}`, ...parts.slice(2)]; // "O - riņķis", "Hot - Fix"
  let head = parts[0] || '';
  const tail = parts.slice(1).join(' - ');
  let before = '';
  let quoteDropped = '';
  let quoteAfter = ''; // vārdi starp preces veidu un dizainu ("T-krekls | organiskās kokvilnas | “Super mamma”")
  let quoteType = '';
  const lead = head.match(c.leadingTypeWords);
  if (lead && head.length > lead[0].length) { head = head.slice(lead[0].length); notes.push('bez veida vārda'); }
  // Apdrukas preces (apģērbi, pēc pasūtījuma): dizaina nosaukums pēdiņās ir svarīgākais. Ar preces veidu, ja ietilpst
  // ("Bērnu T-krekls ar īsām piedurknēm “Mazais pūķis”" → "T-krekls “Mazais pūķis”", "Organiskās kokvilnas T-krekls “TĒTI”"
  // → "Kokvilnas T-krekls “TĒTI”"), citādi vārdi tieši pirms pēdiņām (bez sākuma prievārda) vai tikai pēdiņas.
  // Izlaistie sākuma vārdi ("Organiskās kokvilnas") – aprakstam.
  const quote = head.length > max && (it._apparel || it._madeToOrder) ? head.match(/[“„"«][^“”„"«»]+[”"»“]$/u) : null;
  let design = '';
  if (quote && quote[0].length > max) {
    // Dizaina nosaukums par garu ("“Tētis zina visu. Ja nezina - izdomās.”"): nosaukumā – preces veids, aprakstā – dizaina sākums.
    const words = head.slice(0, quote.index).trim().split(' ').filter(Boolean);
    const ti = typeRe ? words.findIndex((w) => typeRe.test(w)) : -1;
    if (ti >= 0) {
      let j = 0;
      while (j < ti && words.slice(j, ti + 1).join(' ').length > max) j++;
      // Ja sauklis aprakstā neietilpst, apzīmētāju neatmet pa pusei: "Organiskās | kokvilnas T-krekls" → "T-krekls", aprakstā
      // "Organiskās kokvilnas"; ja ietilpst – "Kokvilnas T-krekls" + sauklis.
      if (j > 0 && j < ti && !sentence(quote[0].slice(1, -1).trim())) j = ti;
      head = words.slice(j, ti + 1).join(' ');
      quoteDropped = words.slice(0, j).join(' ');
      quoteAfter = words.slice(ti + 1).join(' ');
      quoteType = words.slice(0, ti + 1).join(' ');
      design = quote[0].slice(1, -1).trim();
      notes.push('nosaukums saīsināts', 'dizains aprakstā');
    }
  } else if (quote) {
    const words = head.slice(0, quote.index).trim().split(' ').filter(Boolean);
    const fits = (ws) => `${ws.join(' ')} ${quote[0]}`.trim().length <= max;
    const ti = typeRe ? words.findIndex((w) => typeRe.test(w)) : -1;
    // Preces veids ar tik daudz vārdiem pirms tā, cik ietilpst; ja veida nav vai neietilpst – vārdi tieši pirms pēdiņām.
    const end = ti >= 0 && fits([words[ti]]) ? ti + 1 : words.length;
    let j = 0;
    while (j < end && !fits(words.slice(j, end))) j++;
    // Apzīmētāju neatmet pa pusei: "Organiskās | kokvilnas T-krekls “TĒTI”" → "T-krekls “TĒTI”", aprakstā "Organiskās kokvilnas".
    if (ti >= 0 && end === ti + 1 && j > 0 && j < ti) j = ti;
    let keep = words.slice(j, end);
    while (keep.length && dangling.has(keep[0].toLowerCase())) keep = keep.slice(1);
    // Tikai krāsa vai īpašības vārds bez preces veida ("Priekšauts tumši | zaļš “Slepenā recepte”") – labāk tikai dizains,
    // preces veids un krāsa – aprakstā.
    if (keep.length && keep.every((w) => (adsAdj(adsKey(w)) && !ADS_NOT_ADJ.test(adsKey(w))) || ADS_COLOR.test(adsKey(w)))) {
      keep = [];
      j = end;
    }
    head = `${keep.join(' ')} ${quote[0]}`.trim();
    quoteDropped = words.slice(0, j).join(' '); // "Organiskās kokvilnas", "Bērnu kokvilnas T-krekls"
    quoteAfter = words.slice(end).join(' ');
    if (ti >= 0 && keep.length) quoteType = words.slice(0, ti + 1).join(' ');
    notes.push('nosaukums saīsināts', 'dizaina nosaukums paturēts');
  }
  let brandUsed = false;
  if (head.length > max && brandRe) {
    const m = brandRe.exec(head);
    const pre = m ? head.slice(0, m.index).replace(/[\s,;:\-–]+$/u, '') : '';
    const preWords = pre.split(' ');
    // "pēdiņa priekš Janome …", "adatas ar SCHMETZ …" – zīmols ir mašīnai / sastāvdaļai, ne precei.
    const accessory = dangling.has(preWords[preWords.length - 1].toLowerCase());
    // Aiz zīmola – modelis ar lielo burtu ("DROPS Pro Circus", "YarnArt Camellia"); "DROPS 40 cm", "DROPS alumīnija" – nav.
    const [m1, m2] = m ? head.slice(m.index + m[0].length).trim().split(' ') : [];
    const model = !!m1 && (/^\p{Lu}/u.test(m1) || (/\d/.test(m1) && !ADS_NUM.test(m1.replace(/[,;:]$/, '')) && !ADS_UNIT.test(m2 || ''))
      || /^\d+\/\d+/.test(m1)); // "SCHMETZ 130/705 H ZWI"; "DROPS 40 cm" – nav
    if (m && m.index > 0 && !accessory && model) {
      const fromBrand = fitText(head.slice(m.index), max, fctx);
      // Apģērbam tikai zīmols + modelis ("SOL’S GALA") – nosaukumā labāk apģērba veids ("Priekšauts ar kabatām").
      const brandOnly = !!typeRe && typeRe.test(pre) && fromBrand.text.split(' ').length <= 2;
      if (fromBrand.text.length >= 8 && !brandOnly) {
        before = pre;
        head = head.slice(m.index);
        brandUsed = true;
        notes.push('nosaukums no zīmola');
      }
    }
  }
  const t = fitText(head, max, fctx);
  if (!t.text) return null;
  if (t.rest || t.dropped) notes.push('nosaukums saīsināts');
  if (t.dropped) notes.push('sākuma vārdi aprakstam');
  const title = fixCaps(upperFirst(t.text), 'nosaukums', full);

  let subtitle = '';
  if (it._variantTitle) {
    const src = clean(it._variantTitle);
    const s = fitText(src, max, fctx);
    if (s.rest || s.dropped || !s.text) notes.push('apakšvirsraksts saīsināts');
    subtitle = fixCaps(upperFirst(s.text), 'apakšvirsraksts', src);
    // Tikai, ja tieši tāds pats kā nosaukums: citādi variantus (S un L, 2,5 mm un 5 mm) reklāmā nevarētu atšķirt.
    if (subtitle && normCmp(subtitle) === normCmp(title)) { subtitle = ''; notes.push('apakšvirsraksts = nosaukums'); }
  }

  // Divas daļas kopā ("traktors" + "tumši zils" → "traktors, tumši zils"); daļa iekavās – bez iekavām ("(kārsums)" → "kārsums").
  const unwrap = (x) => String(x || '').trim().replace(/^\(([^()]*)\)(?=$|[\s,;])/u, '$1'); // "(hotfix), 4 mm" → "hotfix, 4 mm"
  const join = (a, b) => (unwrap(a) && unwrap(b) ? `${unwrap(a).replace(/[\s,;:\-–]+$/u, '')}, ${unwrap(b)}` : '');
  const category = String(it.category_full || '').split(/\s*>>\s*/).filter(Boolean).pop() || '';
  // Atmestie sākuma vārdi ("Organiskās kokvilnas", "Ziemassvētku", "Filcēšanas") – informatīvāki par kategoriju, bet ne viens
  // pats īpašības vārds vai krāsa ("Organiskās", "Sarkana").
  const droppedPhrase = (x) => {
    const w = String(x || '').replace(/[\s,;:\-–]+$/u, '').split(' ').filter(Boolean);
    return !w.length || (w.length === 1 && (adsAdj(adsKey(w[0])) || ADS_COLOR.test(adsKey(w[0])))) ? '' : w.join(' ');
  };
  // Viens atmests īpašības vārds ("Magnētiskais", "Ūdensizturīgs") – kopā ar atlikumu, ja ietilpst viss ("Magnētiskais, apaļš"),
  // vai viens pats pirms kategorijas. Krāsa – nē (redzama attēlā / variantā).
  const dw = String(t.dropped || '');
  const nextW = adsKey(String(t.text || '').split(' ')[t.dropped && /^\p{Lu}{2,}/u.test(t.text) ? 1 : 0]);
  const oneAdj = /^\S+$/u.test(dw) && adsAdj(adsKey(dw)) && !ADS_NOT_ADJ.test(adsKey(dw)) && !ADS_COLOR.test(adsKey(dw))
    && /(s|š|a|i|ais|ie|as|ās)$/u.test(adsKey(dw)) && !(ADS_MATERIAL_ADJ.test(adsKey(dw)) && /ās$/u.test(adsKey(dw)) && /as$/u.test(nextW))
    ? dw : ''; // ne "Organiskās" (kokvilnas), bet "Apvelkamās" (pogas)
  const restShort = String(t.rest || '').length <= 12;
  const keepD = String(t.dropped || '').split(' ').some((x) => ADS_KEEP.test(adsKey(x))) ? droppedPhrase(t.dropped) : '';
  const cands = [
    [sentence(design), 'design'],
    [design && !/[.!?…]/u.test(design) ? design : '', 'designfit'], // "Nošu un latviskā raksta dizains" → "Latviskā raksta dizains"
    [brandUsed ? join(before, tail) : '', ''],
    // Atmests "Sintētiskā ahāta" / "Mākslīgās ādas" – aprakstā obligāti (bez tā nosaukums maldina).
    [keepD ? join(keepD, t.rest || tail) : '', 'whole'],
    [keepD && !/[“„"«]/u.test(`${t.rest} ${tail}`) ? keepD : '', 'whole'], // dizaina nosaukums pēdiņās svarīgāks (Opry etiķetes)
    [oneAdj && t.rest ? join(oneAdj, t.rest.split(/,\s+/u)[0]) : '', 'whole'], // "Pašlīmējošs, 10 × 18 cm" – atmestā īpašība svarīgāka par toņiem
    [join(t.rest, tail), 'whole'],
    [oneAdj && restShort ? join(oneAdj, t.rest) : '', 'whole'], // "Magnētiskais, apaļš"
    [oneAdj && !t.rest ? join(oneAdj, tail) : '', 'whole'], // "Ūdensizturīgs, balts"
    [join(t.rest, tail), ''],
    [unwrap(tail), ''],
    [unwrap(before), ''],
    [unwrap(t.rest), ''],
    [quoteDropped && quoteType ? quoteType : '', 'whole'], // "Bērnu T-krekls", "Kokvilnas auduma maisiņš"
    [droppedPhrase(t.dropped || quoteDropped), ''],
    [unwrap(quoteAfter), ''], // "ar apdruku", "organiskās kokvilnas"
    [oneAdj, 'whole'],
    [String(t.rest || tail).split(/,\s+/u).slice(1).join(', '), ''], // aiz komata: "27 mm, 40 gab.", "violeta Sew Tasty"
    [clean(category), 'kategorija'],
    [unwrap(tail || t.rest), 'loose'], // "Trīs dekoratīvo lentīšu" – labāk nekā tukšs apraksts
  ];
  let description = '';
  // Tikai kodi ("16x231 SES SERV 7") – tikai tad, ja nekā cita nav (vispirms meklē tekstu ar vārdiem: "SCHMETZ adatas trikotāžai").
  const codesOnly = (x) => !/\p{Ll}{3,}/u.test(x) && /\d[x×]\d|\p{Lu}{2,}\d|\p{Lu}\p{L}*x\d/u.test(x);
  for (const pass of [0, 1]) {
    for (const [cand, kind] of cands) {
      if (!cand || description) continue;
      // Sauklis pēdiņās ('“Šajā maisiņā dzīvo jauni projekti”') – vesels teikums vai nekas.
      const q = kind ? null : cand.match(/^[“„"«]([^“”„"«»]+)[”"»“]$/u);
      const d = kind === 'design' ? { text: cand, rest: '' }
        : kind === 'whole' ? { text: cand.length <= max ? cand : '', rest: '' }
          : q ? { text: sentence(cand) || (sentence(q[1]) ? `${cand[0]}${sentence(q[1])}${cand[cand.length - 1]}` : ''), rest: '' }
            : fitText(cand, max, fctx, kind !== 'loose');
      if (!d.text || d.text.length > max || (kind === 'loose' && !d.text.includes(' '))) continue;
      // Dizaina nosaukumu nepārgriež ("Mūsu satikšanos | rakstīja zvaigznes") un neatmet tā sākumu ("Šajā maisiņā | dzīvo …"),
      // izņemot vienrangu locekļus ("Nošu un | latviskā raksta dizains").
      if (kind === 'designfit' && (d.rest || d.dropped)) continue;
      if (hasWords(title, d.text) || (subtitle && normCmp(d.text) === normCmp(subtitle))) continue;
      if (!pass && kind !== 'kategorija' && codesOnly(d.text)) continue;
      if (d.rest || d.dropped) notes.push('apraksts saīsināts');
      if (kind === 'kategorija') notes.push('apraksts = kategorija');
      description = fixCaps(upperFirst(d.text), 'apraksts', kind === 'kategorija' ? cand : full);
    }
  }
  return { title, subtitle, description, notes, source: full + (it._variantTitle ? ` | ${clean(it._variantTitle)}` : '') };
}

/**
 * Google Ads dinamiskā remarketinga plūsma "Pielāgoti" (Custom), CSV latviski, no buildItems ierakstiem (visi
 * varianti, kā google-lv.xml). Izslēdz tāpat kā toGoogleXml (ar defektu, bez attēla, metrā ar nezināmu atlikumu,
 * dubulta saite) un papildus: CONFIG.googleAdsCustom.excludeProductTypes, attēls nav JPG/PNG/GIF, nosaukumu nevar
 * saīsināt. Atkārtots ID – kļūda (Google: "IDs must be unique").
 * Atgriež { csv, stats, report, excluded } – report: rindas, kurās teksts saīsināts vai mainīts (Edgara pārbaudei);
 * excluded: katrs izlaistais ieraksts ar iemeslu.
 */
export function toGoogleAdsCustomCsv(items, cfg = CONFIG, opts = {}) {
  const c = cfg.googleAdsCustom;
  const stats = { items: 0, decimal: 0, sale: 0, skipped: {}, notes: {},
    with: { subtitle: 0, description: 0, category: 0, formatted_price: 0 } };
  let cur = null;
  const skip = (why) => {
    stats.skipped[why] = (stats.skipped[why] || 0) + 1;
    excluded.push({ id: String(cur._variantId ?? ''), source: cur._baseName || cur.name || '', reason: why });
  };
  const brands = [...new Set(cfg.titleBrands)].sort((a, b) => b.length - a.length)
    .map((b) => b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'));
  const brandRe = brands.length ? new RegExp(`(?<![\\p{L}\\d])(${brands.join('|')})(?![\\p{L}\\d])`, 'u') : null;
  const brandCase = new Map(cfg.titleBrands.map((b) => [b.toUpperCase(), b])); // PRYM → Prym
  // Kuri vārdi kataloga nosaukumos ir preces vārdi un kuri – apzīmētāji (skat. adsWordStats, adsPhraseEnd)
  // opts.wordStats – cita kataloga statistika (pārbaudēm ar dažām precēm)
  const wordStats = opts.wordStats || adsWordStats([...new Set(items.map((it) => it._productTitle || it._baseName || it.name))]);
  const prefix = `${cfg.shopUrl}/products/`;
  const fmt = (n) => `${money(n).replace('.', ',')} €${c.perMetre}`;
  const seenIds = new Set();
  const seenLinks = new Set();
  const report = [];
  const excluded = []; // { id, source, reason } – katrs izlaistais ieraksts (atskaitei)
  const lines = [c.columns.map(csvField).join(',')];

  for (const it of items) {
    cur = it;
    if (it.used === '1') { skip('ar defektu / demo / lietota'); continue; }
    if (c.excludeProductTypes.includes(it._productType)) { skip(`tips ${it._productType}`); continue; }
    if (it._decimal && it.in_stock === '') { skip('metrā tirgota, atlikums nav zināms'); continue; }
    const id = String(it._variantId ?? '');
    if (!/^[0-9]+$/.test(id)) { skip('ID nav tikai cipari'); continue; }
    if (!String(it.link || '').startsWith(prefix)) { skip('saite nav preces lapa'); continue; }
    if (seenLinks.has(it.link)) { skip('dublikāts (saite)'); continue; }
    if (!it.image) { skip('nav attēla'); continue; }
    const iconFix = adsIconFix(it.image, c);
    if (iconFix === '') { skip('attēlā augšupielādes ikona, foto bez ikonas nav (Google: maldinošs dizains)'); continue; }
    const image = adsImage(iconFix ?? it.image, c);
    if (!image) { skip('attēls nav JPG/PNG/GIF/WebP'); continue; }
    if (!(it._priceNum > 0)) { skip('cena 0'); continue; }
    const t = adsTexts(it, cfg, { brandRe, brandCase, stats: wordStats });
    if (!t) { skip(`nosaukumu nevar saīsināt līdz ${c.textMax} zīmēm`); continue; }
    if (seenIds.has(id)) throw new Error(`Google Ads Custom: ID ${id} atkārtojas`);

    const sale = it._compareAt != null && it._compareAt > it._priceNum + 0.004;
    const price = sale ? it._compareAt : it._priceNum;
    const category = noEmoji(String(it.category_full || '').split(/\s*>>\s*/)[0] || '')
      .replace(adsSwapRe(c), (w) => adsSwapWord(w, c));
    const row = [
      id, t.title, t.subtitle, t.description, category, it.link, image,
      `${money(price)} ${c.currency}`,
      sale ? `${money(it._priceNum)} ${c.currency}` : '',
      it._decimal ? fmt(price) : '',
      it._decimal && sale ? fmt(it._priceNum) : '',
      // Contextual keywords: tikai no Edgara atslēgvārdu tabulas (1:1), skat. adsKeywords un data/google-ads-atslegvardi.json
      adsKeywords(it, opts.keywords).join('; '),
    ];
    const bad = adsRowCheck(row, cfg).errors;
    if (bad.length) { skip(`rinda neiziet pārbaudi: ${bad[0].replace(/:.*$/, '')}`); continue; }
    seenIds.add(id);
    seenLinks.add(it.link);
    lines.push(row.map(csvField).join(','));

    stats.items++;
    if (it._decimal) stats.decimal++;
    if (sale) stats.sale++;
    if (iconFix) stats.notes['attēls bez ikonas'] = (stats.notes['attēls bez ikonas'] || 0) + 1;
    if (t.subtitle) stats.with.subtitle++;
    if (t.description) stats.with.description++;
    if (category) stats.with.category++;
    if (row[9]) stats.with.formatted_price++;
    if (row[11]) stats.with.keywords = (stats.with.keywords || 0) + 1;
    for (const n of t.notes) stats.notes[n] = (stats.notes[n] || 0) + 1;
    if (t.notes.some((n) => n !== 'bez veida vārda')) {
      report.push({ id, source: t.source, title: t.title, subtitle: t.subtitle, description: t.description, notes: t.notes.join('; ') });
    }
  }
  return { csv: `${lines.join('\n')}\n`, stats, report, excluded };
}

/**
 * Pārbauda gatavu Custom CSV pret Google noteikumiem (6053288, sadaļa Custom) un šī repo noteikumiem.
 * Atgriež { rows, errors[], errorCount, warnings[] }. errors – fails nav publicējams; warnings – jāizskata.
 */
export function validateGoogleAdsCustomCsv(csv, cfg = CONFIG) {
  const c = cfg.googleAdsCustom;
  const errors = [];
  const warnings = [];
  let errorCount = 0;
  let warningCount = 0;
  const err = (where, msg) => { errorCount++; if (errors.length < 100) errors.push(where ? `${where}: ${msg}` : msg); };
  const warn = (where, msg) => { warningCount++; if (warnings.length < 100) warnings.push(`${where}: ${msg}`); };
  const text = String(csv ?? '');
  if (text.charCodeAt(0) === 0xfeff) err('', 'fails sākas ar BOM');
  if (/[\uFFFD]/.test(text)) err('', 'fails satur bojātas UTF-8 rakstzīmes (U+FFFD)');
  const rows = parseCsv(text);
  const header = rows.shift() || [];
  if (header.join('\u0001') !== c.columns.join('\u0001')) err('', `galvene neatbilst: ${header.join(',')}`);
  const ids = new Set();
  rows.forEach((r, i) => {
    const where = `rinda ${i + 2}${r[0] ? ` (ID ${r[0]})` : ''}`;
    const check = adsRowCheck(r, cfg);
    for (const e of check.errors) err(where, e);
    for (const w of check.warnings) warn(where, w);
    if (r.length !== c.columns.length || !/^[0-9]+$/.test(r[0])) return;
    if (ids.has(r[0])) err(where, 'ID atkārtojas');
    ids.add(r[0]);
  });
  return { rows: rows.length, errors, errorCount, warnings, warningCount };
}

/**
 * Vienas Custom CSV rindas pārbaude (bez ID unikalitātes): { errors[], warnings[] }. To pašu izmanto toGoogleAdsCustomCsv –
 * rinda, ko pārbaude noraidītu, failā netiek likta (citādi viena slikta prece apturētu visu failu).
 */
function adsRowCheck(r, cfg) {
  const c = cfg.googleAdsCustom;
  const errors = [];
  const warnings = [];
  if (r.length !== c.columns.length) return { errors: [`${r.length} kolonnas, nevis ${c.columns.length}`], warnings };
  const [id, title, subtitle, description, category, url, image, price, salePrice, fPrice, fSale, keywords] = r;
  const priceRe = new RegExp(`^\\d+\\.\\d{2} ${c.currency}$`);
  const brands = new Set(cfg.titleBrands.map((b) => b.toUpperCase()));
  if (!/^[0-9]+$/.test(id)) errors.push('ID nav tikai cipari');
  if (!title.trim()) errors.push('tukšs Item title');
  for (const [name, val, max] of [['Item title', title, c.textMax], ['Item subtitle', subtitle, c.textMax],
    ['Item description', description, c.textMax], ['Formatted price', fPrice, c.formattedMax],
    ['Formatted sale price', fSale, c.formattedMax]]) {
    if (val.length > max) errors.push(`${name} garāks par ${max} zīmēm (${val.length})`);
    if (val !== val.trim()) errors.push(`${name} ar atstarpi sākumā vai beigās`);
  }
  for (const [name, val] of [['Item title', title], ['Item subtitle', subtitle], ['Item description', description],
    ['Item category', category], ['Contextual keywords', keywords]]) {
    if (/[\r\n\t]/.test(val)) errors.push(`${name}: rindas pārnesums`);
    if (/[\u0000-\u001F\u007F-\u009F\uFFFD]/.test(val)) errors.push(`${name}: vadības vai bojāta rakstzīme`);
    if (/<\/?[a-z!][^>]*>/i.test(val)) errors.push(`${name}: HTML`);
    if (ADS_EMOJI.test(val)) errors.push(`${name}: emocijzīme`);
    if (ADS_DECOR.test(val) || /[!?]{2,}/.test(val)) errors.push(`${name}: triku zīmes ("!!", "★")`);
    if (/Default Title/i.test(val)) errors.push(`${name}: "Default Title"`);
    if (/…$/.test(val)) errors.push(`${name}: daudzpunkte (pārgriezts teksts)`);
    if (/(?<!\p{L})(bezmaksas|free|tikai šodien|labākā cena)(?!\p{L})/iu.test(val)) warnings.push(`${name}: reklāmas frāze: ${val}`);
    if (name !== 'Contextual keywords' && adsSwapRe(c).test(val)) errors.push(`${name}: vārds, ko Google noraida (wordSwap)`);
    // Tikai zīmols un kodi ("SCHMETZ", "SCHMETZ 134") – nav brīdinājums.
    if (isAllCaps(val) && !val.split(' ').every((w) => brands.has(w.toUpperCase()) || ADS_CODE.test(w))) {
      warnings.push(`${name} tikai ar lielajiem burtiem: ${val}`);
    }
  }
  if (!url.startsWith(`${cfg.shopUrl}/products/`)) errors.push('Final URL nav veikala preces lapa');
  if (/\s/.test(image) || !adsImageOk(image, c)) errors.push('Image URL nav https JPG/PNG/GIF (Shopify – ar width un format=pjpg)');
  if (adsIconFix(image, c) !== undefined) errors.push('Image URL: attēls ar augšupielādes ikonu (iconImages)');
  if (!priceRe.test(price) || !(parseFloat(price) > 0)) errors.push(`Price formāts: ${price}`);
  if (salePrice && (!priceRe.test(salePrice) || !(parseFloat(salePrice) < parseFloat(price)))) errors.push(`Sale price: ${salePrice}`);
  if (fSale && !salePrice) errors.push('Formatted sale price bez Sale price');
  if (fSale && !fPrice) errors.push('Formatted sale price bez Formatted price');
  return { errors, warnings };
}

export function toXml(items, cfg = CONFIG) {
  const out = ['<?xml version="1.0" encoding="utf-8" ?>', '<root>'];
  for (const it of items) {
    if (it._portalSkip) continue; // cits tās pašas krāsas izmērs
    out.push('<item>');
    for (const tag of TAG_ORDER) {
      const val = tag === 'category_full' ? portalCategory(it, cfg) : it[tag];
      if (val === '' || val == null) continue;
      out.push(`<${tag}>${escapeXml(val)}</${tag}>`);
    }
    out.push('</item>');
  }
  out.push('</root>', '');
  return out.join('\n');
}
