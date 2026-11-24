// Google Ads "Pielāgoti" (Custom) plūsmas pārbaude bez publicēšanas.
//
//   node check-google-ads-custom.mjs public/google-ads-custom-lv.csv
//       pārbauda gatavu failu (vai publicēto adresi https://…/google-ads-custom-lv.csv) pret Google noteikumiem
//   node check-google-ads-custom.mjs --storefront [mape]
//       uzbūvē failu no veikala publiskā /products.json (bez Shopify atslēgām) un pārbauda; mapē (noklusējums
//       custom-check/) saglabā CSV, saīsināto tekstu atskaiti (saisinajumi.csv), katru izlaisto variantu ar iemeslu
//       (izlaistie.csv) un kopsavilkumu (summary.json; iekļautie + izlaistie = visi varianti).
//       Publiskajā /products.json nav atlikuma skaita – metrā tirgotajām precēm pieņem, ka atlikums ir (tikai pārbaudei).
//
// Izvada kopsavilkumu: rindu skaits, kļūdas, brīdinājumi (piem. teksts tikai ar lielajiem burtiem). Kļūdu gadījumā – kods 1.

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { CONFIG, buildItems, toGoogleAdsCustomCsv, validateGoogleAdsCustomCsv, parseCsv } from './feed-core.mjs';

const csvLine = (cells) => cells.map((x) => (/[",\n]/.test(String(x)) ? `"${String(x).replace(/"/g, '""')}"` : String(x))).join(',');

async function fromStorefrontBuild(dir) {
  const { fromStorefront } = await import('./generate.mjs');
  const products = await fromStorefront();
  const { items, stats: b, skippedVariants } = buildItems(products, CONFIG);
  for (const it of items) if (it._decimal && it.in_stock === '') it.in_stock = String(CONFIG.minDecimalMeters); // tikai pārbaudei
  const r = toGoogleAdsCustomCsv(items, CONFIG);
  await mkdir(dir, { recursive: true });
  await writeFile(`${dir}/${CONFIG.googleAdsCustom.file}`, r.csv, 'utf8');
  await writeFile(`${dir}/saisinajumi.csv`, [csvLine(['ID', 'Shopify nosaukums | variants', 'Item title', 'Item subtitle', 'Item description', 'Piezīmes']),
    ...r.report.map((x) => csvLine([x.id, x.source, x.title, x.subtitle, x.description, x.notes]))].join('\n') + '\n', 'utf8');
  await writeFile(`${dir}/izlaistie.csv`, [csvLine(['ID', 'Shopify nosaukums', 'Iemesls', 'Posms']),
    ...skippedVariants.map((x) => csvLine([x.id, `${x.product}${x.variant && x.variant !== 'Default Title' ? ` | ${x.variant}` : ''}`, x.reason, 'buildItems'])),
    ...r.excluded.map((x) => csvLine([x.id, x.source, x.reason, 'Custom CSV']))].join('\n') + '\n', 'utf8');
  const variants = products.reduce((s, p) => s + p.variants.length, 0);
  // Salīdzinājums ar sākotnējo sarakstu: katrs variants ir vai nu CSV, vai izlaists ar iemeslu – ne abos, ne nevienā.
  const all = products.flatMap((p) => p.variants.map((v) => String(v.id).split('/').pop()));
  const seen = new Map();
  for (const id of [...parseCsv(r.csv).slice(1).map((x) => x[0]), ...skippedVariants.map((x) => x.id), ...r.excluded.map((x) => x.id)]) {
    seen.set(id, (seen.get(id) || 0) + 1);
  }
  const reconcile = { variants: all.length, csvRows: r.stats.items, skippedBuildItems: skippedVariants.length, skippedCsv: r.excluded.length,
    missing: all.filter((id) => !seen.has(id)), twice: [...seen].filter(([, n]) => n > 1).map(([id]) => id) };
  const summary = { source: 'storefront', products: products.length, variants, buildItems: { items: items.length, skipped: b.skipped },
    csv: r.stats, report: r.report.length, reconcile: { ...reconcile, missing: reconcile.missing.length, twice: reconcile.twice.length,
      missingIds: reconcile.missing.slice(0, 50), twiceIds: reconcile.twice.slice(0, 50) } };
  await writeFile(`${dir}/summary.json`, JSON.stringify(summary, null, 2), 'utf8');
  console.log(`Veikals: ${products.length} produkti, ${variants} varianti → buildItems ${items.length} → CSV ${r.stats.items} rindas`);
  console.log(`Salīdzinājums: ${r.stats.items} CSV + ${skippedVariants.length} izlaisti buildItems + ${r.excluded.length} izlaisti CSV = `
    + `${r.stats.items + skippedVariants.length + r.excluded.length} no ${all.length}; trūkst ${reconcile.missing.length}, divreiz ${reconcile.twice.length}`);
  if (reconcile.missing.length || reconcile.twice.length) process.exitCode = 1;
  return r.csv;
}

const arg = process.argv[2];
if (!arg) {
  console.log('Lietošana: node check-google-ads-custom.mjs <fails.csv | https://…csv | --storefront [mape]>');
  process.exit(2);
}
let text;
if (arg === '--storefront') text = await fromStorefrontBuild(process.argv[3] || 'custom-check');
else if (/^https?:\/\//.test(arg)) {
  const res = await fetch(arg, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${arg}: HTTP ${res.status}`);
  console.log(`HTTP ${res.status}, ${res.headers.get('content-type')}`);
  text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(await res.arrayBuffer());
} else text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(await readFile(arg)); // BOM paliek – pārbaude to atrod

const check = validateGoogleAdsCustomCsv(text, CONFIG);
const rows = parseCsv(text).slice(1);
const count = (i) => rows.filter((r) => r[i]).length;
console.log(`Rindas: ${check.rows}; ar Item subtitle ${count(2)}, Item description ${count(3)}, Sale price ${count(8)}, Formatted price ${count(9)}`);
console.log(`Kļūdas: ${check.errorCount}${check.errors.length ? `\n  ${check.errors.join('\n  ')}` : ''}`);
console.log(`Brīdinājumi: ${check.warningCount}${check.warnings.length ? `\n  ${check.warnings.slice(0, 20).join('\n  ')}` : ''}`);
process.exit(check.errorCount || process.exitCode ? 1 : 0);
