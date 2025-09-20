import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTags, faBox, faIndianRupeeSign, faReceipt, faUser, faCalendar, faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons'
import './expenseRecord.scss'

const ExpenseRecord = ({ record, capitalize, formatPrice, formatDate, onClose }) => {
  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent" onClick={e => e.stopPropagation()}>
        <button className="closeButton" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <h2>Expense Details</h2>
        <div className="detailItem">
          <FontAwesomeIcon icon={faTags} className="detailIcon" />
          <span>Category: <p>{capitalize(record.category)}</p></span>
        </div>
        <div className="detailItem">
          <FontAwesomeIcon icon={faBox} className="detailIcon" />
          <span>Item: <p>{capitalize(record.item)}</p></span>
        </div>
        <div className="detailItem">
          <FontAwesomeIcon icon={faReceipt} className="detailIcon" />
          <span>Quantity: <p>{record.quantity || 0}</p></span>
        </div>
        <div className="detailItem">
          <FontAwesomeIcon icon={faIndianRupeeSign} className="detailIcon" />
          <span>Cost: <p>{formatPrice(record.price)}</p></span>
        </div>
        <div className="detailItem">
          <FontAwesomeIcon icon={faUser} className="detailIcon" />
          <span>Person: <p>{capitalize(record.person)}</p></span>
        </div>
        <div className="detailItem">
          <FontAwesomeIcon icon={faCalendar} className="detailIcon" />
          <span>Date: <p>{record.date ? formatDate(record.date) : ''}</p></span>
        </div>
        <div className="detailItem">
          <FontAwesomeIcon icon={faInfoCircle} className="detailIcon" />
          <span>Description: <p>{record.description || 'No description available'}</p></span>
        </div>
      </div>
    </div>
  )
}

export default ExpenseRecord