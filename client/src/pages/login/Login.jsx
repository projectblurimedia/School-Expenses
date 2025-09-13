import './login.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEyeSlash, faUser } from '@fortawesome/free-solid-svg-icons'

const Login = () => {
  return (
    <div className='loginContainer'>
      <form className="loginForm">
        <div className="loginTitle">Login</div>
        <div className="formInputs">
          <div className="formInputContainer">
            <input type="text" className="formInput" placeholder='' required/>
            <label className="formLabel">Username</label>
            <FontAwesomeIcon icon={faUser} className='formIcon' />
          </div>
          <div className="formInputContainer">
            <input type= 'password' className= "formInput" placeholder= '' required />
            <label className="formLabel">Password</label>
            <FontAwesomeIcon icon={faEyeSlash} className='formIcon passwordIcon' />
          </div>
        </div>
        <button className="loginBtn" type='submit'>Login</button>
       
      </form>
    </div>
  )
}

export default Login