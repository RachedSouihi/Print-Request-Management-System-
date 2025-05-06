import { BrowserRouter as Router, Routes, Route } from 'react-router'
import './App.css'
import SignUp from './pages/SignUp/SignUp'
import Home from './pages/Home/Home'
import Loading from './common/Loading'
import PrivateRoute from './PrivateRoute'
import AccountSettings from './pages/Account/Account'
import AuthModal from './common/Modal'
import { useState } from 'react'
import AccessModal from './common/Modal'
import Dashboard from './pages/dashboard/Dashboard'
import Header from './layouts/Header'
import TestimonialCarousel from './components/Testimonials'
import CoursesCarousel from './components/ExamsOverview'
import DocumentsPage from './pages/Documents/Documents'
import Footer from './layouts/Footer'
import SavedDocumentsPage from './pages/SavedDocs/SavedDocs'
import Login from './pages/Login/Login'
import PrintHistory from './pages/history/PrintHistory'
import DocumentOverview from './components/DocumentOverview'
import Analyse from './pages/analyse'
import DocAdmin from './components/docadmin/docadmin'
import ConsumptionPredict from './pages/consompredict/ConsumptionPredict'
import ProfDocs from './pages/profdocs/profdocs'


import ProfRequest from './pages/profrequest/ProfRequest'

function App() {
  return (
    <div className='root-app'>
      <Router>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admindoc" element={<DocAdmin />} />
          <Route path="/costpredict" element={<ConsumptionPredict/>} />
          <Route path="/profdocs" element={<ProfDocs />} />
          

          <Route path="/profrequest" element={<ProfRequest show={false} handleClose={function (): void {
            throw new Error('Function not implemented.')
          } } />} />

          <Route path="/" element={<Home />}>
            <Route path="/account" element={<AccountSettings />} />
            <Route path='/saved-docs' element={<SavedDocumentsPage />}/>
            <Route path='/documents' element={<DocumentsPage />} />
            <Route path='/requests' element={<PrintHistory />} />
            <Route path="/analyse" element={<Analyse />} />
            
           




            <Route index element={
              <>
              <DocumentOverview />
                <CoursesCarousel />
                
                <TestimonialCarousel />

              
              </>
          } />





          </Route>
          <Route
  path="/dashboard/*"
  element={
    <>
      <Dashboard />
    </>
  }
/>







        </Routes>
      </Router>
    </div>
  )
}

export default App
