import { useState, useEffect } from 'react'
import './AddExpense.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose, faChevronDown, faChevronUp, faSpinner } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import ToastNotification from '../../components/toastNotification/ToastNotification'

const capitalize = (str) => {
  if (!str) return ''
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const AddExpense = ({ onClose, onExpenseAdded }) => {
  const today = new Date()
  const [formData, setFormData] = useState({
    category: '',
    customCategory: '',
    item: '',
    customItem: '',
    quantity: '',
    price: '',
    person: '',
    description: '',
    date: today
  })
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [showCustomItem, setShowCustomItem] = useState(false)
  const [categorySelected, setCategorySelected] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showItemDropdown, setShowItemDropdown] = useState(false)
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState({
    categories: false,
    items: false,
    submitting: false
  })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(prev => ({ ...prev, categories: true }))
    try {
      const response = await axios.get('/categories')
      setCategories(response.data)
      if (response.data.length === 0) {
        setShowCustomCategory(true)
      }
    } catch (err) {
      setError(capitalize('Failed to fetch categories. Please try again.'))
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(prev => ({ ...prev, categories: false }))
    }
  }

  const fetchItemsByCategory = async (categoryId) => {
    if (!categoryId) return
    
    setLoading(prev => ({ ...prev, items: true }))
    try {
      const response = await axios.get(`/items/${categoryId}`)
      setItems(response.data)
      if (response.data.length === 0) {
        setShowCustomItem(true)
        setFormData(prev => ({ ...prev, item: '', customItem: '' }))
      } else {
        setShowCustomItem(false)
      }
    } catch (err) {
      setError(capitalize('Failed to fetch items. Please try again.'))
      console.error('Error fetching items:', err)
      setShowCustomItem(true)
    } finally {
      setLoading(prev => ({ ...prev, items: false }))
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'number' ? value : capitalize(value)
    })
  }

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date: date
    })
  }

  const handleCategorySelect = (categoryId) => {
    setShowCategoryDropdown(false)
    setShowCustomCategory(false)
    setCategorySelected(true)
    setFormData({ ...formData, category: categoryId, customCategory: '', item: '', customItem: '' })
    setShowCustomItem(false)
    fetchItemsByCategory(categoryId)
  }

  const addCustomCategory = async () => {
    const trimName = formData.customCategory.trim()
    if (trimName === '') {
      setError(capitalize('Category name cannot be empty.'))
      return
    }

    const categoryExists = categories.find(
      cat => cat.name.toLowerCase() === trimName.toLowerCase()
    )

    if (categoryExists) {
      setFormData({
        ...formData,
        category: categoryExists._id,
        customCategory: ''
      })
      setShowCustomCategory(false)
      setCategorySelected(true)
      setShowCategoryDropdown(false)
      fetchItemsByCategory(categoryExists._id)
      return
    }

    setLoading(prev => ({ ...prev, categories: true }))
    try {
      const response = await axios.post('/categories', {
        name: trimName
      })
      
      const newCategory = response.data
      setCategories(prev => [...prev, newCategory])
      
      setFormData({
        ...formData,
        category: newCategory._id,
        customCategory: ''
      })
      
      setShowCustomCategory(false)
      setCategorySelected(true)
      setShowCategoryDropdown(false)
      setShowCustomItem(true)
      fetchItemsByCategory(newCategory._id)
    } catch (err) {
      setError(capitalize('Failed to create category. Please try again.'))
      console.error('Error creating category:', err)
    } finally {
      setLoading(prev => ({ ...prev, categories: false }))
    }
  }

  const handleItemSelect = (item) => {
    setShowItemDropdown(false)
    setShowCustomItem(false)
    setFormData({ ...formData, item: capitalize(item.name), customItem: '' })
  }

  const addCustomItem = async () => {
    const trimName = formData.customItem.trim()
    if (trimName === '' || !formData.category) {
      setError(capitalize('Item name cannot be empty and a category must be selected.'))
      return
    }

    const itemExists = items.find(
      item => item.name.toLowerCase() === trimName.toLowerCase()
    )

    if (itemExists) {
      setFormData({
        ...formData,
        item: capitalize(itemExists.name),
        customItem: ''
      })
      setShowCustomItem(false)
      setShowItemDropdown(false)
      return
    }

    setLoading(prev => ({ ...prev, items: true }))
    try {
      const response = await axios.post('/items', {
        name: trimName,
        category: formData.category
      })
      
      const newItem = response.data
      setItems(prev => [...prev, newItem])
      
      setFormData({
        ...formData,
        item: capitalize(newItem.name),
        customItem: ''
      })
      
      setShowCustomItem(false)
      setShowItemDropdown(false)
    } catch (err) {
      setError(capitalize('Failed to create item. Please try again.'))
      console.error('Error creating item:', err)
    } finally {
      setLoading(prev => ({ ...prev, items: false }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.item || !formData.quantity || !formData.price || !formData.person) {
      setError(capitalize('Please fill in all required fields (Item, Quantity, Price, Person).'))
      return
    }

    const selectedCategory = categories.find(cat => cat._id === formData.category)
    const categoryName = selectedCategory ? capitalize(selectedCategory.name) : capitalize(formData.customCategory)
    
    const expense = {
      category: categoryName,
      item: formData.item,
      quantity: Number(formData.quantity),
      price: Number(formData.price),
      person: capitalize(formData.person),
      description: capitalize(formData.description),
      date: formData.date.toISOString()
    }

    setLoading(prev => ({ ...prev, submitting: true }))
    try {
      const res = await axios.post('/expenses', expense)
      console.log('Expense added:', res.data)

      if (onExpenseAdded) {
        onExpenseAdded(res.data)
      }
      
      setSuccess(capitalize('Expense added successfully!'))
      setFormData({
        category: '',
        customCategory: '',
        item: '',
        customItem: '',
        quantity: '',
        price: '',
        person: '',
        description: '',
        date: today
      })
      setShowCustomCategory(categories.length === 0)
      setShowCustomItem(false)
      setCategorySelected(false)
      setShowCategoryDropdown(false)
      setShowItemDropdown(false)
    } catch (err) {
      setError(capitalize('Failed to add expense. Please try again.'))
      console.error('Error adding expense:', err)
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }))
    }
  }

  const getSelectedCategoryName = () => {
    if (!formData.category) return "Select a category"
    const category = categories.find(cat => cat._id === formData.category)
    return category ? capitalize(category.name) : "Select a category"
  }

  return (
    <div className="addExpenseContainer">
      {error && (
        <ToastNotification
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}
      {success && (
        <ToastNotification
          message={success}
          type="success"
          onClose={() => setSuccess(null)}
        />
      )}
      <div className="expenseForm">
        <div className="formHeader">
          <h2>{capitalize('Create Expense')}</h2>
          <div className="closeBtn" onClick={onClose}>
            <FontAwesomeIcon icon={faClose} />
          </div>
        </div>

        <div className="formContent">
          <form onSubmit={handleSubmit}>
            <div className="formGroup">
              <div className="inputHeader">
                <label>{capitalize('Category')}</label>
                {showCustomCategory ? (
                  <button
                    type="button"
                    className="cancelCustomBtn"
                    onClick={() => {
                      setShowCustomCategory(categories.length === 0)
                      setFormData({ ...formData, customCategory: '' })
                    }}
                    disabled={loading.categories}
                  >
                    {capitalize('Cancel')}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="addCustomBtn"
                    onClick={() => {
                      setShowCustomCategory(true)
                      setCategorySelected(false)
                      setFormData({ ...formData, category: '', customCategory: '', item: '', customItem: '' })
                    }}
                    disabled={loading.categories}
                  >
                    {loading.categories ? <FontAwesomeIcon icon={faSpinner} spin /> : capitalize('+ Custom')}
                  </button>
                )}
              </div>

              {!showCustomCategory ? (
                <div className="customSelectContainer">
                  <div
                    className="customSelect"
                    onClick={() => !loading.categories && setShowCategoryDropdown(!showCategoryDropdown)}
                  >
                    <span>
                      {loading.categories ? capitalize('Loading categories...') : getSelectedCategoryName()}
                    </span>
                    {!loading.categories && categories.length > 0 && (
                      <FontAwesomeIcon icon={showCategoryDropdown ? faChevronUp : faChevronDown} />
                    )}
                  </div>
                  
                  {showCategoryDropdown && categories.length > 0 && (
                    <div className="customOptions">
                      {categories.map(cat => (
                        <div
                          key={cat._id}
                          className="customOption"
                          onClick={() => handleCategorySelect(cat._id)}
                        >
                          {capitalize(cat.name)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="customInputContainer">
                  <input
                    type="text"
                    name="customCategory"
                    placeholder={capitalize("Enter new category")}
                    value={formData.customCategory}
                    onChange={handleInputChange}
                    required
                    autoFocus
                    disabled={loading.categories}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomCategory(); } }}
                  />
                  <button
                    type="button"
                    className="saveCustomBtn"
                    onClick={addCustomCategory}
                    disabled={loading.categories || !formData.customCategory.trim()}
                  >
                    {loading.categories ? <FontAwesomeIcon icon={faSpinner} spin /> : capitalize('Add')}
                  </button>
                </div>
              )}
            </div>

            {categorySelected && (
              <div className="formGroup">
                <div className="inputHeader">
                  <label>Item</label>
                  {showCustomItem ? (
                    <button
                      type="button"
                      className="cancelCustomBtn"
                      onClick={() => {
                        setShowCustomItem(items.length === 0)
                        setFormData({ ...formData, customItem: '' })
                      }}
                      disabled={loading.items}
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="addCustomBtn"
                      onClick={() => {
                        setShowCustomItem(true)
                        setFormData({ ...formData, item: '', customItem: '' })
                      }}
                      disabled={loading.items}
                    >
                      {loading.items ? <FontAwesomeIcon icon={faSpinner} spin /> : capitalize('+ Custom')}
                    </button>
                  )}
                </div>

                {!showCustomItem && items.length > 0 ? (
                  <div className="customSelectContainer">
                    <div
                      className="customSelect"
                      onClick={() => !loading.items && setShowItemDropdown(!showItemDropdown)}
                    >
                      <span>
                        {loading.items ? 'Loading items...' : (formData.item || "Select an item" )}
                      </span>
                      {!loading.items && (
                        <FontAwesomeIcon icon={showItemDropdown ? faChevronUp : faChevronDown} />
                      )}
                    </div>
                    
                    {showItemDropdown && items.length > 0 && (
                      <div className="customOptions">
                        {items.map((item, index) => (
                          <div
                            key={item._id || index}
                            className="customOption"
                            onClick={() => handleItemSelect(item)}
                          >
                            {capitalize(item.name)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="customInputContainer">
                    <input
                      type="text"
                      name="customItem"
                      placeholder={capitalize("Enter new item")}
                      value={formData.customItem}
                      onChange={handleInputChange}
                      required
                      autoFocus
                      disabled={loading.items}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomItem(); } }}
                    />
                    <button
                      type="button"
                      className="saveCustomBtn"
                      onClick={addCustomItem}
                      disabled={loading.items || !formData.customItem.trim()}
                    >
                      {loading.items ? <FontAwesomeIcon icon={faSpinner} spin /> : capitalize('Add')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {formData.item && (
              <>
                <div className="formRow">
                  <div className="formGroup">
                    <label htmlFor="quantity">{capitalize('Quantity')}</label>
                    <input
                      className="input"
                      placeholder={capitalize("Enter quantity")}
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                      min="0"
                    />
                  </div>
                
                  <div className="formGroup">
                    <label htmlFor="price">{capitalize('Price (₹)')}</label>
                    <input
                      className="input"
                      placeholder={capitalize("Enter price")}
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="1"
                      step="1"
                    />
                  </div>
                </div>

                <div className="formRow">
                  <div className="formGroup">
                    <label htmlFor="date">{capitalize('Date')}</label>
                    <DatePicker
                      id="date"
                      selected={formData.date}
                      onChange={handleDateChange}
                      maxDate={today}
                      dateFormat="dd/MM/yyyy"
                      className="input datePicker"
                      placeholderText={capitalize("Select date")}
                      required
                    />
                  </div>

                  <div className="formGroup">
                    <label htmlFor="person">{capitalize('Person Name')}</label>
                    <input
                      className="input"
                      type="text"
                      id="person"
                      name="person"
                      placeholder={capitalize("Person name")}
                      value={formData.person}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="formGroup">
                  <label htmlFor="description">{capitalize('Description')}</label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder={capitalize("Add any additional details")}
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="formActions">
                  <button type="button" className="cancelBtn" onClick={onClose} disabled={loading.submitting}>
                    {capitalize('Cancel')}
                  </button>
                  <button type="submit" className="submitBtn" disabled={loading.submitting}>
                    {loading.submitting ? <FontAwesomeIcon icon={faSpinner} spin /> : capitalize('Add Expense')}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddExpense