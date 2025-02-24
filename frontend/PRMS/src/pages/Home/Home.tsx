import React, { useState, useEffect } from "react";
import Header from "../../layouts/Header";
import Footer from "../../layouts/Footer";
import Sidebar from "../../components/SideBar/SideBar";
import { Col } from "react-bootstrap";
import { PrintRequestModal } from "../../components/PrintRequest/PrintRequest";
import axios from "axios";
import { Outlet } from "react-router";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { fetchDocuments } from '../../store/documentsSlice';

const Home: React.FC = () => {


  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

 
  return (
    <div className="d-flex gap-0">
      <Col md={3}>
        <Sidebar />
      </Col>

      <Col md={9}>
        <Header />

        <Outlet />

  
        <Footer />
      </Col>
    </div>
  );
};

export default Home;
