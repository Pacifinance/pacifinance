import users from "../../db/models/users"
import balances from "../../db/models/balances"
import expenses from "../../db/models/expenses"

/**
 * Contains all the relevant averages of a user
 */
type Averages = {
    balances: number,
    expenses: number,
    incomes: number
}

/**
 * Accumulates values to compute their average
 */
class Accumulator {
    private sum: number
    private count: number
    
    public constructor() {
        this.sum = 0
        this.count = 0
    }

    public accumulate(value: number) {
        this.sum += value
        this.count++
    }

    public getAverage() {
        if (this.count === 0)
            return 0
        return this.sum / this.count
    }
}

/**
 * Accumulates the values for computing the relevant averages of a user
 */
class AveragesData {
    private balances: Accumulator
    private expenses: Accumulator
    private incomes: Accumulator

    public constructor() {
        this.balances = new Accumulator()
        this.expenses = new Accumulator()
        this.incomes = new Accumulator()
    }

    public addBalance(value: number) {
        this.balances.accumulate(value)
    }

    public addExpense(value: number) {
        this.expenses.accumulate(value)
    }

    public addIncome(value: number) {
        this.incomes.accumulate(value)
    }

    public getAverages(): Averages {
        return {
            balances: this.balances.getAverage(),
            expenses: this.expenses.getAverage(),
            incomes: this.incomes.getAverage()
        }
    }
}

/**
 * How the averages of all users are stored in the cache
 */
type AveragesCachedData = {
    all: Averages,
    [user: string]: Averages // mongodb ObjectId converted to string
}

type UsersList = Awaited<ReturnType<typeof users.getAllUsersIds>>

/**
 * Computes the averages given a list of users
 * @param usersList List of users
 * @param now Current time
 * @returns Averages among the provided users
 */
async function computeAverages(usersList: UsersList, now: Date): Promise<Averages> {
    const thisMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth()))
    const lastMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth()-1))

    // let averages = new AveragesData()

    // let allBalances: number[] = []
    // let allExpenses: number[] = []
    // let allIncomes: number[] = []

    // for (const user of usersList) {
    //     if (user.type >= users.UserType.test.value)
    //         continue

    //     const balanceTotal = await balances.getTotalLatestByUserId(user.userId, thisMonthStart)
    //     if (balanceTotal !== null)
    //         allBalances.push(balanceTotal)

    //     const expensesTotal = await expenses.getTotalMonthlyExpensesByUserId(user.userId, lastMonthStart, true)
    //     if (expensesTotal !== null)
    //         allExpenses.push(expensesTotal)

    //     const incomesTotal = await expenses.getTotalMonthlyExpensesByUserId(user.userId, lastMonthStart, false)
    //     if (incomesTotal !== null)
    //         allIncomes.push(incomesTotal)
    // }

    // if (allBalances.length === 0)
    //     averages.balances = 0.0
    // else
    //     averages.balances = allBalances.reduce((accumulator, balance) => accumulator + balance, 0) / allBalances.length
    
    // if (allExpenses.length === 0)
    //     averages.expenses = 0.0
    // else
    //     averages.expenses = allExpenses.reduce((accumulator, expense) => accumulator + expense, 0) / allExpenses.length
    
    // if (allIncomes.length === 0)
    //     averages.incomes = 0.0
    // else
    //     averages.incomes = allIncomes.reduce((accumulator, income) => accumulator + income, 0) / allIncomes.length

    // return averages

    let averagesData = new AveragesData()

    for (const user of usersList) {
        if (user.type >= users.UserType.test.value)
            continue

        const balanceTotal = await balances.getTotalLatestByUserId(user.userId, thisMonthStart)
        if (balanceTotal !== null)
            averagesData.addBalance(balanceTotal)

        const expensesTotal = await expenses.getTotalMonthlyExpensesByUserId(user.userId, lastMonthStart, true)
        if (expensesTotal !== null)
            averagesData.addExpense(expensesTotal)

        const incomesTotal = await expenses.getTotalMonthlyExpensesByUserId(user.userId, lastMonthStart, false)
        if (incomesTotal !== null)
            averagesData.addIncome(incomesTotal)
    }

    return averagesData.getAverages()
}

/**
 * Computes the averages for the last month among all users and for each user
 * @returns Object to store in the database and cache
 */
async function fetchUserAverages(): Promise<AveragesCachedData> {
    // For each user, get its total balance, total expenses and total incomes of the last month
    // Then, compute the average of all balances, expenses and incomes

    console.log("Started computation of users averages")

    let averagesCachedData: AveragesCachedData = {
        all: {
            balances: 0,
            expenses: 0,
            incomes: 0
        }
    }

    const now = new Date(Date.now())

    const allUsersList = await users.getAllUsersIds() // test users included
    averagesCachedData.all = await computeAverages(allUsersList, now)

    for (let user of allUsersList) {
        const userRef = user._id.toString()
        const similarUsersList = await users.getAllUsersIds(userRef, true) // only similar, non-test users
        averagesCachedData[userRef] = await computeAverages(similarUsersList, now)
    }

    console.log("Finished computation of users averages")

    return averagesCachedData
}

export default { fetchUserAverages }