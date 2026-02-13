import publicRouter from "./public/public";
import userRouter from "./private/user"
import balancesRouter from "./private/balances"
import expensesRouter from "./private/expenses"
import tagsRouter from "./private/tags";
import rankRouter from "./private/rank";
import statsRouter from "./private/stats";
import pricesRouter from "./private/prices";

export default {
    publicRouter,
    userRouter,
    balancesRouter,
    expensesRouter,
    tagsRouter,
    rankRouter,
    statsRouter,
    pricesRouter,
}