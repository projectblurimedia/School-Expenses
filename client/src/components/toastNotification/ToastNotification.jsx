import { useEffect } from 'react'
import './toastNotification.scss'

const ToastNotification = ({ message, type = 'error', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000) 

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`toast-notification ${type}`}>
      <span className="toast-message">{message}</span>
      <div className="toast-close" onClick={onClose}>
        ×
      </div>
    </div>
  )
}

export default ToastNotification