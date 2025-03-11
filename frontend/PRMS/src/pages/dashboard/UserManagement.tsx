import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Form, Modal, Badge, Tab, Tabs, InputGroup, Row, Col } from 'react-bootstrap';
import { FiUserPlus, FiSearch, FiEdit, FiLock, FiActivity } from 'react-icons/fi';
import './UserManagement.scss';
import { CiExport } from 'react-icons/ci';
import { fetchAllUsersAsync } from '../../store/userSlice';
import { AppDispatch, RootState } from '../../store/store';
import { User } from '../../types/userTypes';

const emptyUser: User = {
    userId: "111",
    email: "",
    active: true,
    profile: {
        firstName: '',
        lastName: '',
        phone: '',
        role: 'student',
        educationLevel: '1',
        field: 'Computer science'
    }
};

const UserManagement: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const allUsers = useSelector((state: RootState) => state.user.users);

    const [users, setUsers] = useState<User[]>([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [filters, setFilters] = useState({
        role: 'student',
        search: '',
    });

    useEffect(() => {
        dispatch(fetchAllUsersAsync());
    }, [dispatch]);

    useEffect(() => {
        setUsers(allUsers);
        console.log("All users: ", allUsers);
    }, [allUsers]);

    // Filtering logic (simple by role and search)
    const filteredUsers = users.filter(user => {
        const matchesRole = user.profile.role === filters.role;
        const matchesSearch = `${user.profile.firstName || ''} ${user.profile.lastName || ''}`
            .toLowerCase()
            .includes(filters.search.toLowerCase());
        return matchesRole && matchesSearch;
    });

    console.log("Filtered users: ", filteredUsers);

    return (
        <div className="user-management">
            {/* Header Section */}
            <div className="management-header">
                <h2>User Directory</h2>
                <Button variant="outline-dark" onClick={() => {
                    setSelectedUser(null);
                    setShowEditModal(true);
                }}>
                    <FiUserPlus className="me-2" /> Add New User
                </Button>
            </div>

            {/* Filter Controls */}
            <div className="filter-controls">
                <Tabs
                    activeKey={filters.role}
                    onSelect={(role) =>
                        setFilters({ ...filters, role: role as 'student' | 'professor' | 'admin', search: '' })
                    }
                    className="role-tabs"
                >
                    <Tab eventKey="student" title="Students" />
                    <Tab eventKey="professor" title="Professors" />
                    <Tab eventKey="admin" title="Admins" />
                </Tabs>

                <div className="filters-container">
                    <InputGroup className="search-input">
                        <InputGroup.Text>
                            <FiSearch />
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Search by name..."
                            value={filters.search}
                            onChange={e => setFilters({ ...filters, search: e.target.value })}
                        />
                    </InputGroup>
                </div>
            </div>

            {/* User Table */}
            <div> 
                <Button variant='outline-dark' className='d-flex align-items-center px-3 py-2'>
                    <CiExport size={22} />
                    Export
                </Button>
            </div>
            <Table responsive hover className="users-table my-2">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        {filters.role === 'professor' && <th>ID Card / Subject</th>}
                        {filters.role === 'student' && <th>Education Level / Field</th>}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(user => (
                        <UserRow
                            key={user.userId}
                            user={user}
                            onEdit={() => {
                                setSelectedUser(user);
                                setShowEditModal(true);
                            }}
                        />
                    ))}
                </tbody>
            </Table>

            {/* Edit/Create Modal */}
            <UserModal
                show={showEditModal}
                user={selectedUser}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                }}
                onSubmit={(userData) => {
                    // Update logic (create or edit)
                    if (userData.userId === "0") {
                        // New user creation
                        userData.userId = (users.length + 1).toString();
                        setUsers([...users, userData]);
                    } else {
                        // Edit existing user
                        setUsers(users.map(u => (u.userId === userData.userId ? userData : u)));
                    }
                    setShowEditModal(false);
                    setSelectedUser(null);
                }}
            />
        </div>
    );
};

interface UserRowProps {
    user: User;
    onEdit: () => void;
}

