import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faHourglassStart, faPlus, faRightFromBracket, faSpinner } from '@fortawesome/free-solid-svg-icons'
import './home.scss'
import AddExpense from '../../components/addExpense/AddExpense'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ExpenseCard from '../../components/expenseCard/ExpenseCard'
import ToastNotification from '../../components/toastNotification/ToastNotification'

function Home({ setIsAuth = () => {} }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    try {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setIsAuth(false) 
      navigate("/login", { replace: true })
    } catch (err) {
      console.error("Error during logout:", err)
      setError("Failed to logout. Please try again.")
    }
  }

  const todayDate = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  const [isAddExpenseVisible, setIsAddExpenseVisible] = useState(false)
  const [records, setRecords] = useState([])
  const [todayTotal, setTodayTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const capitalizeWords = (str) => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formatIndianNumber = (num) => {
    const numStr = num.toString()
    let lastThree = numStr.slice(-3)
    const otherNumbers = numStr.slice(0, -3)
    if (otherNumbers !== '') {
      lastThree = ',' + lastThree
    }
    const result = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree
    return `${result}/-`
  }

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
    const fetchTodaysExpenses = async () => {
      setIsLoading(true)
      const today = new Date()
      const todayISO = today.toISOString().split('T')[0]
      try {
        const res = await axios.get(
          `/expenses/filtered?category=All Categories&item=All Items&period=Date&startDate=${todayISO}&endDate=${todayISO}`
        )
        setRecords(res.data)
        const total = res.data.reduce((sum, exp) => sum + exp.price, 0)
        setTodayTotal(total)
        setError(null)
      } catch (err) {
        console.error("Error fetching today's expenses:", err)
        setError("Failed to fetch today's expenses. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchTodaysExpenses()
  }, [])

  useEffect(() => {
    if (records.length > 0) {
      const total = records.reduce(
        (sum, exp) => sum + exp.price, 0)
      setTodayTotal(total)
    } else {
      setTodayTotal(0)
    }
  }, [records])

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
      {error && (
        <ToastNotification
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}
      <div className="logoutButton" onClick={handleLogout}>
        <span>Logout</span>
        <FontAwesomeIcon icon={faRightFromBracket} />
      </div>
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
          <div className="left">
            <div className="title">Today's Expenses - </div>
            <div className='total'>
              <div className='amount'>₹ {formatIndianNumber(todayTotal)}</div>
            </div>
          </div>
          <div className="date">{todayDate}</div>
        </div>

        {isLoading ? (
          <div className="loadingContainer">
            <FontAwesomeIcon icon={faHourglassStart} className="spinnerIcon" />
            <div className="loadingText">Loading...</div>
          </div>
        ) : (
          <>
            <div className="tableWrapper desktopOnly">
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
                  {records.length > 0 ? (
                    records.map((expense, index) => (
                      <tr key={expense._id || index}>
                        <td>{index + 1}</td>
                        <td>{capitalizeWords(expense.category)}</td>
                        <td>{capitalizeWords(expense.item)}</td>
                        <td>{expense.quantity}</td>
                        <td>{formatIndianNumber(expense.price)}</td>
                        <td>{capitalizeWords(expense.person)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center' }}>
                        No expenses recorded today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mobileOnly">
              <div className="cardsScrollWrapper">
                <div className="cardsWrapper">
                  {records.length > 0 ? (
                    records.map((expense, index) => (
                      <ExpenseCard
                        key={expense._id || index}
                        expense={expense}
                        capitalizeWords={capitalizeWords}
                        formatIndianNumber={formatIndianNumber}
                        serialNo={index + 1}
                      />
                    ))
                  ) : (
                    <div className="noRecords">No expenses recorded today.</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
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

      {isAddExpenseVisible && (
        <AddExpense
          onClose={onCloseAddExpense}
          onExpenseAdded={(newExpense) =>
            setRecords((prev) => [{
              ...newExpense,
              category: capitalizeWords(newExpense.category),
              item: capitalizeWords(newExpense.item),
              person: capitalizeWords(newExpense.person),
              price: newExpense.price
            }, ...prev])
          }
        />
      )}
    </div>
  )
}

export default Home