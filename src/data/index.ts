/**
 * Data barrel. Import via `@data`.
 *
 * NOTE: Some files export names that collide (`assetOrder` exists in both
 * assetColors and assetIcons; `getCategoryColor` exists in both
 * categoryColors and categoryIcons). Those names are re-exported with a
 * prefix to avoid shadowing.
 *
 * @module data
 */

// ─── Unique / non-colliding exports ─────────────────────────────────
export { APP_VERSION } from './appVersion';
export * from './currencyConfig';
export * from './expenseCategoryCodes';
export * from './financeDefaults';
export * from './mockCryptoData';
export * from './roadmapData';
export * from './tagTranslations';
export { generateDemoData } from './demoData';

// ─── Asset colors ───────────────────────────────────────────────────
export {
  assetColors,
  getAssetColor,
  assetNameMap,
  assetOrder as assetColorOrder,
} from './assetColors';

// ─── Asset icons ────────────────────────────────────────────────────
export {
  assetIcons,
  getAssetIcon,
  assetMapping,
  assetOrder as assetIconOrder,
} from './assetIcons';

// ─── Category colors ────────────────────────────────────────────────
export {
  incomeCategoryColors,
  outflowCategoryColors,
  getCategoryColor as getCategoryColorByKey,
} from './categoryColors';

// ─── Category icons ─────────────────────────────────────────────────
export {
  categoryIcons,
  getCategoryIcon,
  getCategoryColor as getCategoryColorByName,
} from './categoryIcons';
