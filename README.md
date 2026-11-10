# Šarlotes audumi – cenu salīdzināšanas XML faili

Katru stundu (6:17–21:17 pēc Latvijas laika) GitHub automātiski nolasa preces
no Shopify, pārrēķina un vienā reizē uzbūvē septiņus failus (četri Latvijas cenu salīdzinātājiem, viens Igaunijai,
viens Lietuvai un viens Google Merchant Center – latviski):

| Fails | Kam | Adrese |
|---|---|---|
| `salidzini.xml` | Salidzini.lv (nolasa 08–12, 12–13, 15–16, 18–19) | https://edgarskalnins2021-cell.github.io/sarlotes-feeds/salidzini.xml |
| `kurpirkt.xml` | Kurpirkt.lv (`manufacturer`, `category`, `category_full` ar ">", `delivery_cost_riga`, `used` 0/1) | https://edgarskalnins2021-cell.github.io/sarlotes-feeds/kurpirkt.xml |
| `ceno.xml` | Ceno.lv (skat. sadaļu "Ceno.lv") | https://edgarskalnins2021-cell.github.io/sarlotes-feeds/ceno.xml |
| `cenueksperts.xml` | Cenueksperts.lv (skat. sadaļu "Cenueksperts.lv") | https://edgarskalnins2021-cell.github.io/sarlotes-feeds/cenueksperts.xml |
| `hindee.xml` | Hind.ee, Igaunija (skat. sadaļu "Hind.ee") | https://edgarskalnins2021-cell.github.io/sarlotes-feeds/hindee.xml |
| `kaina24.xml` | Kaina24.lt, Lietuva (skat. sadaļu "Kaina24.lt") | https://edgarskalnins2021-cell.github.io/sarlotes-feeds/kaina24.xml |
| `google-lv.xml` | Google Merchant Center, Latvija, latviešu valodā (skat. sadaļu "Google") – vēl nav pieslēgts | https://edgarskalnins2021-cell.github.io/sarlotes-feeds/google-lv.xml |

Grafiks GitHub pusē mēdz kavēties; vajadzības gadījumā: **Actions → Salidzini XML → Run workflow**.

Drošības noteikumi: ja Shopify īslaicīgi neatbild, skripts mēģina vēlreiz; ja preču ir aizdomīgi maz
(zem 100 vai uz pusi mazāk nekā iepriekš – arī Ceno failā atsevišķi), netiek izvietots neviens fails un
publiski paliek iepriekšējā versija. Ja neizdodas tikai Igaunijas vai Lietuvas fails, Latvijas faili tiek
izvietoti, bet `hindee.xml` / `kaina24.xml` / `google-lv.xml` paliek iepriekšējā versija. Pēc izvietošanas darbs `verify` nolasa visus publiskos XML
(HTTP 200, derīgs XML, preču skaits sakrīt ar `stats.json`). Reizi nedēļā (pirmdienas rītā)
tiek ierakstīts `status/last-run.json`, lai GitHub neatslēgtu grafiku 60 dienu neaktivitātes dēļ.

## Ko fails dara

| Noteikums | Kā |
|---|---|
| Metrā tirgotās preces (tags `decimal`) | cena × 10 (par 1 m), atlikums ÷ 10 (metros), nosaukumā "(cena par 1 m)" |
| Atlikumā mazāk par 1 m | nerāda |
| 0 atlikums / atlikums netiek uzskaitīts | nerāda |
| Dāvanu kartes, apdrukas preces (tips `Customizer`), digitālās preces, 0 € | nerāda |
| T-krekli un džemperi (nosaukums sākas ar "T-krekls" / "Džemperis") | nerāda |
| Minimālā cena | nav (`minPrice: 0`); ja vajag, var iestatīt, piem. 3 € – metrā tirgotajām precēm tiek salīdzināta 1 m cena |
| Vienāds nosaukums divreiz | rāda vienu reizi |
| Nosaukumā "ar defektu", "bojāts", "lietots", "demo" | `<used>1</used>` (Salidzini prasība) |
| Nosaukumā "pēdējais gabaliņš 50cm", "-neatjaunot" | "gabals 50 cm", piezīme tiek izņemta |
| Kategorija | Google Shopping lauki, piem. "Audumi >> Kokvilnas audumi"; bez tiem – tips + konkrētākais tags (SEO tagi, kas ir vairāk nekā pusei tipa preču, netiek ņemti) |
| Zīmols | tikai īsti zīmoli (SCHMETZ, Milward, Prym, DROPS, Alize u.c.) |
| EAN | tikai derīgi kodi (automātiski ģenerētie netiek likti) |
| Piegāde | 3,30 € (Omniva), 0 € no 70 €; tikai kurjers – 11,90 € / 15,90 € virs 3 kg; 3 dienas; veikalā Cēsīs – šodien (Salidzini rāda "0d" un zaļo "Ātra piegāde") |

