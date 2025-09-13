import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faUser } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

 const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/auth/login', {
        username,
        password,
      });
      localStorage.setItem('token', response.data.token);
      console.log("logged in");
      setError('');
      navigate('/home', { replace: true });  // Add { replace: true }

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="loginContainer">
      <form className="loginForm" onSubmit={handleLogin}>
        <div className="loginTitle">Login</div>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        <div className="formInputs">
          <div className="formInputContainer">
            <input
              type="text"
              className="formInput"
              placeholder=""
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label className="formLabel">Username</label>
            <FontAwesomeIcon icon={faUser} className="formIcon" />
          </div>
          <div className="formInputContainer">
            <input
              type={showPassword ? 'text' : 'password'}
              className="formInput"
              placeholder=""
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label className="formLabel">Password</label>
            <FontAwesomeIcon
              icon={showPassword ? faEye : faEyeSlash}
              className="formIcon passwordIcon"
              onClick={togglePasswordVisibility}
            />
          </div>
        </div>
        <button className="loginBtn" type="submit" disabled={!username || !password}>
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;