const { createExpense, getAllExpenses, getFilteredExpenses, getMonthlyExpensesByYear, getYearlyExpensesInRange } = require('../controllers/expenseController')

const router = require('express').Router()

router.post('/', createExpense)

router.get('/', getAllExpenses)

router.get('/filtered', getFilteredExpenses)

router.get('/comparemonths', getMonthlyExpensesByYear)

router.get('/compareyears', getYearlyExpensesInRange)



module.exports = router