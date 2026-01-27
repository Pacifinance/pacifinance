import users from "../../db/models/users"
import balances from "../../db/models/balances"
import expenses from "../../db/models/expenses"

type AveragesData = {
    balances: number,
    expenses: number,
    incomes: number
}

/**
 * Computes the average of all balances, expenses and incomes of all users for the last month
 * @returns Object to store in the database and cache
 */
async function fetchUserAverages(): Promise<AveragesData> {
    // For each user, get its total balance, total expenses and total incomes of the last month
    // Then, compute the average of all balances, expenses and incomes
    
    let averages: AveragesData = {
        balances: 0,
        expenses: 0,
        incomes: 0
    }

    const now = new Date(Date.now())
    const thisMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth()))
    const lastMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth()-1))

    let allBalances: number[] = []
    let allExpenses: number[] = []
    let allIncomes: number[] = []

    const usersList = await users.getAllUsersIds()
    for (const user of usersList) {
        if (user.type >= users.UserType.test.value)
            continue

        const balanceTotal = await balances.getTotalLatestByUserId(user.userId, thisMonthStart)
        if (balanceTotal !== null)
            allBalances.push(balanceTotal)

        const expensesTotal = await expenses.getTotalMonthlyExpensesByUserId(user.userId, lastMonthStart, true)
        if (expensesTotal !== null)
            allExpenses.push(expensesTotal)

        const incomesTotal = await expenses.getTotalMonthlyExpensesByUserId(user.userId, lastMonthStart, false)
        if (incomesTotal !== null)
            allIncomes.push(incomesTotal)
    }

    if (allBalances.length === 0)
        averages.balances = 0.0
    else
        averages.balances = allBalances.reduce((accumulator, balance) => accumulator + balance, 0) / allBalances.length
    
    if (allExpenses.length === 0)
        averages.expenses = 0.0
    else
        averages.expenses = allExpenses.reduce((accumulator, expense) => accumulator + expense, 0) / allExpenses.length
    
    if (allIncomes.length === 0)
        averages.incomes = 0.0
    else
        averages.incomes = allIncomes.reduce((accumulator, income) => accumulator + income, 0) / allIncomes.length

    return averages
}

export default { fetchUserAverages }