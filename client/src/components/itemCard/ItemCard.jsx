import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBox, faIndianRupeeSign } from '@fortawesome/free-solid-svg-icons'
import './itemCard.scss'

const ItemCard = ({ data, index, formatPrice }) => {
  return (
    <div className="itemCardContainer">
      <div className="serialNumber">{index + 1}</div>
      <div className="itemCard__header">
        <span className="itemCard__category">
          <FontAwesomeIcon icon={faBox} className="itemCard__icon--primary" />
          {data.item}
        </span>
        <span className="itemCard__price">
          <FontAwesomeIcon icon={faIndianRupeeSign} className="itemCard__icon--price" />
          {formatPrice(data.totalPrice)}
        </span>
      </div>
    </div>
  )
}

export default ItemCard