import React, { useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { addDocument } from "../../store/profSlice";

interface ProfRequestProps {
  show: boolean;
  handleClose: () => void;
}

const ProfRequest: React.FC<ProfRequestProps> = ({ show, handleClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.prof);

  const [formData, setFormData] = useState({
    level: "",
    section: "",
    subject: "",
    class: "",
    docType: "Exam",
    examDate: "",
    printMode: "Black & White",
    file: null as File | null,
    description: "",
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const levels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const sections = ["Mathematics", "Science", "Literature", "Informatics"];
  const classes = ["1", "2", "3", "4", "5", "6"];

  const subjectsBySection: Record<string, string[]> = {
    Mathematics: ["Algebra", "Geometry", "Calculus"],
    Science: ["Physics", "Chemistry", "Biology"],
    Literature: ["French", "English", "Philosophy"],
    Informatics: ["Programming", "Data Structures", "Databases"],
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async () => {
    const data = new FormData();
    data.append("level", formData.level);
    data.append("section", formData.section);
    data.append("subject", formData.subject);
    data.append("class", formData.class);
    data.append("docType", formData.docType);
    data.append("examDate", formData.examDate);
    data.append("printMode", formData.printMode);
    data.append("description", formData.description);

    if (formData.file) {
      data.append("file", formData.file);
    }

    setSuccessMessage(null);
    setErrorMessage(null);
    console.log("Sending data:", Object.fromEntries(data.entries()));

    try {
      await dispatch(addDocument(data)).unwrap();
      setSuccessMessage("The document has been successfully added.");
      handleClose();
    } catch (err) {
      setErrorMessage("Failed to add the document. Please try again.");
      console.error("Document submission failed:", err);
    }
  };

  const sectionSubjects = subjectsBySection[formData.section] || [];

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add a Document</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

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

            {formData.level !== "1st Year" && (
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
                  {sectionSubjects.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
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
                <Form.Select name="docType" value={formData.docType} onChange={handleChange}>
                  <option>Exam</option>
                  <option>Exercise</option>
                  <option>Course</option>
                  <option>Other</option>
                </Form.Select>
              </Form.Group>
            </div>

            {formData.docType === "Exam" && (
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
              <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} />
            </Form.Group>
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={status === "loading"}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={status === "loading"}>
          {status === "loading" ? <Spinner animation="border" size="sm" /> : "Submit Request"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProfRequest;
