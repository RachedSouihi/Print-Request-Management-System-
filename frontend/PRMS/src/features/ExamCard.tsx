import { useState, useEffect, act } from "react";
import { Button, Card } from "react-bootstrap";
import { CiBookmark } from "react-icons/ci";
import { GoBookmark, GoBookmarkFill } from 'react-icons/go';
import { IoBookmark } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { saveDocument, removeSavedDocument, saveDocumentThunk } from '../store/documentsSlice';

export default function ExamCard({document, index, handleSaveDocument, showToast }: any) {
  const dispatch: AppDispatch = useDispatch();
  const savedDocuments = useSelector((state: RootState) => state.documents.savedDocuments);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Check if the document is in the savedDocuments list
    const isDocumentSaved = savedDocuments.some(doc => doc.id === document.id);
    setIsSaved(isDocumentSaved);
  }, [savedDocuments, document.id]);

  const handleSaveClick = () => {
    /*if (isSaved) {
      dispatch(removeSavedDocument(document.id));
    } else {*/
      dispatch(saveDocumentThunk(document.id)).then((action: any) => {

        console.log("save doc action: ", action);

        if(saveDocumentThunk.fulfilled.match(action)) {


          //dispatch(saveDocument(document));
          showToast(action.payload, 'success' );

        }







        
      })

      setIsSaved(!isSaved);


    }

  return (
    <Card className="course-card">
      <Card.Body className="d-flex flex-column justify-content-around">
        <Card.Title className="course-title">{document.subject}</Card.Title>
        <Card.Subtitle className="course-subtitle">
          {document.description}
        </Card.Subtitle>
        <Card.Text className="course-description">
          {document.docType}
        </Card.Text>
        {/* Save icon positioned at the bottom right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <Button variant="outline-primary preview-btn" size="sm">
            Preview
          </Button>
          {isSaved ? (
            <IoBookmark
              onClick={handleSaveClick}
              style={{ cursor: "pointer", color: "#6c757d" }}
              size="20px"
            />
          ) : (
            <CiBookmark
              onClick={handleSaveClick}
              style={{ cursor: "pointer", color: "#6c757d" }}
              size="20px"
            />
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
