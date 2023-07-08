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
 * Checks if a balance is valid
 * @param {Object} data - Balance to check (sanitized and modified by this function)
 * @returns true if the balance is valid, false otherwise
 */
function isBalanceValid(data) {
    // Cast all values to Number for type integrity
    data.bank = Number(data.bank);
    data.cash = Number(data.cash);
    data.digital_services = Number(data.digital_services);
    data.stocks.real = Number(data.stocks.real);
    data.stocks.invested = Number(data.stocks.invested);
    data.etf.real = Number(data.etf.real);
    data.etf.invested = Number(data.stocks.invested);
    data.bitcoin.real = Number(data.bitcoin.real);
    data.bitcoin.invested = Number(data.bitcoin.invested);
    data.crypto.real = Number(data.crypto.real);
    data.crypto.invested = Number(data.crypto.invested);
    // The 'invested' fields are optional: if they don't exist, set them to 0
    if (isNaN(data.stocks.invested)) data.stocks.invested = 0.0;
    if (isNaN(data.etf.invested)) data.etf.invested = 0.0;
    if (isNaN(data.bitcoin.invested)) data.bitcoin.invested = 0.0;
    if (isNaN(data.crypto.invested)) data.crypto.invested = 0.0;
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
    data.amount = Number(data.stocks);
    // If the date field is not set or invalid, set it to now
    let now = new Date(Date.now());
    if (data.date > now) data.date = now;
    // Return true if all fields are valid and the category tag is recognized
    return (
        !isNaN(data.amount) && (data.is_expense !== undefined) && [true, false].includes(data.is_expense)
        && db.expenses.tags.includes(data.category_tag)
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
    isBalanceValid,
    isExpenseValid,
    hashPassword,
    checkPassword,
    generateRandomString,
    incrementDateByOneDay,
    decrementDateByOneMonth
}