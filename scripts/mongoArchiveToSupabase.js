#!/usr/bin/env node

/**
 * Migrazione completa MongoDB → Supabase (Postgres).
 *
 * Legge il backup `mongodump --archive --gzip` e genera una migration SQL
 * allineata a supabase/schema.sql:
 *   - auth.users + auth.identities (email sintetica {userId}@users.pacifinance.internal,
 *     password bcrypt riusata così com'è: GoTrue supporta gli hash $2a$/$2b$,
 *     quindi gli utenti mantengono la stessa password)
 *   - public.tags        (id espliciti via OVERRIDING SYSTEM VALUE + setval)
 *   - public.profiles    (tag ObjectId → FK bigint; ObjectId "null" 00000000... → NULL)
 *   - public.balances
 *   - public.expenses    (notes cifrate AES-256-GCM come server/src/db/crypto.ts)
 *   - public.deletions
 * Le collection caches/sessions non vengono migrate (ora Redis/Supabase Auth).
 *
 * Chiave di cifratura note: DB_ENCRYPTION_KEY dall'ambiente (base64, 32 byte).
 * Se assente ne viene generata una nuova, salvata in migration-encryption-key.txt
 * (da NON committare): va impostata come DB_ENCRYPTION_KEY su Vercel/Doppler,
 * oppure rilanciare lo script con la chiave già in uso.
 *
 * Uso: [DB_ENCRYPTION_KEY=...] node scripts/mongoArchiveToSupabase.js \
 *        [backupMongo/mongo_2026-07-08.archive.gz] [migration-final.sql]
 */

const fs = require('fs');
const zlib = require('zlib');
const crypto = require('crypto');
const { BSON } = require('bson');

const archivePath = process.argv[2] || 'backupMongo/mongo_2026-07-08.archive.gz';
const outputPath = process.argv[3] || 'migration-final.sql';

/* ==================== Parser archivio mongodump ==================== */

const MAGIC = 0x8199e26d;
const TERMINATOR = 0xffffffff;

function parseArchive(buf) {
  let pos = 0;
  if (buf.readUInt32LE(pos) !== MAGIC) throw new Error('Magic number errato: non è un mongodump --archive');
  pos += 4;

  const readDoc = () => {
    const size = buf.readUInt32LE(pos);
    const doc = BSON.deserialize(buf.subarray(pos, pos + size));
    pos += size;
    return doc;
  };

  readDoc(); // header archivio
  const collections = {};
  while (buf.readUInt32LE(pos) !== TERMINATOR) {
    const meta = readDoc();
    collections[`${meta.db}.${meta.collection}`] = [];
  }
  pos += 4;

  while (pos < buf.length - 4) {
    const ns = readDoc(); // {db, collection, EOF, CRC}
    const key = `${ns.db}.${ns.collection}`;
    if (!collections[key]) collections[key] = [];
    if (ns.EOF) {
      if (buf.readUInt32LE(pos) === TERMINATOR) pos += 4;
      continue;
    }
    while (pos < buf.length - 4 && buf.readUInt32LE(pos) !== TERMINATOR) collections[key].push(readDoc());
    pos += 4;
  }
  return collections;
}

/* ==================== Helpers ==================== */

const oidHex = (v) => (v == null ? null : typeof v === 'string' ? v : v.toHexString());

// ObjectId "null" di mongoose (new ObjectId(NaN)): timestamp a zero → campo non impostato
const isNullOid = (hex) => hex == null || hex.startsWith('00000000');

// UUID deterministico dall'ObjectId (24 hex → 32 hex con padding finale)
const oidToUuid = (hex) =>
  `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 24)}00000000`;

const sqlStr = (s) => (s == null ? 'NULL' : `'${String(s).replace(/\0/g, '').replace(/'/g, "''")}'`);
const sqlNum = (n) => (n == null || Number.isNaN(n) ? 'NULL' : String(n));
// Alcuni campi data sono arrivati in Mongo come epoch-millis (number) invece di Date BSON
const toIso = (d) => (d instanceof Date ? d : new Date(typeof d === 'number' ? d : String(d))).toISOString();
const sqlTs = (d) => (d == null ? 'NULL' : sqlStr(toIso(d)));
const sqlDateUTC = (d) => (d == null ? 'NULL' : sqlStr(toIso(d).slice(0, 10)));
const sqlJson = (obj) => `${sqlStr(JSON.stringify(obj))}::jsonb`;

