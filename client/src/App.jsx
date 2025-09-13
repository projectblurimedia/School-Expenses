import { BrowserRouter, Routes, Route } from "react-router-dom"
import "./App.css"
import Login from './pages/login/Login'
import Home from './pages/home/Home'
import Expenses from './pages/expenses/Expenses'
import axios from "axios"


function App() {
  const axiosBaseUrl = 'http://localhost:8000/server'
  axios.defaults.baseURL = axiosBaseUrl

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/expenses" element={<Expenses/>} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
