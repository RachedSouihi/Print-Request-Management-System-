import { Badge, Button, Card } from "react-bootstrap";
import { FiDownload, FiPrinter, FiStar } from "react-icons/fi";
import { Document, downloadDocumentThunk, increaseDownloads } from "../store/documentsSlice";

import "./DocumentCard.scss";

const DocumentCard = ({
  doc,
  handleOpenModal,
  dispatch
}: {
  doc: Document;
  handleOpenModal: any;

  dispatch?: any;
}) => {





 
  const handleDownload = async () => {
    try {
      const { blob } = await dispatch(downloadDocumentThunk(doc.id)).then(
        (action: any) => {
          console.log("Download action: ", action);
          return action.payload; // Extract the payload containing the blob and documentId
        }
      );

      // Create a URL for the blob and trigger the download
      const url = window.URL.createObjectURL(blob); // Use the blob from the payload
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.title; // Set the file name for the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Clean up the URL object
    } catch (error) {
      console.error('Failed to download document:', error);
    }
  };


  return(



  
  // Update the Card component
  <Card
    className="document-card h-100 d-flex flex-column"

  >
    {" "}
    <div className="card-header">
      <Badge
        bg={doc.docType === "principal" ? "dark" : ""}
        style={{
          color: doc.docType === "serie" ? "#000" : "",
          border: doc.docType === "serie" ? "1px solid #000" : "",
        }}
        className="type-label"
      >
        {doc.docType}
      </Badge>
      <div className="document-meta">
        <span className="subject">{doc.subject!.name}</span>
        <span className="separator">•</span>
        <span className="level">Grade {doc.level}</span>
      </div>
    </div>
    <Card.Body className="card-body">
      <h3 className="document-title">
        {
          //doc.title ||
          //doc.field + " " + doc.level + " " + doc.subject  +

          doc.description
        }
      </h3>

      <div className="rating-container">
        {[...Array(5)].map((_, index) => (
          <FiStar
            key={index}
            className={`star ${index < doc.rating ? "filled" : ""}`}
          />
        ))}
        <span className="rating-text">({doc.rating}/5)</span>
      </div>
    </Card.Body>
    <Card.Footer className="card-footer">
      <div className="action-buttons">
        <Button
          variant="primary"
          className="download-btn"
          href={doc.fileUrl}
          onClick={handleDownload}
        >
          <FiDownload className="action-icon" />
          <span className="button-text">
            Download
            <span className="download-count">({doc.downloads})</span>
          </span>
        </Button>
        <Button
          variant="outline-dark"
          className="print-btn"
          onClick={() => handleOpenModal(doc)}        >
          <FiPrinter className="action-icon" />
          <span className="button-text">Print</span>
        </Button>
      </div>
    </Card.Footer>
  </Card>

      )
};

export default DocumentCard;
