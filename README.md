# Šarlotes audumi – Salidzini.lv XML fails

4 reizes dienā (5:47, 10:47, 13:47 un 16:47 pēc Latvijas laika) GitHub automātiski nolasa preces
no Shopify, pārrēķina un uzbūvē `salidzini.xml`. Salidzini.lv šo failu nolasa 08–12, 12–13, 15–16 un 18–19.

Drošības noteikumi: ja Shopify īslaicīgi neatbild, skripts mēģina vēlreiz; ja preču ir aizdomīgi maz
(zem 100 vai uz pusi mazāk nekā iepriekš), vecais fails paliek nemainīts. Reizi nedēļā (pirmdienas rītā)
tiek ierakstīts `status/last-run.json`, lai GitHub neatslēgtu grafiku 60 dienu neaktivitātes dēļ.

## Ko fails dara

| Noteikums | Kā |
|---|---|
| Metrā tirgotās preces (tags `decimal`) | cena × 10 (par 1 m), atlikums ÷ 10 (metros), nosaukumā "(1 m)" |
| Atlikumā mazāk par 1 m | nerāda |
| 0 atlikums / atlikums netiek uzskaitīts | nerāda |
| Dāvanu kartes, apdrukas preces (tips `Customizer`), digitālās preces, 0 € | nerāda |
| T-krekli un džemperi (nosaukums sākas ar "T-krekls" / "Džemperis") | nerāda |
| Cena zem 3 € (metrā – par 1 m) | nerāda |
| Vienāds nosaukums divreiz | rāda vienu reizi |
| Nosaukumā "ar defektu", "bojāts", "lietots", "demo" | `<used>1</used>` (Salidzini prasība) |
| Nosaukumā "pēdējais gabaliņš 50cm", "-neatjaunot" | "gabals 50 cm", piezīme tiek izņemta |
| Kategorija | Google Shopping lauki, piem. "Audumi >> Kokvilnas audumi"; bez tiem – tips + konkrētākais tags (SEO tagi, kas ir vairāk nekā pusei tipa preču, netiek ņemti) |
| Zīmols | tikai īsti zīmoli (SCHMETZ, Milward, Prym, DROPS, Alize u.c.) |
| EAN | tikai derīgi kodi (automātiski ģenerētie netiek likti) |
| Piegāde | 3,30 € (Omniva), 0 € no 70 €; tikai kurjers – 11,90 € / 15,90 € virs 3 kg; 3 dienas; veikalā – šodien |

Visi skaitļi ir `feed-core.mjs` augšā, blokā `CONFIG` (piem. `minPrice: 3.0`).

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
node test/test-core.mjs   # noteikumu pārbaude
node generate.mjs         # uzbūvē public/salidzini.xml
```
