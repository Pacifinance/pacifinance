#!/usr/bin/env node

/**
 * Parser corretto del formato `mongodump --archive` (gzip).
 * Formato: magic (0x8199e26d LE) | header BSON | collection metadata BSON...
 * | 0xFFFFFFFF | [namespace header BSON | doc BSON... | 0xFFFFFFFF]...
 * Ogni documento viene attribuito alla sua collezione reale tramite i
 * namespace header, senza euristiche sulla forma dei documenti.
 *
 * Uso: node scripts/parseMongoArchive.js <archive.gz> <outputDir>
 */

const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const { BSON } = require('bson');

const archivePath = process.argv[2] || 'backupMongo/mongo_2026-07-08.archive.gz';
const outputDir = process.argv[3] || 'extracted_json';

const buf = zlib.gunzipSync(fs.readFileSync(archivePath));

const MAGIC = 0x8199e26d;
const TERMINATOR = 0xffffffff;

let pos = 0;
const magic = buf.readUInt32LE(pos);
if (magic !== MAGIC) {
  console.error(`❌ Magic number errato: 0x${magic.toString(16)} (atteso 0x8199e26d)`);
  process.exit(1);
}
pos += 4;

function readDoc() {
  const size = buf.readUInt32LE(pos);
  const doc = BSON.deserialize(buf.subarray(pos, pos + size));
  pos += size;
  return doc;
}

// Prelude: header + collection metadata fino al terminatore
const header = readDoc();
console.log(`📦 Archive header: ${JSON.stringify(header)}\n`);

const collectionsMeta = [];
while (buf.readUInt32LE(pos) !== TERMINATOR) {
  const meta = readDoc();
  collectionsMeta.push(meta);
  console.log(`  collezione dichiarata: ${meta.db}.${meta.collection} (size: ${meta.size})`);
}
pos += 4; // salta terminatore

// Body: segmenti di namespace
const collections = {};
for (const m of collectionsMeta) collections[`${m.db}.${m.collection}`] = [];

while (pos < buf.length - 4) {
  const nsHeader = readDoc(); // {db, collection, EOF, CRC}
  const key = `${nsHeader.db}.${nsHeader.collection}`;
  if (!collections[key]) collections[key] = [];

  if (nsHeader.EOF) {
    // segmento di chiusura: subito il terminatore
    if (buf.readUInt32LE(pos) === TERMINATOR) pos += 4;
    continue;
  }
  while (pos < buf.length - 4 && buf.readUInt32LE(pos) !== TERMINATOR) {
    collections[key].push(readDoc());
  }
  pos += 4; // terminatore di fine segmento
}

// EJSON-friendly: ObjectId -> hex string, Date -> ISO
function normalize(v) {
  if (v === null || v === undefined) return v;
  if (v._bsontype === 'ObjectId' || v._bsontype === 'ObjectID') return v.toHexString();
  if (v instanceof Date) return v.toISOString();
  if (Array.isArray(v)) return v.map(normalize);
  if (typeof v === 'object') {
    const out = {};
    for (const [k, val] of Object.entries(v)) out[k] = normalize(val);
    return out;
  }
  return v;
}

fs.mkdirSync(outputDir, { recursive: true });
console.log(`\n📊 Documenti estratti:\n`);
for (const [name, docs] of Object.entries(collections)) {
  const file = path.join(outputDir, `${name.replace(/\./g, '_')}.json`);
  fs.writeFileSync(file, JSON.stringify(docs.map(normalize), null, 2));
  console.log(`  ${name}: ${docs.length} documenti → ${file}`);
}
console.log('\n✅ Fatto\n');
