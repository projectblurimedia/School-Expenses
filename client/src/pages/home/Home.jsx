import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownLeftAndUpRightToCenter, faEye, faPlus } from '@fortawesome/free-solid-svg-icons'
import './home.scss'
import AddExpense from '../../components/addExpense/AddExpense'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Home() {
  const navigate = useNavigate()

  const todayDate = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  const [isAddExpenseVisible, setIsAddExpenseVisible] = useState(false)
  const [records, setRecords] = useState([]) 
  //new
  const [todayTotal, setTodayTotal] = useState(0);
  
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

  /*neww
  useEffect(() => {
    const fetchTodaysExpenses = async () => {
      const today = new Date();
      const todayISO = today.toISOString().split('T')[0]; // yyyy-mm-dd
      try {
        const res = await axios.get(
          `/expenses/filtered?category=All Categories&item=All Items&period=Date&startDate=${todayISO}&endDate=${todayISO}`
        );
        setRecords(res.data);
      } catch (err) {
        console.error("Error fetching today's expenses:", err);
      }
    };
    fetchTodaysExpenses();
  }, []);
  */

  useEffect(() => {
  const fetchTodaysExpenses = async () => {
      const today = new Date();
      const todayISO = today.toISOString().split('T')[0]; // yyyy-mm-dd
      try {
        const res = await axios.get(
          `/expenses/filtered?category=All Categories&item=All Items&period=Date&startDate=${todayISO}&endDate=${todayISO}`
        );
        setRecords(res.data);

        // calculate total here
        const total = res.data.reduce((sum, exp) => sum + exp.price, 0);
        setTodayTotal(total);
      } catch (err) {
        console.error("Error fetching today's expenses:", err);
      }
    };
    fetchTodaysExpenses();
  }, []);

  //new
  useEffect(() => {
    if (records.length > 0) {
      const total = records.reduce(
        (sum, exp) => sum + exp.price, 0);
      setTodayTotal(total);
    } else {
      setTodayTotal(0);
    }
  }, [records]);


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
          <div className="left">
            <div className="title">Today's Expenses</div>
            <div className='total'>
              <FontAwesomeIcon icon={faDownLeftAndUpRightToCenter} className='icon'/>
              <div className='amount'>₹{todayTotal} INR</div>
            </div>
          </div>
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
              {/* {[...Array(15)].map((_, index) => (
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
              ))} */}
               {records.length > 0 ? (
                records.map((expense, index) => (
                  <tr key={expense._id || index}>
                    <td>{index + 1}</td>
                    <td>{expense.category}</td>
                    <td>{expense.item}</td>
                    <td>{expense.quantity}</td>
                    <td>{expense.price}</td>
                    <td>{expense.person}</td>
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

      {/* {isAddExpenseVisible && <AddExpense onClose={onCloseAddExpense} />} */}
      {isAddExpenseVisible && (
      <AddExpense
        onClose={onCloseAddExpense}
          onExpenseAdded={(newExpense) =>
            setRecords((prev) => [newExpense, ...prev]) // instantly update table
          }
      />
    )}

    </div>
  )
}

export default Home