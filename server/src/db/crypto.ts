import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const VERSION = "v1"
const IV_LENGTH = 12

let cachedKey: Buffer | null = null

/**
 * Loads DB_ENCRYPTION_KEY (base64, 32 bytes) once per process. The key is
 * managed in Doppler and injected as a Vercel env var — never stored in the
 * database, never in the repo.
 */
function getKey(): Buffer {
    if (cachedKey) return cachedKey
    const b64 = process.env.DB_ENCRYPTION_KEY
    if (!b64)
        throw new Error("DB_ENCRYPTION_KEY is not set")
    const key = Buffer.from(b64, "base64")
    if (key.length !== 32)
        throw new Error("DB_ENCRYPTION_KEY must decode to exactly 32 bytes (openssl rand -base64 32)")
    cachedKey = key
    return key
}

/**
 * Encrypts a plaintext string with AES-256-GCM. Used for free-text fields
 * (e.g. expense notes) that could reveal sensitive information, so that a DB
 * leak/breach or a leaked service_role key alone isn't enough to read them —
 * only the app, holding DB_ENCRYPTION_KEY, can decrypt.
 * @param plaintext Plain text to encrypt, or empty/undefined
 * @returns Versioned "v1:iv:authTag:ciphertext" string (all base64), or null for empty input
 */
export function encryptField(plaintext: string | null | undefined): string | null {
    if (!plaintext) return null
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)
    const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
    const authTag = cipher.getAuthTag()
    return [VERSION, iv.toString("base64"), authTag.toString("base64"), ciphertext.toString("base64")].join(":")
}

/**
 * Decrypts a value produced by encryptField.
 * @param stored Stored ciphertext string, or empty/undefined
 * @returns The decrypted plain text, or "" if empty/not in the expected format
 */
export function decryptField(stored: string | null | undefined): string {
    if (!stored) return ""
    const parts = stored.split(":")
    if (parts.length !== 4 || parts[0] !== VERSION) return ""
    const [, ivB64, authTagB64, ciphertextB64] = parts
    try {
        const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivB64, "base64"))
        decipher.setAuthTag(Buffer.from(authTagB64, "base64"))
        const plaintext = Buffer.concat([decipher.update(Buffer.from(ciphertextB64, "base64")), decipher.final()])
        return plaintext.toString("utf8")
    } catch (error) {
        console.error("crypto.decryptField: failed to decrypt field (wrong/rotated DB_ENCRYPTION_KEY?)", error)
        return ""
    }
}

export default {encryptField, decryptField}
