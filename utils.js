const bcrypt = require("bcrypt");
const db = require("./db/mongo.js");

/**
 * Sanitizes user input by removing blank spaces and HTML tags
 * @param {String} data - data to sanitize
 * @returns Sanitized data
 */
function sanitizeInput(data) {
    // Remove empty spaces
    let sanitized_data = String(data).trim();
    // Check if there are HTML tags and remove them
    const regex = /(<.*>)*/g;
    sanitized_data = sanitized_data.replace(regex, "");
    // Return the sanitized input
    return sanitized_data;
}

/**
 * Rounds a currency value to the second decimal digit
 * @param {Number} n - Currency value
 * @returns Rounded currency value
 */
function roundCurrency(n) {
    if (n === undefined) return 0;
    // Round to the second decimal digit
	let r = +n.toFixed(2); // toFixed() returns a string, but with the + in front it becomes a number
    // If the rounding was of the 'ceiling' type, make it 'floor'
	if (r > n) r -= 0.01;
    // Round again to the second decimal digit to account for floating point shenanigans
	return +r.toFixed(2);
}

/**
 * Checks if a balance is valid
 * @param {Object} data - Balance to check (sanitized and modified by this function)
 * @returns true if the balance is valid, false otherwise
 */
function isBalanceValid(data) {
    // Cast all values to Number for type integrity, then round them to the second decimal digit
    data.bank = roundCurrency(Number(data.bank));
    data.cash = roundCurrency(Number(data.cash));
    data.digital_services = roundCurrency(Number(data.digital_services));
    data.stocks.real = roundCurrency(Number(data.stocks.real));
    data.stocks.invested = roundCurrency(Number(data.stocks.invested));
    data.etf.real = roundCurrency(Number(data.etf.real));
    data.etf.invested = roundCurrency(Number(data.stocks.invested));
    data.bitcoin.real = roundCurrency(Number(data.bitcoin.real));
    data.bitcoin.invested = roundCurrency(Number(data.bitcoin.invested));
    data.crypto.real = roundCurrency(Number(data.crypto.real));
    data.crypto.invested = roundCurrency(Number(data.crypto.invested));
    // Return true if all fields exist and they are valid numbers
    return (
        !isNaN(data.bank) && !isNaN(data.cash) && !isNaN(data.digital_services) &&
        !isNaN(data.stocks.real) && !isNaN(data.stocks.invested) &&
        !isNaN(data.etf.real) && !isNaN(data.etf.invested) &&
        !isNaN(data.bitcoin.real) && !isNaN(data.bitcoin.invested) &&
        !isNaN(data.crypto.real) && !isNaN(data.crypto.real)
    );
}

/**
 * Checks if an expense is valid
 * @param {Object} data - Expense to check (sanitized and modified by this function)
 * @returns true if the expense is valid, false otherwise
 */
function isExpenseValid(data) {
    // Cast the amount to Number for type integrity
    data.amount = roundCurrency(Number(data.stocks));
    // If the date field is not set or invalid, set it to now
    let now = new Date(Date.now());
    if (data.date === undefined || data.date > now) data.date = now;
    // Return true if all fields are valid and the category tag is recognized
    return (
        !isNaN(data.amount) && (data.is_expense !== undefined) && [true, false].includes(data.is_expense) &&
        (data.payment_type !== undefined) && db.expenses.payment_types.includes(data.payment_type) /* &&
        db.expenses.tags.includes(data.category_tag) */ /* DISABLED FOR TEST */
    );
}

/**
 * Hashes a string (usually a password) using the given number of salt rounds
 * @param {String} password - password to hash
 * @param {BigInt} salt_rounds - number of salt rounds
 * @returns Hashed password
 */
function hashPassword(password, salt_rounds) {
    // Hash the password using the given number of salt rounds
    // Cast to Number is used to make sure that the correct technique is used
    return bcrypt.hashSync(password, Number(salt_rounds));
}

/**
 * Checks if a plain password corresponds to an hashed password
 * @param {String} plain_password - plain password to check
 * @param {String} hashed_password - reference hashed password
 * @returns true if the two passwords correspond, false otherwise
 */
function checkPassword(plain_password, hashed_password) {
    return bcrypt.compareSync(plain_password, hashed_password);
}

/**
 * Generates a random character
 * @param {boolean} alpha - if true an alphanumeric character is generated, numeric only otherwise
 * @returns A character
 */
function generateRandomCharacter(alpha=true) {
    let characters = "0123456789";
    if (alpha) characters = "abcdefghijklmnopqrstuvwxyz" + characters;
    const index = Math.floor(Math.random() * characters.length);
    return characters[index];
}

/**
 * Generates a random string (like user and session IDs)
 * @param {BigInt} length - length of the string to generate
 * @param {boolean} alpha - if true an alphanumeric string is generated, numeric only otherwise
 * @returns A random string
 */
function generateRandomString(length, alpha=true) {
    // Generate 'length' random characters
    let characters = [];
    for (let i = 0; i < length; i++)
        characters.push(generateRandomCharacter(alpha));
    return characters.join('');
}

/**
 * Adds one day to a date
 * @param {Date} date - date to increment
 * @returns Incremented date
 */
function incrementDateByOneDay(date) {
    let new_date = new Date(date);
    new_date.setUTCDate(new_date.getUTCDate() + 1);
    return new_date;
}

/**
 * Subtracts one month to a date
 * @param {Date} date - date to decrement
 * @returns Decremented date
 */
function decrementDateByOneMonth(date) {
    let new_date = new Date(date);
    new_date.setUTCMonth(new_date.getUTCMonth() - 1);
    return new_date;
}

module.exports = {
    sanitizeInput,
    roundCurrency,
    isBalanceValid,
    isExpenseValid,
    hashPassword,
    checkPassword,
    generateRandomString,
    incrementDateByOneDay,
    decrementDateByOneMonth
}