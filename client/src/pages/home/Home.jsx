import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faPlus } from '@fortawesome/free-solid-svg-icons'
import "./home.scss"

function Home() {
  const todayDate = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  return (
    <div className="homeContainer">
      <div className="headerImageContainer">
        <img
          src="https://static.vecteezy.com/system/resources/previews/011/844/721/non_2x/back-to-school-horizontal-banner-with-colorful-lettering-online-courses-learning-and-tutorials-web-page-template-online-education-concept-free-vector.jpg"
          alt="Sai Rakesh E.M High School Logo"
          className='headerImage'
        />
      </div>

      <div className="titleContainer">
        <div className="title">Expenses Tracking System</div>
      </div>

      <div className="todayExpensesContainer">
        <div className="todayHeading">
          <div className="title">Today</div>
          <div className="date">{todayDate}</div>
        </div>

        <table className="expensesTable">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Category</th>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Cost</th>
              <th>Person Name</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Stationery</td>
              <td>Notebooks</td>
              <td>5</td>
              <td>115/-</td>
              <td>John Doe</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Food</td>
              <td>Lunch</td>
              <td>1</td>
              <td>80/-</td>
              <td>Jane Smith</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Food</td>
              <td>Lunch</td>
              <td>1</td>
              <td>80/-</td>
              <td>Jane Smith</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Food</td>
              <td>Lunch</td>
              <td>1</td>
              <td>80/-</td>
              <td>Jane Smith</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Food</td>
              <td>Lunch</td>
              <td>1</td>
              <td>80/-</td>
              <td>Jane Smith</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Food</td>
              <td>Lunch</td>
              <td>1</td>
              <td>80/-</td>
              <td>Jane Smith</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Food</td>
              <td>Lunch</td>
              <td>1</td>
              <td>80/-</td>
              <td>Jane Smith</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Food</td>
              <td>Lunch</td>
              <td>1</td>
              <td>80/-</td>
              <td>Jane Smith</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Food</td>
              <td>Lunch</td>
              <td>1</td>
              <td>80/-</td>
              <td>Jane Smith</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Food</td>
              <td>Lunch</td>
              <td>1</td>
              <td>80/-</td>
              <td>Jane Smith</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Food</td>
              <td>Lunch</td>
              <td>1</td>
              <td>80/-</td>
              <td>Jane Smith</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Food</td>
              <td>Lunch</td>
              <td>1</td>
              <td>80/-</td>
              <td>Jane Smith</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Food</td>
              <td>Lunch</td>
              <td>1</td>
              <td>80/-</td>
              <td>Jane Smith</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="viewAndCreateButtonsContainer">
        <div className="viewButton">
          <FontAwesomeIcon icon={faEye} />
        </div>
        <div className="createButton">
          <FontAwesomeIcon icon={faPlus} />
        </div>
      </div>
    </div>
  )
}

export default Home
