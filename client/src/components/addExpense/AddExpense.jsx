import { useState } from 'react'
import './AddExpense.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'

const AddExpense = ({ onClose }) => {
  const [formData, setFormData] = useState({
    category: '',
    customCategory: '',
    item: '',
    customItem: '',
    quantity: '',
    price: '',
    person: '',
    description: ''
  })
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [showCustomItem, setShowCustomItem] = useState(false)
  const [categorySelected, setCategorySelected] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showItemDropdown, setShowItemDropdown] = useState(false)
  const [categories, setCategories] = useState([
    { id: 1, name: 'Classroom Supplies' },
    { id: 2, name: 'Technology' },
    { id: 3, name: 'Sports Equipment' },
    { id: 4, name: 'Library Resources' },
    { id: 5, name: 'Administrative' }
  ])
  const [itemsByCategory, setItemsByCategory] = useState({
    1: ['Pens', 'Pencils', 'Notebooks', 'Art Supplies'],
    2: ['Tablets', 'Laptops', 'Projectors', 'Software Licenses'],
    3: ['Basketballs', 'Soccer Balls', 'Uniforms', 'Training Equipment'],
    4: ['Books', 'Magazines', 'Reference Materials', 'E-books'],
    5: ['Office Supplies', 'Furniture', 'Cleaning Supplies', 'Utilities']
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleCategorySelect = (categoryId) => {
    setShowCategoryDropdown(false)
    setShowCustomCategory(false)
    setCategorySelected(true)
    setFormData({ ...formData, category: categoryId, customCategory: '', item: '', customItem: '' })
    setShowCustomItem(false)
  }

  const addCustomCategory = () => {
    if (formData.customCategory.trim() === '') return

    const newCategory = {
      id: categories.length + 1,
      name: formData.customCategory
    }
    setCategories([...categories, newCategory])
    setItemsByCategory({
      ...itemsByCategory,
      [newCategory.id]: []
    })
    setFormData({
      ...formData,
      category: String(newCategory.id),
      customCategory: '',
      item: '',
      customItem: ''
    })
    setShowCustomCategory(false)
    setCategorySelected(true)
    setShowCustomItem(false)
  }

  const handleItemSelect = (item) => {
    setShowItemDropdown(false)
    setShowCustomItem(false)
    setFormData({ ...formData, item: item, customItem: '' })
  }

  const addCustomItem = () => {
    if (formData.customItem.trim() === '' || !formData.category) return

    const categoryId = formData.category
    const newItems = [...(itemsByCategory[categoryId] || []), formData.customItem]

    setItemsByCategory({
      ...itemsByCategory,
      [categoryId]: newItems
    })

    setFormData({
      ...formData,
      item: formData.customItem,
      customItem: ''
    })

    setShowCustomItem(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const categoryName = formData.category ?
      categories.find(cat => cat.id === parseInt(formData.category))?.name : ''
    const finalItem = formData.item
    const expense = {
      category: categoryName,
      item: finalItem,
      quantity: formData.quantity,
      price: formData.price,
      person: formData.person,
      description: formData.description,
      date: new Date().toISOString()
    }
    console.log('Expense added:', expense)
    alert('Expense added successfully!')
    setFormData({
      category: '',
      customCategory: '',
      item: '',
      customItem: '',
      quantity: '',
      price: '',
      person: '',
      description: ''
    })
    setShowCustomCategory(false)
    setShowCustomItem(false)
    setCategorySelected(false)
  }

  const getSelectedCategoryName = () => {
    if (!formData.category) return "Select a category"
    const category = categories.find(cat => cat.id === parseInt(formData.category))
    return category ? category.name : "Select a category"
  }

  return (
    <div className="addExpenseContainer">
      <div className="expenseForm">
        <div className="formHeader">
          <h2>Add New Expense</h2>
          <div className="closeBtn" onClick={onClose}>
            <FontAwesomeIcon icon={faClose} />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="formGroup">
            <div className="inputHeader">
              <label htmlFor="category">Category</label>
              {!showCustomCategory ? (
                <button
                  type="button"
                  className="addCustomBtn"
                  onClick={() => {
                    setShowCustomCategory(true)
                    setCategorySelected(false)
                    setFormData({ ...formData, category: '', customCategory: '', item: '', customItem: '' })
                  }}
                >
                  + Custom
                </button>
              ) : (
                <button
                  type="button"
                  className="cancelCustomBtnInHeader"
                  onClick={() => setShowCustomCategory(false)}
                >
                  Cancel
                </button>
              )}
            </div>

            {!showCustomCategory ? (
              <div className="customSelectContainer">
                <div
                  className="customSelect"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  <span>{getSelectedCategoryName()}</span>
                  <FontAwesomeIcon icon={showCategoryDropdown ? faChevronUp : faChevronDown} />
                </div>
                {showCategoryDropdown && (
                  <div className="customOptions">
                    {categories.map(cat => (
                      <div
                        key={cat.id}
                        className="customOption"
                        onClick={() => handleCategorySelect(cat.id)}
                      >
                        {cat.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="customInputContainer withAddBtn">
                <input
                  type="text"
                  name="customCategory"
                  placeholder="Enter new category"
                  value={formData.customCategory}
                  onChange={handleInputChange}
                  required
                  autoFocus
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomCategory(); } }}
                />
                <button
                  type="button"
                  className="saveCustomBtn"
                  onClick={addCustomCategory}
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {categorySelected && (
            <div className="formGroup">
              <div className="inputHeader">
                <label htmlFor="item">Item</label>
                {!showCustomItem ? (
                  <button
                    type="button"
                    className="addCustomBtn"
                    onClick={() => {
                      setShowCustomItem(true)
                      setFormData({ ...formData, item: '', customItem: '' })
                    }}
                  >
                    + Custom
                  </button>
                ) : (
                  <button
                    type="button"
                    className="cancelCustomBtnInHeader"
                    onClick={() => setShowCustomItem(false)}
                  >
                    Cancel
                  </button>
                )}
              </div>

              {!showCustomItem ? (
                <div className="customSelectContainer">
                  <div
                    className="customSelect"
                    onClick={() => {
                      if (itemsByCategory[formData.category]?.length > 0) {
                        setShowItemDropdown(!showItemDropdown)
                      }
                    }}
                  >
                    <span>{formData.item || "Select an item"}</span>
                    {itemsByCategory[formData.category]?.length > 0 && (
                      <FontAwesomeIcon icon={showItemDropdown ? faChevronUp : faChevronDown} />
                    )}
                  </div>
                  {showItemDropdown && itemsByCategory[formData.category]?.length > 0 && (
                    <div className="customOptions">
                      {itemsByCategory[formData.category]?.map((item, index) => (
                        <div
                          key={index}
                          className="customOption"
                          onClick={() => handleItemSelect(item)}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="customInputContainer withAddBtn">
                  <input
                    type="text"
                    name="customItem"
                    placeholder="Enter new item"
                    value={formData.customItem}
                    onChange={handleInputChange}
                    required
                    autoFocus
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomItem(); } }}
                  />
                  <button
                    type="button"
                    className="saveCustomBtn"
                    onClick={addCustomItem}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          )}

          {formData.item && (
            <>
              <div className="formRow">
                <div className="formGroup">
                  <label htmlFor="quantity">Quantity</label>
                  <input
                    className="input"
                    placeholder="Enter quantity of Item"
                    type="text"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="formGroup">
                  <label htmlFor="price">Price (₹)</label>
                  <input
                    className="input"
                    placeholder="Enter Price in Rupees"
                    type="text"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="formGroup">
                <label htmlFor="person">Person Name</label>
                <input
                  className="input"
                  type="text"
                  id="person"
                  name="person"
                  placeholder="Who made this expense?"
                  value={formData.person}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="formGroup">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Add any additional details about this expense"
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div className="formActions">
                <button type="button" className="cancelBtn" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="submitBtn">
                  Add Expense
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}

export default AddExpense
