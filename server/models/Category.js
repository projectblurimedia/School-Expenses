const mongoose = require("mongoose")

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
  },{ timestamps: true })

module.exports = mongoose.model("Category", categorySchema)
