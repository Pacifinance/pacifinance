/**
 * Extension of the default Date class for domain-specific UTC dates manipulation
*/
export class ExtDate extends Date {
    constructor(value: number | string | Date) {
        super(value)
    }

    /**
     * Copies a date
     * @returns Copy of this date
     */
    copy() {
        return new ExtDate(this)
    }

    /**
     * Creates a date using the current time
     * @returns Current UTC time
     */
    static fromNow() {
        return new ExtDate(Date.now())
    }

    /**
     * Creates a date from the start of the current month
     * @returns Current month's start UTC time
     */
    static fromThisMonthStart() {
        const now = ExtDate.fromNow()
        now.setUTCDate(1)
        now.setUTCHours(0, 0, 0, 0)
        return now
    }

    /**
     * Creates a date from the end of the current month
     * @returns Current month's end UTC time
     */
    static fromThisMonthEnd() {
        const now = ExtDate.fromNow()
        now.setUTCMonth(now.getUTCMonth() + 1, 0)
        now.setUTCHours(23, 59, 59, 999)
        return now
    }

    /**
     * Creates a date from the start of the month given as reference
     * @param value Reference date
     * @returns Reference month's start UTC time
     */
    static fromReferenceMonthStart(value: ExtDate) {
        const ref = new ExtDate(value)
        return new ExtDate(ExtDate.UTC(ref.getUTCFullYear(), ref.getUTCMonth()))
    }

    /**
     * Creates a date from the end of the month given as reference
     * @param value Reference date
     * @returns Reference month's end UTC time
     */
    static fromReferenceMonthEnd(value: ExtDate) {
        const ref = new ExtDate(value)
        ref.setUTCMonth(ref.getUTCMonth() + 1, 0)
        ref.setUTCHours(23, 59, 59, 999)
        return ref
    }

    /**
     * Moves this date forward or back in time by the given number of seconds
     * @param seconds Number of seconds to move
     */
    moveBySeconds(seconds: number) {
        this.setUTCSeconds(this.getUTCSeconds() + seconds)
    }

    /**
     * Moves this date forward or back in time by the given number of days
     * @param days Number of days to move
     */
    moveByDays(days: number) {
        this.setUTCDate(this.getUTCDate() + days)
    }

    /**
     * Moves this date forward or back in time by the given number of months
     * @param months Number of months to move
     */
    moveByMonths(months: number) {
        this.setUTCMonth(this.getUTCMonth() + months)
    }
}

/**
 * Formats a date as a UTC "YYYY-MM-DD" string, matching the granularity of
 * `date`-type columns. Built from explicit UTC getters (not toISOString().split)
 * to avoid the UTC-midnight/local-timezone shift bug.
 */
export function toDateOnly(d: Date) {
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, "0")
    const day = String(d.getUTCDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
}
