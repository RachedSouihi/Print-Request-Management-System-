import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import "bootstrap/dist/css/bootstrap.min.css";
import ProtectedRoute from "./pages/Login/protectedroute";
import Signup from "./pages/SignUp/SignUp";
import Documents from "./pages/Documents/Documents";
import Dashboard from "./pages/dashboard/Dashboard";
import PrintHistory from "./pages/history/PrintHistory";
import ProfRequest from "./pages/profrequest/ProfRequest";
const App = () => {
  return (
    
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />}/>
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
         <Route path="/documents" element={<Documents/>}/>
         <Route path="/dashboard" element={<Dashboard/>}/>
         <Route path="/history" element={<PrintHistory/>}/>
         <Route
          path="/prof"
          element={<ProfRequest show={true} handleClose={() => console.log("Modal fermé")} />}
        />
      </Routes>
    
  );
};

export default App;