Visi skaitļi ir `feed-core.mjs` augšā, blokā `CONFIG` (piem. `minPrice: 0`).

## Ceno.lv (`ceno.xml`)

Tās pašas preces kā Salidzini/Kurpirkt failos (`buildItems`), ar Ceno pielāgojumiem (`toCenoXml`, `CONFIG.ceno`).
Formāts pēc https://ceno.lv/pages/xml-file (pārbaudīts 08.11.2026). Ceno datus atjauno reizi dienā.
Cenas un atlikumi jau ir pārrēķināti uz pārdošanas vienību, otrreiz netiek pārrēķināti.

| Tags | No kurienes |
|---|---|
| `name` | produkta + varianta nosaukums; metrā tirgotajām "(cena par 1 m)" – saīsinot nosaukumu, šī norāde paliek |
| `link` | preces saite, variantiem ar `?variant=` |
| `price` | cena, ko pircējs maksā, EUR ar PVN; metrā tirgotajām par 1 m (arī akcijas precēm) |
| `price_sale` | netiek likts (`salePrice: false`): Ceno kartiņā rāda tikai `price`, tāpēc akcijas cena jāliek tur |
| `image` | varianta attēls, citādi produkta attēls; bez attēla prece netiek iekļauta |
| `manufacturer` | tikai īsti zīmoli (tie paši noteikumi kā Salidzini) |
| `model` | netiek likts – SKU ir piegādātāja iekšējie kodi, nevis modelis |
| `ean` | tikai derīgi kodi |
| `category`, `category_full` | tā pati kategorija kā Salidzini, atdalītājs " > " |
| `category_link` | tikai veikalā publicēta kolekcija, kurā prece ir un kuras nosaukums sakrīt ar kategoriju; citādi nav |
| `in_stock` | atlikums pilnās pārdošanas vienībās (metrā tirgotajām – pilni metri, uz leju) |
| `used` | `0`; preces ar defektu / demo / lietotas Ceno failā 1. versijā netiek iekļautas |
| `delivery_omniva` | 3,30 €, 0 € ja vienas vienības cena ≥ 70 €; tukšs, ja "tikai kurjers" vai > 30 kg |
| `delivery_dpd_paku_bode` | 4,99 € (DPD Pickup pakomāts); tukšs, ja "tikai kurjers" vai > 30 kg |
| `delivery_cost_riga`, `delivery_latvija` | Ceno: "maksimālā piegādes cena" – dārgākais šai precei pieejamais veids (kurjers 11,90 € / 15,90 € virs 3 kg) |
| `delivery_latvijas_pasts`, `delivery_pasta_stacija`, `delivery_circlek`, `delivery_venipak` | netiek piedāvāti – tukšs tags (Ceno prasība); tāpat `delivery_omniva`/`delivery_dpd_paku_bode` precēm "tikai kurjers" |
| `delivery_days_riga`, `delivery_days_latvija` | 3 ("1–3 darba dienas") |

Svars: Shopify svars metrā tirgotajām precēm ir par 0,1 m (piem. kokvilna 20 g), tāpēc 1 m = svars × 10.
Ceno faktu skaits un izlaišanas iemesli – `stats.json` laukā `ceno` (`items` laukā paliek Salidzini/Kurpirkt skaits).

