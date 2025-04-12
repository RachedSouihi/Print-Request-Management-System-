import React, { useEffect } from "react";
import Header from "../../layouts/Header";
import Footer from "../../layouts/Footer";
import Sidebar from "../../components/SideBar/SideBar";
import { Col, Row } from "react-bootstrap";
import { Outlet, useLocation } from "react-router";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { fetchDocuments } from '../../store/documentsSlice';
import DocumentsPage from "../Documents/Documents";
import './Home.scss'; // Import the CSS file
import ProfRequest from "../profrequest/ProfRequest";
import SockJS from "sockjs-client";
import { Client, Stomp } from "@stomp/stompjs";

import { HiDocumentAdd } from "react-icons/hi";



const Home: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);


  useEffect(() => {
    const username = ' chaima';

    var socket = new SockJS(`http://127.0.0.1:8089/ws?username=${username}`);
      var stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame: any) {
      console.log('Connected as: ' + username);

      // Subscribe to the user-specific destination
      stompClient.subscribe('/user/queue/notifications', function (notification) {
        //var message = JSON.parse(notification.body);
        console.log('Received notification:', notification.body);
      });
    });

  })


  const isDocumentsRoute = location.pathname === '/documents';

  return (
    <div className="d-flex gap-0 home">
      {!isDocumentsRoute && (
        <Col md={3}>
          <Sidebar />
        </Col>
      )}

      <Col md={isDocumentsRoute ? 12 : 9}className="transition-col" >
        <Header />


    
          <Outlet />

          <div style={{
            width: '100%',
            border: '1px solid red',
            position: 'relative'

          }}>

          <HiDocumentAdd   size={100} style={{
                position: 'fixed',
                zIndex: 1001,
                bottom: 0,
                right: 0,

                transform: 'translateX(-100%)',

                  
                  
                }} />

                </div>

        <Footer />
      </Col>
    </div>
  );
};

export default Home;
