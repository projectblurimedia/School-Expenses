const mongoose = require("mongoose")

const itemSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true }
)

itemSchema.index({ category: 1, name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } })

module.exports = mongoose.model("Item", itemSchema)