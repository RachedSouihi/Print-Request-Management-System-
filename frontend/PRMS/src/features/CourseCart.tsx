import React, { useState } from "react";
import { 
  Card, 
  Button, 
  Modal,
  Spinner 
} from "react-bootstrap";
import CustomButton from "../components/Button/Button";
interface DocumentType {
  documentId: string;
  title: string;
  description: string;
  image: string;
}

interface ProductCardProps {
  document: DocumentType;
}

const CourseCard: React.FC<ProductCardProps> = ({ document }) => {
  const [showModal, setShowModal] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePreview = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:9001/doc/preview?id=${document.documentId}`);
      if (!response.ok) throw new Error('Failed to fetch document');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDocumentUrl(url);
    } catch (error) {
      console.error('Error fetching document:', error);
    } finally {
      setLoading(false);
      setShowModal(true);
    }
  };

  return (
    <>
      <Card className="custom-card shadow-lg border-0 h-100 d-flex flex-column">
        <div className="image-container">
          <Card.Img
            variant="top"
            src={document.image}
            alt={document.title}
            className="card-img"
            style={{ padding: "5px" }}
            height="200px"
          />
        </div>
        <Card.Body className="d-flex flex-column flex-grow-1">
          <Card.Title className="fw-bold">{document.title}</Card.Title>
          <Card.Text className="text-muted">{document.description}</Card.Text>
          <div className="mt-auto d-flex justify-content-between">
            <Button variant="outline-primary" onClick={handlePreview}>Preview</Button>
            <CustomButton type="button" width={150} text="Download" />
          </div>
        </Card.Body>
      </Card>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {document.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="d-flex justify-content-center">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : documentUrl ? (
            <embed
              src={documentUrl}
              type="application/pdf"
              width="100%"
              height="500px"
            />
          ) : (
            <p>Failed to load document</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CourseCard;





