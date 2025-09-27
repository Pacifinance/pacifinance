# 🧪 Sistema di Development Mode - Pacifinance

## Panoramica

Questo sistema ti permette di testare tutte le pagine protette dell'applicazione durante lo sviluppo senza dover configurare un database di test o compromettere la sicurezza dell'applicazione di produzione.

## 🚀 Come Attivare il Development Mode

### Metodo 1: URL Parameter
Aggiungi `?dev=true` all'URL:
```
http://localhost:5173/?dev=true
```

### Metodo 2: Development Toolbar
1. Avvia l'applicazione in development mode (`npm run dev`)
2. Cerca il bottone 🔒 in basso a destra
3. Clicca per switchare in modalità 🧪 MOCK

### Metodo 3: Console Browser
```javascript
localStorage.setItem('pacifinance-dev-mode', 'true');
window.location.reload();
```

## 📱 Interfaccia Development Toolbar

La toolbar di sviluppo offre:
- **Toggle Mode**: Passa tra MOCK (🧪) e PROD (🔒)
- **Clear Storage**: Pulisce localStorage
- **Reload**: Ricarica la pagina
- **Info Environment**: Mostra modalità corrente

## 🎭 Dati Mock Disponibili

Quando il development mode è attivo, vengono utilizzati dati mock realistici:

### Utente Mock
```javascript
{
  id: 'dev-user-123',
  email: 'dev@test.com',
  name: 'Developer User',
  isAuthenticated: true,
  premium: true
}
```

### Dati Dashboard Mock
- **Asset Tradizionali**: Conto Corrente (€5.000), Conto Deposito (€15.000), Contanti (€500)
- **Investimenti**: ETF World (€25.000), BTP Italia (€10.000), Azioni Apple (€8.000)
- **Spese**: Affitto (€800), Spesa (€300), Trasporti (€150)
- **Entrate**: Stipendio (€2.500), Freelance (€500)

## 🔧 Configurazione

### File `.env.development`
```env
VITE_DEV_MODE=true
VITE_MOCK_AUTH=true
VITE_AUTO_DEV_MODE=true
VITE_MOCK_USER_PREMIUM=true
```

### Componenti Coinvolti
- `MockAuthContext.jsx`: Gestisce l'autenticazione mock
- `DevModeProvider.jsx`: Provider che sceglie tra mock e produzione
- `useAuth.js`: Hook unificato per l'autenticazione
- `DevToolbar.jsx`: Interfaccia di controllo per developer

## 🛡️ Sicurezza

- **Solo Development**: Il sistema funziona SOLO in `import.meta.env.DEV`
- **Nessun Impact Produzione**: Non influisce mai sulla build di produzione
- **Dati Isolati**: I dati mock sono completamente separati da quelli reali

## 🧪 Testing delle Funzionalità

Con il development mode puoi testare:
- ✅ Tutte le pagine protette (`/dashboard`, `/charts-statistics`, ecc.)
- ✅ Sistema di privacy (pulsante privacy nella sidebar)
- ✅ Autenticazione e logout
- ✅ Funzionalità premium
- ✅ Rendering responsive su mobile/desktop

## 🚨 Troubleshooting

### Problema: Il development mode non si attiva
1. Verifica che `import.meta.env.DEV` sia `true`
2. Controlla la console per errori
3. Prova a cancellare localStorage e ricaricare

### Problema: Dati non aggiornati
1. Usa "Clear Storage" nella dev toolbar
2. Ricarica la pagina
3. Verifica che il pulsante mostri 🧪 MOCK

### Problema: Auth Context non trovato
Il sistema usa automaticamente il fallback corretto, ma assicurati che:
- `DevModeProvider` sia wrappato correttamente in `index.jsx`
- I context providers siano nell'ordine giusto

## 📝 Note per il Development

- Il sistema preserva completamente la struttura di sicurezza originale
- I dati mock sono realistici per test significativi
- La toolbar è nascosta automaticamente in produzione
- Tutti i hook e componenti continuano a funzionare normalmente

## 🎯 Vantaggi

1. **Test Completo**: Accesso a tutte le funzionalità senza database
2. **Sviluppo Veloce**: Niente setup complicato, attivazione immediata
3. **Sicurezza Preservata**: Zero impact sulla logica di produzione
4. **Debug Facile**: Toolbar con strumenti di sviluppo integrati
5. **Dati Realistici**: Mock data progettati per test significativi