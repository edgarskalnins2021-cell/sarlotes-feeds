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
  usedPattern: /(ar defektu|defekts|bojāt|lietot[aāsi]\b|\bdemo\b|ekspozīcij)/i,

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
    leadingTypeWords: /^(dzijas|dzija)\s+(?=\p{Lu})/iu,
    // Metrā tirgotās preces: Price = cena par 1 m, Formatted price "18,90 € / m".
    perMetre: ' / m',
    // Vārdi, ar kuriem saīsināts teksts nedrīkst beigties ("Lente ar" → "Lente").
    danglingWords: ['un', 'ar', 'no', 'uz', 'par', 'bez', 'pie', 'pēc', 'līdz', 'priekš', 'vai', 'ir', 'kā', 'ko', 'pret', 'starp', 'nr.', 'nr', 'ø', '⌀',
      'and', 'with', 'for', 'of', 'the', 'in', 'on', 'to', 'x', '×'],
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
  const skip = (why) => { stats.skipped[why] = (stats.skipped[why] || 0) + 1; };
  const seenNames = new Set();
  const items = [];
  const tags = tagStats(products);
  const groups = new Map(); // apģērbi: produkts + opcijas bez izmēra → tās pašas krāsas izmēri
  const mtoDays = cfg.madeToOrder?.productionDays || [0, 0];

  for (const p of products) {
    if (p.onlineStore === false) { skip('nav publicēts veikalā'); continue; }
    if (p.isGiftCard || cfg.excludeProductTypes.includes(p.productType)) {
      skip(p.isGiftCard || p.productType === 'Dāvanu kartes' ? 'dāvanu karte' : `tips ${p.productType}`);
      continue;
    }
    if (cfg.excludeTitlePattern?.test(p.title)) { skip('T-krekli/džemperi'); continue; }
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
      if (!v.requiresShipping) { skip('digitāla prece'); continue; }
      if (!(v.price > 0)) { skip('cena 0'); continue; }
      if (mto) {
        // Pēc pasūtījuma: atlikums nav gatavu preču daudzums. Izlaižam tikai, ja Shopify šo variantu pasūtīt neļauj.
        if (v.tracked !== false && v.qty != null && v.qty <= 0 && v.inventoryPolicy !== 'CONTINUE') { skip('0 atlikums'); continue; }
        // Publiskais /products.json (rezerves avots): uzskaites nav, der tikai "available".
        if (v.tracked == null && v.qty == null && v.available === false) { skip('0 atlikums'); continue; }
      } else {
        if (v.tracked === false) { skip('atlikums netiek uzskaitīts'); continue; }
        if (v.qty != null ? v.qty <= 0 : !v.available) { skip('0 atlikums'); continue; }
      }

      const price = decimal ? v.price / cfg.decimalStep : v.price;
      let inStock = mto ? null : v.qty;
      if (decimal && inStock != null) {
        inStock = Math.floor(inStock * cfg.decimalStep + 1e-9);
        if (inStock < cfg.minDecimalMeters) { skip('atlikumā mazāk par 1 m'); continue; }
      }
      if (price < cfg.minPrice) { skip(`cena zem ${money(cfg.minPrice)} €`); continue; }

      const variantTitle = v.title && v.title !== 'Default Title' ? ` - ${v.title}` : '';
      const name = cut(cleanName(`${p.title}${variantTitle}`, cfg) + (decimal ? cfg.decimalNameSuffix : ''), 200);
      if (seenNames.has(name)) { skip('dublikāts'); continue; }
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
  return { items, stats };
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
const upperFirst = (s) => String(s).replace(/^\p{Ll}/u, (x) => x.toUpperCase());

// Nosaukuma daļas, atdalītas ar " - ". Skaitļu diapazons ("izmēri 2 - 12 mm", "Ø3 - 20 mm") nav atdalītājs.
function titleParts(s) {
  const parts = [];
  const re = /\s+[-–]\s+/g;
  let start = 0;
  let m;
  while ((m = re.exec(s))) {
    if (/\d/.test(s[m.index - 1] || '') && /\d/.test(s[m.index + m[0].length] || '')) continue;
    parts.push(s.slice(start, m.index));
    start = m.index + m[0].length;
  }
  parts.push(s.slice(start));
  return parts.map((x) => x.trim()).filter(Boolean);
}

const ADS_BOUNDARY = /,\s+|;\s+|\s+[-–]\s+|\s+\/\s+|\s+\(/g;
// Lielie burti, kas paliek arī teikumā: izmēri (XS, M, 2XL) un kodi ar cipariem (#12, A4), valstu kodi.
const ADS_CODE = /^(\(?(X{0,3}S|M|X{0,4}L|\d+XL|LV|EE|LT|EU)\)?[,.;/]?|\S*\d\S*)$/;
const ADS_UNIT = /^(mm|cm|m|km|g|kg|ml|l|gab\.?|m²|cm²|g\/m²|%|mm\)|cm\)|m\)|g\))[,.;)]*$/i;

