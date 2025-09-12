import { useState } from 'react'
import './AddExpense.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons'

const AddExpense = ({ onClose }) => {
  // State for form data
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

  // State for UI control
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [showCustomItem, setShowCustomItem] = useState(false)
  const [categorySelected, setCategorySelected] = useState(false)

  // Sample categories and items
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  // Handle category selection
  const handleCategoryChange = (e) => {
    const value = e.target.value
    
    if (value === 'custom') {
      setShowCustomCategory(true)
      setCategorySelected(false)
      setFormData({...formData, category: '', customCategory: ''})
    } else {
      setShowCustomCategory(false)
      setCategorySelected(true)
      setFormData({...formData, category: value, customCategory: ''})
    }
  }

  // Add custom category
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
      customCategory: ''
    })
    
    setShowCustomCategory(false)
    setCategorySelected(true)
  }

  // Handle item selection
  const handleItemChange = (e) => {
    const value = e.target.value
    
    if (value === 'custom') {
      setShowCustomItem(true)
      setFormData({...formData, item: '', customItem: ''})
    } else {
      setShowCustomItem(false)
      setFormData({...formData, item: value, customItem: ''})
    }
  }

  // Add custom item
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

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Determine final category and item values
    const categoryName = formData.category ? 
      categories.find(cat => cat.id === parseInt(formData.category))?.name : ''
    const finalItem = formData.item
    
    // Create the expense object
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
    
    // Reset form
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
              <button 
                type="button" 
                className="addCustomBtn"
                onClick={() => {
                  setShowCustomCategory(true)
                  setCategorySelected(false)
                  setFormData({...formData, category: '', customCategory: ''})
                }}
              >
                + Custom
              </button>
            </div>
            
            {!showCustomCategory ? (
              <select 
                id="category"
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            ) : (
              <div className="customInputContainer">
                <input
                  type="text"
                  name="customCategory"
                  placeholder="Enter new category"
                  value={formData.customCategory}
                  onChange={handleInputChange}
                  required
                />
                <div className="customActions">
                  <button 
                    type="button" 
                    className="cancelCustomBtn"
                    onClick={() => setShowCustomCategory(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="saveCustomBtn"
                    onClick={addCustomCategory}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {categorySelected && (
            <div className="formGroup">
              <div className="inputHeader">
                <label htmlFor="item">Item</label>
                <button 
                  type="button" 
                  className="addCustomBtn"
                  onClick={() => {
                    setShowCustomItem(true)
                    setFormData({...formData, item: '', customItem: ''})
                  }}
                >
                  + Custom
                </button>
              </div>
              
              {!showCustomItem ? (
                <select 
                  id="item"
                  name="item"
                  value={formData.item}
                  onChange={handleItemChange}
                  required
                >
                  <option value="">Select an item</option>
                  {itemsByCategory[formData.category]?.map((item, index) => (
                    <option key={index} value={item}>{item}</option>
                  ))}
                </select>
              ) : (
                <div className="customInputContainer">
                  <input
                    type="text"
                    name="customItem"
                    placeholder="Enter new item"
                    value={formData.customItem}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="customActions">
                    <button 
                      type="button" 
                      className="cancelCustomBtn"
                      onClick={() => setShowCustomItem(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="saveCustomBtn"
                      onClick={addCustomItem}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {(formData.item || formData.customItem) && (
            <>
              <div className="formRow">
                <div className="formGroup">
                  <label htmlFor="quantity">Quantity</label>
                  <input
                    className='input'
                    placeholder='Enter quantity of Item'
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
                    className='input'
                    placeholder='Enter Price in Rupees'
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
                  className='input'
                  type="text"
                  id="person"
                  name="person"
                  placeholder="Who made this purchase?"
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