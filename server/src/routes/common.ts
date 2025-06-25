import express from "express"
import session from "express-session";
import bcrypt from "bcrypt"

import db from "../db/mongo"

/**
 * Rounds a currency value to the second decimal digit
 * @param n Currency value
 * @returns Rounded currency value
 */
function roundCurrency(n: number) {
    if (n === undefined || isNaN(n)) return 0;
    // Round to the second decimal digit
	let r = +n.toFixed(2); // toFixed() returns a string, but with the + in front it becomes a number
    // If the rounding was of the 'ceiling' type, make it 'floor'
	if (r > n) r -= 0.01;
    // Round again to the second decimal digit to account for floating point shenanigans
	return +r.toFixed(2);
}

/**
 * Converts any date to a Date object
 * @param date Date to convert
 * @returns A Date object, or undefined if the provided date is invalid
 */
function toDateObject(date: Date | string) {
    // If the date is of type Date, return it
    if (date instanceof Date)
        return date;
    // If the date is of type string
    else if (typeof date === "string") {
        // If its format is "yyyy-mm-dd", parse it as Date and return it
        const regex = /\d{4}-\d{2}-\d{2}/;
        let match = date.match(regex);
        if (match === null)
            return undefined;
        return new Date(date);
    }
    // Otherwise, the date is invalid
    else
        return undefined;
}

/**
 * Subtracts one month to a date
 * @param date Date to decrement
 * @returns Decremented date
 */
function decrementDateByOneMonth(date: Date) {
    let new_date = new Date(date);
    new_date.setUTCMonth(new_date.getUTCMonth() - 1);
    return new_date;
}

/**
 * Sanitizes user input by removing blank spaces and HTML tags
 * @param data Data to sanitize
 * @returns Sanitized data
 */
function sanitizeInput(data: string) {
    // Remove empty spaces
    let sanitized_data = String(data).trim()
    // Check if there are HTML tags and remove them
    const regex = /(<.*>)*/g
    sanitized_data = sanitized_data.replace(regex, "")
    // Return the sanitized input
    return sanitized_data
}

/**
 * Generates a random character
 * @param alpha If true an alphanumeric character is generated, numeric only otherwise
 * @returns A character
 */
function generateRandomCharacter(alpha: boolean =true) {
    let characters = "0123456789"
    if (alpha) characters = "abcdefghijklmnopqrstuvwxyz" + characters
    const index = Math.floor(Math.random() * characters.length)
    return characters[index]
}

/**
 * Generates a random string (like user and session IDs)
 * @param length Length of the string to generate
 * @param alpha If true an alphanumeric string is generated, numeric only otherwise
 * @returns A random string
 */
function generateRandomString(length: number, alpha: boolean = true) {
    // Generate 'length' random characters
    let characters = []
    for (let i = 0; i < length; i++)
        characters.push(generateRandomCharacter(alpha))
    return characters.join('')
}

async function generateUserId() {
    // Get the list of all user IDs
    const users = await db.users.getAllUsersIds()
    let ids = users.map(({userId}) => userId)
    // Generate a random user ID until a unique one is generated
    let user_id = ""
    do {
        user_id = generateRandomString(db.users.userIdLength, false)
    } while (ids.includes(user_id))
    return user_id
}

/**
 * 
 * @param password Password to hash
 * @param salt_rounds Number of salt rounds
 * @returns Hashed password
 */
function hashPassword(password: string, salt_rounds: number) {
    // Hash the password using the given number of salt rounds
    // Cast to Number is used to make sure that the correct technique is used
    return bcrypt.hashSync(password, Number(salt_rounds))
}

/**
 * Checks if a plain password corresponds to an hashed password
 * @param plain_password Plain password to check
 * @param hashed_password Reference hashed password
 * @returns true if the two passwords correspond, false otherwise
 */
function checkPassword(plain_password: string, hashed_password: string) {
    return bcrypt.compareSync(plain_password, hashed_password)
}

async function checkUserSession(session: session.Session & Partial<session.SessionData>) {
    const now = new Date(Date.now());
    // Check if the session in the cookie is valid
    if (!session || !session.userId || !session.sessionId ||
        !session.expirationDate || session.expirationDate < now)
        return false;
    // Check if the user has session information in the database
    const user = await db.users.getSessionByUserId(session.userId);
    if (user === null)
        return false;
    // Check if this session info is valid
    if (user.session.sessionId !== session.sessionId ||
        user.session.expirationDate < now)
        return false;
    return true;
}

async function checkSessionMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
    // Check if the session is valid. Send status code 401
    // (Unauthorized) if it's not valid
    const valid_session = await checkUserSession(req.session);
    if (!valid_session)
    {
        res.status(401);
        res.send();
        return;
    }

    next()
}

export default {
    roundCurrency,
    toDateObject,
    decrementDateByOneMonth,
    sanitizeInput,
    generateRandomString,
    generateUserId,
    hashPassword,
    checkPassword,
    checkSessionMiddleware,
}