# Investment Platform Export Formats — Research for the Import Feature

> Status: research reference (July 2026). Feeds the "import investments / reduce manual entry" roadmap items.
> Goal: let users import holdings & transactions from their broker/exchange exports instead of manual entry,
> while keeping Pacifinance's privacy model (parsing client-side where possible, no third-party credentials stored server-side unless user-supplied read-only API keys).

## Part 1 — Brokers / Banks

### DEGIRO
- **Formats**: CSV and XLS from the web app (Activity > Transactions / Account Statement / Portfolio). No official API (unofficial: `degiro-connector` Python lib).
- **What**: Both — `Transactions.csv` (trades), `Account.csv` (all cash movements: dividends, fees, FX), `Portfolio.csv` (current positions snapshot).
- **Structure**: Transactions columns (localized): *Date, Time, Product, ISIN, Exchange, Quantity, Price, Local value, Value, Exchange rate, Transaction costs, Total, Order ID*. Verbatim Account.csv header from a real (Dutch) export: `Datum,Tijd,Valutadatum,Product,ISIN,Omschrijving,FX,Mutatie,,Saldo,,Order Id` — note the **unnamed currency columns** preceding each amount. Dates `dd-MM-yyyy`, **decimal comma**, ISIN always present.
- **Quirks**: headers and the free-text description column are **localized per account language** (AllInvestView handles 12 languages); transaction type (buy/sell/dividend/fee) must be inferred from the localized description text in Account.csv; currency travels in its own unnamed column.

