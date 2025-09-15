import './expenses.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faCalendar, faDownload, faChartPie, faChevronDown, faFileArrowDown, faTable } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import axios from 'axios'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

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

  const categoryDropdownRef = useRef(null)
  const itemDropdownRef = useRef(null)
  const dateDropdownRef = useRef(null)
  const calendarRef = useRef(null)

  const dateRanges = ['Date', 'Month', 'Year', 'Custom Range']

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#3fa5ea', '#fcd060', '#4BC0C0', '#9966FF', '#C9CBCF', '#5E4FA2', '#3E9651', '#800000', '#D9E3F0', '#F46D43', '#FDAE61', '#FEE08B', '#E6F598', '#ABDDA4', '#66BD63']

  const capitalize = (str) => {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/categories')
        setCategories([{ name: 'All Categories', _id: null }, ...response.data.map(cat => ({...cat, name: capitalize(cat.name)}))])
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
        const fetchedItems = response.data.map(item => capitalize(item.name))
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false)
      }
      if (itemDropdownRef.current && !itemDropdownRef.current.contains(event.target)) {
        setShowItemDropdown(false)
      }
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target)) {
        setShowDateDropdown(false)
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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
    console.log(periodData)
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
      let category = record.category
      const lowerCategory = category.toLowerCase()
      category = capitalize(category)
      const price = record.price
      if (!acc[lowerCategory]) {
        acc[lowerCategory] = 0
      }
      acc[lowerCategory] += price
      return acc
    }, {})
    
    return Object.entries(categoryTotals).map(([lowerCategory, totalPrice], index) => ({
      id: index + 1,
      category: capitalize(lowerCategory),
      totalPrice
    }))
  }

  const getItemAggregatedData = () => {
    const itemTotals = records.reduce((acc, record) => {
      let item = record.item
      const lowerItem = item.toLowerCase()
      item = capitalize(item)
      const price = record.price
      if (!acc[lowerItem]) {
        acc[lowerItem] = 0
      }
      acc[lowerItem] += price
      return acc
    }, {})
    
    return Object.entries(itemTotals).map(([lowerItem, totalPrice], index) => ({
      id: index + 1,
      item: capitalize(lowerItem),
      totalPrice
    }))
  }

  const getPieData = () => {
    let data
    if (appliedCategory.name === 'All Categories') {
      return getCategoryAggregatedData().map(d => ({ name: d.category, value: d.totalPrice }))
    } else if (appliedItem === 'All Items') {
      return getItemAggregatedData().map(d => ({ name: d.item, value: d.totalPrice }))
    } else {
      const personTotals = records.reduce((acc, record) => {
        let person = record.person || 'Unknown'
        const lowerPerson = person.toLowerCase()
        const price = record.price
        if (!acc[lowerPerson]) {
          acc[lowerPerson] = { name: capitalize(lowerPerson), value: 0 }
        }
        acc[lowerPerson].value += price
        return acc
      }, {})
      return Object.values(personTotals)
    }
    // Filter out 0 value entries
    return data.filter(d => d.value > 0)
  }

  const getTotalPrice = () => {
    return records.reduce((acc, record) => acc + record.price, 0)
  }

  const formatPrice = (price) => {
    return price.toLocaleString('en-IN')
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

  const pieData = getPieData()
  const total = getTotalPrice()

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const radius = outerRadius + 20
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    if (percent < 0.03) return null
    return (
      <text x={x} y={y} fill="#333" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight={500}>
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className='expensesContainer'>
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
          <div className="customDropdown" ref={categoryDropdownRef}>
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
            <div className="customDropdown" ref={itemDropdownRef}>
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
          
          <div className="customDropdown" ref={dateDropdownRef}>
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
              <div className="calendarContainer" ref={calendarRef}>
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
                          <td>{formatPrice(data.totalPrice)}/-</td>
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
                          <td>{formatPrice(data.totalPrice)}/-</td>
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
                          <td><span className='category'>{capitalize(record.category)}</span></td>
                          <td>{capitalize(record.item)}</td>
                          <td>{record.quantity}</td>
                          <td>{formatPrice(record.price)}/-</td>
                          <td>{capitalize(record.person)}</td>
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
              <div className="totalAmount">Total: {formatPrice(getTotalPrice())} INR</div>
            )}
          </div>
        ) : (
          <div className="analyticsWrapper">
            <div className="filterSummary">{filterSummary}</div>
            <div className="analyticsContainer">
              <div className="chartContainer">
                <h3>Expense Trends</h3>
                {records.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={1}
                        label={renderCustomizedLabel}
                        labelLine={true}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => `${formatPrice(value)} INR`} 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '2px solid #dde9f5ff', 
                          borderRadius: '8px',
                          fontFamily: "'Poppins', 'Inter', 'Segoe UI', sans-serif",
                        }}
                        labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                        itemStyle={{ color: '#1d9bf0', fontWeight: 500 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="chartPlaceholder">No data available</div>
                )}
              </div>
              <div className="categoryBreakdown">
                <h3>Category Breakdown</h3>
                <div className="breakdownList">
                  {records.length > 0 ? (
                    pieData.map((entry, index) => (
                      <div className="breakdownItem" key={index}>
                        <div className="categoryColor" style={{background: COLORS[index % COLORS.length]}}></div>
                        <div className="categoryName">{entry.name}</div>
                        <div className="categoryAmount">{formatPrice(entry.value)} INR</div>
                        <div className="categoryPercentage">{((entry.value / total) * 100).toFixed(0)}%</div>
                      </div>
                    ))
                  ) : (
                    <div className="noRecords">No records found</div>
                  )}
                </div>
              </div>
            </div>
            {records.length > 0 && (
              <div className="totalAmount">Total: {formatPrice(total)} INR</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Expenses