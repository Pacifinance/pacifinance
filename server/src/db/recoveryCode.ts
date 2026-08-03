import crypto from "crypto"

// 80 bits of entropy — far beyond brute-forceable even without rate
// limiting (which is still applied on the verification endpoint as
// defense-in-depth, see routes/public/public.ts).
const RECOVERY_CODE_BYTE_LENGTH = 10

// Crockford Base32 — excludes I, L, O, U (never appear) to avoid
// transcription ambiguity (1/I/l, 0/O confusion) when handwritten or printed.
const BASE32_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"

/**
 * One word per possible byte value (0-255) — a plain, directly reversible
 * lookup table, not BIP39-style bit-packing. This isn't meant to be
 * interoperable with wallet software, just a second, more memorable /
 * handwriting-friendly view of the exact same secret as the block code
 * below — English-only regardless of the app's UI language, same as most
 * seed-phrase tools defaulting to a single universal list.
 */
export const WORDLIST: string[] = [
    "tiger", "eagle", "otter", "panda", "zebra", "camel", "koala", "rhino", "falcon", "dolphin",
    "beaver", "badger", "rabbit", "turtle", "salmon", "spider", "monkey", "parrot", "walrus", "gecko",
    "hornet", "weasel", "jaguar", "lizard", "magpie", "ostrich", "pelican", "penguin", "sparrow", "squirrel",
    "wolf", "lion", "river", "valley", "island", "canyon", "glacier", "meadow", "prairie", "volcano",
    "jungle", "ocean", "harbor", "cliff", "plateau", "tundra", "lagoon", "orchard", "marsh", "delta",
    "dune", "grove", "reef", "ridge", "spring", "stream", "summit", "cave", "coast", "plain",
    "oasis", "thunder", "lightning", "rainbow", "sunrise", "sunset", "breeze", "cloud", "storm", "frost",
    "mist", "blizzard", "drizzle", "cyclone", "aurora", "eclipse", "comet", "meteor", "twilight", "dawn",
    "dusk", "horizon", "zenith", "nebula", "galaxy", "planet", "crater", "orbit", "tide", "wave",
    "current", "gust", "chill", "hammer", "anchor", "lantern", "compass", "ladder", "basket", "kettle",
    "mirror", "candle", "blanket", "pillow", "needle", "thimble", "chisel", "wrench", "bucket", "barrel",
    "crate", "satchel", "pouch", "ribbon", "buckle", "hinge", "latch", "bolt", "screw", "nail",
    "plank", "beam", "brick", "tile", "wire", "pepper", "cinnamon", "ginger", "saffron", "walnut",
    "almond", "hazelnut", "chestnut", "apricot", "mango", "papaya", "coconut", "lemon", "orange", "cherry",
    "plum", "fig", "olive", "wheat", "barley", "oat", "clover", "thistle", "fern", "moss",
    "bamboo", "cedar", "willow", "maple", "birch", "pine", "oak", "amber", "coral", "ivory",
    "jade", "onyx", "pearl", "ruby", "sapphire", "topaz", "bronze", "copper", "silver", "platinum",
    "crystal", "marble", "granite", "slate", "velvet", "satin", "linen", "cotton", "wool", "leather",
    "canvas", "parchment", "ember", "charcoal", "indigo", "violet", "crimson", "scarlet", "azure", "castle",
    "cottage", "cabin", "tower", "bridge", "lighthouse", "windmill", "chapel", "temple", "palace", "fortress",
    "garden", "courtyard", "terrace", "balcony", "chimney", "rooftop", "doorway", "hallway", "corridor", "cellar",
    "attic", "pavilion", "gazebo", "vineyard", "quarry", "wharf", "dock", "pier", "arrow", "banner",
    "beacon", "blade", "cannon", "chariot", "drum", "feather", "flame", "flute", "harp", "helmet",
    "horn", "jewel", "kite", "lyre", "mask", "medal", "quill", "saddle", "scroll", "shield",
    "spear", "sword", "torch", "trumpet", "violin", "whistle", "wand", "biscuit", "noodle", "pretzel",
    "waffle", "pumpkin", "carrot", "potato", "cabbage", "spinach",
]

if (WORDLIST.length !== 256 || new Set(WORDLIST).size !== 256)
    throw new Error(`recoveryCode.WORDLIST must contain exactly 256 unique words (got ${WORDLIST.length}, ${new Set(WORDLIST).size} unique)`)

const WORD_TO_BYTE = new Map<string, number>(WORDLIST.map((word, index) => [word, index]))

/**
 * Generates a fresh recovery code: 10 random bytes plus both textual
 * representations of those exact same bytes.
 */
export function generateRecoveryCode() {
    const bytes = crypto.randomBytes(RECOVERY_CODE_BYTE_LENGTH)
    return {
        bytes,
        base32: formatBase32(bytesToBase32(bytes)),
        words: bytesToWords(bytes),
    }
}

/**
 * Hashes the raw bytes of a recovery code for storage. Only this hash is
 * ever persisted — never either textual form, never the raw bytes.
 */
export function hashRecoveryCode(bytes: Buffer): string {
    return crypto.createHash("sha256").update(bytes).digest("hex")
}

/**
 * Parses whichever format the user typed (grouped block code OR word
 * phrase — both accepted, both represent the same secret) back to the
 * original bytes.
 * @returns The raw bytes, or null if the input matches neither format
 */
export function parseRecoveryCodeInput(input: string): Buffer | null {
    if (!input) return null
    const stripped = input.toUpperCase().replace(/[^0-9A-Z]/g, "")
    if (stripped.length === 16 && [...stripped].every((c) => BASE32_ALPHABET.includes(c)))
        return base32ToBytes(stripped)

    const tokens = input.trim().toLowerCase().split(/[\s-]+/).filter(Boolean)
    if (tokens.length === RECOVERY_CODE_BYTE_LENGTH && tokens.every((t) => WORD_TO_BYTE.has(t)))
        return Buffer.from(tokens.map((t) => WORD_TO_BYTE.get(t) as number))

    return null
}

function bytesToWords(bytes: Buffer): string {
    return Array.from(bytes).map((byte) => WORDLIST[byte]).join("-")
}

function bytesToBase32(bytes: Buffer): string {
    let bits = 0
    let value = 0
    let output = ""
    for (const byte of bytes) {
        value = (value << 8) | byte
        bits += 8
        while (bits >= 5) {
            output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
            bits -= 5
        }
    }
    if (bits > 0)
        output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
    return output
}

function base32ToBytes(input: string): Buffer | null {
    let bits = 0
    let value = 0
    const output: number[] = []
    for (const char of input) {
        const index = BASE32_ALPHABET.indexOf(char)
        if (index === -1) return null
        value = (value << 5) | index
        bits += 5
        if (bits >= 8) {
            output.push((value >>> (bits - 8)) & 0xff)
            bits -= 8
        }
    }
    return Buffer.from(output)
}

function formatBase32(base32: string): string {
    return (base32.match(/.{1,4}/g) ?? [base32]).join("-")
}

export default {generateRecoveryCode, hashRecoveryCode, parseRecoveryCodeInput, WORDLIST}
