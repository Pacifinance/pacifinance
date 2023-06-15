const bcrypt = require("bcrypt");

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
 * @param {Object} data - Balance to check
 * @returns true if the balance is valid, false otherwise
 */
function isBalanceValid(data) {
    data.stocks.real = Number(data.stocks.real);
    data.stocks.invested = Number(data.stocks.invested);
    data.bank = Number(data.bank);
    data.cash = Number(data.cash);
    data.crypto.real = Number(data.crypto.real);
    data.crypto.invested = Number(data.crypto.invested);
    return (
        !isNaN(data.stocks.real) && !isNaN(data.stocks.invested) &&
        !isNaN(data.bank) && !isNaN(data.cash) &&
        !isNaN(data.crypto.real) && !isNaN(data.crypto.real)
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
 * @returns A character
 */
function generateRandomCharacter() {
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    const index = Math.floor(Math.random() * characters.length);
    return characters[index];
}

/**
 * Generates a random session ID
 * @returns A session ID as a random string
 */
function generateSessionId() {
    // Generate 32 random characters
    let characters = [];
    for (let i = 0; i < 32; i++)
        characters.push(generateRandomCharacter());
    return characters.join('');
}

/**
 * Adds one day to a date
 * @param {Date} date - date to increment
 * @returns Incremented date
 */
function incrementDateByOneDay(date) {
    let new_date = new Date(date);
    new_date.setDate(new_date.getDate() + 1);
    return new_date;
}

module.exports = {
    sanitizeInput,
    isBalanceValid,
    hashPassword,
    checkPassword,
    generateSessionId,
    incrementDateByOneDay
}