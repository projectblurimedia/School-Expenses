const Category = require("../models/Category")

const createCategory = async (req, res, next) => {
  try {
    const category = new Category(req.body)
    const savedCategory = await category.save()
    res.status(201).json(savedCategory)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 })
    res.json(categories)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createCategory,
  getCategories,
}
