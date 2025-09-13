const Expense = require("../models/Expense")

const createExpense = async (req, res, next) => {
  try {
    const expense = new Expense(req.body)
    const savedExpense = await expense.save()
    res.status(201).json(savedExpense)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getAllExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 })
    res.json(expenses)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getTotalExpenses = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const result = await Expense.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ])
    
    res.json(result[0] || { total: 0, count: 0 })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getExpensesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const expenses = await Expense.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).sort({ date: -1 })
    res.json(expenses)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getExpensesByCategory = async (req, res) => {
  try {
    const { category } = req.params
    const expenses = await Expense.find({ category }).sort({ date: -1 })
    res.json(expenses)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getExpensesByPerson = async (req, res) => {
  try {
    const { person } = req.params
    const expenses = await Expense.find({ person }).sort({ date: -1 })
    res.json(expenses)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getCategoryBreakdown = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const result = await Expense.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { total: -1 },
      },
    ])
    
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const updateExpense = async (req, res) => {
  try {
    const { id } = req.params
    const updatedExpense = await Expense.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
    
    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" })
    }
    
    res.json(updatedExpense)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params
    const deletedExpense = await Expense.findByIdAndDelete(id)
    
    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found" })
    }
    
    res.json({ message: "Expense deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createExpense,
  getAllExpenses,
  getTotalExpenses,
  getExpensesByDateRange,
  getExpensesByCategory,
  getExpensesByPerson,
  getCategoryBreakdown,
  updateExpense,
  deleteExpense,
}
