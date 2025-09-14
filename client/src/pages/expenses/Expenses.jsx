import './expenses.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faCalendar, faDownload, faEye, faChartPie } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'

const Expenses = () => {
  const [activeTab, setActiveTab] = useState('table')

  return (
    <div className='expensesContainer'>
      <div className="expensesHeader">
        <div className="titleContainer">
          <FontAwesomeIcon icon={faArrowLeft} className='icon'/>
          <div className="name">Expenses</div>
        </div>
        
        <div className="filters">
          <div className="categoryFilter">
            <select className="categorySelect">
              <option value="all">All Categories</option>
              <option value="food">Food</option>
              <option value="fees">Fees</option>
              <option value="stationary">Stationary</option>
              <option value="others">Others</option>
            </select>
          </div>

          <div className="itemFilter">
            <select className="itemSelect">
              <option value="all">All Items</option>
              <option value="notebooks">Notebooks</option>
              <option value="lunch">Lunch</option>
              <option value="textbooks">Textbooks</option>
            </select>
          </div>

          <div className="dateRange">
            <FontAwesomeIcon icon={faCalendar} className="calendarIcon" />
            <input type="date" className="dateInput" />
            <span className="dateSeparator">to</span>
            <input type="date" className="dateInput" />
          </div>
        </div>

        <div className="tabContainer">
          <button 
            className={`tabButton ${activeTab === 'table' ? 'active' : ''}`}
            onClick={() => setActiveTab('table')}
          >
            Table
          </button>
          <button 
            className={`tabButton ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <FontAwesomeIcon icon={faChartPie} className='tabIcon'/>
            Analytics
          </button>
        </div>
      </div>

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

      <div className="footerTab">
        <button className="viewDetails">
          Amount Details
          <FontAwesomeIcon icon={faEye} className="icon" />
        </button>
        
        <button className="exportBtn">
          Export
          <FontAwesomeIcon icon={faDownload} className="exportIcon" />
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