/* ==================== Cifratura note (identica a server/src/db/crypto.ts) ==================== */

let generatedKey = false;
let keyB64 = process.env.DB_ENCRYPTION_KEY;
if (!keyB64) {
  keyB64 = crypto.randomBytes(32).toString('base64');
  generatedKey = true;
}
const encKey = Buffer.from(keyB64, 'base64');
if (encKey.length !== 32) {
  console.error('❌ DB_ENCRYPTION_KEY deve decodificare a 32 byte (openssl rand -base64 32)');
  process.exit(1);
}

function encryptField(plaintext) {
  if (!plaintext) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encKey, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64'), cipher.getAuthTag().toString('base64'), ciphertext.toString('base64')].join(':');
}

/* ==================== Estrazione ==================== */

const buf = zlib.gunzipSync(fs.readFileSync(archivePath));
const cols = parseArchive(buf);
const users = cols['sangiorgio.users'] || [];
const tags = cols['sangiorgio.tags'] || [];
const expenses = cols['sangiorgio.expenses'] || [];
const balances = cols['sangiorgio.balances'] || [];
const deletions = cols['sangiorgio.deletions'] || [];

console.log(`📦 Estratti: ${users.length} users, ${tags.length} tags, ${expenses.length} expenses, ${balances.length} balances, ${deletions.length} deletions`);

/* ==================== Mapping id ==================== */

// tags: ObjectId → id bigint progressivo (1..N), ordinati per (type, index) per leggibilità
const sortedTags = [...tags].sort((a, b) => a.type - b.type || a.index - b.index);
const tagIdByOid = new Map();
sortedTags.forEach((t, i) => tagIdByOid.set(oidHex(t._id), i + 1));

// users: ObjectId → uuid deterministico
const userUuidByOid = new Map();
for (const u of users) userUuidByOid.set(oidHex(u._id), oidToUuid(oidHex(u._id)));

const tagRef = (oid) => {
  const hex = oidHex(oid);
  if (isNullOid(hex)) return 'NULL';
  const id = tagIdByOid.get(hex);
  if (id === undefined) throw new Error(`Tag non risolto: ${hex}`);
  return String(id);
};

const userRef = (oid) => {
  const uuid = userUuidByOid.get(oidHex(oid));
  if (!uuid) throw new Error(`User non risolto: ${oidHex(oid)}`);
  return sqlStr(uuid);
};

/* ==================== Generazione SQL ==================== */

const SYNTH_DOMAIN = 'users.pacifinance.internal';
const out = [];
out.push(`-- ============================================================`);
out.push(`-- PaciFinance — Migrazione completa MongoDB → Supabase`);
out.push(`-- Generato: ${new Date().toISOString()} da scripts/mongoArchiveToSupabase.js`);
out.push(`-- Sorgente: ${archivePath}`);
out.push(`-- Contenuto: ${users.length} utenti (auth + profili), ${sortedTags.length} tags,`);
out.push(`--            ${balances.length} balances, ${expenses.length} expenses, ${deletions.length} deletions`);
out.push(`-- Prerequisito: supabase/schema.sql già applicato.`);
out.push(`-- ATTENZIONE: contiene hash bcrypt delle password — non committare, non condividere.`);
out.push(`-- ============================================================`);
out.push(``);
out.push(`begin;`);
out.push(``);
out.push(`-- Pulizia (idempotente): rimuove solo i dati di questa app.`);
out.push(`-- delete su auth.users cascata su identities/profiles/balances/expenses/deletions.`);
out.push(`delete from auth.users where email like '%@${SYNTH_DOMAIN}';`);
out.push(`delete from public.tags;`);
out.push(``);

