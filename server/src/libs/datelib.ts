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
