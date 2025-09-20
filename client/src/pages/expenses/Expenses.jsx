import './expenses.scss'
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import 'react-datepicker/dist/react-datepicker.css'
import axios from 'axios'
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import html2canvas from 'html2canvas'
import CompareView from '../../components/compareView/CompareView'
import AnalyticsView from '../../components/analyticsView/AnalyticsView'
import TableView from '../../components/tableView/TableView'
import ControlSection from '../../components/controlSection/ControlSection'
import ExpensesHeader from '../../components/expensesHeader/ExpensesHeader'
import ToastNotification from '../../components/toastNotification/ToastNotification'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAnglesUp, faWifi } from '@fortawesome/free-solid-svg-icons'

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
  const [isFetching, setIsFetching] = useState(true)
  const [isFetchingTotals, setIsFetchingTotals] = useState(true)
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const [error, setError] = useState(null)
  const [initialFetches, setInitialFetches] = useState({
    table: false,
    analytics: false,
    compare: false
  })
  const [showScrollToTop, setShowScrollToTop] = useState(false)
  
  const [compareYear, setCompareYear] = useState(new Date().getFullYear())
  const [compareRange, setCompareRange] = useState('Year')
  const [showYearDropdown, setShowYearDropdown] = useState(false)
  const [showModeDropdown, setShowModeDropdown] = useState(false)
  const [showCompareCalendar, setShowCompareCalendar] = useState(false)
  const [compareStartYear, setCompareStartYear] = useState(null)
  const [compareEndYear, setCompareEndYear] = useState(null)
  const [appliedCompareYear, setAppliedCompareYear] = useState(new Date().getFullYear())
  const [appliedCompareRange, setAppliedCompareRange] = useState('Year')
  const [appliedCompareStartYear, setAppliedCompareStartYear] = useState(null)
  const [appliedCompareEndYear, setAppliedCompareEndYear] = useState(null)
  const [compareData, setCompareData] = useState([])

  // Network status state
  const [networkStatus, setNetworkStatus] = useState({
    online: navigator.onLine,
    showToast: false
  })

  const analyticsRef = useRef(null)
  const compareRef = useRef(null)
  const contentContainerRef = useRef(null)
  const expensesContainerRef = useRef(null)

  const categoryDropdownRef = useRef(null)
  const itemDropdownRef = useRef(null)
  const dateDropdownRef = useRef(null)
  const calendarRef = useRef(null)
  const exportDropdownRef = useRef(null)
  const yearDropdownRef = useRef(null)
  const modeDropdownRef = useRef(null)
  const compareCalendarRef = useRef(null)

  const dateRanges = ['Date', 'Month', 'Year', 'Custom Range']
  const compareRanges = ['Year', 'Custom Range']
  const years = Array.from({length: 20}, (_, i) => new Date().getFullYear() - i)

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#9966FF', '#07ec38', '#800000', '#3fa5ea', '#f9d16b', '#0b9797', '#D9E3F0', '#F46D43', '#E6F598', '#ABDDA4']

  // Network status detection
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus({ online: true, showToast: true })
      // Hide the toast after 3 seconds
      setTimeout(() => {
        setNetworkStatus(prev => ({ ...prev, showToast: false }))
      }, 3000)
    }

    const handleOffline = () => {
      setNetworkStatus({ online: false, showToast: true })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const capitalize = (str) => {
    if (!str) return ''
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const scrollToContent = () => {
    if (contentContainerRef.current) {
      contentContainerRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToTop = () => {
    if (expensesContainerRef.current) {
      expensesContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (expensesContainerRef.current) {
        const { scrollTop } = expensesContainerRef.current
        setShowScrollToTop(scrollTop > 100) 
      }
    }

    const container = expensesContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      handleScroll()
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      // Don't try to fetch if offline
      if (!navigator.onLine) {
        setError("You are offline. Cannot fetch categories.")
        return
      }
      
      try {
        const response = await axios.get('/categories')
        setCategories([{ name: 'All Categories', _id: null }, ...response.data.map(cat => ({...cat, name: capitalize(cat.name)}))])
      } catch (err) {
        console.error('Error fetching categories:', err)
        if (err.message === 'Network Error') {
          setError("Network error. Please check your connection.")
        } else {
          setError('Failed to fetch categories. Please try again.')
        }
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchItemsByCategory = async (categoryId) => {
      // Don't try to fetch if offline
      if (!navigator.onLine) {
        setError("You are offline. Cannot fetch items.")
        setItems(['All Items'])
        setSelectedItem('All Items')
        return
      }
      
      try {
        const response = await axios.get(`/items/${categoryId}`)
        const fetchedItems = response.data.map(item => capitalize(item.name))
        setItems(['All Items', ...fetchedItems])
        setSelectedItem('All Items')
      } catch (err) {
        console.error('Error fetching items:', err)
        if (err.message === 'Network Error') {
          setError("Network error. Please check your connection.")
        } else {
          setError('Failed to fetch items. Please try again.')
        }
        setItems(['All Items'])
        setSelectedItem('All Items')
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
    const fetchTotals = async () => {
      // Don't try to fetch if offline
      if (!navigator.onLine) {
        setError("You are offline. Cannot fetch totals.")
        setIsFetchingTotals(false)
        return
      }
      
      setIsFetchingTotals(true)
      const now = new Date()
      const annualStart = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
      const annualEnd = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0]
      try {
        const annualRes = await axios.get(`/expenses/filtered?category=All Categories&item=All Items&period=Year&startDate=${annualStart}&endDate=${annualEnd}`)
        const annualSum = annualRes.data.reduce((acc, r) => acc + r.price, 0)
        setAnnualTotal(annualSum)
      } catch (err) {
        console.error('Error fetching annual total:', err)
        if (err.message === 'Network Error') {
          setError("Network error. Please check your connection.")
        } else {
          setError('Failed to fetch annual total.')
        }
      }

      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
      try {
        const monthRes = await axios.get(`/expenses/filtered?category=All Categories&item=All Items&period=Month&startDate=${monthStart}&endDate=${monthEnd}`)
        const monthSum = monthRes.data.reduce((acc, r) => acc + r.price, 0)
        setMonthlyTotal(monthSum)
      } catch (err) {
        console.error('Error fetching monthly total:', err)
        if (err.message === 'Network Error') {
          setError("Network error. Please check your connection.")
        } else {
          setError('Failed to fetch monthly total.')
        }
      } finally {
        setIsFetchingTotals(false)
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
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false)
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
        setShowYearDropdown(false)
      }
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(event.target)) {
        setShowModeDropdown(false)
      }
      if (compareCalendarRef.current && !compareCalendarRef.current.contains(event.target)) {
        setShowCompareCalendar(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!initialFetches.table) {
      handleGetRecords()
      setInitialFetches(prev => ({ ...prev, table: true }))
      scrollToContent()
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'analytics' && !initialFetches.analytics) {
      handleGetRecords()
      setInitialFetches(prev => ({ ...prev, analytics: true }))
      scrollToContent()
    } else if (activeTab === 'compare' && !initialFetches.compare) {
      handleCompare()
      setInitialFetches(prev => ({ ...prev, compare: true }))
      scrollToContent()
    }
  }, [activeTab])

  const filtersChanged = () => {
    if (activeTab === 'compare') {
      if (compareRange !== appliedCompareRange) return true
      if (compareRange === 'Year') {
        return compareYear !== appliedCompareYear
      } else {
        return compareStartYear !== appliedCompareStartYear || compareEndYear !== appliedCompareEndYear
      }
    }
    
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
    setShowDateDropdown(true)
    if (range !== selectedDateRange) {
      setSelectedDateRange(range)
      if (range === 'Custom Range') {
        setStartDate(null)
        setEndDate(null)
        setSelectedDate(null)
        setShowCalendar(true)
      } else if (range === 'Date') {
        const today = new Date()
        setSelectedDate(today)
        setStartDate(today)
        setEndDate(today)
        setShowCalendar(true)
      } else if (range === 'Month') {
        const selected = selectedDate || new Date()
        const year = selected.getFullYear()
        const month = selected.getMonth()
        const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
        const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999))
        setStartDate(start)
        setEndDate(end)
        setSelectedDate(selected)
        setShowCalendar(true)
      } else if (range === 'Year') {
        const today = new Date()
        const year = today.getFullYear()
        const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0))
        const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))
        setStartDate(start)
        setEndDate(end)
        setSelectedDate(today)
        setShowCalendar(true)
      }
    } else {
      setShowCalendar(true)
    }
  }

  const handleDateSelect = (date) => {
    if (selectedDateRange === 'Month') {
      const year = date.getFullYear()
      const month = date.getMonth()
      const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
      const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999))
      setStartDate(start)
      setEndDate(end)
      setSelectedDate(date)
      setShowCalendar(false)
      setShowDateDropdown(false)
    } else if (selectedDateRange === 'Year') {
      const year = date.getFullYear()
      const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0))
      const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))
      setStartDate(start)
      setEndDate(end)
      setSelectedDate(date)
      setShowCalendar(false)
      setShowDateDropdown(false)
    } else if (selectedDateRange === 'Custom Range') {
      const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0))
      if (!startDate) {
        setStartDate(utcDate)
      } else if (!endDate && utcDate >= startDate) {
        setEndDate(utcDate)
        setShowCalendar(false)
        setShowDateDropdown(false)
      } else {
        setStartDate(utcDate)
        setEndDate(null)
      }
      setSelectedDate(date)
    } else {
      setSelectedDate(date)
      setStartDate(date)
      setEndDate(date)
      setShowCalendar(false)
      setShowDateDropdown(false)
    }
  }

  const handleGetRecords = async () => {
    // Don't try to fetch if offline
    if (!navigator.onLine) {
      setError("You are offline. Cannot fetch records.")
      setIsFetching(false)
      return
    }
    
    setIsFetching(true)
    
    if (activeTab === 'compare') {
      setIsFetching(false)
      return
    }
    
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
      if (err.message === 'Network Error') {
        setError("Network error. Please check your connection.")
      } else {
        setError('Failed to fetch records. Please try again.')
      }
      setRecords([])
    } finally {
      setIsFetching(false)
      setTimeout(scrollToContent, 100)
    }
  }

  const handleCompare = async () => {
    // Don't try to fetch if offline
    if (!navigator.onLine) {
      setError("You are offline. Cannot fetch comparison data.")
      setIsFetching(false)
      return
    }
    
    setIsFetching(true)
    
    try {
      let data = []
      if (compareRange === 'Year') {
        const res = await axios.get(`/expenses/comparemonths?year=${compareYear}`)
        data = res.data.map(item => ({
          name: new Date(0, item.month - 1).toLocaleString('default', { month: 'short' }),
          total: item.total
        }))
        setAppliedCompareYear(compareYear)
        setAppliedCompareStartYear(null)
        setAppliedCompareEndYear(null)
      } else {
        const res = await axios.get(`/expenses/compareyears?startYear=${compareStartYear}&endYear=${compareEndYear}`)
        data = res.data.map(item => ({
          name: item.year.toString(),
          total: item.total
        }))
        setAppliedCompareStartYear(compareStartYear)
        setAppliedCompareEndYear(compareEndYear)
        setAppliedCompareYear(null)
      }
      setCompareData(data)
      setAppliedCompareRange(compareRange)
    } catch (err) {
      console.error('Error fetching compare data:', err)
      if (err.message === 'Network Error') {
        setError("Network error. Please check your connection.")
      } else {
        setError('Failed to fetch compare data. Please try again.')
      }
      setCompareData([])
    } finally {
      setIsFetching(false)
      setTimeout(scrollToContent, 100)
    }
  }

  const handleDownloadScreenshot = async (ref) => {
    if (!ref.current) return
    try {
      const canvas = await html2canvas(ref.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })
      const link = document.createElement('a')
      link.download = `${activeTab}View.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Error downloading screenshot:', err)
      setError('Failed to download screenshot. Please try again.')
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
    return data ? data.filter(d => d.value > 0) : []
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
    if (activeTab === 'compare') {
      if (compareRange === 'Custom Range') {
        return compareStartYear !== null && compareEndYear !== null && compareEndYear >= compareStartYear
      }
      return true
    }
    
    if (selectedDateRange === 'Custom Range') {
      return startDate !== null && endDate !== null
    }
    return true
  }

  const handleExport = (format = "csv") => {
    if (!records || records.length === 0) {
      setError('No records to export!')
      return
    }

    let fileLabel = ""
    if (appliedDateRange === "Date") {
      fileLabel = appliedSelectedDate.toLocaleDateString("en-GB")
    } else if (appliedDateRange === "Month") {
      fileLabel = appliedSelectedDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      })
    } else if (appliedDateRange === "Year") {
      fileLabel = appliedSelectedDate.getFullYear().toString()
    } else if (appliedStartDate && appliedEndDate) {
      fileLabel = `${appliedStartDate.toLocaleDateString("en-GB")} - ${appliedEndDate.toLocaleDateString("en-GB")}`
    } else {
      fileLabel = "data"
    }

    const fileName = `Expenses_${fileLabel}.${format}`

    const exportData = records.map((r, index) => ({
      SNo: index + 1,
      Category: r.category,
      Item: r.item,
      Quantity: r.quantity,
      Price: r.price,
      Person: r.person,
      Date: r.date ? new Date(r.date).toLocaleDateString("en-GB") : "",
    }))

    if (format === "csv") {
      const headers = Object.keys(exportData[0]).join(",")
      const rows = exportData.map((row) =>
        Object.values(row)
          .map((val) => `"${val}"`)
          .join(",")
      )
      const csvContent = [headers, ...rows].join("\n")
      const blob = new Blob([csvContent], { type: "text/csvcharset=utf-8" })
      saveAs(blob, fileName)
    } else {
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Expenses")
      XLSX.writeFile(wb, fileName)
    }
  }

  const handleYearSelect = (year) => {
    setCompareYear(year)
    setShowYearDropdown(false)
  }

  const handleModeSelect = (mode) => {
    setCompareRange(mode)
    setShowModeDropdown(false)
    setShowYearDropdown(false)
    setShowCompareCalendar(false)
    if (mode === 'Custom Range') {
      setCompareStartYear(null)
      setCompareEndYear(null)
    } else {
      setCompareYear(new Date().getFullYear())
    }
  }

  const handleCompareYearSelect = (date) => {
    const year = date.getFullYear()
    if (!compareStartYear) {
      setCompareStartYear(year)
    } else if (!compareEndYear && year >= compareStartYear) {
      setCompareEndYear(year)
      setShowCompareCalendar(false)
    } else {
      setCompareStartYear(year)
      setCompareEndYear(null)
    }
  }

  const getCompareDisplayYear = () => {
    if (compareRange === 'Year') {
      return compareYear.toString()
    } else if (compareStartYear && compareEndYear) {
      return `${compareStartYear} - ${compareEndYear}`
    } else if (compareStartYear) {
      return `${compareStartYear} - Select end year`
    }
    return 'Select years'
  }

  return (
    <div className='expensesContainer' ref={expensesContainerRef}>
      {/* Network status toast */}
      {networkStatus.showToast && (
        <ToastNotification
          message={networkStatus.online ? "Connection restored" : "You are offline. Some features may not work."}
          type={networkStatus.online ? "success" : "error"}
          icon={faWifi}
          onClose={() => setNetworkStatus(prev => ({ ...prev, showToast: false }))}
        />
      )}
      
      {/* Error toast */}
      {error && (
        <ToastNotification
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}
      
      <ExpensesHeader 
        activeTab={activeTab}
        annualTotal={annualTotal}
        monthlyTotal={monthlyTotal}
        isFetchingTotals={isFetchingTotals}
        formatPrice={formatPrice}
        handleGoBackToHome={handleGoBackToHome}
        showExportDropdown={showExportDropdown}
        setShowExportDropdown={setShowExportDropdown}
        exportDropdownRef={exportDropdownRef}
        handleExport={handleExport}
        handleDownloadScreenshot={handleDownloadScreenshot}
        analyticsRef={analyticsRef}
        compareRef={compareRef}
        isOnline={networkStatus.online}
      />
      
      <ControlSection
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        showCategoryDropdown={showCategoryDropdown}
        setShowCategoryDropdown={setShowCategoryDropdown}
        categoryDropdownRef={categoryDropdownRef}
        categories={categories}
        handleCategorySelect={handleCategorySelect}
        selectedItem={selectedItem}
        showItemDropdown={showItemDropdown}
        setShowItemDropdown={setShowItemDropdown}
        itemDropdownRef={itemDropdownRef}
        items={items}
        handleItemSelect={handleItemSelect}
        selectedDateRange={selectedDateRange}
        showDateDropdown={showDateDropdown}
        setShowDateDropdown={setShowDateDropdown}
        dateDropdownRef={dateDropdownRef}
        dateRanges={dateRanges}
        handleDateRangeSelect={handleDateRangeSelect}
        showCalendar={showCalendar}
        selectedDate={selectedDate}
        handleDateSelect={handleDateSelect}
        calendarRef={calendarRef}
        getDatePickerView={getDatePickerView}
        getDisplayDate={getDisplayDate}
        filtersChanged={filtersChanged}
        canGetRecords={canGetRecords}
        handleGetRecords={handleGetRecords}
        isFetching={isFetching}
        compareYear={compareYear}
        compareRange={compareRange}
        showYearDropdown={showYearDropdown}
        setShowYearDropdown={setShowYearDropdown}
        showModeDropdown={showModeDropdown}
        setShowModeDropdown={setShowModeDropdown}
        modeDropdownRef={modeDropdownRef}
        compareRanges={compareRanges}
        handleModeSelect={handleModeSelect}
        yearDropdownRef={yearDropdownRef}
        years={years}
        handleYearSelect={handleYearSelect}
        showCompareCalendar={showCompareCalendar}
        setShowCompareCalendar={setShowCompareCalendar}
        compareCalendarRef={compareCalendarRef}
        compareStartYear={compareStartYear}
        compareEndYear={compareEndYear}
        handleCompareYearSelect={handleCompareYearSelect}
        getCompareDisplayYear={getCompareDisplayYear}
        handleCompare={handleCompare}
        isOnline={networkStatus.online}
      />
      
      <div ref={contentContainerRef} className="expensesContentContainer">
        {activeTab === 'table' && (
          <TableView
            records={records}
            appliedCategory={appliedCategory}
            appliedItem={appliedItem}
            filterSummary={filterSummary}
            getTotalPrice={getTotalPrice}
            formatPrice={formatPrice}
            getCategoryAggregatedData={getCategoryAggregatedData}
            getItemAggregatedData={getItemAggregatedData}
            capitalize={capitalize}
            formatDate={formatDate}
            isFetching={isFetching}
            isOnline={networkStatus.online}
          />
        )}
        {activeTab === 'analytics' && (
          <div ref={analyticsRef} className='contentWrapper'>
            <AnalyticsView
              records={records}
              filterSummary={filterSummary}
              pieData={pieData}
              total={total}
              formatPrice={formatPrice}
              COLORS={COLORS}
              renderCustomizedLabel={renderCustomizedLabel}
              isFetching={isFetching}
              isOnline={networkStatus.online}
            />
          </div>
        )}
        {activeTab === 'compare' && (
          <div ref={compareRef} className='contentWrapper'>
            <CompareView 
              appliedCompareYear={appliedCompareYear}
              appliedCompareRange={appliedCompareRange}
              appliedCompareStartYear={appliedCompareStartYear}
              appliedCompareEndYear={appliedCompareEndYear}
              compareData={compareData}
              formatPrice={formatPrice}
              isFetching={isFetching}
              isOnline={networkStatus.online}
            />
          </div>
        )}
      </div>

      {showScrollToTop && (
        <div className="scrollToTopButton" onClick={scrollToTop} title="Scroll to Top">
          <FontAwesomeIcon icon={faAnglesUp} />
        </div>
      )}
    </div>
  )
}

export default Expenses