import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faPlus } from '@fortawesome/free-solid-svg-icons'
import './home.scss'
import AddExpense from '../../components/addExpense/AddExpense'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  const todayDate = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  const [isAddExpenseVisible, setIsAddExpenseVisible] = useState(false)
  
  const onCloseAddExpense = () => {
    setIsAddExpenseVisible(false)
    if (window.history.state?.modalOpen) {
      window.history.back()
    }
  }

  const openAddExpense = () => {
    setIsAddExpenseVisible(true)
    window.history.pushState({ modalOpen: true }, '')
  }

  useEffect(() => {
    const handleBackButton = (event) => {
      if (isAddExpenseVisible) {
        event.preventDefault()
        onCloseAddExpense()
      }
    }

    const handlePopState = (event) => {
      if (event.state && event.state.modalOpen) {
        setIsAddExpenseVisible(true)
      } else {
        setIsAddExpenseVisible(false)
      }
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('beforeunload', handleBackButton)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBackButton)
    }
  }, [isAddExpenseVisible])

  const handleNavigateExpenses = () => {
    navigate('/expenses')
  }

  return (
    <div className="homeContainer">
      <div className="headerImageContainer">
        <img
          src="https://static.vecteezy.com/system/resources/previews/011/844/721/non_2x/back-to-school-horizontal-banner-with-colorful-lettering-online-courses-learning-and-tutorials-web-page-template-online-education-concept-free-vector.jpg"
          alt="School Campus"
          className='headerImage'
        />
        <div className="imageOverlay">
          <h1>Expenses Tracking System</h1>
          <p>Sai Rakesh E.M High School</p>
        </div>
      </div>

      <div className="todayExpensesContainer">
        <div className="todayHeading">
          <div className="title">Today's Expenses</div>
          <div className="date">{todayDate}</div>
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
      </div>

      <div className="viewAndCreateButtonsContainer">
        <div className="viewButton" onClick={handleNavigateExpenses}>
          <FontAwesomeIcon icon={faEye} />
          <span>View Reports</span>
        </div>
        <div className="createButton" onClick={openAddExpense}>
          <FontAwesomeIcon icon={faPlus} />
          <span>Add Expense</span>
        </div>
      </div>

      {isAddExpenseVisible && <AddExpense onClose={onCloseAddExpense} />}
    </div>
  )
}

export default Home