import './expenses.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faCalendar, faDownload, faChartPie, faChevronDown, faFileArrowDown, faTable } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import axios from 'axios'

const Expenses = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('table')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showItemDropdown, setShowItemDropdown] = useState(false)
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState({ name: 'All Categories', _id: null })
  const [selectedItem, setSelectedItem] = useState('All Items')
  const [selectedDateRange, setSelectedDateRange] = useState('Date')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [appliedCategory, setAppliedCategory] = useState({ name: 'All Categories', _id: null })
  const [appliedItem, setAppliedItem] = useState('All Items')
  const [appliedDateRange, setAppliedDateRange] = useState('Date')
  const [appliedSelectedDate, setAppliedSelectedDate] = useState(new Date())
  const [appliedStartDate, setAppliedStartDate] = useState(new Date())
  const [appliedEndDate, setAppliedEndDate] = useState(new Date())
  const [categories, setCategories] = useState([{ name: 'All Categories', _id: null }])
  const [items, setItems] = useState(['All Items'])
  const [records, setRecords] = useState([])

  const dateRanges = ['Date', 'Month', 'Year', 'Custom Range']

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/categories')
        setCategories([{ name: 'All Categories', _id: null }, ...response.data])
      } catch (err) {
        console.error('Error fetching categories:', err)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchItemsByCategory = async (categoryId) => {
      try {
        const response = await axios.get(`/items/${categoryId}`)
        const fetchedItems = response.data.map(item => item.name)
        setItems(['All Items', ...fetchedItems])
      } catch (err) {
        console.error('Error fetching items:', err)
        setItems(['All Items'])
      }
    }
    if (selectedCategory._id) {
      fetchItemsByCategory(selectedCategory._id)
      setShowItemDropdown(true)
    } else {
      setShowItemDropdown(false)
      setSelectedItem('All Items')
      setItems(['All Items'])
    }
  }, [selectedCategory._id])

  useEffect(() => {
    handleGetRecords()
  }, [])

  const handleGoBackToHome = () => {
    navigate('/')
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setShowCategoryDropdown(false)
  }

  const handleItemSelect = (item) => {
    setSelectedItem(item)
    setShowItemDropdown(false)
  }

  const handleDateRangeSelect = (range) => {
    setSelectedDateRange(range)
    setShowDateDropdown(false)
    setShowCalendar(true)
    if (range === 'Date') {
      const today = new Date()
      setSelectedDate(today)
      setStartDate(today)
      setEndDate(today)
    } else if (range === 'Month' || range === 'Year') {
      // Will be set in handleDateSelect
    } else {
      setStartDate(null)
      setEndDate(null)
    }
  }

  const handleDateSelect = (date) => {
    if (selectedDateRange === 'Month') {
      const year = date.getFullYear()
      const month = date.getMonth()
      const start = new Date(date)
      const end = new Date(year, month + 1, 1)
      setStartDate(start)
      setEndDate(end)
      setSelectedDate(date)
      setShowCalendar(false)
    } else if (selectedDateRange === 'Year') {
      const year = date.getFullYear()
      const start = new Date(date)
      const end = new Date(year, 11, 32)
      setStartDate(start)
      setEndDate(end)
      setSelectedDate(date)
      setShowCalendar(false)
    } else if (selectedDateRange === 'Custom Range') {
      if (!startDate) {
        setStartDate(date)
      } else if (!endDate && date >= startDate) {
        setEndDate(date)
        setShowCalendar(false)
      } else {
        setStartDate(date)
        setEndDate(null)
      }
      setSelectedDate(date)
    } else {
      setSelectedDate(date)
      setStartDate(date)
      setEndDate(date)
      setShowCalendar(false)
    }
  }

  const handleGetRecords = async () => {
    const periodData = {
      category: selectedCategory.name,
      item: selectedItem,
      period: selectedDateRange,
      startDate: startDate ? startDate.toISOString().split('T')[0] : null,
      endDate: endDate ? endDate.toISOString().split('T')[0] : null
    }
    try {
      const res = await axios.get(`/expenses/filtered?category=${periodData.category}&item=${periodData.item}&period=${periodData.period}&startDate=${periodData.startDate}&endDate=${periodData.endDate}`)
      setRecords(res.data)
      setAppliedCategory(selectedCategory)
      setAppliedItem(selectedItem)
      setAppliedDateRange(selectedDateRange)
      setAppliedSelectedDate(selectedDate)
      setAppliedStartDate(startDate)
      setAppliedEndDate(endDate)
    } catch (err) {
      console.error('Error fetching records:', err)
    }
  }

  const getCategoryAggregatedData = () => {
    const categoryTotals = records.reduce((acc, record) => {
      const category = record.category
      const price = record.price
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += price
      return acc
    }, {})
    
    return Object.entries(categoryTotals).map(([category, totalPrice], index) => ({
      id: index + 1,
      category,
      totalPrice
    }))
  }

  const getItemAggregatedData = () => {
    const itemTotals = records.reduce((acc, record) => {
      const item = record.item
      const price = record.price
      if (!acc[item]) {
        acc[item] = 0
      }
      acc[item] += price
      return acc
    }, {})
    
    return Object.entries(itemTotals).map(([item, totalPrice], index) => ({
      id: index + 1,
      item,
      totalPrice
    }))
  }

  const getTotalPrice = () => {
    return records.reduce((acc, record) => acc + record.price, 0)
  }

  const getDatePickerView = () => {
    if (selectedDateRange === 'Month') {
      return { showMonthYearPicker: true, dateFormat: 'MMMM yyyy' }
    } else if (selectedDateRange === 'Year') {
      return { showYearPicker: true, dateFormat: 'yyyy' }
    }
    return { dateFormat: 'dd/MM/yyyy' }
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB')
  }

  const getDisplayDate = () => {
    if (selectedDateRange === 'Date') {
      return formatDate(selectedDate)
    } else if (selectedDateRange === 'Month') {
      return selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    } else if (selectedDateRange === 'Year') {
      return selectedDate.getFullYear().toString()
    } else if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`
    } else if (startDate) {
      return `${formatDate(startDate)} - Select end date`
    }
    return 'Select dates'
  }

  const getAppliedDisplayDate = () => {
    if (appliedDateRange === 'Date') {
      return formatDate(appliedSelectedDate)
    } else if (appliedDateRange === 'Month') {
      return appliedSelectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    } else if (appliedDateRange === 'Year') {
      return appliedSelectedDate.getFullYear().toString()
    } else if (appliedStartDate && appliedEndDate) {
      return `${formatDate(appliedStartDate)} - ${formatDate(appliedEndDate)}`
    }
    return 'Select dates'
  }

  const filterSummary = appliedItem !== 'All Items' 
    ? `${appliedCategory.name} > ${appliedItem} - ${getAppliedDisplayDate()}`
    : `${appliedCategory.name} - ${getAppliedDisplayDate()}`

  return (
    <div className='expensesContainer'>
      {/* Top Header */}
      <div className="topHeader">
        <div className="leftSection">
          <FontAwesomeIcon 
            icon={faArrowLeft} 
            className='backIcon' 
            onClick={handleGoBackToHome}
          />
          <div className="pageTitle">Expenses</div>
        </div>
        
        <div className="centerSection">
          <div className="amountDetails">
            <div className="amountItem">
              <div className="amountLabel">Total Amount</div>
              <div className="amountValue">12,000 INR</div>
            </div>
            <div className="divider"></div>
            <div className="amountItem">
              <div className="amountLabel">This Month</div>
              <div className="amountValue">3,450 INR</div>
            </div>
          </div>
        </div>
        
        <div className="rightSection">
          <button className="exportBtn">
            <FontAwesomeIcon icon={faDownload} className="exportIcon" />
            Export
          </button>
        </div>
      </div>

      <div className="controlsSection">
        <div className="tabsContainer">
          <button 
            className={`tabButton ${activeTab === 'table' ? 'active' : ''}`}
            onClick={() => setActiveTab('table')}
          >
            <FontAwesomeIcon icon={faTable} className='tabIcon'/>
            Table View
          </button>
          <button 
            className={`tabButton ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <FontAwesomeIcon icon={faChartPie} className='tabIcon'/>
            Analytics
          </button>
        </div>
        
        <div className="filtersContainer">          
          <div className="customDropdown">
            <div 
              className="dropdownHeader"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              {selectedCategory.name}
              <FontAwesomeIcon icon={faChevronDown} className="dropdownIcon" />
            </div>
            {showCategoryDropdown && (
              <div className="dropdownMenu">
                {categories.map((category, index) => (
                  <div 
                    key={index} 
                    className="dropdownItem"
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {selectedCategory._id && (
            <div className="customDropdown">
              <div 
                className="dropdownHeader"
                onClick={() => setShowItemDropdown(!showItemDropdown)}
              >
                {selectedItem}
                <FontAwesomeIcon icon={faChevronDown} className="dropdownIcon" />
              </div>
              {showItemDropdown && (
                <div className="dropdownMenu">
                  {items.map((item, index) => (
                    <div 
                      key={index} 
                      className="dropdownItem"
                      onClick={() => handleItemSelect(item)}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className="customDropdown">
            <div 
              className="dropdownHeader"
              onClick={() => setShowDateDropdown(!showDateDropdown)}
            >
              <FontAwesomeIcon icon={faCalendar} className="calendarIcon" />
              {getDisplayDate()}
              <FontAwesomeIcon icon={faChevronDown} className="dropdownIcon" />
            </div>
            {showDateDropdown && (
              <div className="dropdownMenu">
                {dateRanges.map((range, index) => (
                  <div 
                    key={index} 
                    className="dropdownItem"
                    onClick={() => handleDateRangeSelect(range)}
                  >
                    {range}
                  </div>
                ))}
              </div>
            )}
            {showCalendar && (
              <div className="calendarContainer">
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateSelect}
                  maxDate={new Date()}
                  inline
                  {...getDatePickerView()}
                />
              </div>
            )}
          </div>

          <div className="filterGroup getRecordsButton" onClick={handleGetRecords}>
            <div className="filterLabel">Get Records</div>
            <FontAwesomeIcon icon={faFileArrowDown} className="filterIcon" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="contentWrapper">
        {activeTab === 'table' ? (
          <div className="tableWrapper">
            <div className="filterSummary">{filterSummary}</div>
            <table className="expensesTable">
              {appliedCategory.name === 'All Categories' ? (
                <>
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Category</th>
                      <th>Total Price (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length > 0 ? (
                      getCategoryAggregatedData().map((data) => (
                        <tr key={data.id}>
                          <td>{data.id}</td>
                          <td>{data.category}</td>
                          <td>{data.totalPrice}/-</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="noRecords">No records found</td>
                      </tr>
                    )}
                  </tbody>
                </>
              ) : appliedItem === 'All Items' ? (
                <>
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Item</th>
                      <th>Total Price (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length > 0 ? (
                      getItemAggregatedData().map((data) => (
                        <tr key={data.id}>
                          <td>{data.id}</td>
                          <td>{data.item}</td>
                          <td>{data.totalPrice}/-</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="noRecords">No records found</td>
                      </tr>
                    )}
                  </tbody>
                </>
              ) : (
                <>
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Category</th>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Cost</th>
                      <th>Person</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length > 0 ? (
                      records.map((record, index) => (
                        <tr key={record._id}>
                          <td>{index + 1}</td>
                          <td><span className='category'>{record.category}</span></td>
                          <td>{record.item}</td>
                          <td>{record.quantity}</td>
                          <td>{record.price}/-</td>
                          <td>{record.person}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="noRecords">No records found</td>
                      </tr>
                    )}
                  </tbody>
                </>
              )}
            </table>
            {records.length > 0 && (
              <div className="totalAmount">Total: {getTotalPrice()} INR</div>
            )}
          </div>
        ) : (
          <div className="analyticsContainer">
            <div className="chartContainer">
              <h3>Expense Trends</h3>
              <div className="chartPlaceholder">Chart visualization will be displayed here</div>
            </div>
            <div className="categoryBreakdown">
              <h3>Category Breakdown</h3>
              <div className="breakdownList">
                <div className="breakdownItem">
                  <div className="categoryColor" style={{background: '#ff6384'}}></div>
                  <div className="categoryName">Food</div>
                  <div className="categoryAmount">5000 INR</div>
                  <div className="categoryPercentage">42%</div>
                </div>
                <div className="breakdownItem">
                  <div className="categoryColor" style={{background: '#36a2eb'}}></div>
                  <div className="categoryName">Stationary</div>
                  <div className="categoryAmount">3000 INR</div>
                  <div className="categoryPercentage">25%</div>
                </div>
                <div className="breakdownItem">
                  <div className="categoryColor" style={{background: '#4bc0c0'}}></div>
                  <div className="categoryName">Books</div>
                  <div className="categoryAmount">2500 INR</div>
                  <div className="categoryPercentage">21%</div>
                </div>
                <div className="breakdownItem">
                  <div className="categoryColor" style={{background: '#ffcd56'}}></div>
                  <div className="categoryName">Others</div>
                  <div className="categoryAmount">1500 INR</div>
                  <div className="categoryPercentage">12%</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Expenses