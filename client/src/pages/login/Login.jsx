import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Login.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

const Login = ({ setIsAuth }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const response = await axios.post('/auth/login', {
        username,
        password,
      })
      
      const token = response.data.token
      console.log('Received token:', token)
      
      if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
        throw new Error('Invalid token received from server')
      }
      
      localStorage.setItem('token', token)
      
      const storedToken = localStorage.getItem('token')
      if (storedToken !== token) {
        throw new Error('Failed to store authentication token')
      }
      
      if (setIsAuth) {
        setIsAuth(true)
      }
      
      setError('')
      
      navigate('/', { replace: true })
      
    } catch (err) {
      console.error('Login error:', err)
      
      localStorage.removeItem('token')
      if (setIsAuth) {
        setIsAuth(false)
      }
      
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.message) {
        setError(err.message)
      } else {
        setError('Login failed. Please check your credentials and try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to your account</p>
        
        {error && (
          <div className="error-message">
            <span>⚠️</span> {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <input
              type="text"
              className="form-input"
              placeholder=" "
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-label="Username"
              disabled={isLoading}
            />
            <label className="form-label">Username</label>
            <FontAwesomeIcon icon={faUser} className="form-icon" />
          </div>
          
          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder=" "
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Password"
              disabled={isLoading}
            />
            <label className="form-label">Password</label>
            <FontAwesomeIcon
              icon={showPassword ? faEye : faEyeSlash}
              className="form-icon password-icon"
              onClick={togglePasswordVisibility}
              style={{ cursor: 'pointer' }}
            />
          </div>
          
          <button
            type="submit"
            className="login-button"
            disabled={!username || !password || isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <p className="signup-link">
          Don't have an account?{' '}
          <a href="#" onClick={(e) => e.preventDefault()}>
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}

export default Login