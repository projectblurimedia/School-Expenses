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

const getFilteredExpenses = async (req, res) => {
  try {
    const { category, item, period, startDate, endDate } = req.query
    const filter = {}

    console.log(req.query)
    let dateFilterSet = false

    if (period) {
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'startDate and endDate are required' })
      }

      let start = new Date(startDate)
      let end = new Date(endDate)

      if (period === 'Month' || period === 'Year') {
        // endDate is already the exclusive end (start of next period)
        filter.date = { $gte: start, $lt: end }
      } else if (period === 'Date' || period === 'Custom Range') {
        // Make end exclusive by adding one day to include the full endDate
        end.setDate(end.getDate() + 1)
        filter.date = { $gte: start, $lt: end }
      } else {
        return res.status(400).json({ message: 'Invalid period. Use "Date", "Month", "Year", or "Custom Range".' })
      }

      dateFilterSet = true
      console.log('Applied date filter:', filter.date)
    }

    // Default to today if no date filter
    if (!dateFilterSet) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      filter.date = { $gte: today, $lt: tomorrow }
    }

    // Add case-insensitive category filter if not 'All Categories'
    if (category && category !== 'All Categories') {
      filter.category = { $regex: new RegExp(category, 'i') }
    }

    // Add case-insensitive item filter if not 'All Items'
    if (item && item !== 'All Items') {
      filter.item = { $regex: new RegExp(item, 'i') }
    }

    // Debugging: Log the filter and count of matching documents
    console.log('Applied filter:', filter)
    const matchCount = await Expense.countDocuments(filter)
    console.log('Matching documents count:', matchCount)

    const expenses = await Expense.find(filter).sort({ date: -1 })
    res.json(expenses)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

//new
const getMonthlyExpensesByYear = async (req, res) => {
  try {
    const { year } = req.query;
    if (!year) return res.status(400).json({ message: "Year is required" });

    const selectedYear = parseInt(year);
    const now = new Date();
    const isCurrentYear = now.getFullYear() === selectedYear;
    const lastMonth = isCurrentYear ? now.getMonth() + 1 : 12;

    let monthlyData = [];

    for (let month = 1; month <= lastMonth; month++) {
      // Start date in UTC (midnight)
      const startDate = new Date(Date.UTC(selectedYear, month - 1, 1, 0, 0, 0, 0));

      // End date in UTC (last millisecond of month)
      const endDate = new Date(Date.UTC(selectedYear, month, 0, 23, 59, 59, 999));

      const result = await Expense.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$price" },
          },
        },
      ]);

      monthlyData.push({
        month,
        startDate,
        endDate,
        total: result.length > 0 ? result[0].total : 0,
      });
    }

    res.json(monthlyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//new
const getYearlyExpensesInRange = async (req, res) => {
  try {
    let { startYear, endYear } = req.query;

    const currentYear = new Date().getFullYear();

    // If no range provided, default to last 3 years
    if (!startYear || !endYear) {
      startYear = currentYear - 2; // last 3 years
      endYear = currentYear;
    }

    startYear = parseInt(startYear);
    endYear = parseInt(endYear);

    if (startYear > endYear) {
      return res.status(400).json({ message: "startYear cannot be greater than endYear" });
    }

    let yearlyData = [];

    for (let year = endYear; year >= startYear; year--) {
      const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

      const result = await Expense.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$price" }, // price only
          },
        },
      ]);

      yearlyData.push({
        year,
        startDate,
        endDate,
        total: result.length > 0 ? result[0].total : 0,
      });
    }

    res.json(yearlyData);
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
  getMonthlyExpensesByYear,
  getYearlyExpensesInRange,
}
