const bcrypt = require("bcrypt");

function sanitizeInput(data) {
    // Remove empty spaces
    let sanitized_data = String(data).trim();
    // Check if there are HTML tags and remove them
    const regex = /(<.*>)*/g;
    sanitized_data = sanitized_data.replace(regex, "");
    // Return the sanitized input
    return sanitized_data;
}

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
    )
}

function hashPassword(password, salt_rounds) {
    // Hash the password using the given number of salt rounds
    // Cast to Number is used to make sure that the correct technique is used
    return bcrypt.hashSync(password, Number(salt_rounds));
}

function checkPassword(plain_password, hashed_password) {
    return bcrypt.compareSync(plain_password, hashed_password);
}

function generateRandomCharacter() {
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    const index = Math.floor(Math.random() * characters.length);
    return characters[index];
}

function generateSessionId() {
    // Generate 32 random characters
    let characters = [];
    for (let i = 0; i < 32; i++)
        characters.push(generateRandomCharacter());
    return characters.join('');
}

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