import { Badge, Button, Card } from "react-bootstrap";
import { FiDownload, FiPrinter, FiStar } from "react-icons/fi";
import { Document } from "../store/documentsSlice";

import './DocumentCard.scss';
const DocumentCard = ({ document, handleOpenModal }: { document: Document, handleOpenModal: any }) => (
  <Card className="document-card" onClick={() => handleOpenModal(document)}>
    <div className="card-header">
      <Badge bg={document.docType === 'exam' ? "dark" : ""} style={{
        color: document.docType === 'serie' ? "#000" : '',
        border: document.docType === 'serie' ? '1px solid #000' : ''
      }} className="type-label">
        {document.docType}
      </Badge>
      <div className="document-meta">
        <span className="subject">{document.subject}</span>
        <span className="separator">•</span>
        <span className="level">Grade {document.level}</span>
      </div>
    </div>

    <Card.Body className="card-body">
      <h3 className="document-title">{
      document.title ||
      document.field + " " + document.level + " " + document.subject 
      
      }</h3>

      

      <div className="rating-container">
        {[...Array(5)].map((_, index) => (
          <FiStar
            key={index}
            className={`star ${index < document.rating ? 'filled' : ''}`}
          />
        ))}
        <span className="rating-text">({document.rating}/5)</span>
      </div>
    </Card.Body>

    <Card.Footer className="card-footer">
      <div className="action-buttons">
        <Button
          variant="primary"
          className="download-btn"
          href={document.fileUrl}
          download
        >
          <FiDownload className="action-icon" />
          <span className="button-text">
            Download
            <span className="download-count">({document.downloads})</span>
          </span>
        </Button>
        <Button
          variant="outline-dark"
          className="print-btn"
          onClick={() => { }/*handlePrint(document)*/}
        >
          <FiPrinter className="action-icon" />
          <span className="button-text">Print</span>
        </Button>
      </div>
    </Card.Footer>
  </Card>
);

export default DocumentCard;