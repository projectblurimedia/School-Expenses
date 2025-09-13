const { createExpense, getAllExpenses } = require('../controllers/expenseController')

const router = require('express').Router()

router.post('/', createExpense)

router.get('/', getAllExpenses)

module.exports = router