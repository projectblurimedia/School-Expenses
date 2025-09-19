import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar, faChartPie, faChevronDown, faFileArrowDown, faTable, faChartLine, faSpinner } from '@fortawesome/free-solid-svg-icons'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './controlSection.scss'

const ControlSection = ({
  activeTab,
  setActiveTab,
  selectedCategory,
  showCategoryDropdown,
  setShowCategoryDropdown,
  categoryDropdownRef,
  categories,
  handleCategorySelect,
  selectedItem,
  showItemDropdown,
  setShowItemDropdown,
  itemDropdownRef,
  items,
  handleItemSelect,
  selectedDateRange,
  showDateDropdown,
  setShowDateDropdown,
  dateDropdownRef,
  dateRanges,
  handleDateRangeSelect,
  showCalendar,
  selectedDate,
  handleDateSelect,
  calendarRef,
  getDatePickerView,
  getDisplayDate,
  filtersChanged,
  canGetRecords,
  handleGetRecords,
  isFetching,
  compareYear,
  compareRange,
  showYearDropdown,
  setShowYearDropdown,
  showModeDropdown,
  setShowModeDropdown,
  modeDropdownRef,
  compareRanges,
  handleModeSelect,
  yearDropdownRef,
  years,
  handleYearSelect,
  showCompareCalendar,
  setShowCompareCalendar,
  compareCalendarRef,
  compareStartYear,
  compareEndYear,
  handleCompareYearSelect,
  getCompareDisplayYear,
  handleCompare
}) => {
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
          </>
        ) : (
          <>
            <div className="customDropdown" ref={modeDropdownRef}>
              <div 
                className="dropdownHeader"
                onClick={() => setShowModeDropdown(!showModeDropdown)}
              >
                {compareRange}
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

            {compareRange === 'Year' ? (
              <div className="customDropdown" ref={yearDropdownRef}>
                <div 
                  className="dropdownHeader"
                  onClick={() => setShowYearDropdown(!showYearDropdown)}
                >
                  {compareYear}
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
                      selected={compareStartYear ? new Date(compareStartYear, 0, 1) : new Date()}
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
          className={`filterGroup getRecordsButton ${
            filtersChanged() && canGetRecords() ? 'enabled' : ''
          } ${isFetching ? 'fetching' : ''}`} 
          onClick={activeTab === 'compare' ? (filtersChanged() && canGetRecords() ? handleCompare : null) : (filtersChanged() && canGetRecords() ? handleGetRecords : null)}
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

export default ControlSection