/* ----- tags ----- */
// Le translations Mongo (solo en/it) NON vengono migrate: il frontend traduce
// le label dai locale i18n (6 lingue) e le valute via currencyConfig.ts.
out.push(`-- ---------- public.tags (${sortedTags.length}) ----------`);
out.push(`insert into public.tags (id, client_index, type, label) overriding system value values`);
out.push(
  sortedTags
    .map((t) => `  (${tagIdByOid.get(oidHex(t._id))}, ${sqlNum(t.index)}, ${sqlNum(t.type)}, ${sqlStr(t.label)})`)
    .join(',\n') + ';'
);
out.push(`select setval(pg_get_serial_sequence('public.tags', 'id'), ${sortedTags.length}, true);`);
out.push(``);

/* ----- auth.users ----- */
out.push(`-- ---------- auth.users (${users.length}) ----------`);
out.push(`-- Password: hash bcrypt originali ($2b$) — GoTrue li verifica nativamente,`);
out.push(`-- gli utenti continuano a loggarsi con lo stesso ID a 6 cifre + password.`);
out.push(`-- I campi token sono '' (non NULL) per evitare errori di scan di GoTrue.`);
for (const u of users) {
  const uuid = userUuidByOid.get(oidHex(u._id));
  const email = `${u.userId}@${SYNTH_DOMAIN}`;
  out.push(
    `insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, ` +
      `raw_app_meta_data, raw_user_meta_data, created_at, updated_at, ` +
      `confirmation_token, recovery_token, email_change_token_new, email_change, ` +
      `email_change_token_current, email_change_confirm_status, phone_change, phone_change_token, ` +
      `reauthentication_token, is_sso_user) values ` +
      `('00000000-0000-0000-0000-000000000000', ${sqlStr(uuid)}, 'authenticated', 'authenticated', ${sqlStr(email)}, ` +
      `${sqlStr(u.password)}, ${sqlTs(u.creationDate)}, ` +
      `'{"provider":"email","providers":["email"]}'::jsonb, ${sqlJson({ user_code: u.userId })}, ` +
      `${sqlTs(u.creationDate)}, now(), '', '', '', '', '', 0, '', '', '', false);`
  );
}
out.push(``);

/* ----- auth.identities ----- */
out.push(`-- ---------- auth.identities (provider email, richieste da GoTrue per il login) ----------`);
for (const u of users) {
  const uuid = userUuidByOid.get(oidHex(u._id));
  const email = `${u.userId}@${SYNTH_DOMAIN}`;
  const identityData = { sub: uuid, email, email_verified: true, phone_verified: false };
  out.push(
    `insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at) values ` +
      `(gen_random_uuid(), ${sqlStr(uuid)}, ${sqlStr(uuid)}, 'email', ${sqlJson(identityData)}, ${sqlTs(u.creationDate)}, ${sqlTs(u.creationDate)}, now());`
  );
}
out.push(``);

/* ----- profiles ----- */
out.push(`-- ---------- public.profiles (${users.length}) ----------`);
for (const u of users) {
  const uuid = userUuidByOid.get(oidHex(u._id));
  const goals = u.goals || {};
  out.push(
    `insert into public.profiles (id, user_code, nickname, account_type, created_at, ` +
      `age_tag_id, living_situation_tag_id, housing_type_tag_id, children_tag_id, country_tag_id, ` +
      `job_tag_id, job_type_tag_id, job_country_tag_id, work_time_tag_id, remote_type_tag_id, ` +
      `years_of_experience_tag_id, preferred_currency_tag_id, ` +
      `expenses_limit, savings_percent, emergency_fund_goal) values ` +
      `(${sqlStr(uuid)}, ${sqlStr(u.userId)}, ${sqlStr(u.nickname || '')}, ${sqlNum(u.type)}, ${sqlTs(u.creationDate)}, ` +
      `${tagRef(u.age)}, ${tagRef(u.livingSituation)}, ${tagRef(u.housingType)}, ${tagRef(u.children)}, ${tagRef(u.country)}, ` +
      `${tagRef(u.job)}, ${tagRef(u.jobType)}, ${tagRef(u.jobCountry)}, ${tagRef(u.workTime)}, ${tagRef(u.remoteType)}, ` +
      `${tagRef(u.yearsOfExperience)}, ${tagRef(u.preferredCurrency)}, ` +
      `${sqlNum(goals.expensesLimit ?? -1)}, ${sqlNum(goals.savingsPercent ?? -1)}, ${sqlNum(goals.emergencyFundGoal ?? -1)});`
  );
}
out.push(``);