## Cenueksperts.lv (`cenueksperts.xml`)

Formāts pēc Cenueksperts parauga (https://static.guenstiger.de/download/productfileexample.xml, saite no
https://w.cenueksperts.lv/buj): `<DataFeeds><item_data>…`. Tās pašas preces un cenas kā pārējos failos.

| Tags | No kurienes |
|---|---|
| `item_unique_id` | Shopify varianta ID (nemainīgs) |
| `item_manufacturer`, `item_upc` | zīmols un derīgs EAN (kā Salidzini); tukšus neliek |
| `item_name`, `item_page_url`, `item_image_url`, `item_price` | kā Salidzini (metrā tirgotajām – cena par 1 m, "(cena par 1 m)") |
| `item_category` | kategorija ar " / " |
| `item_short_desc` | produkta apraksts no Shopify (bez HTML, līdz 500 zīmēm); bez apraksta prece netiek iekļauta (obligāts lauks) |
| `item_inventory`, `item_condition` | `AVAILABLE`, `New` (failā ir tikai preces noliktavā; ar defektu / demo netiek iekļautas) |
| `item_shipping_charge` | lētākā piegāde Latvijā: 3,30 € (0 € no 70 €), "tikai kurjers" – 11,90 € / 15,90 € |

## Hind.ee (`hindee.xml`, Igaunija)

Igaunijas veikals https://sharlottekangad.ee. Formāts – Hind.ee oficiālais paraugs https://www.hind.ee/xml/example.xml
(lapā nav saites, bet fails ir; pārbaudīts 09.11.2026). Tas ir tieši tāds pats kā Kaina24 – abi portāli pieder
UAB Elektroninės prekybos centras –, tāpēc abiem failiem ir kopīgs kods (`localizeItems` + `toProductsXml`).

Preces – tās pašas kā Latvijas failos (`buildItems`: atlikums, metrā tirgotās, zem 1 m nerāda, T-krekli u.c. nerāda),
bet teksti un cena – no Igaunijas veikala publiskā `/products.json` (igauņu valodā, Igaunijas cena ar Igaunijas PVN).
Lauki – kā tabulā sadaļā "Kaina24.lt", ar šīm atšķirībām:

| Tags | Igaunijā |
|---|---|
| `title` | igauņu nosaukums; metrā tirgotajām "(hind 1 m kohta)"; "viimane tükk 50cm" → "tükk 50 cm" |
| `price` | Igaunijas cena (piem. 0,40 € par 0,1 m → 4,00 €) |
| `product_url` | `https://sharlottekangad.ee/products/<igauņu adrese>` |
| `category_name` | igauņu tips (piem. "Kangas", "Lõng"); bez tipa – pēc LV kategorijas; citādi "Õmblus- ja käsitöötarbed" |
| `delivery` | kuller 15,90 €, pakiautomaat (Omniva) 5,99 €, 5 darba dienas (veikala Igaunijas preču lapās "Eeldatav tarneaeg" ir par 2 darba dienām vēlāk nekā Latvijā) |

Nerāda: preces ar defektu / demo / lietotas, bez attēla, kuru nav Igaunijas veikalā. Bezmaksas piegādes slieksnis
Igaunijā nav. Drošība: ja preču ir zem 100, uz pusi mazāk nekā iepriekš vai vairāk nekā puse nosaukumu sakrīt ar
latviešu nosaukumiem, publiski paliek iepriekšējā `hindee.xml` versija.

## Kaina24.lt (`kaina24.xml`, Lietuva)

Lietuvas veikals https://sarlotesaudiniai.lt. Formāts – Kaina24 oficiālais paraugs https://www.kaina24.lt/xml/example.xml
(pārbaudīts 09.11.2026): `<products><product id="…">`. Kaina24 un Hind.ee ir viens uzņēmums (UAB Elektroninės prekybos
centras). Preces un drošības noteikumi – tāpat kā Hind.ee (kopīgās funkcijas `localizeItems`, `toProductsXml`), teksti un cena – no
Lietuvas veikala publiskā `/products.json` (Lietuvā PVN 21 %, tāpēc cenas sakrīt ar Latvijas).

| Tags | No kurienes |
|---|---|
| `product id`, `product_id` | Shopify varianta ID |
| `title` | lietuviešu nosaukums + varianta nosaukums; metrā tirgotajām "(kaina už 1 m)"; "paskutinis gabalėlis 50cm" → "gabalas 50 cm" |
| `price` | Lietuvas cena; metrā tirgotajām par 1 m |
| `condition` | `new` (preces ar defektu / demo / lietotas netiek iekļautas) |
| `stock` | atlikums (metrā tirgotajām – pilni metri) |
| `ean_code`, `manufacturer`, `image_url` | kā Latvijas failos |
| `product_url` | `https://sarlotesaudiniai.lt/products/<lietuviešu adrese>`, variantiem ar `?variant=` |
| `category_name` | lietuviešu produkta tips; bez tipa – pēc LV kategorijas (kā Hind.ee); citādi "Siuvimo ir rankdarbių prekės" (lauks obligāts) |
| `description` | lietuviešu apraksts (CDATA, bez HTML, līdz 1000 zīmēm) |
| `delivery/home_delivery` | kurjers 15,90 €, 5 darba dienas |
| `delivery/parcel_locker_delivery` | lētākais pakomāts (Omniva) 5,99 €, 5 darba dienas; nav "tikai kurjers" precēm un > 30 kg |

## Google Merchant Center (`google-lv.xml`, Latvija, latviski)

Pašlaik (10.11.2026) Google Latvijai latviešu valodu **neatbalsta**: Merchant Center valodu sarakstā Latvijai
latviešu nav, un Shopify Google & YouTube lietotne raksta "Latvian – This language isn't supported by Google in
this country". Tāpēc Shopify lietotne sūta preces angliski (avots "Shopify App API"). Šis fails ir gatavs brīdim,
kad Google latviešu valodu ieslēgs: tad Merchant Center pievieno **jaunu primāro avotu → Add products from a file →
Enter a link to your file** ar šo adresi, valsts Latvija, valoda latviešu (pieslēdz tikai tad, ne agrāk).

Formāts: RSS 2.0 ar `g:` laukiem (https://support.google.com/merchants/answer/7052112). Preces – tās pašas kā
Salidzini (noliktavā; metrā tirgotās – vismaz 1 m; bez dāvanu kartēm, apdrukas precēm, defektiem/demo).

| Lauks | No kurienes |
|---|---|
| `g:id` | `shopify_ZZ_{produkta ID}_{varianta ID}` – tāds pats kā Shopify lietotnes angliskajām precēm (Google: viena prece visās valodās – viens ID) |
| `g:title` | latviskais produkta + varianta nosaukums (līdz 150 zīmēm), bez "(cena par 1 m)" un emocijzīmēm |
| `g:description` | pilns latviskais apraksts no `sarlotesaudumi.lv/products.json` (bez HTML un saitēm, līdz 5000 zīmēm); ja nav – no Shopify Admin; ja nav arī tur – nosaukums |
| `g:link` | latviskā preces lapa `https://sarlotesaudumi.lv/products/...`, variantiem ar `?variant=` |
| `g:image_link`, `g:additional_image_link` | varianta / produkta attēls; līdz 10 papildu attēliem (variantu precēm – tikai kopīgie un šī varianta, ne citu krāsu) |
| `g:price` | **cena par Shopify vienību, kā preces lapā** (metrā tirgotajām – par 10 cm, piem. `0.39 EUR`), EUR ar PVN |
| `g:unit_pricing_measure`, `g:unit_pricing_base_measure` | metrā tirgotajām `10cm` un `1m` – Google parāda arī "3,90 €/m" (ES prasība precēm, ko pārdod pēc garuma) |
| `g:sale_price` | netiek likts (`salePrice: false`, kā Ceno) |
| `g:availability`, `g:condition` | `in_stock`, `new` |
| `g:brand`, `g:gtin`, `g:identifier_exists` | tikai īsti zīmoli; GTIN – derīgs EAN, ne veikala iekšējie diapazoni (2…, 02…, 04…); bez GTIN – `identifier_exists=no` |
| `g:item_group_id`, `g:item_group_title`, `g:variant_option` | variantu precēm: `shopify_ZZ_{produkta ID}`, produkta nosaukums, Shopify opcijas (piem. "Krāsa: Rozā – #12") |
| `g:color`, `g:size`, `g:pattern` | no opcijām "Krāsa" (bez kodiem: "Balta – #650" → "Balta"; tikai cipari – netiek likts), "Izmērs"/"Adatas izmērs"/"Garums", "Motīvs" |
| `g:google_product_category` | pēc Shopify produkta tipa (oficiālās taksonomijas ID, piem. Audums → 47, Dzija → 2669); neskaidriem tipiem – Google nosaka pats |
| `g:product_type` | LV kategorija, piem. "Audumi > Kokvilnas audumi" |
| `g:shipping` | tikai precēm "tikai kurjers" un > 30 kg: kurjers 11,90 € / 15,90 € (virs 3 kg), 0–1 + 1–2 darba dienas. Pārējām – Merchant Center konta piegādes politika (Latvija: 3,30 €, no 70 € bez maksas, 1–3 darba dienas, pasūtījumi līdz 11:00) |
| `g:shipping_weight`, `g:ships_from_country` | Shopify svars par vienību (g); `LV` |
| `g:custom_label_0…4` | LV kategorija, apakškategorija, "metrā"/"gabalos", cenu grupa, "akcija" (Google Ads kampaņu dalīšanai; pircēji neredz) |

Pašizmaksa (`cost_of_goods_sold`) un atlikuma skaits failā netiek likti – fails ir publisks.

## Vienreizēja iestatīšana

### 1. GitHub
1. Izveido bezmaksas kontu github.com (ja vēl nav).
2. Izveido jaunu **publisku** repozitoriju, piem. `sarlotes-feeds`.
3. Augšupielādē visus šīs mapes failus (arī `.github/workflows/salidzini.yml`).
4. Repozitorijā: **Settings → Pages → Source: GitHub Actions**.

### 2. Shopify lietotne (tikai lasīšanai)
1. Atver https://dev.shopify.com → **Apps → Create app** → nosaukums "Salidzini XML".
2. Versijā izvēlas piekļuvi: `read_products`, `read_inventory` → **Release**.
3. **Install** uz veikala sarlotesaudumi.
4. **Settings**: nokopē **Client ID** un **Client secret**.

### 3. Atslēgas GitHub (ievadi pats)
Repozitorijā: **Settings → Secrets and variables → Actions → New repository secret**:
- `SHOPIFY_CLIENT_ID` – Client ID
- `SHOPIFY_CLIENT_SECRET` – Client secret

> Bez šīm atslēgām skripts arī strādā, bet ņem datus no publiskā `/products.json`
> (bez atlikuma skaita, kategorijām un EAN).

### 4. Pirmā palaišana
**Actions → Salidzini XML → Run workflow**. Pēc ~2–5 min fails būs:
`https://<lietotājvārds>.github.io/sarlotes-feeds/salidzini.xml`

Šo saiti pārbauda Salidzini XML pārbaudes rīkā un ieraksta Salidzini profilā → "Nomainīt XML failu".

## Pārbaude uz sava datora
```
node test/test-core.mjs   # Salidzini/Kurpirkt noteikumu pārbaude
node test/test-ceno.mjs   # Ceno: metri, atlikumi, piegāde, kategorijas saite, akcijas
node test/test-cenueksperts.mjs  # Cenueksperts: formāts, apraksts, piegāde
node test/test-hindee.mjs # Hind.ee: oficiālā struktūra, igauņu teksti, Igaunijas cena, metri, piegāde uz Igauniju
node test/test-kaina24.mjs # Kaina24: oficiālā struktūra, lietuviešu teksti, metri, piegāde uz Lietuvu
node test/test-google.mjs # Google: RSS/g: lauki, ID, cena par 10 cm + vienības cena, varianti, attēli, piegāde
node generate.mjs         # uzbūvē visus failus mapē public/ (vajag Shopify atslēgas)
```
