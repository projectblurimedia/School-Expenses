const { createExpense, getAllExpenses, getFilteredExpenses } = require('../controllers/expenseController')

const router = require('express').Router()

router.post('/', createExpense)

router.get('/', getAllExpenses)

router.get('/filtered', getFilteredExpenses)

module.exports = router