import React, { useState } from 'react';
import { Form, Button, Tab, Nav, Row, Col } from 'react-bootstrap';
import { FiUser, FiLock, FiBell, FiUsers } from 'react-icons/fi';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import './AccountSettings.scss';
import { ChangePasswordModal } from './ChangePasswordModal';
import CustomButton from '../../components/Button/Button';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfileAsync, updatePasswordAsync } from '../../store/userSlice';
import { RootState, AppDispatch } from '../../store/store';
import { useToast } from '../../context/ToastContext';
import CustomToast from '../../common/Toast';

const AccountSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);


  const { toast, showToast, hideToast } = useToast()

  const dispatch = useDispatch<AppDispatch>();

  const userData = useSelector((state: RootState) => state.user);

  const [followedProfessors, setFollowedProfessors] = useState([
    { id: 1, name: 'Dr. Michael Chen', subject: 'Computer Science', avatar: 'https://via.placeholder.com/40', isFollowing: true },
    { id: 2, name: 'Prof. Emma Wilson', subject: 'Mathematics', avatar: 'https://via.placeholder.com/40', isFollowing: true },
    { id: 3, name: 'Dr. James Peterson', subject: 'Physics', avatar: 'https://via.placeholder.com/40', isFollowing: false },
  ]);

  const toggleFollow = (professorId: number) => {
    setFollowedProfessors(professors => professors.map(prof =>
      prof.id === professorId ? { ...prof, isFollowing: !prof.isFollowing } : prof
    ));
  };

  const validationSchema = Yup.object({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    phone: Yup.string().required('Phone Number is required').matches(/^\+?[1-9]\d{1,14}$/, 'Phone number is not valid'),
  });

  const formik = useFormik({
    initialValues: userData,
    validationSchema,
    onSubmit: (values) => {


      dispatch(updateProfileAsync(values)).then((action: any) => {
        if (action.type === 'user/updateProfileAsync/fulfilled') {


          setSuccess(true);
        } else {
          setSuccess(false)
        }

        console.log("ACTION UPDATE PROFILE:", action)


        showToast(action.payload.message, action.payload.status === 200 ? 'success' : 'danger');

      });
    },
  });

  const handlePasswordChange = (oldPassword: string, newPassword: string) => {
    dispatch(updatePasswordAsync({ email: "jane.doe@example.com" /*userData.email*/, oldPassword, newPassword })).then((action: any) => {
      if (action.type === 'user/updatePasswordAsync/fulfilled') {
        setPasswordError(null);
        //setShowPasswordModal(false);
      } else if (action.payload) {
        setPasswordError(action.payload);
        console.log('error passwor change', action.payload);

      }

      showToast(action.payload.message, action.payload.status === 200 ? 'success' : 'danger');

    });
  };

  return (
    <div className="account-settings">

      <CustomToast
        show={toast.show}
        onClose={hideToast}
        type={toast.type}
        message={toast.message}
      />
      <Row className="g-0 mt-4">
        {/* Sidebar Navigation */}
        <Col md={3} className="settings-sidebar">
          <Nav variant="pills" className="flex-column">
            <Nav.Item>
              <Nav.Link eventKey="profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
                <FiUser className="nav-icon" />
                Profile
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="security" active={activeTab === 'security'} onClick={() => setActiveTab('security')}>
                <FiLock className="nav-icon" />
                Security
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')}>
                <FiBell className="nav-icon" />
                Notifications
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="following" active={activeTab === 'following'} onClick={() => setActiveTab('following')}>
                <FiUsers className="nav-icon" />
                Following
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>

        {/* Main Content Area */}
        <Col md={9} className="settings-content">
          <Tab.Container activeKey={activeTab}>
            <Tab.Content>
              {/* Profile Tab */}
              <Tab.Pane eventKey="profile">
                <div className="section-card">
                  <h3 className="section-title">Profile Information</h3>
                  <Form noValidate onSubmit={formik.handleSubmit}>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>First Name</Form.Label>
                          <Form.Control
                            type="text"
                            {...formik.getFieldProps('firstName')}
                            isInvalid={formik.touched.firstName && !!formik.errors.firstName}
                          />
                          <Form.Control.Feedback type="invalid">
                            {formik.errors.firstName}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Last Name</Form.Label>
                          <Form.Control
                            type="text"
                            {...formik.getFieldProps('lastName')}
                            isInvalid={formik.touched.lastName && !!formik.errors.lastName}
                          />
                          <Form.Control.Feedback type="invalid">
                            {formik.errors.lastName}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control type="email" value={formik.values.email} readOnly />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        {...formik.getFieldProps('phone')}
                        isInvalid={formik.touched.phone && !!formik.errors.phone}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.phone}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <CustomButton disabled={false} text="Save Changes" type="submit" />
                  </Form>
                </div>
              </Tab.Pane>

              {/* Security Tab */}
              <Tab.Pane eventKey="security">
                <div className="section-card">
                  <h3 className="section-title">Security Settings</h3>
                  <div className="security-item">
                    <div className="security-info">
                      <h5>Password</h5>
                      <p className="text-muted">Last changed 3 days ago</p>
                    </div>
                    <Button
                      className='change-password-btn'
                      variant="outline-primary"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      Change Password
                    </Button>
                  </div>

                  <div className="security-item">
                    <div className="security-info">
                      <h5>Two-Factor Authentication</h5>
                      <p className="text-muted">Add an extra layer of security</p>
                    </div>
                    <Form.Check
                      type="switch"
                      id="2fa-switch"
                      label="Enable 2FA"
                    />
                  </div>
                </div>
              </Tab.Pane>

              {/* Notifications Tab */}
              <Tab.Pane eventKey="notifications">
                <div className="section-card">
                  <h3 className="section-title">Notification Preferences</h3>
                  <div className="notification-item">
                    <div className="notification-info">
                      <h5>Email Notifications</h5>
                      <p className="text-muted">Receive important updates via email</p>
                    </div>
                    <Form.Check type="switch" />
                  </div>

                  <div className="notification-item">
                    <div className="notification-info">
                      <h5>SMS Alerts</h5>
                      <p className="text-muted">Get instant alerts on your phone</p>
                    </div>
                    <Form.Check type="switch" />
                  </div>
                </div>
              </Tab.Pane>

              {/* Following Tab */}
              <Tab.Pane eventKey="following">
                <div className="section-card">
                  <h3 className="section-title">Followed Professors</h3>
                  <div className="professors-list">
                    {followedProfessors.map(professor => (
                      <div key={professor.id} className="professor-card">
                        <div className="professor-info">
                          <img
                            src={"/boy.png"}
                            alt={professor.name}
                            className="professor-avatar"
                          />
                          <div className="professor-details">
                            <h5>{professor.name}</h5>
                            <p className="text-muted">{professor.subject}</p>
                          </div>
                        </div>
                        <Button
                          variant={professor.isFollowing ? 'primary' : 'outline-primary'}
                          onClick={() => toggleFollow(professor.id)}
                          className="follow-btn"
                        >
                          {professor.isFollowing ? 'Following' : 'Follow'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Col>
      </Row>

      <ChangePasswordModal
        show={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setSuccess(false);
        }}
        onSubmit={handlePasswordChange}
        error={passwordError}

      />

    </div>
  );
};

export default AccountSettings;