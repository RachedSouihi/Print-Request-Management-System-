import React, { useEffect, useState } from 'react';
import axios from 'axios';
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

type Professor = {
  isFollowing: any;
  userId: string;
  profile: {
    firstname: string;
    lastname: string;
    subject: string;
  };
};

const AccountSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { toast, showToast, hideToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const userData = useSelector((state: RootState) => state.user.user);

  const [followedProfessors, setFollowedProfessors] = useState<Professor[]>([]);

  useEffect(() => {
    const fetchFollowedProfessors = async () => {
      try {
        const response = await axios.get(`http://localhost:8089/api/follow/user/${userData.user_id}/professors`);
        if (Array.isArray(response.data)) {
          const formatted = response.data.map((prof: any) => ({
            userId: prof.userId,
            profile: {
              firstname: prof.profile.firstname,
              lastname: prof.profile.lastname,
              subject: prof.profile.subject,
            },
          }));
          setFollowedProfessors(formatted);
        } else {
          console.error("API response is not an array:", response.data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des professeurs :", error);
      }
    };

    if (userData.user_id) {
      fetchFollowedProfessors();
    }
  }, [userData]);

  const toggleFollow = (profId: string) => {
    setFollowedProfessors(professors =>
      professors.map(prof =>
        prof.userId === profId ? { ...prof, isFollowing: !prof.isFollowing } : prof
      )
    );
  };

  const validationSchema = Yup.object({
    firstname: Yup.string().required('First Name is required'),
    lastname: Yup.string().required('Last Name is required'),
    phone: Yup.string().required('Phone Number is required').matches(/^\+?[1-9]\d{1,14}$/, 'Phone number is not valid'),
  });

  const formik = useFormik({
    initialValues: {
      firstname: userData.profile?.firstname || '',
      lastname: userData.profile?.lastname || '',
      email: userData.email || '',
      phone: userData.profile?.phone || '',
    },
    validationSchema,
    onSubmit: (values) => {
      dispatch(updateProfileAsync(values)).then((action: any) => {
        setSuccess(action.type === 'user/updateProfileAsync/fulfilled');
        showToast(action.payload.message, action.payload.status === 200 ? 'success' : 'danger');
      });
    },
  });

  const handlePasswordChange = (oldPassword: string, newPassword: string) => {
    dispatch(updatePasswordAsync({ email: userData.email, oldPassword, newPassword })).then((action: any) => {
      if (action.payload.status === 200) {
        setPasswordError(null);
        setShowPasswordModal(false);
      } else if (action.payload) {
        setPasswordError(action.payload);
      }
      showToast(action.payload.message, action.payload.status === 200 ? 'success' : 'danger');
    });
  };

  return (
    <div className="account-settings">
      <CustomToast show={toast.show} onClose={hideToast} type={toast.type} message={toast.message} />
      <Row className="g-0 mt-4">
        <Col md={3} className="settings-sidebar">
          <Nav variant="pills" className="flex-column">
            {['profile', 'security', 'notifications', 'following'].map(tab => (
              <Nav.Item key={tab}>
                <Nav.Link
                  eventKey={tab}
                  active={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'profile' && <FiUser className="nav-icon" />}
                  {tab === 'security' && <FiLock className="nav-icon" />}
                  {tab === 'notifications' && <FiBell className="nav-icon" />}
                  {tab === 'following' && <FiUsers className="nav-icon" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Col>

        <Col md={9} className="settings-content">
          <Tab.Container activeKey={activeTab}>
            <Tab.Content>
              <Tab.Pane eventKey="profile">
                {/* Formulaire de profil (inchangé) */}
              </Tab.Pane>

              <Tab.Pane eventKey="security">
                {/* Sécurité (inchangé) */}
              </Tab.Pane>

              <Tab.Pane eventKey="notifications">
                {/* Notifications (inchangé) */}
              </Tab.Pane>

              <Tab.Pane eventKey="following">
                <div className="section-card">
                  <h3 className="section-title">Followed Professors</h3>
                  <div className="professors-list">
                    {followedProfessors.map((professor) => (
                      <div key={professor.userId} className="professor-card">
                        <div className="professor-info">
                          <img
                            src="/boy.png"
                            alt={`${professor.profile.firstname} ${professor.profile.lastname}`}
                            className="professor-avatar"
                          />
                          <div className="professor-details">
                            <h5>{professor.profile.firstname} {professor.profile.lastname}</h5>
                            <p className="text-muted">{professor.profile.subject}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline-primary"
                          onClick={() => toggleFollow(professor.userId)}
                          className="follow-btn"
                        >
                          Unfollow
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
