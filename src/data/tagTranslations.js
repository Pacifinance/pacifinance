/**
 * Local Tag Translations — SINGLE SOURCE OF TRUTH for tag display names.
 *
 * Decouples human-readable translations from the database `translations` field
 * so that adding a new language only requires updating this file (+ locale JSONs),
 * without touching the backend.
 *
 * Structure:  type → label (lowercase, as stored in DB) → { languageCode: string }
 *
 * Usage:
 *   import { translateTag } from '../data/tagTranslations';
 *   const text = translateTag('food', 'expense', 'it'); // → 'Alimentari'
 *
 * @module data/tagTranslations
 */

// ─── Expense Categories ──────────────────────────────────────────────
const EXPENSE_TRANSLATIONS = {
  'digital service': { en: 'Digital service', it: 'Servizio digitale' },
  'gift':            { en: 'Gift',            it: 'Regalo' },
  'shopping':        { en: 'Shopping',        it: 'Shopping' },
  'food':            { en: 'Food',            it: 'Alimentari' },
  'house':           { en: 'House',           it: 'Casa' },
  'free time':       { en: 'Free time',       it: 'Tempo libero' },
  'travelling':      { en: 'Travelling',      it: 'Viaggio' },
  'investment':      { en: 'Investment',      it: 'Investimento' },
  'health':          { en: 'Health',          it: 'Salute e benessere' },
  'tax':             { en: 'Tax',             it: 'Tassa' },
  'vehicle':         { en: 'Vehicle',         it: 'Veicolo' },
  'transports':      { en: 'Transports',      it: 'Trasporto' },
  'pets':            { en: 'Pets',            it: 'Animali' },
  'personal project':{ en: 'Personal project',it: 'Progetto personale' },
  'education':       { en: 'Education',       it: 'Istruzione' },
  'other':           { en: 'Other',           it: 'Altro' },
};

// ─── Income Categories ───────────────────────────────────────────────
const INCOME_TRANSLATIONS = {
  'salary':           { en: 'Salary',                         it: 'Stipendio' },
  'freelance income': { en: 'Freelance income',               it: 'Entrata da lavoro indipendente' },
  'extra income':     { en: 'Extra income',                   it: 'Entrata extra' },
  'gift':             { en: 'Gift',                           it: 'Regalo' },
  'retirement':       { en: 'Retirement',                     it: 'Pensione' },
  'other':            { en: 'Other',                          it: 'Altro' },
};

// ─── Payment Types ───────────────────────────────────────────────────
const PAYMENT_TRANSLATIONS = {
  'none':              { en: 'None',                    it: 'Nessuno' },
  'single payment':    { en: 'Single payment',          it: 'Pagamento unico' },
  'subscription':      { en: 'Subscription',            it: 'Abbonamento' },
  'installment':       { en: 'Installment',             it: 'Rata' },
  'cap':               { en: 'Capital accumulation plan',it: 'Piano di accumulo' },
  'periodic payment':  { en: 'Periodic payment',        it: 'Pagamento ricorrente' },
};

// ─── Job Sectors ─────────────────────────────────────────────────────
const JOB_TRANSLATIONS = {
  'arts and entertainment':   { en: 'Arts and entertainment',   it: 'Arte ed intrattenimento' },
  'information technology':   { en: 'Information Technology',   it: 'Informatica' },
  'healthcare':               { en: 'Healthcare',               it: 'Sanità' },
  'finance':                  { en: 'Finance',                  it: 'Finanza' },
  'legal':                    { en: 'Legal',                    it: 'Legge' },
  'education':                { en: 'Education',                it: 'Educazione' },
  'hospitality and services': { en: 'Hospitality and services', it: 'Ospitalità e servizi' },
  'commerce':                 { en: 'Commerce',                 it: 'Commercio' },
  'sports':                   { en: 'Sports',                   it: 'Sport' },
  'art and design':           { en: 'Art and design',           it: 'Arte e design' },
  'public sector':            { en: 'Public sector',            it: 'Settore pubblico' },
  'communication and media':  { en: 'Communication and media',  it: 'Comunicazione e media' },
  'transportation':           { en: 'Transportation',           it: 'Trasporti' },
  'administrative services':  { en: 'Administrative services',  it: 'Servizi amministrativi' },
  'engineering':              { en: 'Engineering',              it: 'Ingegneria' },
  'craftsman':                { en: 'Craftsman',                it: 'Artigiano' },
  'workman':                  { en: 'Workman',                  it: 'Operaio' },
  'student':                  { en: 'Student',                  it: 'Studente' },
  'logistics':                { en: 'Logistics',                it: 'Logistica' },
  'other':                    { en: 'Other',                    it: 'Altro' },
};

