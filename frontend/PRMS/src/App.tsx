
import { BrowserRouter as Router, Routes, Route } from 'react-router'
import './App.css'
import SignUp from './pages/SignUp/SignUp'
import Home from './pages/Home/Home'
import OtpModal from './auth/OTP/OTP'
import { useState } from 'react'

function App() {

  const [showOtpModal, setShowOtpModal] = useState(true);


  return (


    <div className='root-app'>
      <Router>
        <Routes>
          <Route path="/signup" element={<>
            <SignUp />
            <OtpModal show={showOtpModal}
              onClose={() => setShowOtpModal(false)}
              email="user@example.com" />
          </>} />
          <Route path='/' element={<Home />} />
        </Routes>
      </Router>



    </div>
  )
}

export default App
