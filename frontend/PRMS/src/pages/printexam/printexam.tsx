import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner, Card } from "react-bootstrap";
import axios from "axios";
import "./PrintExam.css";

interface PrintExamProps {
  show: boolean;
  handleClose: () => void;
}

const PrintExam: React.FC<PrintExamProps> = ({ show, handleClose }) => {
  const [formData, setFormData] = useState({
    userId: "9c912fa9-998f-4c02-a6aa-d9397fa21b89", // Valeur par défaut
    level: "",
    section: "",
    subject: "",
    className: "",
    examDate: "",
    copies: 1,
    printMode: "Black & White",
    paperType: "A4",
    file: null as File | null,
    instructions: "",
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [sections, setSections] = useState<string[]>([]);
  const [subjectsBySection, setSubjectsBySection] = useState<Record<string, string[]>>({});
  const [fields, setFields] = useState<any[]>([]);

  // Fetch sections and subjects from the API
  useEffect(() => {
    const fetchSectionsAndSubjects = async () => {
      try {
        const [subjectsRes, fieldsRes] = await Promise.all([
          axios.get("http://localhost:8083/p-request/subjects"),
          axios.get("http://localhost:8083/p-request/fields"),
        ]);

        const subjectsData = subjectsRes.data;
        const fieldsData = fieldsRes.data;

        // Set subjects and fields data
        setFields(fieldsData);
        const newSubjectsBySection: Record<string, string[]> = {};

        subjectsData.forEach((subject: { name: string, subject_id: number }) => {
          const section = subject.name.toLowerCase(); // Assuming the section name corresponds to the subject
          if (!newSubjectsBySection[section]) {
            newSubjectsBySection[section] = [];
          }
          newSubjectsBySection[section].push(subject.name);
        });

        setSections(Object.keys(newSubjectsBySection)); // Set unique sections
        setSubjectsBySection(newSubjectsBySection);
      } catch (error) {
        console.error("Error fetching subjects or fields:", error);
        setErrorMessage("Failed to fetch subjects or fields.");
      }
    };

    fetchSectionsAndSubjects();
  }, []);

  const levels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const classes = ["1", "2", "3", "4", "5", "6"];
  const formats = ["A4", "A3", "A2", "A1"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (validationErrors[name]) {
      const newErrors = { ...validationErrors };
      delete newErrors[name];
      setValidationErrors(newErrors);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        setValidationErrors({ ...validationErrors, file: "Please upload a PDF file only" });
      } else {
        setFormData({ ...formData, file });
        const newErrors = { ...validationErrors };
        delete newErrors.file;
        setValidationErrors(newErrors);
      }
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.level) errors.level = "Level is required";
    if (formData.level !== "1st Year" && !formData.section) errors.section = "Section is required";
    if (!formData.subject) errors.subject = "Subject is required";
    if (!formData.className) errors.className = "Class is required";
    if (!formData.examDate) errors.examDate = "Exam date is required";
    if (!formData.file) errors.file = "PDF file is required";
    if (formData.copies < 1 || formData.copies > 100) errors.copies = "Copies must be between 1 and 100";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const data = new FormData();
    data.append("userId", formData.userId); // Ajouter le userId
    data.append("level", formData.level);
    if (formData.level !== "1st Year") {
      data.append("section", formData.section);
    }
    
    data.append("subject", formData.subject);
    data.append("className", formData.className);
    data.append("examDate", formData.examDate);
    data.append("copies", formData.copies.toString());
    data.append("printMode", formData.printMode);
    data.append("paperType", formData.paperType);
    data.append("instructions", formData.instructions);
    if (formData.file) data.append("file", formData.file);

    try {
      setLoading(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      const response = await axios.post("http://localhost:8083/p-request/send-print-requestexam", data); // ✅ Change URL as needed
      console.log('FormData:', data);

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage("Exam print request submitted successfully!");
        setFormData({
          userId: "9c912fa9-998f-4c02-a6aa-d9397fa21b89",
          level: "",
          section: "",
          subject: "",
          className: "",
          examDate: "",
          copies: 1,
          printMode: "Black & White",
          paperType: "A4",
          file: null,
          instructions: "",
        });
        setTimeout(() => {
          handleClose();
          setSuccessMessage(null);
        }, 2000);
      }
    } catch (err: any) {
      setErrorMessage("Failed to submit request. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sectionSubjects = subjectsBySection[formData.section] || [];

  return (
    <Modal show={show} onHide={handleClose} centered size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Exam Printing Request</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

        <Form>
          <Card className="mb-3">
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Level *</Form.Label>
                <Form.Select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.level}
                >
                  <option value="">Select Level</option>
                  {levels.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{validationErrors.level}</Form.Control.Feedback>
              </Form.Group>

              {formData.level !== "1st Year" && (
                <Form.Group className="mb-3">
                  <Form.Label>Section *</Form.Label>
                  <Form.Select
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.section}
                  >
                    <option value="">Select Section</option>
                    {sections.map((sec) => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{validationErrors.section}</Form.Control.Feedback>
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Subject *</Form.Label>
                <Form.Select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.subject}
                >
                  <option value="">Select Subject</option>
                  {sectionSubjects.map((subj) => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{validationErrors.subject}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Class *</Form.Label>
                <Form.Select
                  name="className"
                  value={formData.className}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.className}
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{validationErrors.className}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Exam Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="examDate"
                  value={formData.examDate}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.examDate}
                />
                <Form.Control.Feedback type="invalid">{validationErrors.examDate}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Copies *</Form.Label>
                <Form.Control
                  type="number"
                  name="copies"
                  value={formData.copies}
                  onChange={handleChange}
                  min={1}
                  max={100}
                  isInvalid={!!validationErrors.copies}
                />
                <Form.Control.Feedback type="invalid">{validationErrors.copies}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Print Mode</Form.Label>
                <Form.Check
                  inline
                  type="radio"
                  label="Black & White"
                  name="printMode"
                  value="Black & White"
                  checked={formData.printMode === "Black & White"}
                  onChange={handleChange}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="Color"
                  name="printMode"
                  value="Color"
                  checked={formData.printMode === "Color"}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Paper Type</Form.Label>
                <Form.Select
                  name="paperType"
                  value={formData.paperType}
                  onChange={handleChange}
                >
                  {formats.map((fmt) => (
                    <option key={fmt} value={fmt}>{fmt}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Upload Exam PDF *</Form.Label>
                <Form.Control
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  isInvalid={!!validationErrors.file}
                />
                <Form.Control.Feedback type="invalid">{validationErrors.file}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group>
                <Form.Label>Additional Instructions</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder="e.g., double-sided, staple top-left..."
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Submitting...
            </>
          ) : (
            "Submit Print Request"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PrintExam;
