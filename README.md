# Šarlotes audumi – cenu salīdzināšanas XML faili

Katru stundu (6:17–21:17 pēc Latvijas laika) GitHub automātiski nolasa preces
no Shopify, pārrēķina un vienā reizē uzbūvē četrus failus:

| Fails | Kam | Adrese |
|---|---|---|
| `salidzini.xml` | Salidzini.lv (nolasa 08–12, 12–13, 15–16, 18–19) | https://edgarskalnins2021-cell.github.io/sarlotes-feeds/salidzini.xml |
| `kurpirkt.xml` | Kurpirkt.lv (`manufacturer`, `category`, `category_full` ar ">", `delivery_cost_riga`, `used` 0/1) | https://edgarskalnins2021-cell.github.io/sarlotes-feeds/kurpirkt.xml |
| `ceno.xml` | Ceno.lv (skat. sadaļu "Ceno.lv") | https://edgarskalnins2021-cell.github.io/sarlotes-feeds/ceno.xml |
| `cenueksperts.xml` | Cenueksperts.lv (skat. sadaļu "Cenueksperts.lv") | https://edgarskalnins2021-cell.github.io/sarlotes-feeds/cenueksperts.xml |

Grafiks GitHub pusē mēdz kavēties; vajadzības gadījumā: **Actions → Salidzini XML → Run workflow**.

Drošības noteikumi: ja Shopify īslaicīgi neatbild, skripts mēģina vēlreiz; ja preču ir aizdomīgi maz
(zem 100 vai uz pusi mazāk nekā iepriekš – arī Ceno failā atsevišķi), netiek izvietots neviens fails un
publiski paliek iepriekšējā versija. Pēc izvietošanas darbs `verify` nolasa visus trīs publiskos XML
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
node generate.mjs         # uzbūvē public/salidzini.xml, kurpirkt.xml, ceno.xml (vajag Shopify atslēgas)
```
