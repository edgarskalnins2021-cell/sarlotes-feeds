# Šarlotes audumi – Salidzini.lv XML fails

Katru rītu (ap 05:15–06:15 pēc Latvijas laika) GitHub automātiski nolasa preces no Shopify,
pārrēķina un uzbūvē `salidzini.xml`. Salidzini.lv šo failu nolasa dienā 08–12.

## Ko fails dara

| Noteikums | Kā |
|---|---|
| Metrā tirgotās preces (tags `decimal`) | cena × 10 (par 1 m), atlikums ÷ 10 (metros), nosaukumā "(1 m)" |
| Atlikumā mazāk par 1 m | nerāda |
| 0 atlikums / atlikums netiek uzskaitīts | nerāda |
| Dāvanu kartes, T-krekli (tips `Customizer`), digitālās preces, 0 € | nerāda |
| Cena zem 3 € (metrā – par 1 m) | nerāda |
| Vienāds nosaukums divreiz | rāda vienu reizi |
| Kategorija | Google Shopping lauki, piem. "Audumi >> Kokvilnas audumi" |
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
