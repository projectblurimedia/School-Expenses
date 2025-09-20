import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faReceipt, faIndianRupeeSign, faUser, faCalendar } from '@fortawesome/free-solid-svg-icons'
import './detailedExpenseCard.scss'

const DetailedExpenseCard = ({ record, index, capitalize, formatPrice, formatDate, onClick }) => {
  return (
    <div className="expenseCardContainer" onClick={onClick}>
      <div className="serialNumber">{index + 1}</div>
      <div className="expenseCard__content">
        <div className="expenseCard__qty">
          <FontAwesomeIcon icon={faReceipt} className="expenseCard__icon" />
          {record.quantity}
        </div>
        <div className="expenseCard__price">
          <FontAwesomeIcon icon={faIndianRupeeSign} className="expenseCard__icon--price" />
          {formatPrice(record.price)}
        </div>
        <div className="expenseCard__person">
          <FontAwesomeIcon icon={faUser} className="expenseCard__icon" />
          {capitalize(record.person)}
        </div>
        <div className="expenseCard__date">
          <FontAwesomeIcon icon={faCalendar} className="expenseCard__icon" />
          {record.date ? formatDate(record.date) : ''}
        </div>
      </div>
    </div>
  )
}

export default DetailedExpenseCard