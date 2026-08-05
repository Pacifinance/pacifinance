export type ReminderType =
    | "monthlySummary"
    | "dataUpdateReminder"
    | "recurringDue"
    | "sharedExpenseUpdates"
    | "communityPriceUpdates"

const SUPPORTED_LANGUAGES = ["it", "en", "es", "de", "fr", "pt-BR"] as const
type Language = (typeof SUPPORTED_LANGUAGES)[number]

function resolveLanguage(language: string | undefined | null): Language {
    return (SUPPORTED_LANGUAGES as readonly string[]).includes(language || "") ? (language as Language) : "en"
}

/** Simple EUR formatting for a push notification body — the DB stores EUR only
 *  (see CLAUDE.md); converting to the user's display currency here would need
 *  a live FX fetch in the cron job for a nudge that doesn't need to be exact. */
function formatEur(amount: number): string {
    return `€${Math.round(amount).toLocaleString("en-US")}`
}

const MONTH_NAMES: Record<Language, string[]> = {
    it: ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    de: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
    fr: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
    "pt-BR": ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
}

export function monthLabel(monthStart: Date, language: string | undefined | null): string {
    const lang = resolveLanguage(language)
    return MONTH_NAMES[lang][monthStart.getUTCMonth()]
}

interface ContentInputs {
    monthlySummary: { monthLabel: string; totalOutflows: number; totalIncomes: number }
    dataUpdateReminder: Record<string, never>
    recurringDue: { count: number }
    sharedExpenseUpdates: Record<string, never>
    communityPriceUpdates: { count: number }
}

type Builder<T extends ReminderType> = (data: ContentInputs[T]) => { title: string; body: string }

