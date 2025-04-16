import React, { useState } from 'react';
import { Modal, Button, Form, Badge } from 'react-bootstrap';

import './subjectModal.scss'

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

  const subjects: Subject[] = [
    { id: 'math', name: 'Math' },
    { id: 'physics', name: 'Physics' },
    { id: 'cs', name: 'Computer Science' },
    { id: 'tech', name: 'Technologies' },
    { id: 'histgeo', name: 'History Geography' },
    { id: 'english', name: 'English' },
    { id: 'french', name: 'French' },
    { id: 'econ', name: 'Economics' }
  ];

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

  return (
    <Modal show={show} onHide={onHide} centered className="subject-modal">
      <Modal.Header closeButton>
        <Modal.Title className="fw-semi-bold">Choose your subjects</Modal.Title>
        <Badge bg="secondary" className="ms-2">
          {selectedSubjects.length} selected
        </Badge>
      </Modal.Header>

      <Modal.Body>
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
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-left">
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <div className="d-flex gap-2">
          <Button
            variant="primary"
            onClick={() => onConfirm(selectedSubjects)}
            disabled={!selectedSubjects.length}
          >
            Confirm Selection
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default SubjectModal;