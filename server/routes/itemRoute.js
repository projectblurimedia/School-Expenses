const { createItemByCategory, getItemsByCategory } = require('../controllers/itemController')

const router = require('express').Router()

router.post('/', createItemByCategory)
router.get('/:categoryId', getItemsByCategory)

module.exports = router