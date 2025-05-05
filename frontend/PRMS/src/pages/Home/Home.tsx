import React, { useEffect, useState } from "react";
import Header from "../../layouts/Header";
import Footer from "../../layouts/Footer";
import Sidebar from "../../components/SideBar/SideBar";
import { Col, Row } from "react-bootstrap";
import { Outlet, useLocation } from "react-router-dom";

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { fetchDocuments } from '../../store/documentsSlice';
import './Home.scss'; // Import the CSS file
import ProfRequest from "../profrequest/ProfRequest";
import SockJS from "sockjs-client";
import { Client, Stomp } from "@stomp/stompjs";

import { HiDocumentAdd } from "react-icons/hi";
import { addNotification } from '../../store/notificationSlice'; // Import the action
import { User } from "../../types/userTypes";

const Home: React.FC = () => {


  const [collapsed, setCollapsed] = useState(false);
  
  const dispatch: AppDispatch = useDispatch();


  const user: User = useSelector((state: RootState) => state.user.user);

  const location = useLocation();

  // State to manage the visibility of the ProfRequest modal
  const [showProfRequest, setShowProfRequest] = useState(false);

  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  useEffect(() => {
    /*const username = '9c912fa9-998f-4c02-a6aa-d9397fa21b89';
    const userLevel = "4"; // Fetch from user profile
    const userGroup = "1";
    const field = 4;   // Fetch from user profile*/


    console.log("User from Home: ", user)


    const socket = new SockJS(`http://127.0.0.1:9001/ws?username=${user.user_id}`);
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, function (frame: any) {
      console.log('Connected as: ' + user.user_id);

      // Subscribe to the user-specific destination
      stompClient.subscribe('/user/queue/notifications', function (notification) {
        const newNotification = JSON.parse(notification.body);
        console.log('Received notification:', newNotification);

        // Dispatch the action to add the notification to the state
        dispatch(addNotification(newNotification));
      });

      stompClient.subscribe(`/topic/notifications/${user.profile.educationLevel}/${user.profile.field?.field_id}/${user.profile.group}`, (message) => {
        const notification = JSON.parse(message.body);
        console.log('New document:', notification);

        // Dispatch the action to add the notification to the state
        dispatch(addNotification(notification));
      });
    });
  }, [dispatch, user]);

  const isDocumentsRoute = location.pathname === '/documents';

  return (
    <div className="d-flex gap-0 home">
      {!isDocumentsRoute && (
       <Col md={collapsed ? 1  : 3} style={{
               transition: '0.2s ease'
             }}>
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </Col>
      )}


        <Col md={isDocumentsRoute? 12: collapsed ? 11  : 9 } style={{
              transition: '0.2s ease'
            }}>

       
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