// ─── Job Type ────────────────────────────────────────────────────────
const JOB_TYPE_TRANSLATIONS = {
  'employee':  { en: 'Employee',  it: 'Lavoro dipendente' },
  'freelance': { en: 'Freelance', it: 'Lavoro autonomo' },
};

// ─── Work Time ───────────────────────────────────────────────────────
const WORK_TIME_TRANSLATIONS = {
  'part time': { en: 'Part time', it: 'Part time' },
  'full time': { en: 'Full time', it: 'Full time' },
  'on-call':   { en: 'On-call',   it: 'A chiamata' },
};

// ─── Remote Type ─────────────────────────────────────────────────────
const REMOTE_TYPE_TRANSLATIONS = {
  'in-office': { en: 'In-Office', it: 'In loco' },
  'hybrid':    { en: 'Hybrid',    it: 'Ibrido' },
  'remote':    { en: 'Remote',    it: 'Remoto' },
};

// ─── Years of Experience ─────────────────────────────────────────────
const YEARS_OF_EXPERIENCE_TRANSLATIONS = {
  '0-1-years':  { en: '0-1 years',  it: '0-1 anni' },
  '2-3-years':  { en: '2-3 years',  it: '2-3 anni' },
  '4-5-years':  { en: '4-5 years',  it: '4-5 anni' },
  '6-10-years': { en: '6-10 years', it: '6-10 anni' },
  '10+-years':  { en: '10+ years',  it: '10+ anni' },
};

// ─── Age Ranges ──────────────────────────────────────────────────────
const AGE_TRANSLATIONS = {
  '18-25': { en: '18-25', it: '18-25' },
  '26-35': { en: '26-35', it: '26-35' },
  '36-45': { en: '36-45', it: '36-45' },
  '46-55': { en: '46-55', it: '46-55' },
  '55+':   { en: '55+',   it: '55+' },
};

// ─── Living Situation ────────────────────────────────────────────────
const LIVING_SITUATION_TRANSLATIONS = {
  'cohabiting':        { en: 'Cohabiting',        it: 'Convivente' },
  'in-a-relationship': { en: 'In a relationship', it: 'In coppia' },
  'single':            { en: 'Single',            it: 'Single' },
  'married':           { en: 'Married',           it: 'Sposato/a' },
  'other':             { en: 'Other',             it: 'Altro' },
};

// ─── Housing Type ────────────────────────────────────────────────────
const HOUSING_TYPE_TRANSLATIONS = {
  'rental-appartment': { en: 'Rental appartment', it: 'Appartamento in affitto' },
  'shared-housing':    { en: 'Shared housing',    it: 'Casa condivisa' },
  'parents-house':     { en: "Parents' house",    it: 'Casa dei genitori' },
  'own-house':         { en: 'Own house',         it: 'Casa propria' },
  'other':             { en: 'Other',             it: 'Altro' },
};

// ─── Children ────────────────────────────────────────────────────────
const CHILDREN_TRANSLATIONS = {
  'yes':       { en: 'Yes',       it: 'Sì' },
  'no':        { en: 'No',        it: 'No' },
  'expecting': { en: 'Expecting', it: 'In attesa' },
};

