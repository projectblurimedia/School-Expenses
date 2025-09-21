import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faHourglassStart, faPlus, faRightFromBracket, faSpinner, faWifi } from '@fortawesome/free-solid-svg-icons'
import './home.scss'
import AddExpense from '../../components/addExpense/AddExpense'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ExpenseCard from '../../components/expenseCard/ExpenseCard'
import ToastNotification from '../../components/toastNotification/ToastNotification'

function Home({ setIsAuth = () => {} }) {
  const navigate = useNavigate()
  const expensesContainerRef = useRef(null)
  const [showScrollToTop, setShowScrollToTop] = useState(false)

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
  const [networkStatus, setNetworkStatus] = useState({
    online: navigator.onLine,
    showToast: false
  })

  // Network status detection
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus({ online: true, showToast: true })
      // Hide the toast after 3 seconds
      setTimeout(() => {
        setNetworkStatus(prev => ({ ...prev, showToast: false }))
      }, 3000)
    }

    const handleOffline = () => {
      setNetworkStatus({ online: false, showToast: true })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      if (expensesContainerRef.current) {
        const { scrollTop } = expensesContainerRef.current
        setShowScrollToTop(scrollTop > 100) // Show button when scrolled more than 100px from top
      }
    }

    const container = expensesContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      // Trigger immediately to set initial state
      handleScroll()
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  const scrollToTop = () => {
    if (expensesContainerRef.current) {
      expensesContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }

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
    if (!navigator.onLine) {
      setError("Cannot add expenses while offline. Please check your connection.")
      return
    }
    
    setIsAddExpenseVisible(true)
    window.history.pushState({ modalOpen: true }, '')
  }

  useEffect(() => {
    const fetchTodaysExpenses = async () => {
      // Don't try to fetch if offline
      if (!navigator.onLine) {
        setError("You are offline. Cannot fetch expenses.")
        setIsLoading(false)
        return
      }
      
      setIsLoading(true)
      const today = new Date()
      const todayISO = today.toISOString().split('T')[0]
      console.log(today)
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
        if (err.message === 'Network Error') {
          setError("Network error. Please check your connection.")
        } else {
          setError("Failed to fetch today's expenses. Please try again later.")
        }
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
      {networkStatus.showToast && (
        <ToastNotification
          message={networkStatus.online ? "Connection restored" : "You are offline. Some features may not work."}
          type={networkStatus.online ? "success" : "error"}
          icon={faWifi}
          onClose={() => setNetworkStatus(prev => ({ ...prev, showToast: false }))}
        />
      )}
      
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

      <div className="todayExpensesContainer" ref={expensesContainerRef}>
        <div className="todayHeading">
          <div className="left">
            <div className="title">Today's Expenses: </div>
            <div className='total'>
              <div className='amount'>₹ {formatIndianNumber(todayTotal)}</div>
              {!navigator.onLine && (
                <div className="offlineIndicator">
                  <FontAwesomeIcon icon={faWifi} />
                  <span>Offline Mode</span>
                </div>
              )}
            </div>
          </div>
          <div className="date">{todayDate}</div>
        </div>

        {isLoading ? (
          <div className="loadingContainer">
            <FontAwesomeIcon icon={faHourglassStart} spin className="spinnerIcon" />
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
        
        {/* Scroll to top button */}
        {showScrollToTop && (
          <button className="scrollToTopButton" onClick={scrollToTop}>
            <FontAwesomeIcon icon={faPlus} rotation={90} />
          </button>
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
          // onExpenseAdded={(newExpense) =>
          //   setRecords((prev) => [{
          //     ...newExpense,
          //     category: capitalizeWords(newExpense.category),
          //     item: capitalizeWords(newExpense.item),
          //     person: capitalizeWords(newExpense.person),
          //     price: newExpense.price
          //   }, ...prev])
          // }

          onExpenseAdded={(newExpense) => {
          // Convert both today's start and end to IST boundaries
          const now = new Date()
          const istOffset = 5.5 * 60 * 60 * 1000 // 5 hours 30 minutes in ms
          const istNow = new Date(now.getTime() + istOffset)

          const year = istNow.getFullYear()
          const month = istNow.getMonth()
          const day = istNow.getDate()

          // Build IST 00:00 → 23:59:59
          const istStart = new Date(year, month, day, 0, 0, 0, 0)
          const istEnd = new Date(year, month, day, 23, 59, 59, 999)

          // Convert IST boundaries back to UTC for comparison
          const startUTC = new Date(istStart.getTime() - istOffset)
          const endUTC = new Date(istEnd.getTime() - istOffset)

          // Parse the expense date
          const expenseDate = new Date(newExpense.date)

          if (expenseDate >= startUTC && expenseDate <= endUTC) {
            setRecords((prev) => [{
              ...newExpense,
              category: capitalizeWords(newExpense.category),
              item: capitalizeWords(newExpense.item),
              person: capitalizeWords(newExpense.person),
              price: newExpense.price,
              totalAmount: newExpense.quantity * newExpense.price
            }, ...prev])
          }
        }}

        />
      )}
    </div>
  )
}

export default Home