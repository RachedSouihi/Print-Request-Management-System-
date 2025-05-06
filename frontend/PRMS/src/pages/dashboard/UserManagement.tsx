import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Form, Modal, Badge, Tab, Tabs, InputGroup, Row, Col } from 'react-bootstrap';
import { FiUserPlus, FiSearch, FiEdit, FiLock, FiActivity } from 'react-icons/fi';
import './UserManagement.scss';
import { CiExport } from 'react-icons/ci';
import { addUserAsync, fetchAllUsersAsync, updateUserAsync } from '../../store/userSlice';
import { AppDispatch, RootState } from '../../store/store';
import { User } from '../../types/userTypes';
import { fetchFieldsThunk, fetchSubjectsThunk, Field, Subject } from '../../store/documentsSlice';


const UserManagement: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const allUsers = useSelector((state: RootState) => state.user.users);

    const subjects: Subject[] = useSelector((state: RootState) => state.documents.subjects);

    const fields: Field[] = useSelector((state: RootState) => state.documents.fields);
    

    const [users, setUsers] = useState<User[]>([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [filters, setFilters] = useState({
        role: 'student',
        search: '',
    });

    useEffect(() => {
        dispatch(fetchAllUsersAsync());

        dispatch(fetchSubjectsThunk()).unwrap();

        dispatch(fetchFieldsThunk()).unwrap();


    }, [dispatch]);

    useEffect(() => {
        setUsers(allUsers);
        console.log("All users: ", allUsers);
    }, [allUsers]);

    // Filtering logic (simple by role and search)
    const filteredUsers = allUsers && users.filter(user => {
        const matchesRole = user.profile.role === filters.role;
        const matchesSearch = `${user.profile.firstname || ''} ${user.profile.lastname || ''}`
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
                    {filteredUsers && filteredUsers.map(user => (
                        <UserRow
                            key={user.user_id}
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
                subjects={subjects}
                fields={fields}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                }}
                onSubmit={(userData) => {
                    // Update logic (create or edit)
                    if (userData.user_id === "0") {
                        // New user creation
                        userData.user_id = (users.length + 1).toString();
                        setUsers([...users, userData]);
                    } else {
                        // Edit existing user
                        setUsers(users.map(u => (u.user_id === userData.user_id ? userData : u)));
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
        <td>{`${user.profile.firstname || ''} ${user.profile.lastname || ''}`.trim()}</td>
        <td>{user.email}</td>
        <td>
            {user.profile.role && <Badge bg={roleBadgeColor(user.profile.role)}>{user.profile.role}</Badge>}
        </td>
        <td>
            <StatusIndicator active={user.active} />
        </td>
        {user.profile.role === 'professor' && (
            <td>
                {user.profile.idCard} / {user.profile.subject?.name}
            </td>
        )}
        {user.profile.role === 'student' && (
            <td>
                {user.profile.educationLevel} / {user.profile.field?.name}
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
    subjects: Subject[];
    fields: Field[];
}


const emptyUser: User = {
    user_id: '',
    email: '',
    active: true,
    profile: {
        firstname: '',
        lastname: '',
        phone: '',
        role: 'student',
        educationLevel: '',
        field: {} as Field,
    },
}
const UserModal: React.FC<UserModalProps> = ({ show, user, onClose, onSubmit, fields, subjects }) => {
    const [formData, setFormData] = useState<User>(user || emptyUser);
    const dispatch = useDispatch<AppDispatch>();

    console.log("form data: ", formData);

    // If the modal opens for editing a different user, update the form data.
    useEffect(() => {
        setFormData(user || emptyUser);
    }, [user, show]);

    // Handle role change to reset fields specific to each type
    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value as 'student' | 'professor' | 'admin';
        if (newRole === 'student') {
            setFormData({
                user_id: formData.user_id,
                email: formData.email,
                active: true,
                profile: {
                    firstname: formData.profile.firstname || '',
                    lastname: formData.profile.lastname || '',
                    phone: formData.profile.phone || '',
                    role: 'student',
                    educationLevel: '1',
                    field: formData.profile.field! || null, // Keep the field if it exists
                }
            });
        } else if (newRole === 'professor') {
            setFormData({
                user_id: formData.user_id,
                email: formData.email,
                active: formData.active,
                profile: {
                    firstname: formData.profile.firstname || '',
                    lastname: formData.profile.lastname || '',
                    phone: formData.profile.phone || '',
                    role: 'professor',
                    idCard: formData.profile.idCard,
                    subject: formData.profile.subject
                }
            });
        } else {
            // For admin or other roles, you can decide which fields to keep.
            setFormData({
                user_id: formData.user_id,
                email: formData.email,
                active: formData.active,
                profile: {
                    firstname: formData.profile.firstname || '',
                    lastname: formData.profile.lastname || '',
                    phone: formData.profile.phone || '',
                    role: 'admin'
                }
            });
        }
    };

    const handleSubmit = async () => {

        console.log("Form data on submit: ", formData);
        if (!formData.user_id || formData.user_id === "0") {
            // Create a new user
            try {
                await dispatch(addUserAsync(formData)).unwrap();
                console.log('User added successfully');
            } catch (error) {
                console.error('Failed to add user:', error);
            }
        } else {
            // Save changes for an existing user
            try {
                const updatedUser = formData ; // Prepare the updated user data
                // Dispatch an action to update the user

                await dispatch(updateUserAsync(updatedUser)).unwrap();
                console.log('User updated successfully');
            } catch (error) {
                console.error('Failed to update user:', error);
            }
        }
        onClose(); // Close the modal after the operation
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
                                            value={formData.profile.firstname}
                                            onChange={e => setFormData({ ...formData, profile: { ...formData.profile, firstname: e.target.value } })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Last Name</Form.Label>
                                        <Form.Control
                                            value={formData.profile.lastname}
                                            onChange={e => setFormData({ ...formData, profile: { ...formData.profile, lastname: e.target.value } })}
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
                                            value={formData.profile.field?.field_id || ''} // Use field_id for the value
                                            onChange={(e) => {
                                                const selectedField = fields.find((field: Field) => field.field_id == e.target.value);

                                               console.log("Selected field: ", e.target.value);

                                               console.log("all fields: ", fields);
                                                setFormData({
                                                    ...formData,
                                                    profile: { ...formData.profile, field: selectedField }, // Update the field with the selected object
                                                });
                                            }}
                                        >
                                            <option value="">Select a field</option>
                                            {fields.map((field: Field) => (
                                                <option key={field.field_id} value={field.field_id}>
                                                    {field.name}
                                                </option>
                                            ))}
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
                                            value={formData.profile.firstname}
                                            onChange={e => setFormData({ ...formData, profile: { ...formData.profile, firstname: e.target.value } })}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Last Name</Form.Label>
                                        <Form.Control
                                            value={formData.profile.lastname}
                                            onChange={e => setFormData({ ...formData, profile: { ...formData.profile, lastname: e.target.value } })}
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
                                    value={formData.profile.subject?.subject_id || ''} // Use subject_id for the value

                                    
                                    onChange={(e) => {

                                        console.log("Selected subject: ", e.target.value);
                                        const selectedSubject = subjects.find((subject: Subject) => subject.subject_id == e.target.value);
                                        setFormData({
                                            ...formData,
                                            profile: { ...formData.profile, subject: selectedSubject }, // Update the subject with the selected object
                                        });
                                    }}
                                >
                                    <option value="">Select a subject</option>
                                    {subjects.map((subject: Subject) => (
                                        <option key={subject.subject_id} value={subject.subject_id}>
                                            {subject.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </>
                    )}

                    {/* Optionally, add admin fields or a permissions section if needed */}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="outline-dark" onClick={handleSubmit}>
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
