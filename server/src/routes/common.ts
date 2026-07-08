import crypto from "crypto"

import db from "../db/db"

/**
 * Rounds a currency value to the second decimal digit
 * @param n Currency value
 * @returns Rounded currency value
 */
function roundCurrency(n: number) {
    if (n === undefined || isNaN(n)) return 0
    // Round to the second decimal digit
	let r = +n.toFixed(2) // toFixed() returns a string, but with the + in front it becomes a number
    // If the rounding was of the 'ceiling' type, make it 'floor'
	if (r > n) r -= 0.01
    // Round again to the second decimal digit to account for floating point shenanigans
	return +r.toFixed(2)
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
 * Adds zeros to the left of a string until the desired string length is reached
 * @param s The string to pad
 * @param nCharacters Desired total length of the string after padding
 * @returns Padded string
 */
function padLeftWithZeros(s: string, nCharacters: number) {
    if (s.length >= nCharacters)
        return s
    return new Array(nCharacters - s.length + 1).join('0') + s
}

/**
 * Generates a random unique user ID. Checks each candidate against the
 * `user_code` unique index (a single indexed lookup) instead of fetching
 * every existing user ID, so cost doesn't grow with the user base.
 * @param nDigits Number of digits of the user ID
 * @returns A new user ID
 */
async function generateUserId(nDigits: number) {
    let user_id = ""
    do {
        user_id = String(crypto.randomInt(0, 10 ** nDigits))
        user_id = padLeftWithZeros(user_id, nDigits)
    } while (await db.users.userCodeExists(user_id))
    return user_id
}

export default {
    roundCurrency,
    sanitizeInput,
    generateUserId,
}
