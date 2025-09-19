import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHourglassStart } from '@fortawesome/free-solid-svg-icons'
import './tableView.scss'

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
  if (isFetching) {
    return (
      <div className="loadingContainer">
        <FontAwesomeIcon icon={faHourglassStart} className="spinnerIcon" spin />
        <span>Loading...</span>
      </div>
    )
  }

  return (
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
  )
}

export default TableView