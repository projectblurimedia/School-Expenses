import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTags, faIndianRupeeSign } from '@fortawesome/free-solid-svg-icons'
import './categoryCard.scss'

const CategoryCard = ({ data, index, formatPrice }) => {
  return (
    <div className="categoryCardContainer">
      <div className="serialNumber">{index + 1}</div>
      <div className="categoryCard__header">
        <span className="categoryCard__category">
          <FontAwesomeIcon icon={faTags} className="categoryCard__icon--primary" />
          {data.category}
        </span>
        <span className="categoryCard__price">
          <FontAwesomeIcon icon={faIndianRupeeSign} className="categoryCard__icon--price" />
          {formatPrice(data.totalPrice)}
        </span>
      </div>
    </div>
  )
}

export default CategoryCard