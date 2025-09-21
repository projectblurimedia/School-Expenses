import { useState, useRef, useCallback, memo, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar, faChartPie, faChevronDown, faFileArrowDown, faTable, faChartLine, faSpinner } from '@fortawesome/free-solid-svg-icons'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './controlSection.scss'
import axios from 'axios'

const ControlSection = ({
  activeTab,
  setActiveTab,
  categories,
  handleGetRecords,
  handleCompare,
  isFetching,
  isOnline,
  capitalize
}) => {
  const [localFilters, setLocalFilters] = useState({
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

  const [items, setItems] = useState(['All Items'])
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showItemDropdown, setShowItemDropdown] = useState(false)
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showYearDropdown, setShowYearDropdown] = useState(false)
  const [showModeDropdown, setShowModeDropdown] = useState(false)
  const [showCompareCalendar, setShowCompareCalendar] = useState(false)

  const dateRanges = ['Date', 'Month', 'Year', 'Custom Range']
  const compareRanges = ['Year', 'Custom Range']
  const years = Array.from({length: 20}, (_, i) => new Date().getFullYear() - i)

  const categoryDropdownRef = useRef(null)
  const itemDropdownRef = useRef(null)
  const dateDropdownRef = useRef(null)
  const calendarRef = useRef(null)
  const yearDropdownRef = useRef(null)
  const modeDropdownRef = useRef(null)
  const compareCalendarRef = useRef(null)

  // Handle click outside for dropdowns
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

  // Fetch items when category changes
  const fetchItemsByCategory = useCallback(async (categoryId) => {
    if (!isOnline) {
      setItems(['All Items'])
      return
    }
    
    try {
      const response = await axios.get(`/items/${categoryId}`)
      const fetchedItems = response.data.map(item => capitalize(item.name))
      setItems(['All Items', ...fetchedItems])
      setLocalFilters(prev => ({ ...prev, item: 'All Items' }))
    } catch (err) {
      console.error('Error fetching items:', err)
      setItems(['All Items'])
      setLocalFilters(prev => ({ ...prev, item: 'All Items' }))
    }
  }, [isOnline, capitalize])

  const handleCategorySelect = useCallback((category) => {
    setLocalFilters(prev => ({ ...prev, category }))
    setShowCategoryDropdown(false)
    if (category._id) {
      fetchItemsByCategory(category._id)
    } else {
      setItems(['All Items'])
      setLocalFilters(prev => ({ ...prev, item: 'All Items' }))
    }
  }, [fetchItemsByCategory])

  const handleItemSelect = useCallback((item) => {
    setLocalFilters(prev => ({ ...prev, item }))
    setShowItemDropdown(false)
  }, [])

  const handleDateRangeSelect = useCallback((range) => {
    setShowDateDropdown(true)
    if (range !== localFilters.dateRange) {
      setLocalFilters(prev => {
        let newStartDate = prev.startDate
        let newEndDate = prev.endDate
        let newSelectedDate = prev.selectedDate
        
        if (range === 'Custom Range') {
          newStartDate = null
          newEndDate = null
          newSelectedDate = null
        } else if (range === 'Date') {
          const today = new Date()
          newSelectedDate = today
          newStartDate = today
          newEndDate = today
        } else if (range === 'Month') {
          const selected = prev.selectedDate || new Date()
          const year = selected.getFullYear()
          const month = selected.getMonth()
          newStartDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
          newEndDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999))
          newSelectedDate = selected
        } else if (range === 'Year') {
          const today = new Date()
          const year = today.getFullYear()
          newStartDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0))
          newEndDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))
          newSelectedDate = today
        }
        
        return { 
          ...prev, 
          dateRange: range, 
          selectedDate: newSelectedDate,
          startDate: newStartDate,
          endDate: newEndDate
        }
      })
    }
    setShowCalendar(true)
  }, [localFilters.dateRange])

  const handleDateSelect = useCallback((date) => {
    setLocalFilters(prev => {
      let newStartDate = prev.startDate
      let newEndDate = prev.endDate
      
      if (prev.dateRange === 'Month') {
        const year = date.getFullYear()
        const month = date.getMonth()
        newStartDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
        newEndDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999))
      } else if (prev.dateRange === 'Year') {
        const year = date.getFullYear()
        newStartDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0))
        newEndDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))
      } else if (prev.dateRange === 'Custom Range') {
        const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0))
        if (!prev.startDate) {
          newStartDate = utcDate
        } else if (!prev.endDate && utcDate >= prev.startDate) {
          newEndDate = utcDate
        } else {
          newStartDate = utcDate
          newEndDate = null
        }
      } else {
        newStartDate = date
        newEndDate = date
      }
      
      return { 
        ...prev, 
        selectedDate: date,
        startDate: newStartDate,
        endDate: newEndDate
      }
    })

    if (localFilters.dateRange !== 'Custom Range' || (localFilters.dateRange === 'Custom Range' && localFilters.startDate && date >= localFilters.startDate)) {
      setShowCalendar(false)
      setShowDateDropdown(false)
    }
  }, [localFilters.dateRange, localFilters.startDate])

  const handleModeSelect = useCallback((mode) => {
    setLocalFilters(prev => {
      if (mode === 'Custom Range') {
        return { 
          ...prev, 
          compareRange: mode,
          compareStartYear: null,
          compareEndYear: null
        }
      } else {
        return { 
          ...prev, 
          compareRange: mode,
          compareYear: new Date().getFullYear()
        }
      }
    })
    setShowModeDropdown(false)
    setShowYearDropdown(false)
    setShowCompareCalendar(false)
  }, [])

  const handleYearSelect = useCallback((year) => {
    setLocalFilters(prev => ({ ...prev, compareYear: year }))
    setShowYearDropdown(false)
  }, [])

  const handleCompareYearSelect = useCallback((date) => {
    const year = date.getFullYear()
    setLocalFilters(prev => {
      if (!prev.compareStartYear) {
        return { ...prev, compareStartYear: year }
      } else if (!prev.compareEndYear && year >= prev.compareStartYear) {
        return { ...prev, compareEndYear: year }
      } else {
        return { ...prev, compareStartYear: year, compareEndYear: null }
      }
    })
  }, [])

  const getDatePickerView = useCallback(() => {
    if (localFilters.dateRange === 'Month') {
      return { showMonthYearPicker: true, dateFormat: 'MMMM yyyy' }
    } else if (localFilters.dateRange === 'Year') {
      return { showYearPicker: true, dateFormat: 'yyyy' }
    }
    return { dateFormat: 'dd/MM/yyyy' }
  }, [localFilters.dateRange])

  const getDisplayDate = useCallback(() => {
    if (localFilters.dateRange === 'Date') {
      return new Date(localFilters.selectedDate).toLocaleDateString('en-GB')
    } else if (localFilters.dateRange === 'Month') {
      return localFilters.selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    } else if (localFilters.dateRange === 'Year') {
      return localFilters.selectedDate.getFullYear().toString()
    } else if (localFilters.startDate && localFilters.endDate) {
      return `${new Date(localFilters.startDate).toLocaleDateString('en-GB')} - ${new Date(localFilters.endDate).toLocaleDateString('en-GB')}`
    } else if (localFilters.startDate) {
      return `${new Date(localFilters.startDate).toLocaleDateString('en-GB')} - Select end date`
    }
    return 'Select dates'
  }, [localFilters.dateRange, localFilters.selectedDate, localFilters.startDate, localFilters.endDate])

  const getCompareDisplayYear = useCallback(() => {
    if (localFilters.compareRange === 'Year') {
      return localFilters.compareYear.toString()
    } else if (localFilters.compareStartYear && localFilters.compareEndYear) {
      return `${localFilters.compareStartYear} - ${localFilters.compareEndYear}`
    } else if (localFilters.compareStartYear) {
      return `${localFilters.compareStartYear} - Select end year`
    }
    return 'Select years'
  }, [localFilters.compareRange, localFilters.compareYear, localFilters.compareStartYear, localFilters.compareEndYear])

  const canGetRecords = useCallback(() => {
    if (activeTab === 'compare') {
      if (localFilters.compareRange === 'Custom Range') {
        return localFilters.compareStartYear !== null && localFilters.compareEndYear !== null && localFilters.compareEndYear >= localFilters.compareStartYear
      }
      return true
    }
    
    if (localFilters.dateRange === 'Custom Range') {
      return localFilters.startDate !== null && localFilters.endDate !== null
    }
    return true
  }, [activeTab, localFilters.compareRange, localFilters.compareStartYear, localFilters.compareEndYear, localFilters.dateRange, localFilters.startDate, localFilters.endDate])

  const handleAction = useCallback(() => {
    if (activeTab === 'compare') {
      handleCompare(localFilters)
    } else {
      handleGetRecords(localFilters)
    }
  }, [activeTab, handleCompare, handleGetRecords, localFilters])

  return (
    <div className="controlsSection">
      <div className="tabsContainer">
        <button 
          className={`tabButton ${activeTab === 'table' ? 'active' : ''}`}
          onClick={() => setActiveTab('table')}
        >
          <FontAwesomeIcon icon={faTable} className='tabIcon'/>
        </button>
        <button 
          className={`tabButton ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <FontAwesomeIcon icon={faChartPie} className='tabIcon'/>
        </button>
        <button 
          className={`tabButton ${activeTab === 'compare' ? 'active' : ''}`}
          onClick={() => setActiveTab('compare')}
        >
          <FontAwesomeIcon icon={faChartLine} className='tabIcon'/>
        </button>
      </div>
      
      <div className="filtersContainer">
        {activeTab !== 'compare' ? (
          <>
            <div className="customDropdown" ref={categoryDropdownRef}>
              <div 
                className="dropdownHeader"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                {localFilters.category.name}
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
            
            {localFilters.category._id && (
              <div className="customDropdown" ref={itemDropdownRef}>
                <div 
                  className="dropdownHeader"
                  onClick={() => setShowItemDropdown(!showItemDropdown)}
                >
                  {localFilters.item}
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
                    selected={localFilters.selectedDate}
                    onChange={handleDateSelect}
                    maxDate={new Date()}
                    inline
                    {...getDatePickerView()}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="customDropdown" ref={modeDropdownRef}>
              <div 
                className="dropdownHeader"
                onClick={() => setShowModeDropdown(!showModeDropdown)}
              >
                {localFilters.compareRange}
                <FontAwesomeIcon icon={faChevronDown} className="dropdownIcon" />
              </div>
              {showModeDropdown && (
                <div className="dropdownMenu">
                  {compareRanges.map((mode, index) => (
                    <div 
                      key={index} 
                      className="dropdownItem"
                      onClick={() => handleModeSelect(mode)}
                    >
                      {mode}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {localFilters.compareRange === 'Year' ? (
              <div className="customDropdown" ref={yearDropdownRef}>
                <div 
                  className="dropdownHeader"
                  onClick={() => setShowYearDropdown(!showYearDropdown)}
                >
                  {localFilters.compareYear}
                  <FontAwesomeIcon icon={faChevronDown} className="dropdownIcon" />
                </div>
                {showYearDropdown && (
                  <div className="dropdownMenu">
                    {years.map((year, index) => (
                      <div 
                        key={index} 
                        className="dropdownItem"
                        onClick={() => handleYearSelect(year)}
                      >
                        {year}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="customDropdown" ref={compareCalendarRef}>
                <div 
                  className="dropdownHeader"
                  onClick={() => setShowCompareCalendar(!showCompareCalendar)}
                >
                  <FontAwesomeIcon icon={faCalendar} className="calendarIcon" />
                  {getCompareDisplayYear()}
                  <FontAwesomeIcon icon={faChevronDown} className="dropdownIcon" />
                </div>
                {showCompareCalendar && (
                  <div className="calendarContainer">
                    <DatePicker
                      selected={localFilters.compareStartYear ? new Date(localFilters.compareStartYear, 0, 1) : new Date()}
                      onChange={handleCompareYearSelect}
                      maxDate={new Date()}
                      inline
                      showYearPicker
                      dateFormat="yyyy"
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div 
          className={`filterGroup getRecordsButton ${canGetRecords() ? 'enabled' : ''} ${isFetching ? 'fetching' : ''}`} 
          onClick={canGetRecords() ? handleAction : null}
        >
          <div className="filterLabel">
            {isFetching ? (
              <FontAwesomeIcon icon={faSpinner} className="spinnerIcon" spin />
            ) : (
              activeTab === 'compare' ? 'Compare' : 'Get Records'
            )}
          </div>
          {!isFetching && (
            <FontAwesomeIcon icon={faFileArrowDown} className="filterIcon" />
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(ControlSection)