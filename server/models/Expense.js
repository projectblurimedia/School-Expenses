const mongoose = require("mongoose")

const expenseSchema = mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      index: true,
    },
    item: {
      type: String,
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    person: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      required: true,
    },
  },{ timestamps: true })

expenseSchema.index({ category: 1, date: -1 })
expenseSchema.index({ person: 1, date: -1 })
expenseSchema.index({ date: -1 })

expenseSchema.pre("save", function (next) {
  this.totalAmount = this.quantity * this.price
  next()
})

expenseSchema.statics.getByDateRange = function (startDate, endDate) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: -1 })
}

expenseSchema.statics.getByCategory = function (category) {
  return this.find({ category: category }).sort({ date: -1 })
}

expenseSchema.statics.getByPerson = function (person) {
  return this.find({ person: person }).sort({ date: -1 })
}

expenseSchema.statics.getTotalExpenses = function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
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
}

expenseSchema.statics.getCategoryBreakdown = function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
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
}

module.exports = mongoose.model("Expense", expenseSchema)
