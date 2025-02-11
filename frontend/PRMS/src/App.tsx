
import {BrowserRouter as Router, Routes, Route} from 'react-router'
import './App.css'
import SignUp from './pages/SignUp/SignUp'

function App() {

  return (


   <div>
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>



   </div>
  )
}

export default App
