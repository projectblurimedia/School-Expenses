import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHourglassStart } from '@fortawesome/free-solid-svg-icons'
import './tableView.scss'
import CategoryCard from '../categoryCard/CategoryCard'
import ItemCard from '../itemCard/ItemCard'
import ExpenseRecord from '../expenseRecord/ExpenseRecord'
import DetailedExpenseCard from '../detailedExpenseCard/DetailedExpenseCard'

const TableView = ({
  records,
  appliedCategory,
  appliedItem,
  filterSummary,
  getTotalPrice,
  formatPrice,
  getCategoryAggregatedData,
  getItemAggregatedData,
  capitalize,
  formatDate,
  isFetching
}) => {
  const [selectedRecord, setSelectedRecord] = useState(null)

  // Handle back navigation to close ExpenseRecord
  useEffect(() => {
    const handlePopState = () => {
      if (selectedRecord) {
        setSelectedRecord(null)
      }
    }

    window.addEventListener('popstate', handlePopState)

    // Push a new history state when ExpenseRecord is opened
    if (selectedRecord) {
      window.history.pushState(null, null, window.location.href)
    }

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [selectedRecord])

  if (isFetching) {
    return (
      <div className="loadingContainer">
        <FontAwesomeIcon icon={faHourglassStart} className="spinnerIcon" spin />
        <span>Loading...</span>
      </div>
    )
  }

  const isDetailedView = appliedCategory.name !== 'All Categories' && appliedItem !== 'All Items'

  return (
    <div className="tableWrapper">
      <div className={`filterSummaryContainer ${records.length > 0 ? 'has-total' : ''}`}>
        <div className="filterSummary">{filterSummary}</div>
        {records.length > 0 && (
          <div className="totalAmount">Total: {formatPrice(getTotalPrice())} INR</div>
        )}
      </div>
      
      <div className="desktopView">
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
                    <tr key={record._id} onClick={() => setSelectedRecord(record)} className="clickableRow">
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

      <div className="mobileView">
        {appliedCategory.name === 'All Categories' ? (
          records.length > 0 ? (
            getCategoryAggregatedData().map((data, index) => (
              <CategoryCard
                key={data.id}
                data={data}
                index={index}
                formatPrice={formatPrice}
              />
            ))
          ) : (
            <div className="noRecords">No records found</div>
          )
        ) : appliedItem === 'All Items' ? (
          records.length > 0 ? (
            getItemAggregatedData().map((data, index) => (
              <ItemCard
                key={data.id}
                data={data}
                index={index}
                formatPrice={formatPrice}
              />
            ))
          ) : (
            <div className="noRecords">No records found</div>
          )
        ) : (
          records.length > 0 ? (
            records.map((record, index) => (
              <DetailedExpenseCard
                key={record._id}
                record={record}
                index={index}
                capitalize={capitalize}
                formatPrice={formatPrice}
                formatDate={formatDate}
                onClick={() => setSelectedRecord(record)}
              />              
            ))
          ) : (
            <div className="noRecords">No records found</div>
          )
        )}
      </div>

      {selectedRecord && (
        <ExpenseRecord
          record={selectedRecord}
          capitalize={capitalize}
          formatPrice={formatPrice}
          formatDate={formatDate}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  )
}

export default TableView