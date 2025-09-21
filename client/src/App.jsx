import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Login from './pages/login/Login'
import Home from './pages/home/Home'
import Expenses from './pages/expenses/Expenses'

function App() {
  const [isAuth, setIsAuth] = useState(false)
  const [loading, setLoading] = useState(true)

  const axiosBaseUrl = 'https://school-expenses-backend.onrender.com/server'
  axios.defaults.baseURL = axiosBaseUrl

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          setIsAuth(false)
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )

    return () => {
      axios.interceptors.request.eject(requestInterceptor)
      axios.interceptors.response.eject(responseInterceptor)
    }
  }, [])

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      
      if (!token || token.trim() === '') {
        setIsAuth(false)
        setLoading(false)
        return
      }
      
      try {
        const parts = token.split('.')
        
        if (parts.length !== 3) {
          localStorage.removeItem('token')
          setIsAuth(false)
          setLoading(false)
          return
        }
        
        const payload = JSON.parse(atob(parts[1]))
        
        const isValid = payload.exp * 1000 > Date.now() - 60000
        
        setIsAuth(isValid)
        
        if (!isValid) {
          localStorage.removeItem('token')
        }
      } catch (error) {
        console.error('Token validation error:', error)
        localStorage.removeItem('token')
        setIsAuth(false)
      }
      setLoading(false)
    }

    checkAuth()
    
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        checkAuth()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        fontFamily: 'Poppins'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={isAuth ? <Navigate to="/" replace /> : <Login setIsAuth={setIsAuth} />} 
        />
        <Route
          path="/"
          element={isAuth ? <Home setIsAuth={setIsAuth} /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/expenses"
          element={isAuth ? <Expenses /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App