import './expenses.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faCalendar, faDownload, faEye, faChartPie, faChevronDown, faFileArrowDown, faTable } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Expenses = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('table')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showItemDropdown, setShowItemDropdown] = useState(false)
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedItem, setSelectedItem] = useState('All Items')
  const [selectedDateRange, setSelectedDateRange] = useState('Today')

  const handleGoBackToHome = () => {
    navigate('/')
  }

  const categories = ['All Categories', 'Food', 'Fees', 'Stationary', 'Others']
  const items = ['All Items', 'Notebooks', 'Lunch', 'Textbooks', 'Pens']
  const dateRanges = ['Today', 'This Week', 'This Month', 'This Year', 'Custom Range']

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
  }

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
              {selectedCategory}
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
                    {category}
                  </div>
                ))}
              </div>
            )}
          </div>
          
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
          
          <div className="customDropdown">
            <div 
              className="dropdownHeader"
              onClick={() => setShowDateDropdown(!showDateDropdown)}
            >
              <FontAwesomeIcon icon={faCalendar} className="calendarIcon" />
              {selectedDateRange}
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
          </div>

          <div className="filterGroup getRecordsButton">
            <div className="filterLabel">Get Records</div>
            <FontAwesomeIcon icon={faFileArrowDown} className="filterIcon" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="contentWrapper">
        {activeTab === 'table' ? (
          <div className="tableWrapper">
            <table className="expensesTable">
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
                {[...Array(15)].map((_, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <span className='category'>
                        {index % 3 === 0 ? 'Stationery' : index % 3 === 1 ? 'Food' : 'Books'}
                      </span>
                    </td>
                    <td>{index % 3 === 0 ? 'Notebooks' : index % 3 === 1 ? 'Lunch' : 'Textbooks'}</td>
                    <td>{index % 3 === 0 ? '5' : index % 3 === 1 ? '1' : '3'}</td>
                    <td>{index % 3 === 0 ? '115/-' : index % 3 === 1 ? '80/-' : '450/-'}</td>
                    <td>{index % 2 === 0 ? 'John Doe' : 'Jane Smith'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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