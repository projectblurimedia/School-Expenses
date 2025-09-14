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

//new
const getFilteredExpenses = async (req, res) => {
  try {
    const { category, item, date, period, startDate, endDate } = req.query;
    const filter = {};

    // Set date filter based on priority
    let dateFilterSet = false;

    // Custom range (highest priority)
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Ensure end date includes the full day
      filter.date = { $gte: start, $lte: end };
      dateFilterSet = true;
      console.log('Custom range filter:', { $gte: start, $lte: end }); // Debug log
    }
    // Single date
    else if (date) {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.date = { $gte: selectedDate, $lt: nextDay };
      dateFilterSet = true;
    }
    // Period-based
    else if (period) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (period === 'today') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filter.date = { $gte: today, $lt: tomorrow };
      } else if (period === 'thisWeek') {
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);
        filter.date = { $gte: startOfWeek, $lt: endOfWeek };
      } else if (period === 'thisMonth') {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        lastDay.setHours(23, 59, 59, 999);
        filter.date = { $gte: firstDay, $lte: lastDay };
      } else if (period === 'thisYear') {
        const firstDay = new Date(today.getFullYear(), 0, 1);
        const lastDay = new Date(today.getFullYear(), 11, 31);
        lastDay.setHours(23, 59, 59, 999);
        filter.date = { $gte: firstDay, $lte: lastDay };
      } else if (period === 'customRange') {
        if (!startDate || !endDate) {
          return res.status(400).json({ message: 'startDate and endDate are required for customRange' });
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date = { $gte: start, $lte: end };
      } else {
        return res.status(400).json({ message: 'Invalid period. Use "today", "thisWeek", "thisMonth", "thisYear", or "customRange".' });
      }
      dateFilterSet = true;
    }

    // Default to today if no date filter
    if (!dateFilterSet) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filter.date = { $gte: today, $lt: tomorrow };
    }

    // Add case-insensitive category filter
    if (category) {
      filter.category = { $regex: new RegExp(category, 'i') };
    }

    // Add case-insensitive item filter
    if (item) {
      filter.item = { $regex: new RegExp(item, 'i') };
    }

    // Debugging: Log the filter and count of matching documents
    console.log('Applied filter:', filter);
    const matchCount = await Expense.countDocuments(filter);
    console.log('Matching documents count:', matchCount);

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


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
  getFilteredExpenses,
}
