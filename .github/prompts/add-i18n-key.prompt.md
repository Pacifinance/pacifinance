---
mode: agent
description: Aggiunge una o più chiavi di traduzione in it.json e en.json
---

Aggiungi le seguenti chiavi di traduzione a entrambi i file locale:

## Keys da aggiungere
<!-- elenca qui le chiavi e i valori: -->
- `sezione.sottochiave` — IT: "..." / EN: "..."

---

## Processo

1. **Leggi il contesto** — verifica se la sezione esiste già in `it.json` e `en.json`
2. **Aggiungi in `src/i18n/locales/it.json`** — nella sezione corretta (non duplicare sezioni)
3. **Aggiungi in `src/i18n/locales/en.json`** — stesso path di chiave, testo in inglese
4. **Verifica struttura** — le chiavi devono esistere identiche in entrambi i file
5. **Usa le nuove chiavi** nel componente: `translations.sezione.sottochiave`

## Regole chiavi
- camelCase per tutti i livelli: `dashboard.weeklyChart.noData`
- Sezioni esistenti: `common`, `errors`, `navigation`, `dashboard`, `profile`, `settings`, 
  `auth`, `goals`, `limits`, `assets`, `incomes`, `outflows`, `rankings`, `roadmap`, `landing`
- Se la sezione non esiste, aggiungila come oggetto nuovo

## Verifica
```bash
# Controlla che le chiavi siano bilanciate (stesso numero di chiavi in entrambi i file)
npm run lint
```
