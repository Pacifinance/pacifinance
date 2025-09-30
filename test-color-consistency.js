#!/usr/bin/env node

// Test script per verificare la consistenza dei colori
// Verifica che tutti i componenti utilizzino il sistema di colori centralizzato

const fs = require('fs');
const path = require('path');

// Colori che dovrebbero essere sostituiti con assetColors
const deprecatedColors = [
    '#0D579B', // bank
    '#329239', // cash  
    '#74b9ff', // digitalServices
    '#FF6600', // stocks
    '#a29bfe', // etf
    '#F7B510', // bitcoin
    '#d63031', // crypto
    '#079164', // totalLiquidity/savings
    '#27ae60', // income
    '#e74c3c', // expense
    '#333',    // textPrimary
    '#666'     // textSecondary
];

// Pattern per identificare colori hex
const hexColorPattern = /#[0-9A-Fa-f]{3,6}/g;

// File da controllare
const filesToCheck = [
    'src/sections/Dashboard.jsx',
    'src/components/BalancesCharts.jsx',
    'src/components/BalancesLinesChart.jsx',
    'src/components/InOutChart.jsx',
    'src/components/PercentageOutflowsChart.jsx',
    'src/components/InOutStatsMonth.jsx',
    'src/components/InOutStatsYear.jsx',
    'src/pages/StatsCharts.jsx'
];

console.log('🔍 Controllo consistenza colori...\n');

let issues = [];

filesToCheck.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  File non trovato: ${filePath}`);
        return;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    const matches = content.match(hexColorPattern) || [];
    
    if (matches.length > 0) {
        console.log(`❌ Colori hardcoded trovati in ${filePath}:`);
        matches.forEach(match => {
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                if (line.includes(match)) {
                    console.log(`   Riga ${index + 1}: ${match} in "${line.trim()}"`);
                    issues.push({
                        file: filePath,
                        line: index + 1,
                        color: match,
                        context: line.trim()
                    });
                }
            });
        });
        console.log('');
    } else {
        console.log(`✅ ${filePath} - Nessun colore hardcoded trovato`);
    }
});

// Verifica import di assetColors
console.log('\n📦 Controllo import assetColors...\n');

filesToCheck.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
        return;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    if (content.includes('assetColors') || content.includes('getAssetColor')) {
        if (content.includes('import') && content.includes('assetColors')) {
            console.log(`✅ ${filePath} - Import assetColors presente`);
        } else {
            console.log(`⚠️  ${filePath} - Usa assetColors ma manca import`);
            issues.push({
                file: filePath,
                issue: 'Missing assetColors import'
            });
        }
    } else {
        console.log(`ℹ️  ${filePath} - Non utilizza assetColors`);
    }
});

// Riepilogo
console.log('\n📊 RIEPILOGO:');
if (issues.length === 0) {
    console.log('✅ Tutti i controlli superati! Sistema di colori centralizzato implementato correttamente.');
} else {
    console.log(`❌ ${issues.length} problemi trovati:`);
    issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.file}: ${issue.color || issue.issue}`);
    });
}

console.log('\n🎨 Sistema assetColors.js:');
try {
    const assetColorsPath = path.join(__dirname, 'src/data/assetColors.js');
    const assetColorsContent = fs.readFileSync(assetColorsPath, 'utf8');
    
    console.log('✅ File assetColors.js presente');
    
    // Conta le definizioni di colori
    const colorDefinitions = assetColorsContent.match(/primary:|gradient:|light:|dark:/g) || [];
    console.log(`📈 ${colorDefinitions.length} definizioni di colori trovate`);
    
    // Verifica funzione getAssetColor
    if (assetColorsContent.includes('getAssetColor')) {
        console.log('✅ Funzione getAssetColor presente');
    } else {
        console.log('❌ Funzione getAssetColor mancante');
    }
    
} catch (error) {
    console.log('❌ File assetColors.js non trovato');
    issues.push({ issue: 'assetColors.js missing' });
}

process.exit(issues.length > 0 ? 1 : 0);