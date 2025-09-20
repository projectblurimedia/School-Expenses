import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTags, faIndianRupeeSign, faBox, faReceipt, faUser } from '@fortawesome/free-solid-svg-icons'
import './expenseCard.scss'

function ExpenseCard({ expense, capitalizeWords, formatIndianNumber, serialNo }) {
  return (
    <div className="expenseCard-glass">
      <div className="expenseCard-glass__serial">{serialNo}</div>
      <div className="expenseCard-glass__header">
        <span className="expenseCard-glass__category">
          <FontAwesomeIcon icon={faTags} className="expenseCard-glass__icon--primary" />
          {capitalizeWords(expense.category)}
        </span>
        <span className="expenseCard-glass__price">
          <FontAwesomeIcon icon={faIndianRupeeSign} className="expenseCard-glass__icon--price" />
          {formatIndianNumber(expense.price)}
        </span>
      </div>
      <div className="expenseCard-glass__content">
        <div className="expenseCard-glass__item smooth-fade">
          <FontAwesomeIcon icon={faBox} className="expenseCard-glass__icon" />
          {capitalizeWords(expense.item)}
        </div>
        <div className="expenseCard-glass__qty">
          <FontAwesomeIcon icon={faReceipt} className="expenseCard-glass__icon" />
          {expense.quantity}
        </div>
        <div className="expenseCard-glass__person">
          <FontAwesomeIcon icon={faUser} className="expenseCard-glass__icon" />
          {capitalizeWords(expense.person)}
        </div>
      </div>
    </div>
  )
}

export default ExpenseCard