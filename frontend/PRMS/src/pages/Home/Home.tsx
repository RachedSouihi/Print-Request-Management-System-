import React, { useEffect, useState } from "react";
import Header from "../../layouts/Header";
import Footer from "../../layouts/Footer";
import Sidebar from "../../components/SideBar/SideBar";
import { Col, Row } from "react-bootstrap";
import { Outlet, useLocation } from "react-router-dom";

import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { fetchDocuments } from '../../store/documentsSlice';
import DocumentsPage from "../Documents/Documents";
import './Home.scss'; // Import the CSS file
import ProfRequest from "../profrequest/ProfRequest";
import SockJS from "sockjs-client";
import { Client, Stomp } from "@stomp/stompjs";

import { HiDocumentAdd } from "react-icons/hi";
import { addNotification } from '../../store/notificationSlice'; // Import the action

const Home: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const location = useLocation();

  // State to manage the visibility of the ProfRequest modal
  const [showProfRequest, setShowProfRequest] = useState(false);

  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  useEffect(() => {
    const username = '9c912fa9-998f-4c02-a6aa-d9397fa21b89';
    const userLevel = "Bac"; // Fetch from user profile
    const userGroup = "1";
    const field = "info";   // Fetch from user profile

    const socket = new SockJS(`http://127.0.0.1:9001/ws?username=${username}`);
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, function (frame: any) {
      console.log('Connected as: ' + username);

      // Subscribe to the user-specific destination
      stompClient.subscribe('/user/queue/notifications', function (notification) {
        const newNotification = JSON.parse(notification.body);
        console.log('Received notification:', newNotification);

        // Dispatch the action to add the notification to the state
        dispatch(addNotification(newNotification));
      });

      stompClient.subscribe(`/topic/notifications/${userLevel}/${field}/${userGroup}`, (message) => {
        const notification = JSON.parse(message.body);
        console.log('New document:', notification);

        // Dispatch the action to add the notification to the state
        dispatch(addNotification(notification));
      });
    });
  }, [dispatch]);

  const isDocumentsRoute = location.pathname === '/documents';

  return (
    <div className="d-flex gap-0 home">
      {!isDocumentsRoute && (
        <Col md={3}>
          <Sidebar />
        </Col>
      )}

      <Col md={isDocumentsRoute ? 12 : 9} className="transition-col">
        <Header />

        <Outlet />

        <div
          style={{
            width: '100%',
            border: '1px solid red',
            position: 'relative',
          }}
        >
          <HiDocumentAdd
            size={100}
            style={{
              position: 'fixed',
              zIndex: 1001,
              bottom: 0,
              right: 0,
              transform: 'translateX(-100%)',
              cursor: 'pointer',
            }}
            onClick={() => setShowProfRequest(true)} // Show the modal on click
          />
        </div>

        {/* ProfRequest Modal */}
        <ProfRequest
          show={showProfRequest}
          handleClose={() => setShowProfRequest(false)} // Close the modal
        />

        <Footer />
      </Col>
    </div>
  );
};

export default Home;