// ─── Countries ───────────────────────────────────────────────────────
const COUNTRY_TRANSLATIONS = {
  'afghanistan':                          { en: 'Afghanistan',                          it: 'Afghanistan' },
  'albania':                              { en: 'Albania',                              it: 'Albania' },
  'algeria':                              { en: 'Algeria',                              it: 'Algeria' },
  'american samoa':                       { en: 'American Samoa',                       it: 'Samoa Americane' },
  'andorra':                              { en: 'Andorra',                              it: 'Andorra' },
  'angola':                               { en: 'Angola',                               it: 'Angola' },
  'anguilla':                             { en: 'Anguilla',                             it: 'Anguilla' },
  'antarctica':                           { en: 'Antarctica',                           it: 'Antartide' },
  'antigua and barbuda':                  { en: 'Antigua and Barbuda',                  it: 'Antigua e Barbuda' },
  'argentina':                            { en: 'Argentina',                            it: 'Argentina' },
  'armenia':                              { en: 'Armenia',                              it: 'Armenia' },
  'aruba':                                { en: 'Aruba',                                it: 'Aruba' },
  'australia':                            { en: 'Australia',                            it: 'Australia' },
  'austria':                              { en: 'Austria',                              it: 'Austria' },
  'azerbaijan':                           { en: 'Azerbaijan',                           it: 'Azerbaigian' },
  'bahamas':                              { en: 'Bahamas',                              it: 'Bahamas' },
  'bahrain':                              { en: 'Bahrain',                              it: 'Bahrein' },
  'bangladesh':                           { en: 'Bangladesh',                           it: 'Bangladesh' },
  'barbados':                             { en: 'Barbados',                             it: 'Barbados' },
  'belarus':                              { en: 'Belarus',                              it: 'Bielorussia' },
  'belgium':                              { en: 'Belgium',                              it: 'Belgio' },
  'belize':                               { en: 'Belize',                               it: 'Belize' },
  'benin':                                { en: 'Benin',                                it: 'Benin' },
  'bermuda':                              { en: 'Bermuda',                              it: 'Bermuda' },
  'bhutan':                               { en: 'Bhutan',                               it: 'Bhutan' },
  'bolivia':                              { en: 'Bolivia',                              it: 'Bolivia' },
  'bonaire, sint eustatius and saba':     { en: 'Bonaire, Sint Eustatius and Saba',     it: 'Bonaire, Sint Eustatius e Saba' },
  'bosnia and herzegovina':               { en: 'Bosnia and Herzegovina',               it: 'Bosnia ed Erzegovina' },
  'botswana':                             { en: 'Botswana',                             it: 'Botswana' },
  'bouvet island':                        { en: 'Bouvet Island',                        it: 'Isola Bouvet' },
  'brazil':                               { en: 'Brazil',                               it: 'Brasile' },
  'british indian ocean territory':       { en: 'British Indian Ocean Territory',       it: 'Territorio britannico dell\'oceano Indiano' },
  'brunei':                               { en: 'Brunei',                               it: 'Brunei' },
  'bulgaria':                             { en: 'Bulgaria',                             it: 'Bulgaria' },
  'burkina faso':                         { en: 'Burkina Faso',                         it: 'Burkina Faso' },
  'burundi':                              { en: 'Burundi',                              it: 'Burundi' },
  'cambodia':                             { en: 'Cambodia',                             it: 'Cambogia' },
  'cameroon':                             { en: 'Cameroon',                             it: 'Camerun' },
  'canada':                               { en: 'Canada',                               it: 'Canada' },
  'cape verde':                           { en: 'Cape Verde',                           it: 'Capo Verde' },
  'cayman islands':                       { en: 'Cayman Islands',                       it: 'Isole Cayman' },
  'central african republic':             { en: 'Central African Republic',             it: 'Repubblica Centrafricana' },
  'chad':                                 { en: 'Chad',                                 it: 'Ciad' },
  'chile':                                { en: 'Chile',                                it: 'Cile' },
  'china':                                { en: 'China',                                it: 'Cina' },
  'christmas island':                     { en: 'Christmas Island',                     it: 'Isola di Natale' },
  'cocos (keeling) islands':              { en: 'Cocos (Keeling) Islands',              it: 'Isole Cocos (Keeling)' },
  'colombia':                             { en: 'Colombia',                             it: 'Colombia' },
  'comoros':                              { en: 'Comoros',                              it: 'Comore' },
  'congo':                                { en: 'Congo',                                it: 'Congo' },
  'congo, the democratic republic of the':{ en: 'Congo, the Democratic Republic of the',it: 'Congo, Repubblica Democratica del' },
  'cook islands':                         { en: 'Cook Islands',                         it: 'Isole Cook' },
  'costa rica':                           { en: 'Costa Rica',                           it: 'Costa Rica' },
  'croatia':                              { en: 'Croatia',                              it: 'Croazia' },
  'cuba':                                 { en: 'Cuba',                                 it: 'Cuba' },
  'curaçao':                              { en: 'Curaçao',                              it: 'Curaçao' },
  'cyprus':                               { en: 'Cyprus',                               it: 'Cipro' },
  'czech republic':                       { en: 'Czech Republic',                       it: 'Repubblica Ceca' },
  'denmark':                              { en: 'Denmark',                              it: 'Danimarca' },
  'djibouti':                             { en: 'Djibouti',                             it: 'Gibuti' },
  'dominica':                             { en: 'Dominica',                             it: 'Dominica' },
  'dominican republic':                   { en: 'Dominican Republic',                   it: 'Repubblica Dominicana' },
  'ecuador':                              { en: 'Ecuador',                              it: 'Ecuador' },
  'egypt':                                { en: 'Egypt',                                it: 'Egitto' },
  'el salvador':                          { en: 'El Salvador',                          it: 'El Salvador' },
  'equatorial guinea':                    { en: 'Equatorial Guinea',                    it: 'Guinea Equatoriale' },
  'eritrea':                              { en: 'Eritrea',                              it: 'Eritrea' },
  'estonia':                              { en: 'Estonia',                              it: 'Estonia' },
  'ethiopia':                             { en: 'Ethiopia',                             it: 'Etiopia' },
  'falkland islands (malvinas)':          { en: 'Falkland Islands (Malvinas)',          it: 'Isole Falkland (Malvina)' },
  'faroe islands':                        { en: 'Faroe Islands',                        it: 'Isole Fær Øer' },
  'fiji':                                 { en: 'Fiji',                                 it: 'Figi' },
  'finland':                              { en: 'Finland',                              it: 'Finlandia' },
  'france':                               { en: 'France',                               it: 'Francia' },
  'french guiana':                        { en: 'French Guiana',                        it: 'Guyana Francese' },
  'french polynesia':                     { en: 'French Polynesia',                     it: 'Polinesia Francese' },
  'french southern territories':          { en: 'French Southern Territories',          it: 'Territori Francesi del Sud' },
  'gabon':                                { en: 'Gabon',                                it: 'Gabon' },
  'gambia':                               { en: 'Gambia',                               it: 'Gambia' },
  'georgia':                              { en: 'Georgia',                              it: 'Georgia' },
  'germany':                              { en: 'Germany',                              it: 'Germania' },
  'ghana':                                { en: 'Ghana',                                it: 'Ghana' },
  'gibraltar':                            { en: 'Gibraltar',                            it: 'Gibilterra' },
  'greece':                               { en: 'Greece',                               it: 'Grecia' },
  'greenland':                            { en: 'Greenland',                            it: 'Groenlandia' },
  'grenada':                              { en: 'Grenada',                              it: 'Grenada' },
  'guadeloupe':                           { en: 'Guadeloupe',                           it: 'Guadalupa' },
  'guam':                                 { en: 'Guam',                                 it: 'Guam' },
  'guatemala':                            { en: 'Guatemala',                            it: 'Guatemala' },
  'guernsey':                             { en: 'Guernsey',                             it: 'Guernsey' },
  'guinea':                               { en: 'Guinea',                               it: 'Guinea' },
  'guinea-bissau':                        { en: 'Guinea-Bissau',                        it: 'Guinea-Bissau' },
  'guyana':                               { en: 'Guyana',                               it: 'Guyana' },
  'haiti':                                { en: 'Haiti',                                it: 'Haiti' },
  'heard island and mcdonald islands':    { en: 'Heard Island and McDonald Islands',    it: 'Isole Heard e McDonald' },
  'holy see (vatican city state)':        { en: 'Holy See (Vatican City State)',        it: 'Santa Sede (Stato della Città del Vaticano)' },
  'honduras':                             { en: 'Honduras',                             it: 'Honduras' },
  'hong kong':                            { en: 'Hong Kong',                            it: 'Hong Kong' },
  'hungary':                              { en: 'Hungary',                              it: 'Ungheria' },
  'iceland':                              { en: 'Iceland',                              it: 'Islanda' },
  'india':                                { en: 'India',                                it: 'India' },
  'indonesia':                            { en: 'Indonesia',                            it: 'Indonesia' },
  'iran, islamic republic of':            { en: 'Iran, Islamic Republic of',            it: 'Iran, Repubblica Islamica dell\'' },
  'iraq':                                 { en: 'Iraq',                                 it: 'Iraq' },
  'ireland':                              { en: 'Ireland',                              it: 'Irlanda' },
  'isle of man':                          { en: 'Isle of Man',                          it: 'Isola di Man' },
  'israel':                               { en: 'Israel',                               it: 'Israele' },
  'italy':                                { en: 'Italy',                                it: 'Italia' },
  'ivory coast':                          { en: 'Ivory Coast',                          it: 'Costa d\'Avorio' },
  'jamaica':                              { en: 'Jamaica',                              it: 'Giamaica' },
  'japan':                                { en: 'Japan',                                it: 'Giappone' },
  'jersey':                               { en: 'Jersey',                               it: 'Jersey' },
  'jordan':                               { en: 'Jordan',                               it: 'Giordania' },
  'kazakhstan':                           { en: 'Kazakhstan',                           it: 'Kazakistan' },
  'kenya':                                { en: 'Kenya',                                it: 'Kenya' },
  'kiribati':                             { en: 'Kiribati',                             it: 'Kiribati' },
  'korea, democratic people\'s republic of': { en: 'Korea, Democratic People\'s Republic of', it: 'Corea, Repubblica Democratica Popolare di' },
  'kosovo':                               { en: 'Kosovo',                               it: 'Kosovo' },
  'kuwait':                               { en: 'Kuwait',                               it: 'Kuwait' },
  'kyrgyzstan':                           { en: 'Kyrgyzstan',                           it: 'Kirghizistan' },
  'lao people\'s democratic republic':    { en: 'Lao People\'s Democratic Republic',    it: 'Laos, Repubblica Democratica Popolare del' },
  'latvia':                               { en: 'Latvia',                               it: 'Lettonia' },
  'lebanon':                              { en: 'Lebanon',                              it: 'Libano' },
  'lesotho':                              { en: 'Lesotho',                              it: 'Lesotho' },
  'liberia':                              { en: 'Liberia',                              it: 'Liberia' },
  'libya':                                { en: 'Libya',                                it: 'Libia' },
  'liechtenstein':                        { en: 'Liechtenstein',                        it: 'Liechtenstein' },
  'lithuania':                            { en: 'Lithuania',                            it: 'Lituania' },
  'luxembourg':                           { en: 'Luxembourg',                           it: 'Lussemburgo' },
  'macao':                                { en: 'Macao',                                it: 'Macao' },
  'macedonia, the former yugoslav republic of': { en: 'Macedonia, the former Yugoslav Republic of', it: 'Macedonia, ex Repubblica Jugoslava di' },
  'madagascar':                           { en: 'Madagascar',                           it: 'Madagascar' },
  'malawi':                               { en: 'Malawi',                               it: 'Malawi' },
  'malaysia':                             { en: 'Malaysia',                             it: 'Malesia' },
  'maldives':                             { en: 'Maldives',                             it: 'Maldive' },
  'mali':                                 { en: 'Mali',                                 it: 'Mali' },
  'malta':                                { en: 'Malta',                                it: 'Malta' },
  'marshall islands':                     { en: 'Marshall Islands',                     it: 'Isole Marshall' },
  'martinique':                           { en: 'Martinique',                           it: 'Martinica' },
  'mauritania':                           { en: 'Mauritania',                           it: 'Mauritania' },
  'mauritius':                            { en: 'Mauritius',                            it: 'Mauritius' },
  'mayotte':                              { en: 'Mayotte',                              it: 'Mayotte' },
  'mexico':                               { en: 'Mexico',                               it: 'Messico' },
  'micronesia, federated states of':      { en: 'Micronesia, Federated States of',      it: 'Micronesia, Stati Federati di' },
  'moldova, republic of':                 { en: 'Moldova, Republic of',                 it: 'Moldavia, Repubblica di' },
  'monaco':                               { en: 'Monaco',                               it: 'Monaco' },
  'mongolia':                             { en: 'Mongolia',                             it: 'Mongolia' },
  'montenegro':                           { en: 'Montenegro',                           it: 'Montenegro' },
  'montserrat':                           { en: 'Montserrat',                           it: 'Montserrat' },
  'morocco':                              { en: 'Morocco',                              it: 'Marocco' },
  'mozambique':                           { en: 'Mozambique',                           it: 'Mozambico' },
  'myanmar':                              { en: 'Myanmar',                              it: 'Myanmar' },
  'namibia':                              { en: 'Namibia',                              it: 'Namibia' },
  'nauru':                                { en: 'Nauru',                                it: 'Nauru' },
  'nepal':                                { en: 'Nepal',                                it: 'Nepal' },
  'netherlands':                          { en: 'Netherlands',                          it: 'Paesi Bassi' },
  'netherlands antilles':                 { en: 'Netherlands Antilles',                 it: 'Antille Olandesi' },
  'new caledonia':                        { en: 'New Caledonia',                        it: 'Nuova Caledonia' },
  'new zealand':                          { en: 'New Zealand',                          it: 'Nuova Zelanda' },
  'nicaragua':                            { en: 'Nicaragua',                            it: 'Nicaragua' },
  'niger':                                { en: 'Niger',                                it: 'Niger' },
  'nigeria':                              { en: 'Nigeria',                              it: 'Nigeria' },
  'niue':                                 { en: 'Niue',                                 it: 'Niue' },
  'norfolk island':                       { en: 'Norfolk Island',                       it: 'Isola Norfolk' },
  'northern mariana islands':             { en: 'Northern Mariana Islands',             it: 'Isole Marianne Settentrionali' },
  'norway':                               { en: 'Norway',                               it: 'Norvegia' },
  'oman':                                 { en: 'Oman',                                 it: 'Oman' },
  'pakistan':                              { en: 'Pakistan',                             it: 'Pakistan' },
  'palau':                                { en: 'Palau',                                it: 'Palau' },
  'palestinian territory, occupied':      { en: 'Palestinian Territory, Occupied',      it: 'Territori Palestinesi, Occupati' },
  'panama':                               { en: 'Panama',                               it: 'Panama' },
  'papua new guinea':                     { en: 'Papua New Guinea',                     it: 'Papua Nuova Guinea' },
  'paraguay':                             { en: 'Paraguay',                             it: 'Paraguay' },
  'peru':                                 { en: 'Peru',                                 it: 'Perù' },
  'philippines':                          { en: 'Philippines',                          it: 'Filippine' },
  'pitcairn':                             { en: 'Pitcairn',                             it: 'Isole Pitcairn' },
  'poland':                               { en: 'Poland',                               it: 'Polonia' },
  'portugal':                             { en: 'Portugal',                             it: 'Portogallo' },
  'puerto rico':                          { en: 'Puerto Rico',                          it: 'Porto Rico' },
  'qatar':                                { en: 'Qatar',                                it: 'Qatar' },
  'romania':                              { en: 'Romania',                              it: 'Romania' },
  'russia':                               { en: 'Russia',                               it: 'Russia' },
  'rwanda':                               { en: 'Rwanda',                               it: 'Ruanda' },
  'réunion':                              { en: 'Réunion',                              it: 'Riunione' },
  'saint barthélemy':                     { en: 'Saint Barthélemy',                     it: 'Saint-Barthélemy' },
  'saint helena, ascension and tristan da cunha': { en: 'Saint Helena, Ascension and Tristan da Cunha', it: 'Sant\'Elena, Ascensione e Tristan da Cunha' },
  'saint kitts and nevis':                { en: 'Saint Kitts and Nevis',                it: 'Saint Kitts e Nevis' },
  'saint lucia':                          { en: 'Saint Lucia',                          it: 'Santa Lucia' },
  'saint martin (french part)':           { en: 'Saint Martin (French part)',           it: 'Saint-Martin (parte francese)' },
  'saint pierre and miquelon':            { en: 'Saint Pierre and Miquelon',            it: 'Saint Pierre e Miquelon' },
  'saint vincent and the grenadines':     { en: 'Saint Vincent and the Grenadines',     it: 'Saint Vincent e Grenadine' },
  'samoa':                                { en: 'Samoa',                                it: 'Samoa' },
  'san marino':                           { en: 'San Marino',                           it: 'San Marino' },
  'sao tome and principe':                { en: 'Sao Tome and Principe',                it: 'Sao Tomé e Principe' },
  'saudi arabia':                         { en: 'Saudi Arabia',                         it: 'Arabia Saudita' },
  'senegal':                              { en: 'Senegal',                              it: 'Senegal' },
  'serbia':                               { en: 'Serbia',                               it: 'Serbia' },
  'seychelles':                           { en: 'Seychelles',                           it: 'Seychelles' },
  'sierra leone':                         { en: 'Sierra Leone',                         it: 'Sierra Leone' },
  'singapore':                            { en: 'Singapore',                            it: 'Singapore' },
  'sint maarten (dutch part)':            { en: 'Sint Maarten (Dutch part)',            it: 'Sint Maarten (parte olandese)' },
  'slovakia':                             { en: 'Slovakia',                             it: 'Slovacchia' },
  'slovenia':                             { en: 'Slovenia',                             it: 'Slovenia' },
  'solomon islands':                      { en: 'Solomon Islands',                      it: 'Isole Salomone' },
  'somalia':                              { en: 'Somalia',                              it: 'Somalia' },
  'south africa':                         { en: 'South Africa',                         it: 'Sudafrica' },
  'south georgia and the south sandwich islands': { en: 'South Georgia and the South Sandwich Islands', it: 'Georgia del Sud e Isole Sandwich Meridionali' },
  'south korea':                          { en: 'South Korea',                          it: 'Corea del Sud' },
  'south sudan':                          { en: 'South Sudan',                          it: 'Sud Sudan' },
  'spain':                                { en: 'Spain',                                it: 'Spagna' },
  'sri lanka':                            { en: 'Sri Lanka',                            it: 'Sri Lanka' },
  'sudan':                                { en: 'Sudan',                                it: 'Sudan' },
  'suriname':                             { en: 'Suriname',                             it: 'Suriname' },
  'svalbard and jan mayen':               { en: 'Svalbard and Jan Mayen',               it: 'Svalbard e Jan Mayen' },
  'swaziland':                            { en: 'Swaziland',                            it: 'Swaziland' },
  'sweden':                               { en: 'Sweden',                               it: 'Svezia' },
  'switzerland':                          { en: 'Switzerland',                          it: 'Svizzera' },
  'syrian arab republic':                 { en: 'Syrian Arab Republic',                 it: 'Repubblica Araba Siriana' },
  'taiwan':                               { en: 'Taiwan',                               it: 'Taiwan' },
  'tajikistan':                           { en: 'Tajikistan',                           it: 'Tagikistan' },
  'tanzania, united republic of':         { en: 'Tanzania, United Republic of',         it: 'Tanzania, Repubblica Unita di' },
  'thailand':                             { en: 'Thailand',                             it: 'Thailandia' },
  'timor-leste':                          { en: 'Timor-Leste',                          it: 'Timor Est' },
  'togo':                                 { en: 'Togo',                                 it: 'Togo' },
  'tokelau':                              { en: 'Tokelau',                              it: 'Tokelau' },
  'tonga':                                { en: 'Tonga',                                it: 'Tonga' },
  'trinidad and tobago':                  { en: 'Trinidad and Tobago',                  it: 'Trinidad e Tobago' },
  'tunisia':                              { en: 'Tunisia',                              it: 'Tunisia' },
  'turkey':                               { en: 'Turkey',                               it: 'Turchia' },
  'turkmenistan':                         { en: 'Turkmenistan',                         it: 'Turkmenistan' },
  'turks and caicos islands':             { en: 'Turks and Caicos Islands',             it: 'Isole Turks e Caicos' },
  'tuvalu':                               { en: 'Tuvalu',                               it: 'Tuvalu' },
  'uganda':                               { en: 'Uganda',                               it: 'Uganda' },
  'ukraine':                              { en: 'Ukraine',                              it: 'Ucraina' },
  'united arab emirates':                 { en: 'United Arab Emirates',                 it: 'Emirati Arabi Uniti' },
  'united kingdom':                       { en: 'United Kingdom',                       it: 'Regno Unito' },
  'united states':                        { en: 'United States',                        it: 'Stati Uniti d\'America' },
  'united states minor outlying islands': { en: 'United States Minor Outlying Islands', it: 'Isole minori esterne degli Stati Uniti' },
  'uruguay':                              { en: 'Uruguay',                              it: 'Uruguay' },
  'uzbekistan':                           { en: 'Uzbekistan',                           it: 'Uzbekistan' },
  'vanuatu':                              { en: 'Vanuatu',                              it: 'Vanuatu' },
  'venezuela':                            { en: 'Venezuela',                            it: 'Venezuela' },
  'vietnam':                              { en: 'Vietnam',                              it: 'Vietnam' },
  'virgin islands, british':              { en: 'Virgin Islands, British',              it: 'Isole Vergini Britanniche' },
  'virgin islands, u.s.':                 { en: 'Virgin Islands, U.S.',                 it: 'Isole Vergini Americane' },
  'wallis and futuna':                    { en: 'Wallis and Futuna',                    it: 'Wallis e Futuna' },
  'western sahara':                       { en: 'Western Sahara',                       it: 'Sahara Occidentale' },
  'yemen':                                { en: 'Yemen',                                it: 'Yemen' },
  'zambia':                               { en: 'Zambia',                               it: 'Zambia' },
  'zimbabwe':                             { en: 'Zimbabwe',                             it: 'Zimbabwe' },
  'åland islands':                        { en: 'Åland Islands',                        it: 'Isole Åland' },
};