const TEMPLATES: { [L in Language]: { [T in ReminderType]: Builder<T> } } = {
    en: {
        monthlySummary: (d) => ({ title: `Your ${d.monthLabel} summary is ready`, body: `Outflows ${formatEur(d.totalOutflows)} · Income ${formatEur(d.totalIncomes)}` }),
        dataUpdateReminder: () => ({ title: "Haven't seen you in a while", body: "Add your latest numbers to keep your dashboard accurate." }),
        recurringDue: (d) => ({ title: "A recurring transaction is coming up", body: d.count === 1 ? "You have 1 recurring transaction due soon." : `You have ${d.count} recurring transactions due soon.` }),
        sharedExpenseUpdates: () => ({ title: "Money still owed to you", body: "You have a pending amount that hasn't been settled yet." }),
        communityPriceUpdates: (d) => ({ title: "New community price available", body: d.count === 1 ? "A verified price was added for an instrument you hold." : `Verified prices were added for ${d.count} instruments you hold.` }),
    },
    it: {
        monthlySummary: (d) => ({ title: `Il tuo riepilogo di ${d.monthLabel} è pronto`, body: `Uscite ${formatEur(d.totalOutflows)} · Entrate ${formatEur(d.totalIncomes)}` }),
        dataUpdateReminder: () => ({ title: "Non ti vediamo da un po'", body: "Aggiorna i tuoi dati per mantenere accurata la dashboard." }),
        recurringDue: (d) => ({ title: "Sta per arrivare una transazione ricorrente", body: d.count === 1 ? "Hai 1 transazione ricorrente in scadenza." : `Hai ${d.count} transazioni ricorrenti in scadenza.` }),
        sharedExpenseUpdates: () => ({ title: "Hai ancora un credito da riscuotere", body: "C'è un importo in sospeso che non è ancora stato saldato." }),
        communityPriceUpdates: (d) => ({ title: "Nuovo prezzo community disponibile", body: d.count === 1 ? "È stato verificato un prezzo per uno strumento che possiedi." : `Sono stati verificati prezzi per ${d.count} strumenti che possiedi.` }),
    },
    es: {
        monthlySummary: (d) => ({ title: `Tu resumen de ${d.monthLabel} ya está listo`, body: `Gastos ${formatEur(d.totalOutflows)} · Ingresos ${formatEur(d.totalIncomes)}` }),
        dataUpdateReminder: () => ({ title: "Hace tiempo que no te vemos", body: "Actualiza tus datos para mantener el panel al día." }),
        recurringDue: (d) => ({ title: "Se acerca una transacción recurrente", body: d.count === 1 ? "Tienes 1 transacción recurrente próxima a vencer." : `Tienes ${d.count} transacciones recurrentes próximas a vencer.` }),
        sharedExpenseUpdates: () => ({ title: "Todavía te deben dinero", body: "Tienes un importe pendiente que aún no se ha saldado." }),
        communityPriceUpdates: (d) => ({ title: "Nuevo precio de la comunidad disponible", body: d.count === 1 ? "Se verificó un precio para un instrumento que posees." : `Se verificaron precios para ${d.count} instrumentos que posees.` }),
    },
    de: {
        monthlySummary: (d) => ({ title: `Deine Zusammenfassung für ${d.monthLabel} ist bereit`, body: `Ausgaben ${formatEur(d.totalOutflows)} · Einnahmen ${formatEur(d.totalIncomes)}` }),
        dataUpdateReminder: () => ({ title: "Lange nichts von dir gehört", body: "Aktualisiere deine Zahlen, damit dein Dashboard stimmt." }),
        recurringDue: (d) => ({ title: "Eine wiederkehrende Buchung steht an", body: d.count === 1 ? "1 wiederkehrende Buchung steht bald an." : `${d.count} wiederkehrende Buchungen stehen bald an.` }),
        sharedExpenseUpdates: () => ({ title: "Dir wird noch Geld geschuldet", body: "Ein ausstehender Betrag wurde noch nicht beglichen." }),
        communityPriceUpdates: (d) => ({ title: "Neuer Community-Preis verfügbar", body: d.count === 1 ? "Für ein von dir gehaltenes Instrument wurde ein Preis bestätigt." : `Für ${d.count} von dir gehaltene Instrumente wurden Preise bestätigt.` }),
    },
    fr: {
        monthlySummary: (d) => ({ title: `Votre résumé de ${d.monthLabel} est prêt`, body: `Dépenses ${formatEur(d.totalOutflows)} · Revenus ${formatEur(d.totalIncomes)}` }),
        dataUpdateReminder: () => ({ title: "Ça fait un moment qu'on ne vous a pas vu", body: "Mettez à jour vos données pour garder votre tableau de bord à jour." }),
        recurringDue: (d) => ({ title: "Une transaction récurrente approche", body: d.count === 1 ? "1 transaction récurrente arrive bientôt à échéance." : `${d.count} transactions récurrentes arrivent bientôt à échéance.` }),
        sharedExpenseUpdates: () => ({ title: "On vous doit encore de l'argent", body: "Un montant en attente n'a pas encore été réglé." }),
        communityPriceUpdates: (d) => ({ title: "Nouveau prix communautaire disponible", body: d.count === 1 ? "Un prix a été vérifié pour un instrument que vous détenez." : `Des prix ont été vérifiés pour ${d.count} instruments que vous détenez.` }),
    },
    "pt-BR": {
        monthlySummary: (d) => ({ title: `Seu resumo de ${d.monthLabel} está pronto`, body: `Despesas ${formatEur(d.totalOutflows)} · Receitas ${formatEur(d.totalIncomes)}` }),
        dataUpdateReminder: () => ({ title: "Faz um tempo que não te vemos", body: "Atualize seus dados para manter o painel em dia." }),
        recurringDue: (d) => ({ title: "Uma transação recorrente está chegando", body: d.count === 1 ? "Você tem 1 transação recorrente prestes a vencer." : `Você tem ${d.count} transações recorrentes prestes a vencer.` }),
        sharedExpenseUpdates: () => ({ title: "Ainda têm dinheiro a te pagar", body: "Há um valor pendente que ainda não foi quitado." }),
        communityPriceUpdates: (d) => ({ title: "Novo preço da comunidade disponível", body: d.count === 1 ? "Um preço foi verificado para um instrumento que você possui." : `Preços foram verificados para ${d.count} instrumentos que você possui.` }),
    },
}

export function buildContent<T extends ReminderType>(type: T, language: string | undefined | null, data: ContentInputs[T]): { title: string; body: string } {
    const lang = resolveLanguage(language)
    const builder = TEMPLATES[lang][type] as Builder<T>
    return builder(data)
}