/* ----- balances ----- */
out.push(`-- ---------- public.balances (${balances.length}) ----------`);
out.push(`insert into public.balances (user_id, recorded_at, user_date, bank, cash, digital_services, stocks, etf, bitcoin, crypto, bonds, funds, gold, emergency_fund) values`);
out.push(
  balances
    .map(
      (b) =>
        `  (${userRef(b.userRef)}, ${sqlTs(b.date)}, ${sqlDateUTC(b.userDate)}, ` +
        `${sqlNum(b.bank ?? 0)}, ${sqlNum(b.cash ?? 0)}, ${sqlNum(b.digitalServices ?? 0)}, ${sqlNum(b.stocks ?? 0)}, ` +
        `${sqlNum(b.etf ?? 0)}, ${sqlNum(b.bitcoin ?? 0)}, ${sqlNum(b.crypto ?? 0)}, ${sqlNum(b.bonds ?? 0)}, ` +
        `${sqlNum(b.funds ?? 0)}, ${sqlNum(b.gold ?? 0)}, ${sqlNum(b.emergencyFund ?? 0)})`
    )
    .join(',\n') + ';'
);
out.push(``);

/* ----- expenses ----- */
let encryptedNotes = 0;
out.push(`-- ---------- public.expenses (${expenses.length}) — notes cifrate AES-256-GCM ----------`);
out.push(`insert into public.expenses (user_id, occurred_at, amount, is_expense, notes, payment_type_tag_id, category_tag_id) values`);
out.push(
  expenses
    .map((e) => {
      const notes = encryptField(e.notes);
      if (notes) encryptedNotes++;
      return (
        `  (${userRef(e.userRef)}, ${sqlTs(e.date)}, ${sqlNum(e.amount)}, ${e.isExpense ? 'true' : 'false'}, ` +
        `${sqlStr(notes)}, ${tagRef(e.paymentType)}, ${tagRef(e.categoryTag)})`
      );
    })
    .join(',\n') + ';'
);
out.push(``);

/* ----- deletions ----- */
if (deletions.length) {
  out.push(`-- ---------- public.deletions (${deletions.length}) ----------`);
  for (const d of deletions)
    out.push(`insert into public.deletions (user_id, scheduled_for) values (${userRef(d.userRef)}, ${sqlTs(d.date)});`);
} else {
  out.push(`-- public.deletions: nessun record nel backup.`);
}
out.push(``);
out.push(`commit;`);
out.push(``);

fs.writeFileSync(outputPath, out.join('\n'));

/* ==================== Report ==================== */

if (generatedKey) {
  fs.writeFileSync(
    'migration-encryption-key.txt',
    `DB_ENCRYPTION_KEY=${keyB64}\n\n` +
      `Chiave generata da scripts/mongoArchiveToSupabase.js il ${new Date().toISOString()}.\n` +
      `Le notes in ${outputPath} sono cifrate con QUESTA chiave: impostala come\n` +
      `DB_ENCRYPTION_KEY su Vercel/Doppler prima del deploy, altrimenti l'app non\n` +
      `potrà decifrare le note. Se esiste già una DB_ENCRYPTION_KEY in produzione,\n` +
      `rilancia lo script passandola nell'ambiente e riapplica la migration.\n` +
      `NON committare questo file.\n`
  );
}

console.log(`\n✅ ${outputPath} generato (${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB)`);
console.log(`   note cifrate: ${encryptedNotes}/${expenses.length}`);
if (generatedKey) {
  console.log(`\n⚠️  DB_ENCRYPTION_KEY non era nell'ambiente: chiave NUOVA generata e salvata`);
  console.log(`   in migration-encryption-key.txt (gitignored). Vedi istruzioni nel file.`);
} else {
  console.log(`   chiave: DB_ENCRYPTION_KEY dall'ambiente`);
}