// ─── Master Map ──────────────────────────────────────────────────────

/**
 * All tag translations indexed by type.
 * The `type` key matches the API's tag type name.
 */
export const TAG_TRANSLATIONS = {
  expense:           EXPENSE_TRANSLATIONS,
  income:            INCOME_TRANSLATIONS,
  payment:           PAYMENT_TRANSLATIONS,
  country:           COUNTRY_TRANSLATIONS,
  job:               JOB_TRANSLATIONS,
  jobType:           JOB_TYPE_TRANSLATIONS,
  workTime:          WORK_TIME_TRANSLATIONS,
  remoteType:        REMOTE_TYPE_TRANSLATIONS,
  yearsOfExperience: YEARS_OF_EXPERIENCE_TRANSLATIONS,
  age:               AGE_TRANSLATIONS,
  livingSituation:   LIVING_SITUATION_TRANSLATIONS,
  housingType:       HOUSING_TYPE_TRANSLATIONS,
  children:          CHILDREN_TRANSLATIONS,
};

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Translate a tag label using local translations.
 *
 * @param {string} label    The tag's `label` field (lowercase key from DB)
 * @param {string} language Current language code (e.g. 'it', 'en')
 * @param {string} [type]   Optional tag type for scoped lookup (e.g. 'expense', 'income').
 *                           If omitted, searches all types (slower, but convenient).
 * @returns {string} Translated string, or the original label capitalised as fallback.
 */
