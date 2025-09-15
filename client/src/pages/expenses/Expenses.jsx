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
  const [annualTotal, setAnnualTotal] = useState(0)
  const [monthlyTotal, setMonthlyTotal] = useState(0)
  const [isFetching, setIsFetching] = useState(false)

  const categoryDropdownRef = useRef(null)
  const itemDropdownRef = useRef(null)
  const dateDropdownRef = useRef(null)
  const calendarRef = useRef(null)

  const dateRanges = ['Date', 'Month', 'Year', 'Custom Range']

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384',  '#9966FF', '#07ec38', '#800000', '#3fa5ea', '#f9d16b', '#0b9797', '#D9E3F0', '#F46D43', '#E6F598', '#ABDDA4']

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

  /*
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
  */

  useEffect(() => {
  const fetchItemsByCategory = async (categoryId) => {
    try {
        const response = await axios.get(`/items/${categoryId}`)
        const fetchedItems = response.data.map(item => capitalize(item.name))
        setItems(['All Items', ...fetchedItems])
        setSelectedItem('All Items')
        setShowItemDropdown(true)
      } catch (err) {
        console.error('Error fetching items:', err)
        setItems(['All Items'])
        setSelectedItem('All Items')
        setShowItemDropdown(true)
      }
    }
    if (selectedCategory._id) {
      fetchItemsByCategory(selectedCategory._id)
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
    const fetchTotals = async () => {
      const now = new Date()
      // Annual
      const annualStart = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
      const annualEnd = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0]
      try {
        const annualRes = await axios.get(`/expenses/filtered?category=All Categories&item=All Items&period=Year&startDate=${annualStart}&endDate=${annualEnd}`)
        const annualSum = annualRes.data.reduce((acc, r) => acc + r.price, 0)
        setAnnualTotal(annualSum)
      } catch (err) {
        console.error('Error fetching annual total:', err)
      }

      // Monthly
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
      try {
        const monthRes = await axios.get(`/expenses/filtered?category=All Categories&item=All Items&period=Month&startDate=${monthStart}&endDate=${monthEnd}`)
        const monthSum = monthRes.data.reduce((acc, r) => acc + r.price, 0)
        setMonthlyTotal(monthSum)
      } catch (err) {
        console.error('Error fetching monthly total:', err)
      }
    }
    fetchTotals()
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

  const filtersChanged = () => {
    return selectedCategory._id !== appliedCategory._id ||
           selectedItem !== appliedItem ||
           selectedDateRange !== appliedDateRange ||
           selectedDate.getTime() !== appliedSelectedDate.getTime() ||
           (startDate ? startDate.getTime() : null) !== (appliedStartDate ? appliedStartDate.getTime() : null) ||
           (endDate ? endDate.getTime() : null) !== (appliedEndDate ? appliedEndDate.getTime() : null)
  }

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
    setShowDateDropdown(true); // Keep date dropdown open after selection
    if (range !== selectedDateRange) {
      setSelectedDateRange(range);
      if (range === 'Custom Range') {
        setStartDate(null);
        setEndDate(null);
        setSelectedDate(null);
        setShowCalendar(true);
      } else {
        if (range === 'Date') {
          const today = new Date();
          setSelectedDate(today);
          setStartDate(today);
          setEndDate(today);
          setShowCalendar(false);
        } else if (range === 'Month') {
          // Use the currently selected date or default to today if none
          const selected = selectedDate || new Date();
          const year = selected.getFullYear();
          const month = selected.getMonth();
          // Set startDate to the 1st of the selected month at midnight UTC
          const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
          // Set endDate to the last day of the selected month at 23:59:59 UTC
          const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
          setStartDate(start);
          setEndDate(end);
          setSelectedDate(selected);
          setShowCalendar(true); // Show calendar to allow month selection
        } else if (range === 'Year') {
          const today = new Date();
          const year = today.getFullYear();
          const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
          const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
          setStartDate(start);
          setEndDate(end);
          setSelectedDate(today);
          setShowCalendar(true); // Open calendar for Year
        }
        setShowCalendar(range === 'Year' || range === 'Month'); // Show calendar for Month and Year
      }
    } else {
      setShowCalendar(true);
    }
  };

  const handleDateSelect = (date) => {
    if (selectedDateRange === 'Month') {
      const year = date.getFullYear();
      const month = date.getMonth();
      // Set startDate to the 1st of the selected month at midnight UTC
      const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
      // Set endDate to the last day of the selected month at 23:59:59 UTC
      const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
      setStartDate(start);
      setEndDate(end);
      setSelectedDate(date);
      setShowCalendar(false);
    } else if (selectedDateRange === 'Year') {
      const year = date.getFullYear();
      const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
      const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
      setStartDate(start);
      setEndDate(end);
      setSelectedDate(date);
      setShowCalendar(false);
    } else if (selectedDateRange === 'Custom Range') {
      // Ensure the date is set to midnight UTC to avoid time zone shifts
      const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
      if (!startDate) {
        setStartDate(utcDate);
      } else if (!endDate && utcDate >= startDate) {
        setEndDate(utcDate);
        setShowCalendar(false);
      } else {
        setStartDate(utcDate);
        setEndDate(null);
      }
      setSelectedDate(date); // Keep selectedDate as the original date for display
    } else {
      setSelectedDate(date);
      setStartDate(date);
      setEndDate(date);
      setShowCalendar(false);
    }
  };

  const handleGetRecords = async () => {
    setIsFetching(true)
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
    } finally {
      setIsFetching(false)
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
    return new Date(date).toLocaleDateString('en-GB')
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

  const canGetRecords = () => {
  if (selectedDateRange === 'Custom Range') {
    return startDate !== null && endDate !== null; // only enable if both picked
  }
  return true; // other ranges work as usual
};


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
              <div className="amountLabel">Annual Amount</div>
              <div className="amountValue">₹ {formatPrice(annualTotal)}</div>
            </div>
            <div className="divider"></div>
            <div className="amountItem">
              <div className="amountLabel">This Month</div>
              <div className="amountValue">₹ {formatPrice(monthlyTotal)}</div>
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

          {/* <div 
            className={`filterGroup getRecordsButton ${filtersChanged() ? 'enabled' : ''} ${isFetching ? 'fetching' : ''}`} 
            onClick={filtersChanged() ? handleGetRecords : null}
          >
            <div className="filterLabel">Get Records</div>
            <FontAwesomeIcon icon={faFileArrowDown} className="filterIcon" />
          </div> */}
          <div 
            className={`filterGroup getRecordsButton ${
              filtersChanged() && canGetRecords() ? 'enabled' : ''
            } ${isFetching ? 'fetching' : ''}`} 
            onClick={filtersChanged() && canGetRecords() ? handleGetRecords : null}
          >
            <div className="filterLabel">Get Records</div>
            <FontAwesomeIcon icon={faFileArrowDown} className="filterIcon" />
          </div>

        </div>
      </div>

      <div className="contentWrapper">
        {activeTab === 'table' ? (
          <div className="tableWrapper">
            <div className={`filterSummaryContainer ${records.length > 0 ? 'has-total' : ''}`}>
              <div className="filterSummary">{filterSummary}</div>
              {records.length > 0 && (
                <div className="totalAmount">Total: {formatPrice(getTotalPrice())} INR</div>
              )}
            </div>
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
                      <th>Date</th>
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
                          <td>{record.date ? formatDate(record.date) : ''}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="noRecords">No records found</td>
                      </tr>
                    )}
                  </tbody>
                </>
              )}
            </table>
          </div>
        ) : (
          <div className="analyticsWrapper">
            <div className={`filterSummaryContainer ${records.length > 0 ? 'has-total' : ''}`}>
              <div className="filterSummary">{filterSummary}</div>
              {records.length > 0 && (
                <div className="totalAmount">Total: {formatPrice(total)} INR</div>
              )}
            </div>
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
          </div>
        )}
      </div>
    </div>
  )
}

export default Expenses