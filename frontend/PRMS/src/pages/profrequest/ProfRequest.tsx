import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

interface ProfRequestProps {
  show: boolean;
  handleClose: () => void;
}

const ProfRequest: React.FC<ProfRequestProps> = ({ show, handleClose }) => {
  const [formData, setFormData] = useState({
    level: "",
    section: "",
    subject: "",
    class: "",
    documentType: "Exam",
    examDate: "",
    printMode: "Black & White",
    specialInstructions: "",
    documentFile: null as File | null,
  });

  const levels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const sections = ["Mathematics", "Science", "Economics", "Informatics", "Literature"];
  const classes = ["1", "2", "3", "4", "5", "6"];

  const subjects: Record<string, string[]> = {
    "1st Year": ["Mathematics", "Physics", "English", "French"],
    "2nd Year": ["Mathematics", "Physics", "Chemistry"],
    "3rd Year": ["Biology", "Geology", "History"],
    "4th Year": ["Philosophy", "Sociology", "Geography"],
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, documentFile: e.target.files[0] });
    }
  };

  const handleSubmit = () => {
    console.log("Form Data Submitted:", formData);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title>Add a Document</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <div className="row">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Level</Form.Label>
                <Form.Select name="level" value={formData.level} onChange={handleChange} required>
                  <option value="">Select Level</option>
                  {levels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            {formData.level && formData.level !== "1st Year" && (
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Section</Form.Label>
                  <Form.Select name="section" value={formData.section} onChange={handleChange} required>
                    <option value="">Select Section</option>
                    {sections.map((section) => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            )}
          </div>

          <div className="row mt-3">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Subject</Form.Label>
                <Form.Select name="subject" value={formData.subject} onChange={handleChange} required>
                  <option value="">Select Subject</option>
                  {formData.level && (Array.isArray(subjects[formData.level]) ? (
                    subjects[formData.level as keyof typeof subjects].map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))
                  ) : (
                    formData.section &&
                    subjects[formData.level as keyof typeof subjects][formData.section as keyof typeof subjects["2nd Year"]]?.map((subject: boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.Key | null | undefined) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Class</Form.Label>
                <Form.Select name="class" value={formData.class} onChange={handleChange} required>
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Document Type</Form.Label>
                <Form.Select name="documentType" value={formData.documentType} onChange={handleChange}>
                  <option>Exam</option>
                  <option>Exercise</option>
                  <option>Course</option>
                  <option>Other</option>
                </Form.Select>
              </Form.Group>
            </div>

            {formData.documentType === "Exam" && (
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Exam Date</Form.Label>
                  <Form.Control type="date" name="examDate" value={formData.examDate} onChange={handleChange} required />
                </Form.Group>
              </div>
            )}
          </div>

          <div className="mt-3">
            <Form.Group>
              <Form.Label>Upload Document (PDF)</Form.Label>
              <Form.Control type="file" accept="application/pdf" onChange={handleFileChange} required />
            </Form.Group>
          </div>

          <div className="mt-3">
            <Form.Group>
              <Form.Label>Print Mode</Form.Label>
              <div>
                <Form.Check inline label="Color" type="radio" name="printMode" value="Color" checked={formData.printMode === "Color"} onChange={handleChange} />
                <Form.Check inline label="Black & White" type="radio" name="printMode" value="Black & White" checked={formData.printMode === "Black & White"} onChange={handleChange} />
              </div>
            </Form.Group>
          </div>

          <div className="mt-3">
            <Form.Group>
              <Form.Label>Special Instructions</Form.Label>
              <Form.Control as="textarea" rows={3} name="specialInstructions" value={formData.specialInstructions} onChange={handleChange} />
            </Form.Group>
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Submit Request</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProfRequest;
