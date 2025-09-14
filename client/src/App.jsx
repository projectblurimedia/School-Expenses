import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from './pages/login/Login';
import Home from './pages/home/Home';
import Expenses from './pages/expenses/Expenses';
import axios from "axios";

function App() {
  const axiosBaseUrl = 'http://localhost:8000/server';
  axios.defaults.baseURL = axiosBaseUrl;

  // Function to check if JWT token is valid
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    if (!token || token.trim() === '') return false;
    
    // Optional: Basic JWT expiration check (decode without library for simplicity)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();  // exp is in seconds
    } catch {
      return false;  // Invalid token
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/home"
          element={isAuthenticated() ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/expenses"
          element={isAuthenticated() ? <Expenses /> : <Navigate to="/login" />}
        />
        <Route
          path="/"
          element={isAuthenticated() ? <Navigate to="/home" /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;