export const translateTag = (label, language, type) => {
  if (!label) return '';
  const key = label.toLowerCase();

  // Scoped lookup (preferred — O(1))
  if (type && TAG_TRANSLATIONS[type]) {
    const entry = TAG_TRANSLATIONS[type][key];
    if (entry) {
      return entry[language] || entry.en || label;
    }
  }

  // Unscoped fallback — search all types
  for (const typeMap of Object.values(TAG_TRANSLATIONS)) {
    const entry = typeMap[key];
    if (entry) {
      return entry[language] || entry.en || label;
    }
  }

  // Ultimate fallback: capitalise first letter
  return label.charAt(0).toUpperCase() + label.slice(1);
};

/**
 * Translate a tag object (with `.label` and optionally `.translations`).
 * Prefers local translations; falls back to DB `.translations` field.
 *
 * Drop-in replacement for the old `getTranslation()` helper.
 *
 * @param {Object|null} tagObj   Tag object (must have `.label`)
 * @param {string}      language Current language code
 * @param {string}      fallback Fallback if nothing matches
 * @param {string}      [type]   Optional tag type
 * @returns {string}
 */
export const translateTagObject = (tagObj, language, fallback, type) => {
  if (!tagObj) return fallback;

  // 1) Try local translations by label
  if (tagObj.label) {
    const local = translateTag(tagObj.label, language, type);
    if (local && local !== tagObj.label) return local;
  }

  // 2) Fall back to DB translations (backward compat)
  if (tagObj.translations) {
    if (tagObj.translations[language]) return tagObj.translations[language];
    if (tagObj.translations.en) return tagObj.translations.en;
    if (tagObj.translations.it) return tagObj.translations.it;
  }

  // 3) Label capitalised or fallback
  if (tagObj.label) return tagObj.label.charAt(0).toUpperCase() + tagObj.label.slice(1);
  return fallback;
};

// ─── Convenience Exports ─────────────────────────────────────────────

export { EXPENSE_TRANSLATIONS, INCOME_TRANSLATIONS, PAYMENT_TRANSLATIONS };
export { COUNTRY_TRANSLATIONS, JOB_TRANSLATIONS, JOB_TYPE_TRANSLATIONS };
export { WORK_TIME_TRANSLATIONS, REMOTE_TYPE_TRANSLATIONS, YEARS_OF_EXPERIENCE_TRANSLATIONS };
export { AGE_TRANSLATIONS, LIVING_SITUATION_TRANSLATIONS, HOUSING_TYPE_TRANSLATIONS, CHILDREN_TRANSLATIONS };