### Trade Republic
- **Formats**: **No native CSV/XLSX export** — only PDF statements. Community standard: [pytr](https://github.com/pytr-org/pytr) (unofficial API client) whose `export_transactions` produces `account_transactions.csv`, and `dl_docs` mass-downloads PDFs.
- **Structure** (pytr output, verbatim sample): `Datum;Transactietype;Waarde (netto);Opmerking;ISIN;Aantal;Kosten;Belasting` — semicolon-delimited, ISO dates, **decimal comma**, headers localized to the chosen output language (German default).
- **Quirks**: unofficial API can break anytime; PDF-based converters exist (Thukyd/trade-republic-portfolio, jcmpagel/Trade-Republic-CSV-Excel, kalix127/tradesight). Export-To-Ghostfolio labels TR support "experimental, via pytr".

### Scalable Capital
- **Formats**: Native **CSV export** of transactions ("CSV exportieren"); settlement PDFs from Baader Bank. No public API.
- **Structure**: semicolon-delimited; columns: *date; time; status; reference; description; assetType; type; isin; shares; price; amount; fee; tax; currency*. **ISIN present.** German-account exports have German values/labels.
- **Quirks**: statements omit details that only exist in per-trade PDFs (Portfolio Performance's Baader/Scalable PDF importer is the community reference).

### Interactive Brokers (IBKR)
- **Formats**: **Flex Queries** — customizable CSV/XML; **Flex Web Service** (documented HTTPS API: token + query ID → fetch report). Also Client Portal / TWS APIs.
- **What**: Both — trades, dividends, cash, open positions (selectable report sections).
- **Structure**: user chooses columns. Export-To-Ghostfolio recommended trades query, verbatim: `"Buy/Sell","TradeDate","ISIN","Quantity","TradePrice","TradeMoney","CurrencyPrimary","IBCommission","IBCommissionCurrency"` — rows like `"BUY","20230522","CH0111762537","7","282.7","1978.9","CHF","-5","CHF"`. Dates `YYYYMMDD`, decimal point, per-row currency.
- **Quirks**: max 365 days per query; columns are user-selected → publish a "required Flex Query recipe". Flex Web Service is the single best serverless-friendly broker integration.

### eToro
- **Formats**: Account Statement as **XLSX or PDF** (multi-tab workbook: Account Summary, Closed Positions, Account Activity, Dividends, Financial Summary).
- **Structure**: Account Activity header, verbatim: `Date,Type,Details,Amount,Units,Realized Equity Change,Realized Equity,Balance,Position ID,Asset type,NWA`; rows like `02/01/2024 00:10:33,Dividend,NKE/USD,0.17,-,0.17,"4,581.91",99.60,2272508626,Stocks,0.00`.
- **Quirks**: **no ISIN** — instrument is `TICKER/CCY` in `Details`; dates `DD/MM/YYYY HH:mm:ss`; thousands separators inside quoted fields; account-currency denominated (USD for most legacy accounts); Position ID is the only stable id.

### FinecoBank
- **Formats**: XLSX/CSV via "Esporta risultato" on movements and executed orders; quarterly statement is an **encrypted PDF**. No public API.
- **Structure**: not publicly documented; Italian headers, decimal comma. Portfolio Performance has **no Fineco importer** (open forum requests). Needs real sample files from a Fineco user — ship as "beta, send us your file".

### Directa SIM
- **Formats**: CSV/Excel export of movements; documented Trading API ("dAPI") but it requires the locally-installed Darwin platform — *not* serverless-viable.
- **Structure** (verbatim from Export-To-Ghostfolio sample): ~9 preamble lines (`Conto : ...`, `Data estrazione : ...`, `Il file include i primi 3000 movimenti`), then header `Data operazione,Data valuta,Tipo operazione,Ticker,Isin,Protocollo,Descrizione,Quantità,Importo euro,Importo Divisa,Divisa,Riferimento ordine`; rows like `27-12-2024,27-12-2024,Provento etf,IEMB,IE00B2NPKV68,YYYYYYY,ISHARES JPMORGAN s EMERGING MA,0,20.95,0,EUR,`.
- **Quirks**: Italian headers and operation types ("Provento etf"); dates `dd-MM-yyyy`; **decimal point** (unusual for an Italian platform); 3,000-movement cap per file; both Ticker and ISIN present.

### Moneyfarm
- Managed portfolios: **PDF only**, no CSV export, no API. Lowest priority (manual entry or future PDF parsing).

### Revolut
- **Formats**: Invest exports CSV/Excel/PDF; Crypto exports CSV. No investment API (Open Banking covers only current accounts).
- **Structure — Invest, verbatim**: `Date,Ticker,Type,Quantity,Price per share,Total Amount,Currency,FX Rate` — rows like `2019-12-02T08:23:08.459586Z,,CASH WITHDRAWAL,,,-$30.93,USD,1.1019`. **Crypto, verbatim**: `Symbol,Type,Quantity,Price,Value,Fees,Date` — rows like `BTC,Buy,0.00056077,"89,162.28 SEK",50.00 SEK,0.00 SEK,"May 5, 2020, 10:10:57 PM"`.
- **Quirks**: **no ISIN**; currency symbols embedded inside numeric fields (`-$30.93`, `50.00 SEK`); Invest uses ISO-8601+microseconds+`Z`, Crypto uses localized long-form English dates.

### Trading 212
- **Formats**: CSV export (History) **and documented public API (beta)** — <https://t212public-api-docs.redoc.ly/> — portfolio, order history, dividends, cash transactions, server-side CSV-report generation. API key in Settings > API (Beta).
- **Structure** (verbatim): `Action,Time,ISIN,Ticker,Name,No. of shares,Price / share,Currency (Price / share),Exchange rate,Result,Currency (Result),Total,Currency (Total),Withholding tax,Currency (Withholding tax),Notes,ID,Currency conversion fee,Currency (Currency conversion fee)`; row: `Market buy,2023-12-18 14:30:03.613,US17275R1023,CSCO,"Cisco Systems",0.0290530000,49.96,USD,1.09303,,"EUR",1.33,"EUR",,,,EOF7504196256,,`.
- **Quirks**: cleanest export of all — but the column set **varies with the user's export options**: match by header name, never by index; 365 days max per file.

### XTB
- **Formats**: xStation Account History CSV/XLSX/HTML; Cash Operations CSV/HTML. xAPI is WebSocket/trading-oriented — awkward for import.
- **Structure** (Cash Operations CSV, verbatim): `ID;Type;Time;Symbol;Comment;Amount` — row: `530692719;Stocks/ETF purchase;12.04.2024 13:01:45;SPYL.DE;OPEN BUY 34/42.5658 @ 11.7480;-399.43`.
- **Quirks**: semicolon delimiter; dates `dd.MM.yyyy HH:mm:ss`; **no ISIN** (ticker + exchange suffix); share count and price **embedded in the free-text `Comment`** (regex extraction).

## Part 2 — Crypto Exchanges

### Binance
- **Formats**: CSV ("Export Transaction Records", async, quota-limited) + fully documented REST API (read-only keys).
- **Structure** (verbatim): `User_ID,UTC_Time,Account,Operation,Coin,Change,Remark`. UTC times, decimal point.
- **Quirks**: it's a **ledger, not a trade list** — one trade = 2–3 rows (bought asset, sold asset, fee) sharing a timestamp that must be re-joined; dozens of `Operation` values.

### Coinbase
- **Formats**: CSV statements + documented APIs (Coinbase App / Advanced Trade under CDP).
- **Structure** (verbatim): `ID,Timestamp,Transaction Type,Asset,Quantity Transacted,Price Currency,Price at Transaction,Subtotal,Total (inclusive of fees and/or spread),Fees and/or Spread,Notes` — row: `678a8bde...,2025-01-17 16:57:02 UTC,Staking Income,ETH,0.000037835729,EUR,€3343.11229989,€0.12649,€0.12649,€0.00,`.
- **Quirks**: currency symbols embedded in numeric fields (`€3343.11`); schema has changed over the years — detect by header content.

### Kraken
- **Formats**: `trades.csv` and `ledgers.csv`; documented REST API (`TradesHistory`, `Ledgers`).
- **Structure**: trades: *txid, ordertxid, pair, time, type, ordertype, price, cost, fee, vol, margin, misc, ledgers*; UTC timestamps with subseconds; always decimal point.
- **Quirks**: legacy asset codes (`XXBT`, `ZEUR`) need normalization; pair strings (`XXBTZEUR`) must be split.

### Crypto.com (App)
- **Formats**: CSV from the app. The retail App has **no public API** (the separate Exchange does).
- **Structure** (verbatim): `Timestamp (UTC),Transaction Description,Currency,Amount,To Currency,To Amount,Native Currency,Native Amount,Native Amount (in USD),Transaction Kind,Transaction Hash`.
- **Quirks**: swaps via `Currency`/`To Currency` column pairs; large evolving `Transaction Kind` enum; very long decimal precision.

### Bitpanda
- **Formats**: CSV (separate trades and transactions exports) or PDF; **public REST API** (officially recommended over CSV).
- **Quirks**: CSV cannot represent crypto-index trades correctly — API import recommended; Bitpanda Pro/One Trading has a different CSV.

### Young Platform
- **Formats**: CSV Transaction Report (Report Center — Movements and Orders, per year). No public API documented.
- Column layout not publicly documented — needs a real sample; ranks high specifically for the Italian user base.

## Part 3 — Synthesis for a Universal Import Parser

### Instrument identification
- **ISIN wins for securities** in the EU (MiFID): natively present in DEGIRO, Trading 212, Directa, Scalable, Trade Republic (pytr/PDF), IBKR (selectable). **Missing from eToro, Revolut, XTB** — resolve ticker→ISIN via OpenFIGI (already integrated in Pacifinance's instrument catalog).
- Crypto: key on **asset symbol** with normalization table (Kraken `XXBT`→BTC).
- Internal model: `{ isin?, ticker?, exchangeSuffix?, name, assetClass }`, resolution priority ISIN > ticker+exchange > fuzzy name.

### Date formats to support
| Format | Seen in |
|---|---|
| `YYYY-MM-DD HH:mm:ss(.SSS)` (± ` UTC`) | Trading 212, Coinbase, Kraken, Binance, Crypto.com |
| ISO-8601 with `Z` + microseconds | Revolut Invest |
| `dd-MM-yyyy` | DEGIRO, Directa |
| `dd.MM.yyyy HH:mm:ss` | XTB |
| `DD/MM/YYYY HH:mm:ss` | eToro |
| `YYYYMMDD` | IBKR Flex |
| Localized long form (`May 5, 2020, 10:10:57 PM`) | Revolut Crypto |

Store date-only for valuation; never `toISOString().split('T')[0]` (CLAUDE.md).

### Pitfalls checklist
1. Decimal comma vs point (+ thousands separators, `1.431,00` vs `4,581.91`) — infer per column, not per file.
2. Delimiter comma vs **semicolon** (DEGIRO, XTB, Scalable, pytr) — sniff the header row.
3. **Localized headers** (DEGIRO ×12 languages, Scalable DE/EN, Fineco/Directa Italian) + localized transaction-type strings — multilingual header dictionaries.
4. Currency symbols inside numeric fields (Coinbase `€…`, Revolut `-$…` / `… SEK`) — strip with regex.
5. Unnamed / companion currency columns (DEGIRO blank-named; T212 `Currency (X)`).
6. Preamble rows before the header (Directa ~9 lines) — scan to the first plausible header.
7. Ledger-style multi-row trades (Binance, Kraken ledgers) — group by timestamp/ref first.
8. Data embedded in free text (XTB `Comment`, DEGIRO descriptions) — regex extraction.
9. Column sets vary per user (T212 options, IBKR Flex) — match by header name, never index.
10. Row/date caps (365d T212/IBKR, 3,000 rows Directa) — support multi-file merge with dedup on transaction/order IDs (T212 `ID`, Kraken `txid`, Directa `Riferimento ordine`, eToro `Position ID`).

### Priority order (Italian/European user base)
Brokers: **1. Trading 212 · 2. DEGIRO · 3. Directa · 4. IBKR Flex · 5. Scalable · 6. Fineco (beta, needs samples) · 7. eToro · 8. Trade Republic (via pytr CSV) · 9. Revolut/XTB · 10. Moneyfarm**.
Crypto: **Binance → Coinbase → Kraken → Young Platform → Crypto.com → Bitpanda**.
Universal fallback: accept the **Ghostfolio / Portfolio Performance generic CSV** formats — users of any unsupported platform can convert via Export-To-Ghostfolio (26 platforms inherited for free).

### Documented public APIs usable from a serverless backend (user-supplied read-only keys)
- **Trading 212 Public API (beta)** — REST; portfolio + history + CSV report generation.
- **IBKR Flex Web Service** — plain HTTPS (token + query ID → CSV/XML). Lowest-friction broker integration.
- **Binance, Coinbase (CDP), Kraken, Bitpanda** — full REST APIs; recommended path for crypto.
- Not viable: Directa dAPI (requires local Darwin), Crypto.com App, eToro, Fineco, Moneyfarm, Revolut Invest, Young Platform. Unofficial only (ToS/breakage risk, avoid server-side): degiro-connector, pytr.

### Open-source parser goldmine
dickwolff/Export-To-Ghostfolio (26 platforms, sample CSVs in `/samples`) · portfolio-performance/portfolio (90+ bank PDF extractors) · ghostfolio/ghostfolio · pytr-org/pytr · Gaunah/DegiroTransactionConverter · bogdanghervan/revolut-statement · Piotr20/xtb-xlsx-cleaner · matthesvoss/Scalable-Capital-Transactions-Exporter · bennycode/trading212-api · prikhi/binance-exports · masterglob/kraken-ledgers-parse · NiccoloSalvini/directa-api-python.
