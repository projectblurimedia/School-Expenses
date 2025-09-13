// Expenses.jsx
import React from 'react'
import './expenses.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faSearch, faCalendar, faDownload, faEye } from '@fortawesome/free-solid-svg-icons'

const Expenses = () => {
  return (
    <div className='expensesContainer'>

      {/* Header */}
      <div className="expensesHeader">
        <div className="left">
          <FontAwesomeIcon icon={faArrowLeft} className='icon'/>
          <div className="name">Expenses</div>
        </div>
        <div className="middle">
            <input type="text" className="searchBar" placeholder='Search Expenses...' />
            <span className="searchIcon">
                <FontAwesomeIcon icon={faSearch} />
            </span>
        </div>
        <div className="right">
          <button className="analyticsBtn">Analytics</button>
        </div>
      </div>

      {/* Filters & Export */}
      <div className="filtersAndExports">
        <div className="filters">
          
          {/* Category Filter */}
          <div className="categoryFilter">
            <select className="categorySelect">
              <option value="all">All Categories</option>
              <option value="food">Food</option>
              <option value="fees">Fees</option>
              <option value="stationary">Stationary</option>
              <option value="others">Others</option>
            </select>
          </div>

          {/* Time Period Selector */}
          <div className="timePeriodSelector">
            <select className="periodSelect">
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          {/* Date Range (visible when custom is selected) */}
          <div className="dateRange">
            <FontAwesomeIcon icon={faCalendar} className="calendarIcon" />
            <input type="date" className="dateInput" />
            <span className="dateSeparator">to</span>
            <input type="date" className="dateInput" />
          </div>
        </div>
        <div className="exports">
          <button className="exportBtn">
            Export
            <FontAwesomeIcon icon={faDownload} className="exportIcon" />
          </button>
        </div>
      </div>

      {/* Table Section */}
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

      {/* Footer Section */}
      <div className="footerTab">
        <button className="viewDetails">
            Amount Details
            <FontAwesomeIcon icon={faEye} className="icon" />
        </button>
        <div className="totalAmount">
          <div className="total">Total Amount:</div>
          <div className="amount">12000 INR</div>
        </div>
      </div>
    </div>
  )
}

export default Expenses