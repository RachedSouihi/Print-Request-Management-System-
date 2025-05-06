import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Breadcrumb } from 'react-bootstrap';
import { FiSearch, FiTrash2, FiEdit, FiShare2, FiFile } from 'react-icons/fi';
import './SavedDocuments.scss';
import { PrintRequestModal } from '../../components/PrintRequest/PrintRequest';
import { useToast } from '../../context/ToastContext';
import { Document, fetchSavedDocumentsThunk } from '../../store/documentsSlice';
import DocumentCard from '../../cards/DocumentCard';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { sendPrintRequest } from '../../store/requestSlice';
import CustomToast from '../../common/Toast';



const SavedDocumentsPage = () => {

  const [selectedDocument, setSelectedDocument] = useState<Document | null>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
 

  const dispatch = useDispatch<AppDispatch>();
  const documents = useSelector((state: RootState) => state.documents.savedDocuments);






  const { toast, showToast, hideToast } = useToast()


    const handlePrintSubmit = (values: any, isUpdate: boolean) => {
     
       
        dispatch(sendPrintRequest({
          copies: values.copies,
          color: values.printMode === 'color',
          notes: values.notes,
          document: selectedDocument as Document,
          paperType: { paperType: values.paperType }
        })).then((action: any) => {

          if (action.type === 'printRequest/sendPrintRequest/fulfilled') {
            console.log("okay")
            showToast('Print request sent successfully', 'success');
            setIsModalOpen(false);
           // dispatch(fetchPrintHistory());
          }
          if (action.type === 'printRequest/sendPrintRequest/rejected') {
            showToast('Submission failed', 'danger');
          }
        });
      
    };


  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredDocuments = documents ? documents : []
  const handleOpenModal = (doc: Document) => {
    setSelectedDocument(doc);
    setIsModalOpen(true);
  };



  useEffect(() => {

    console.log("selected document from saved docs: ", selectedDocument)
  }, [selectedDocument])

  const handleCloseModal = () => setIsModalOpen(false);


  const handleDelete = (docId: string) => {
   // setDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  const handleEdit = (docId: string) => {
    // Implement edit logic
  };

  const handleShare = (docId: string) => {
    // Implement share logic
  };

 


  useEffect(() => {
      dispatch(fetchSavedDocumentsThunk())
  }, [dispatch])

  return (
    <Container fluid className="saved-documents-page">
     

     <PrintRequestModal
             isOpen={isModalOpen}
             onClose={handleCloseModal}
             onSubmit={handlePrintSubmit}
             document={selectedDocument as Document}
     
           />

          <CustomToast
                show={toast.show}
                onClose={hideToast}
                type={toast.type}
                message={toast.message}
              />


      {/* Header Section */}
      <Row className="page-header">
        <Col xs={12} className="mb-4">
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item active>Saved Documents</Breadcrumb.Item>
          </Breadcrumb>
          <h1 className="page-title">Saved Documents</h1>
        </Col>

        <Col xs={12} md={8} lg={6} className="mb-4">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <Form.Control
              type="search"
              placeholder="Search saved documents..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </Col>
      </Row>

      {/* Documents Grid */}
      <Row className="documents-grid">
        {filteredDocuments ? (
          filteredDocuments.map(document => (
            <Col key={document.id} xs={12} sm={6} lg={5} xl={4} className="mb-4">
              <DocumentCard doc={document} handleOpenModal={handleOpenModal} dispatch={dispatch}/>
            </Col>
          ))
        ) : (
          <Col xs={12} className="empty-state">
            <FiFile className="empty-icon" />
            <h3>No saved documents found</h3>
            <p>Try adjusting your search terms or save new documents</p>
          </Col>
        )}
      </Row>
    </Container>
  );
};


export default SavedDocumentsPage

// SCSS Styles (SavedDocuments.scss)

