import './expenses.scss'
import { useEffect, useState, useRef, useCallback } from 'react'
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
  const [categories, setCategories] = useState([{ name: 'All Categories', _id: null }])
  const [records, setRecords] = useState([])
  const [annualTotal, setAnnualTotal] = useState(0)
  const [monthlyTotal, setMonthlyTotal] = useState(0)
  const [isFetching, setIsFetching] = useState(true)
  const [isFetchingTotals, setIsFetchingTotals] = useState(true)
  const [error, setError] = useState(null)
  const [initialFetches, setInitialFetches] = useState({
    table: false,
    analytics: false,
    compare: false
  })
  const [showScrollToTop, setShowScrollToTop] = useState(false)
  const [compareData, setCompareData] = useState([])

  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef(null);


  // Applied filters (what's currently displayed)
  const [appliedFilters, setAppliedFilters] = useState({
    category: { name: 'All Categories', _id: null },
    item: 'All Items',
    dateRange: 'Date',
    selectedDate: new Date(),
    startDate: new Date(),
    endDate: new Date(),
    compareYear: new Date().getFullYear(),
    compareRange: 'Year',
    compareStartYear: null,
    compareEndYear: null
  })

  // Network status state
  const [networkStatus, setNetworkStatus] = useState({
    online: navigator.onLine,
    showToast: false
  })

  const analyticsRef = useRef(null)
  const compareRef = useRef(null)
  const contentContainerRef = useRef(null)
  const expensesContainerRef = useRef(null)

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#9966FF', '#07ec38', '#800000', '#3fa5ea', '#f9d16b', '#0b9797', '#D9E3F0', '#F46D43', '#E6F598', '#ABDDA4']

  // Network status detection
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus({ online: true, showToast: true })
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

  const capitalize = useCallback((str) => {
    if (!str) return ''
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }, [])

  const scrollToContent = useCallback(() => {
    if (contentContainerRef.current) {
      contentContainerRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  const scrollToTop = useCallback(() => {
    if (expensesContainerRef.current) {
      expensesContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

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
  }, [capitalize])

  // useEffect(() => {
  //   const fetchTotals = async () => {
  //     if (!navigator.onLine) {
  //       setError("You are offline. Cannot fetch totals.")
  //       setIsFetchingTotals(false)
  //       return
  //     }
      
  //     setIsFetchingTotals(true)
  //     const now = new Date()
  //     const annualStart = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
  //     const annualEnd = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0]
  //     try {
  //       const annualRes = await axios.get(`/expenses/filtered?category=All Categories&item=All Items&period=Year&startDate=${annualStart}&endDate=${annualEnd}`)
  //       const annualSum = annualRes.data.reduce((acc, r) => acc + r.price, 0)
  //       setAnnualTotal(annualSum)
  //     } catch (err) {
  //       console.error('Error fetching annual total:', err)
  //       if (err.message === 'Network Error') {
  //         setError("Network error. Please check your connection.")
  //       } else {
  //         setError('Failed to fetch annual total.')
  //       }
  //     }

  //     const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  //     const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  //     try {
  //       const monthRes = await axios.get(`/expenses/filtered?category=All Categories&item=All Items&period=Month&startDate=${monthStart}&endDate=${monthEnd}`)
  //       const monthSum = monthRes.data.reduce((acc, r) => acc + r.price, 0)
  //       setMonthlyTotal(monthSum)
  //     } catch (err) {
  //       console.error('Error fetching monthly total:', err)
  //       if (err.message === 'Network Error') {
  //         setError("Network error. Please check your connection.")
  //       } else {
  //         setError('Failed to fetch monthly total.')
  //       }
  //     } finally {
  //       setIsFetchingTotals(false)
  //     }
  //   }
  //   fetchTotals()
  // }, [])

  useEffect(() => { 
    const fetchTotals = async () => {
      if (!navigator.onLine) {
        setError("You are offline. Cannot fetch totals.");
        setIsFetchingTotals(false);
        return;
      }

      setIsFetchingTotals(true);

      const now = new Date();

      // Function to format date in IST as YYYY-MM-DD
      const toISTDateString = (date) => {
        const istOffset = 5.5 * 60; // IST = UTC +5:30 in minutes
        const localTime = new Date(date.getTime() + istOffset * 60000);
        const year = localTime.getFullYear();
        const month = String(localTime.getMonth() + 1).padStart(2, '0');
        const day = String(localTime.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const annualStart = toISTDateString(new Date(now.getFullYear(), 0, 1));
      const annualEnd = toISTDateString(new Date(now.getFullYear(), 11, 31));

      //console.log("Annual Start:", annualStart, "Annual End:", annualEnd);

      try {
        const annualRes = await axios.get(
          `/expenses/filtered?category=All Categories&item=All Items&period=Year&startDate=${annualStart}&endDate=${annualEnd}`
        );
        const annualSum = annualRes.data.reduce((acc, r) => acc + r.price, 0);
        setAnnualTotal(annualSum);
      } catch (err) {
        console.error('Error fetching annual total:', err);
        if (err.message === 'Network Error') {
          setError("Network error. Please check your connection.");
        } else {
          setError('Failed to fetch annual total.');
        }
      }

      const monthStart = toISTDateString(new Date(now.getFullYear(), now.getMonth(), 1));
      const monthEnd = toISTDateString(new Date(now.getFullYear(), now.getMonth() + 1, 0));

      //console.log("Monthly Start:", monthStart, "Monthly End:", monthEnd);


      try {
        const monthRes = await axios.get(
          `/expenses/filtered?category=All Categories&item=All Items&period=Month&startDate=${monthStart}&endDate=${monthEnd}`
        );
        const monthSum = monthRes.data.reduce((acc, r) => acc + r.price, 0);
        setMonthlyTotal(monthSum);
      } catch (err) {
        console.error('Error fetching monthly total:', err);
        if (err.message === 'Network Error') {
          setError("Network error. Please check your connection.");
        } else {
          setError('Failed to fetch monthly total.');
        }
      } finally {
        setIsFetchingTotals(false);
      }
    };

    fetchTotals();
  }, []);


  useEffect(() => {
    if (!initialFetches.table) {
      handleGetRecords(appliedFilters)
      setInitialFetches(prev => ({ ...prev, table: true }))
    }
  }, [appliedFilters, initialFetches.table])

  useEffect(() => {
    if (activeTab === 'analytics' && !initialFetches.analytics) {
      handleGetRecords(appliedFilters)
      setInitialFetches(prev => ({ ...prev, analytics: true }))
    } else if (activeTab === 'compare' && !initialFetches.compare) {
      handleCompare(appliedFilters)
      setInitialFetches(prev => ({ ...prev, compare: true }))
    }
  }, [activeTab, appliedFilters, initialFetches.analytics, initialFetches.compare])

  const handleGoBackToHome = useCallback(() => {
    navigate('/')
  }, [navigate])

  const handleGetRecords = useCallback(async (filters) => {
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
      category: filters.category.name,
      item: filters.item,
      period: filters.dateRange,
      startDate: filters.startDate ? filters.startDate.toISOString().split('T')[0] : null,
      endDate: filters.endDate ? filters.endDate.toISOString().split('T')[0] : null
      
    }
    try {
      const res = await axios.get(`/expenses/filtered?category=${periodData.category}&item=${periodData.item}&period=${periodData.period}&startDate=${periodData.startDate}&endDate=${periodData.endDate}`)
      setRecords(res.data)
      setAppliedFilters(filters)
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
    }
  }, [activeTab])

  const handleCompare = useCallback(async (filters) => {
    if (!navigator.onLine) {
      setError("You are offline. Cannot fetch comparison data.")
      setIsFetching(false)
      return
    }
    
    setIsFetching(true)
    
    try {
      let data = []
      if (filters.compareRange === 'Year') {
        const res = await axios.get(`/expenses/comparemonths?year=${filters.compareYear}`)
        data = res.data.map(item => ({
          name: new Date(0, item.month - 1).toLocaleString('default', { month: 'short' }),
          total: item.total
        }))
      } else {
        const res = await axios.get(`/expenses/compareyears?startYear=${filters.compareStartYear}&endYear=${filters.compareEndYear}`)
        data = res.data.map(item => ({
          name: item.year.toString(),
          total: item.total
        }))
      }
      setCompareData(data)
      setAppliedFilters(filters)
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
    }
  }, [])

  const handleDownloadScreenshot = useCallback(async (ref) => {
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
  }, [activeTab])

  const getCategoryAggregatedData = useCallback(() => {
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
  }, [records, capitalize])

  const getItemAggregatedData = useCallback(() => {
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
  }, [records, capitalize])

  const getPieData = useCallback(() => {
    let data
    if (appliedFilters.category.name === 'All Categories') {
      return getCategoryAggregatedData().map(d => ({ name: d.category, value: d.totalPrice }))
    } else if (appliedFilters.item === 'All Items') {
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
  }, [appliedFilters.category.name, appliedFilters.item, getCategoryAggregatedData, getItemAggregatedData, records, capitalize])

  const getTotalPrice = useCallback(() => {
    return records.reduce((acc, record) => acc + record.price, 0)
  }, [records])

  const formatPrice = useCallback((price) => {
    return price.toLocaleString('en-IN')
  }, [])

  const formatDate = useCallback((date) => {
    return new Date(date).toLocaleDateString('en-GB')
  }, [])

  const getAppliedDisplayDate = useCallback(() => {
    if (appliedFilters.dateRange === 'Date') {
      return formatDate(appliedFilters.selectedDate)
    } else if (appliedFilters.dateRange === 'Month') {
      return appliedFilters.selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    } else if (appliedFilters.dateRange === 'Year') {
      return appliedFilters.selectedDate.getFullYear().toString()
    } else if (appliedFilters.startDate && appliedFilters.endDate) {
      return `${formatDate(appliedFilters.startDate)} - ${formatDate(appliedFilters.endDate)}`
    }
    return 'Select dates'
  }, [appliedFilters.dateRange, appliedFilters.endDate, appliedFilters.selectedDate, appliedFilters.startDate, formatDate])

  const filterSummary = useCallback(() => {
    return appliedFilters.item !== 'All Items' 
      ? `${appliedFilters.category.name} > ${appliedFilters.item} - ${getAppliedDisplayDate()}`
      : `${appliedFilters.category.name} - ${getAppliedDisplayDate()}`
  }, [appliedFilters.category.name, appliedFilters.item, getAppliedDisplayDate])

  const pieData = getPieData()
  const total = getTotalPrice()

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = useCallback(({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const radius = outerRadius + 20
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    if (percent < 0.03) return null
    return (
      <text x={x} y={y} fill="#333" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight={500}>
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }, [RADIAN])

  const handleExport = useCallback((format = "csv") => {
    if (!records || records.length === 0) {
      setError('No records to export!')
      return
    }

    let fileLabel = ""
    if (appliedFilters.dateRange === "Date") {
      fileLabel = appliedFilters.selectedDate.toLocaleDateString("en-GB")
    } else if (appliedFilters.dateRange === "Month") {
      fileLabel = appliedFilters.selectedDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      })
    } else if (appliedFilters.dateRange === "Year") {
      fileLabel = appliedFilters.selectedDate.getFullYear().toString()
    } else if (appliedFilters.startDate && appliedFilters.endDate) {
      fileLabel = `${appliedFilters.startDate.toLocaleDateString("en-GB")} - ${appliedFilters.endDate.toLocaleDateString("en-GB")}`
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
  }, [records, appliedFilters.dateRange, appliedFilters.selectedDate, appliedFilters.startDate, appliedFilters.endDate])

  return (
    <div className='expensesContainer' ref={expensesContainerRef}>
      {networkStatus.showToast && (
        <ToastNotification
          message={networkStatus.online ? "Connection restored" : "You are offline. Some features may not work."}
          type={networkStatus.online ? "success" : "error"}
          icon={faWifi}
          onClose={() => setNetworkStatus(prev => ({ ...prev, showToast: false }))}
        />
      )}
      
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
        handleExport={handleExport}
        handleDownloadScreenshot={handleDownloadScreenshot}
        analyticsRef={analyticsRef}
        compareRef={compareRef}
        showExportDropdown={showExportDropdown}
        setShowExportDropdown={setShowExportDropdown}
        exportDropdownRef={exportDropdownRef}
        isOnline={networkStatus.online}
      />
      
      <ControlSection
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        categories={categories}
        handleGetRecords={handleGetRecords}
        handleCompare={handleCompare}
        isFetching={isFetching}
        isOnline={networkStatus.online}
        capitalize={capitalize}
      />
      
      <div ref={contentContainerRef} className="expensesContentContainer">
        {activeTab === 'table' && (
          <TableView
            records={records}
            appliedCategory={appliedFilters.category}
            appliedItem={appliedFilters.item}
            filterSummary={filterSummary()}
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
              filterSummary={filterSummary()}
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
              appliedCompareYear={appliedFilters.compareYear}
              appliedCompareRange={appliedFilters.compareRange}
              appliedCompareStartYear={appliedFilters.compareStartYear}
              appliedCompareEndYear={appliedFilters.compareEndYear}
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