const UserRow: React.FC<UserRowProps> = ({ user, onEdit }) => (
    <tr>
        <td>{`${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim()}</td>
        <td>{user.email}</td>
        <td>
            {user.profile.role && <Badge bg={roleBadgeColor(user.profile.role)}>{user.profile.role}</Badge>}
        </td>
        <td>
            <StatusIndicator active={user.active} />
        </td>
        {user.profile.role === 'professor' && (
            <td>
                {user.profile.idCard} / {user.profile.subject}
            </td>
        )}
        {user.profile.role === 'student' && (
            <td>
                {user.profile.educationLevel} / {user.profile.field}
            </td>
        )}
        <td>
            <Button variant="link" onClick={onEdit}>
                <FiEdit />
            </Button>
            <Button variant="link">
                <FiActivity />
            </Button>
            <Button variant="link">
                <FiLock />
            </Button>
        </td>
    </tr>
);

interface UserModalProps {
    show: boolean;
    user: User | null;
    onClose: () => void;
    onSubmit: (userData: User) => void;
}

const UserModal: React.FC<UserModalProps> = ({ show, user, onClose, onSubmit }) => {
    const [formData, setFormData] = useState<User>(user || emptyUser);

    // If the modal opens for editing a different user, update the form data.
    useEffect(() => {
        setFormData(user || emptyUser);
    }, [user, show]);

    // Handle role change to reset fields specific to each type
    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value as 'student' | 'professor' | 'admin';
        if (newRole === 'student') {
            setFormData({
                userId: formData.userId,
                email: formData.email,
                active: formData.active,
                profile: {
                    firstName: formData.profile.firstName || '',
                    lastName: formData.profile.lastName || '',
                    phone: formData.profile.phone || '',
                    role: 'student',
                    educationLevel: '1',
                    field: 'Computer science'
                }
            });
        } else if (newRole === 'professor') {
            setFormData({
                userId: formData.userId,
                email: formData.email,
                active: formData.active,
                profile: {
                    firstName: formData.profile.firstName || '',
                    lastName: formData.profile.lastName || '',
                    phone: formData.profile.phone || '',
                    role: 'professor',
                    idCard: '',
                    subject: 'math'
                }
            });
        } else {
            // For admin or other roles, you can decide which fields to keep.
            setFormData({
                userId: formData.userId,
                email: formData.email,
                active: formData.active,
                profile: {
                    firstName: formData.profile.firstName || '',
                    lastName: formData.profile.lastName || '',
                    phone: formData.profile.phone || '',
                    role: 'admin'
                }
            });
        }
    };

    return (
        <Modal show={show} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton className="create-edit-user">
                <Modal.Title>{user ? 'Edit User' : 'Create New User'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Role</Form.Label>
                        <Form.Select value={formData.profile.role} onChange={handleRoleChange}>
                            <option value="student">Student</option>
                            <option value="professor">Professor</option>
                            <option value="admin">Admin</option>
                        </Form.Select>
                    </Form.Group>

                    {/* Conditionally render fields based on role */}
                    {formData.profile.role === 'student' && (
                        <>
                            <Row>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>First Name</Form.Label>
                                        <Form.Control
                                            value={formData.profile.firstName}
                                            onChange={e => setFormData({ ...formData, profile: { ...formData.profile, firstName: e.target.value } })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Last Name</Form.Label>
                                        <Form.Control
                                            value={formData.profile.lastName}
                                            onChange={e => setFormData({ ...formData, profile: { ...formData.profile, lastName: e.target.value } })}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Phone</Form.Label>
                                        <Form.Control
                                            value={formData.profile.phone}
                                            onChange={e => setFormData({ ...formData, profile: { ...formData.profile, phone: e.target.value } })}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Education Level</Form.Label>
                                        <Form.Select
                                            value={formData.profile.educationLevel}
                                            onChange={e =>
                                                setFormData({
                                                    ...formData,
                                                    profile: { ...formData.profile, educationLevel: e.target.value as '1' | '2' | '3' | '4' }
                                                })
                                            }
                                        >
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Field</Form.Label>
                                        <Form.Select
                                            value={formData.profile.field}
                                            onChange={e =>
                                                setFormData({
                                                    ...formData,
                                                    profile: { ...formData.profile, field: e.target.value as 'Computer science' | 'experimental science' | 'technical science' | 'Math' }
                                                })
                                            }
                                        >
                                            <option value="Computer science">Computer science</option>
                                            <option value="experimental science">Experimental science</option>
                                            <option value="technical science">Technical science</option>
                                            <option value="Math">Math</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </>
                    )}

                    {formData.profile.role === 'professor' && (
                        <>
                            <Row>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>ID Card</Form.Label>
                                        <Form.Control
                                            value={formData.profile.idCard}
                                            onChange={e => setFormData({ ...formData, profile: { ...formData.profile, idCard: e.target.value } })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>First Name</Form.Label>
                                        <Form.Control
                                            value={formData.profile.firstName}
                                            onChange={e => setFormData({ ...formData, profile: { ...formData.profile, firstName: e.target.value } })}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Last Name</Form.Label>
                                        <Form.Control
                                            value={formData.profile.lastName}
                                            onChange={e => setFormData({ ...formData, profile: { ...formData.profile, lastName: e.target.value } })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Phone</Form.Label>
                                        <Form.Control
                                            value={formData.profile.phone}
                                            onChange={e => setFormData({ ...formData, profile: { ...formData.profile, phone: e.target.value } })}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Subject</Form.Label>
                                <Form.Select
                                    value={formData.profile.subject}
                                    onChange={e => setFormData({ ...formData, profile: { ...formData.profile, subject: e.target.value as 'math' | 'science' | 'history' } })}
                                >
                                    <option value="math">Mathematics</option>
                                    <option value="science">Science</option>
                                    <option value="history">History</option>
                                </Form.Select>
                            </Form.Group>
                        </>
                    )}

                    {/* Optionally, add admin fields or a permissions section if needed */}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="outline-dark" onClick={() => onSubmit(formData)}>
                    {user ? 'Save Changes' : 'Create User'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

const roleBadgeColor = (role: 'student' | 'professor' | 'admin'): string => {
    switch (role) {
        case 'student':
            return 'primary';
        case 'professor':
            return 'success';
        case 'admin':
            return 'warning';
        default:
            return 'secondary';
    }
};

interface StatusIndicatorProps {
    active: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ active }) => (
    <Badge bg={active ? 'success' : 'danger'}>
        {active ? 'Active' : 'Inactive'}
    </Badge>
);

export default UserManagement;
