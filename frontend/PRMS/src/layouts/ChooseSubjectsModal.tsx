import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/store';
import { saveChosenSubjects } from '../store/authSlice';

import './subjectModal.scss';
import CustomToast from '../common/Toast';
import { useToast } from '../context/ToastContext';
import { fetchSubjectsThunk } from '../store/documentsSlice';

// Define the types for the props
interface Subject {
  id: string;
  name: string;
}

interface SubjectModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: (selectedSubjects: string[]) => void;
  initialSelections?: string[];
}

const SubjectModal: React.FC<SubjectModalProps> = ({ show, onHide, onConfirm, initialSelections = [] }) => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialSelections);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { toast, showToast, hideToast } = useToast();

  // Get subjects from the Redux state
  const { subjects, loading, error } = useSelector((state: RootState) => state.documents);

  // Fetch subjects when the modal is shown
  useEffect(() => {
    if (show) {
      dispatch(fetchSubjectsThunk());
    }
  }, [dispatch, show]);

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSubjects.length === subjects.length) {
      setSelectedSubjects([]);
    } else {
      setSelectedSubjects(subjects.map((subject) => subject.id));
    }
  };

  const handleConfirmSelection = async () => {
    try {
      const response = await dispatch(saveChosenSubjects(selectedSubjects)).unwrap();
      if (response.status === 200) {
        showToast({ type: 'success', message: response.message }); // Use showToast for success
        navigate('/'); // Redirect to the home route
      } else {
        showToast({ type: 'danger', message: 'Failed to save subjects. Please try again.' }); // Use showToast for failure
      }
    } catch (error: any) {
      showToast({ type: 'danger', message: error.message || 'An unknown error occurred.' }); // Handle errors
    }
  };

  return (
    <>
      <CustomToast
        show={toast.show}
        onClose={hideToast}
        type={toast.type}
        message={toast.message}
      />
      <Modal show={show} onHide={onHide} centered className="subject-modal">
        <Modal.Header closeButton>
          <Modal.Title className="fw-semi-bold">Choose your subjects</Modal.Title>
          <Badge bg="secondary" className="ms-2">
            {selectedSubjects.length} selected
          </Badge>
        </Modal.Header>

        <Modal.Body>
          {loading && <div>Loading subjects...</div>}
          {error && <div className="text-danger">Error: {error}</div>}
          {!loading && !error && (
            <>
              <div className="mb-3">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleSelectAll}
                  className="select-all-btn"
                >
                  {selectedSubjects.length === subjects.length ? 'Deselect all' : 'Select all'}
                </Button>
              </div>

              <div className="d-flex flex-wrap gap-2">
                {subjects.map((subject) => (
                  <Form.Check
                    key={subject.id}
                    type="checkbox"
                    id={`subject-${subject.id}`}
                    className="subject-chip"
                    checked={selectedSubjects.includes(subject.id)}
                    onChange={() => toggleSubject(subject.id)}
                    label={
                      <>
                        {subject.name}
                        <svg className="checkmark" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </>
                    }
                  />
                ))}
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-left">
          <Button variant="secondary" onClick={onHide}>Cancel</Button>
          <div className="d-flex gap-2">
            <Button
              variant="primary"
              onClick={handleConfirmSelection}
              disabled={!selectedSubjects.length}
            >
              Confirm Selection
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SubjectModal;