const Item = require("../models/Item")

const createItemByCategory = async (req, res, next) => {
  try {
    const item = new Item(req.body)
    const savedItem = await item.save()
    res.status(201).json(savedItem)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getItemsByCategory = async (req, res, next) => {
  try {
    const items = await Item.find({ category: req.params.categoryId }).sort({ name: 1 })
    res.json(items)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createItemByCategory,
  getItemsByCategory,
}