/**
 * Teksts līdz max zīmēm bez pārgrieztiem vārdiem un bez daudzpunktes: vispirms garākā daļa līdz frāzes robežai
 * (", ", " - ", " / ", " ("), ja tā nav pārāk īsa; citādi pa veseliem vārdiem. Beigās nepaliek pieturzīmes,
 * saikļi un prievārdi ("ar", "un"), skaitlis bez mērvienības vai neaizvērta iekava / pēdiņa.
 * Atgriež { text, rest } – rest ir atmestā daļa (var izmantot citā kolonnā). text = '' – nevar saīsināt.
 */
function fitText(s, max, dangling) {
  s = String(s ?? '').trim();
  if (s.length <= max) return { text: s, rest: '' };
  const tidy = (t) => {
    let prev;
    do {
      prev = t;
      t = t.replace(/[\s,;:\-–/(&+·]+$/u, '');
      const open = (t.match(/\(/g) || []).length > (t.match(/\)/g) || []).length ? t.lastIndexOf('(')
        : (t.match(/“/g) || []).length > (t.match(/”/g) || []).length ? t.lastIndexOf('“')
          : (t.match(/"/g) || []).length % 2 ? t.lastIndexOf('"') : -1;
      if (open >= 0) t = t.slice(0, open);
      const words = t.split(' ');
      if (words.length > 1 && dangling.has(words[words.length - 1].toLowerCase())) t = words.slice(0, -1).join(' ');
    } while (t !== prev);
    return t.trim();
  };
  let best = '';
  for (const m of s.matchAll(ADS_BOUNDARY)) {
    if (/-|–/.test(m[0]) && /\d/.test(s[m.index - 1] || '') && /\d/.test(s[m.index + m[0].length] || '')) continue; // "Ø3 - 20 mm"
    const t = tidy(s.slice(0, m.index));
    if (t.length <= max && t.length > best.length) best = t;
  }
  let text = best.length >= Math.min(10, max) ? best : '';
  if (!text) {
    const words = s.split(' ');
    let n = 0;
    let len = 0;
    while (n < words.length && len + (n ? 1 : 0) + words[n].length <= max) { len += (n ? 1 : 0) + words[n].length; n++; }
    // Skaitlis bez mērvienības ("Atstarojošā lente 50" no "… 50 mm") – nost arī skaitli.
    if (n > 0 && n < words.length && ADS_UNIT.test(words[n]) && /^[\d.,×x/–-]+$/i.test(words[n - 1])) n--;
    text = tidy(words.slice(0, n).join(' '));
  }
  if (!text) return { text: '', rest: s };
  let rest = s.slice(text.length).replace(/^[\s,;:\-–/)·]+/u, '').trim();
  for (let w = rest.split(' '); w.length > 1 && dangling.has(w[0].toLowerCase()); w = rest.split(' ')) rest = w.slice(1).join(' ');
  return { text, rest };
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

// Vai attēla adrese der Google (JPG/PNG/GIF vai Shopify CDN ar piespiedu JPEG).
function adsImageOk(url, c) {
  let u;
  try { u = new URL(url); } catch { return false; }
  return u.protocol === 'https:' && (c.imageExt.test(u.pathname)
    || (!!c.shopifyForceJpeg && u.searchParams.get('format') === c.shopifyForceJpeg && c.shopifyImageExt.test(u.pathname)));
}

/**
 * Item title / Item subtitle / Item description (katrs līdz textMax zīmēm) no Shopify nosaukuma.
 *   Item title – produkta nosaukuma pirmā daļa (līdz " - "), bez sākuma veida vārda ("Dzijas"); ja par garu un vidū ir
 *     zināms zīmols ("Tamboradatas DROPS Pro Circus, …") – no zīmola; tad saīsināts pa frāzēm / vārdiem.
 *   Item subtitle – varianta nosaukums (krāsa, izmērs), ja variantu ir vairāki.
 *   Item description – pirmais no: nosaukuma daļa pēc " - ", daļa pirms zīmola, atmestā nosaukuma daļa, kategorija;
 *     neatkārto virsrakstu vai apakšvirsrakstu.
 * Teksts tikai ar lielajiem burtiem kļūst par teikumu ("BALTA" → "Balta"), zīmoli (DROPS, SCHMETZ) paliek.
 * Atgriež null, ja nosaukumu nevar saīsināt bez pārgriezta vārda.
 */
function adsTexts(it, cfg, brandRe, brandUpper) {
  const c = cfg.googleAdsCustom;
  const max = c.textMax;
  const dangling = new Set(c.danglingWords);
  const notes = [];
  const clean = (s) => noEmoji(String(s ?? '').replace(/<[^>]*>/g, ' ')).replace(/–/g, '-').replace(/(\p{L})-\s+/gu, '$1 - ')
    .replace(/\s+/g, ' ').trim();
  const fixCaps = (s, what) => {
    if (!isAllCaps(s) || brandUpper.has(s.toUpperCase())) return s;
    notes.push(`${what}: lielie burti`);
    return upperFirst(s.split(' ').map((w) => (brandUpper.has(w.toUpperCase()) || ADS_CODE.test(w) ? w : w.toLowerCase())).join(' '));
  };
  const full = clean(it._productTitle || it._baseName || it.name);
  let parts = titleParts(full);
  if (parts.length > 1 && parts[0].length < 3) parts = [`${parts[0]} - ${parts[1]}`, ...parts.slice(2)]; // "O - riņķis"
  let head = parts[0] || '';
  const tail = parts.slice(1).join(' - ');
  let before = '';
  const lead = head.match(c.leadingTypeWords);
  if (lead && head.length > lead[0].length) { head = head.slice(lead[0].length); notes.push('bez veida vārda'); }
  // Apdrukas preces (apģērbi, pēc pasūtījuma): dizaina nosaukums pēdiņās ir svarīgākais ("Organiskās kokvilnas T-krekls “TĒTI”" →
  // "Kokvilnas T-krekls “TĒTI”"): pēdiņas + tik daudz vārdu no beigām, cik ietilpst; aprakstā – kategorija.
  const quote = head.length > max && (it._apparel || it._madeToOrder) ? head.match(/[“„"«][^“”„"«»]+[”"»“]$/u) : null;
  if (quote && quote[0].length <= max) {
    const words = head.slice(0, quote.index).trim().split(' ').filter(Boolean);
    let k = words.length;
    while (k > 0 && `${words.slice(words.length - k).join(' ')} ${quote[0]}`.length > max) k--;
    head = `${words.slice(words.length - k).join(' ')} ${quote[0]}`.trim();
    notes.push('nosaukums saīsināts', 'dizaina nosaukums paturēts');
  }
  if (head.length > max && brandRe) {
    const m = brandRe.exec(head);
    if (m && m.index > 0) {
      const fromBrand = fitText(head.slice(m.index), max, dangling);
      if (fromBrand.text.length >= 8) {
        before = head.slice(0, m.index).replace(/[\s,;:\-–]+$/u, '');
        head = head.slice(m.index);
        notes.push('nosaukums no zīmola');
      }
    }
  }
  const t = fitText(head, max, dangling);
  if (!t.text) return null;
  if (t.rest) notes.push('nosaukums saīsināts');
  const title = fixCaps(upperFirst(t.text), 'nosaukums');

  let subtitle = '';
  if (it._variantTitle) {
    const s = fitText(clean(it._variantTitle), max, dangling);
    if (s.rest || !s.text) notes.push('apakšvirsraksts saīsināts');
    subtitle = fixCaps(upperFirst(s.text), 'apakšvirsraksts');
    if (normCmp(subtitle) === normCmp(title) || normCmp(title).includes(normCmp(subtitle))) subtitle = '';
  }

  const norm = (x) => normCmp(x);
  const category = String(it.category_full || '').split(/\s*>>\s*/).filter(Boolean).pop() || '';
  let description = '';
  for (const [cand, kind] of [[tail, ''], [before, ''], [t.rest, ''], [clean(category), 'kategorija']]) {
    if (!cand) continue;
    const d = fitText(cand, max, dangling);
    if (!d.text) continue;
    const n = norm(d.text);
    if (!n || n === norm(title) || n === norm(subtitle) || norm(title).includes(n)) continue;
    if (d.rest) notes.push('apraksts saīsināts');
    if (kind) notes.push('apraksts = kategorija');
    description = fixCaps(upperFirst(d.text), 'apraksts');
    break;
  }
  return { title, subtitle, description, notes, source: full + (it._variantTitle ? ` | ${clean(it._variantTitle)}` : '') };
}

/**
 * Google Ads dinamiskā remarketinga plūsma "Pielāgoti" (Custom), CSV latviski, no buildItems ierakstiem (visi
 * varianti, kā google-lv.xml). Izslēdz tāpat kā toGoogleXml (ar defektu, bez attēla, metrā ar nezināmu atlikumu,
 * dubulta saite) un papildus: CONFIG.googleAdsCustom.excludeProductTypes, attēls nav JPG/PNG/GIF, nosaukumu nevar
 * saīsināt. Atkārtots ID – kļūda (Google: "IDs must be unique").
 * Atgriež { csv, stats, report } – report: rindas, kurās teksts saīsināts vai mainīts (Edgara pārbaudei).
 */
export function toGoogleAdsCustomCsv(items, cfg = CONFIG) {
  const c = cfg.googleAdsCustom;
  const stats = { items: 0, decimal: 0, sale: 0, skipped: {}, notes: {},
    with: { subtitle: 0, description: 0, category: 0, formatted_price: 0 } };
  const skip = (why) => { stats.skipped[why] = (stats.skipped[why] || 0) + 1; };
  const brands = [...new Set(cfg.titleBrands)].sort((a, b) => b.length - a.length)
    .map((b) => b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'));
  const brandRe = brands.length ? new RegExp(`(?<![\\p{L}\\d])(${brands.join('|')})(?![\\p{L}\\d])`, 'u') : null;
  const brandUpper = new Set(cfg.titleBrands.map((b) => b.toUpperCase()));
  const prefix = `${cfg.shopUrl}/products/`;
  const fmt = (n) => `${money(n).replace('.', ',')} €${c.perMetre}`;
  const seenIds = new Set();
  const seenLinks = new Set();
  const report = [];
  const lines = [c.columns.map(csvField).join(',')];

  for (const it of items) {
    if (it.used === '1') { skip('ar defektu / demo / lietota'); continue; }
    if (c.excludeProductTypes.includes(it._productType)) { skip(`tips ${it._productType}`); continue; }
    if (it._decimal && it.in_stock === '') { skip('metrā tirgota, atlikums nav zināms'); continue; }
    const id = String(it._variantId ?? '');
    if (!/^[0-9]+$/.test(id)) { skip('ID nav tikai cipari'); continue; }
    if (!String(it.link || '').startsWith(prefix)) { skip('saite nav preces lapa'); continue; }
    if (seenLinks.has(it.link)) { skip('dublikāts (saite)'); continue; }
    if (!it.image) { skip('nav attēla'); continue; }
    const image = adsImage(it.image, c);
    if (!image) { skip('attēls nav JPG/PNG/GIF/WebP'); continue; }
    if (!(it._priceNum > 0)) { skip('cena 0'); continue; }
    const t = adsTexts(it, cfg, brandRe, brandUpper);
    if (!t) { skip(`nosaukumu nevar saīsināt līdz ${c.textMax} zīmēm`); continue; }
    if (seenIds.has(id)) throw new Error(`Google Ads Custom: ID ${id} atkārtojas`);
    seenIds.add(id);
    seenLinks.add(it.link);

    const sale = it._compareAt != null && it._compareAt > it._priceNum + 0.004;
    const price = sale ? it._compareAt : it._priceNum;
    const category = noEmoji(String(it.category_full || '').split(/\s*>>\s*/)[0] || '');
    const row = [
      id, t.title, t.subtitle, t.description, category, it.link, image,
      `${money(price)} ${c.currency}`,
      sale ? `${money(it._priceNum)} ${c.currency}` : '',
      it._decimal ? fmt(price) : '',
      it._decimal && sale ? fmt(it._priceNum) : '',
      '', // Contextual keywords: tikai no Edgara atslēgvārdu tabulas (1:1), tāpēc pagaidām tukšs
    ];
    lines.push(row.map(csvField).join(','));

    stats.items++;
    if (it._decimal) stats.decimal++;
    if (sale) stats.sale++;
    if (t.subtitle) stats.with.subtitle++;
    if (t.description) stats.with.description++;
    if (category) stats.with.category++;
    if (row[9]) stats.with.formatted_price++;
    for (const n of t.notes) stats.notes[n] = (stats.notes[n] || 0) + 1;
    if (t.notes.some((n) => n !== 'bez veida vārda')) {
      report.push({ id, source: t.source, title: t.title, subtitle: t.subtitle, description: t.description, notes: t.notes.join('; ') });
    }
  }
  return { csv: `${lines.join('\n')}\n`, stats, report };
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
  const err = (where, msg) => { errorCount++; if (errors.length < 100) errors.push(where ? `${where}: ${msg}` : msg); };
  const warn = (where, msg) => { if (warnings.length < 100) warnings.push(`${where}: ${msg}`); };
  const text = String(csv ?? '');
  if (text.charCodeAt(0) === 0xfeff) err('', 'fails sākas ar BOM');
  if (/[�]/.test(text)) err('', 'fails satur bojātas UTF-8 rakstzīmes (U+FFFD)');
  const rows = parseCsv(text);
  const header = rows.shift() || [];
  if (header.join('\u0001') !== c.columns.join('\u0001')) err('', `galvene neatbilst: ${header.join(',')}`);
  const ids = new Set();
  const prefix = `${cfg.shopUrl}/products/`;
  const priceRe = new RegExp(`^\\d+\\.\\d{2} ${c.currency}$`);
  rows.forEach((r, i) => {
    const where = `rinda ${i + 2}${r[0] ? ` (ID ${r[0]})` : ''}`;
    if (r.length !== c.columns.length) { err(where, `${r.length} kolonnas, nevis ${c.columns.length}`); return; }
    const [id, title, subtitle, description, category, url, image, price, salePrice, fPrice, fSale, keywords] = r;
    if (!/^[0-9]+$/.test(id)) err(where, 'ID nav tikai cipari');
    else if (ids.has(id)) err(where, 'ID atkārtojas');
    else ids.add(id);
    if (!title.trim()) err(where, 'tukšs Item title');
    for (const [name, val, max] of [['Item title', title, c.textMax], ['Item subtitle', subtitle, c.textMax],
      ['Item description', description, c.textMax], ['Formatted price', fPrice, c.formattedMax],
      ['Formatted sale price', fSale, c.formattedMax]]) {
      if (val.length > max) err(where, `${name} garāks par ${max} zīmēm (${val.length})`);
      if (val !== val.trim()) err(where, `${name} ar atstarpi sākumā vai beigās`);
    }
    for (const [name, val] of [['Item title', title], ['Item subtitle', subtitle], ['Item description', description],
      ['Item category', category], ['Contextual keywords', keywords]]) {
      if (/[\r\n\t]/.test(val)) err(where, `${name}: rindas pārnesums`);
      if (/<\/?[a-z!][^>]*>/i.test(val)) err(where, `${name}: HTML`);
      if (/\p{Extended_Pictographic}/u.test(val)) err(where, `${name}: emocijzīme`);
      if (/Default Title/i.test(val)) err(where, `${name}: "Default Title"`);
      if (/…$/.test(val)) err(where, `${name}: daudzpunkte (pārgriezts teksts)`);
      if (isAllCaps(val)) warn(where, `${name} tikai ar lielajiem burtiem: ${val}`);
    }
    if (!url.startsWith(prefix)) err(where, 'Final URL nav veikala preces lapa');
    if (/\s/.test(image) || !adsImageOk(image, c)) err(where, 'Image URL nav https JPG/PNG/GIF');
    if (!priceRe.test(price) || !(parseFloat(price) > 0)) err(where, `Price formāts: ${price}`);
    if (salePrice && (!priceRe.test(salePrice) || !(parseFloat(salePrice) < parseFloat(price)))) err(where, `Sale price: ${salePrice}`);
    if (fSale && !salePrice) err(where, 'Formatted sale price bez Sale price');
    if (fSale && !fPrice) err(where, 'Formatted sale price bez Formatted price');
  });
  return { rows: rows.length, errors, errorCount, warnings };
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
