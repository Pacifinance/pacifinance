# PaciFinance Backend - TODO

> Ultimo aggiornamento: 12/02/2026

---

## 🔧 Da Fare

### Urgente
- [ ] capire perché gli url variabilizzati con le lingue non funzionano (per ora l'url che funziona per browser senza cache è solo pacifinance.com)

### Valute & Moneta
- [ ] Aggiungere richiesta API e sistema di cache per le valute (mettine più possibili) ★
- [ ] Aggiungere alla route del profilo un campo currency, per permettere all'utente di scegliere la sua moneta di riferimento e salvarla a db (ora salvata in locale ) ★

### Rankings & Confronti
- [ ] Modificare la response di tutti i rank e mandare solo il rapporto tra data.position e data.total moltiplicato * 100 ★

### Profilo Utente
- [ ] Aggiungere al profilo dati per facilitare la profilazione utenti simili: anni di esperienza nel settore, età utente, vivi da solo o meno (utile per spese condominiali, affitto, mutuo, da capire come scriverlo), figli o no? ★
- [ ] Profile - Back End
  - [x] Nationality
  - [x] Job
  - [ ] Auto-generated nickname
  - [x] Job type (employee/freelance, full/part time, office/hybrid/remote)

### Spese & Entrate
- [ ] Permettere all'utente di modificare una sua spesa o entrata inserita ★
- [ ] Permettere di vedere tutte le spese e le entrate inserite all'utente anche oltre l'anno (guardare filtri grafici) ★
- [ ] Aggiungere limite di spesa per utente mensile a db (ora salvato in locale) ★
- [ ] Aggiungere obbiettivo di income mensile a db (ragioniamoci)
- [ ] Aggiungere fattore 100 per convertire i valori inseriti dall'utente in centesimi così non ne perdiamo per Error floating point (ovunque) ★
- [ ] Permettere per gli abbonamenti di attivare la ricorrenza e scalare in automatico delle spese ogni mese

### Investimenti
- [ ] Fare categorie degli investimenti (BTC, Crypto, Stocks, Gold, ecc...)

### API Prices Data
- [ ] Settare una o più route alla quale richiedere i dati crypto, stocks e etf ★
  - [x] Cache requirements
  - [x] Cache design
  - [x] Cache implementation
  - [x] Crypto API
  - [ ] Stocks API
  - [ ] ETF API

### Roadmap & Community
- [ ] Sviluppare interazione backend Roadmap page ★
- [ ] Metodo per invitare amici/conoscenti inviti limitati (magari danno dei primi agli utenti o vantaggi) (al posto dell'iscrizione) (Hype culture)

### Autenticazione & Login
- [ ] Permettere all'utente di avere il login smart (salvare in cache l'informazione e gestire dal backend due login diversi)

### Qualità Codice
- [ ] Controllare nomenclatura backend soprattutto per il formato dei dati e dei campi nelle route ma anche per il resto

### Performance
- [ ] Enable text compression Server Side
  - [ ] https://developer.chrome.com/docs/lighthouse/performance/uses-text-compression/?utm_source=lighthouse&utm_medium=lr

---

## ✅ Completati

- [x] Ritornare media Bilancio, media spesa del mese, media income del mese di tutti gli utenti per analisi comparativa anonima ★
- [x] Aggiungere lato investimenti Obbligazioni, Fondi e Oro (come campi del portafoglio tipo BTC, crypto etf ecc) ★
- [x] Permettere all'utente di scaricare tutti i suoi dati, quindi fare una route che invia tutti i dati anche quelli storici ★
- [x] Aggiungere lavori: logistica e trasporti, Artigiano (lo ha richiesto un fabbro), Trader, per chi lavora nei bar o nei ristoranti cosa c'é?, commercialista? ★
- [x] Documentazione Backend ★
- [x] Cancella questi utenti, è stato un mio test (SPERA): 176545, 849316 e 611604 ★
- [x] Togliere Matomo database, dati e il codice dal server
  - [x] Disabilitare Apache
  - [ ] Cancellare dati
- [x] Cookie login per Backend ★
