import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Badge, InputGroup } from 'react-bootstrap';
import { FiSearch, FiDownload, FiStar, FiFilter, FiX, FiPrinter } from 'react-icons/fi';
import './Documents.scss';
import { PrintRequestModal } from '../../components/PrintRequest/PrintRequest';
import axios from 'axios';
import { Document, fetchDocuments } from '../../store/documentsSlice';
import { useToast } from '../../context/ToastContext';
import CustomToast from '../../common/Toast';
import DocumentCard from '../../cards/DocumentCard';


import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, RootState } from '../../store/store';








const DocumentsPage: React.FC = () => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>();
  const [isModalOpen, setIsModalOpen] = useState(false);


    const dispatch = useDispatch<AppDispatch>();
    const sampleDocuments: Document[] =  useSelector((state: RootState) => state.documents.documents);





  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    level: '',
    subject: '',
    field: '',
    sort: 'date'
  });
  const [showFilters, setShowFilters] = useState(true);

  const { toast, showToast, hideToast } = useToast()


  const subjects = [
    "Math", "Physics", "Science de la vie et de la terre", "Computer science", "Technologies",
    "History Geography", "English", "French", "Economics",
    "Management", "Philosophy", "Islamic thought", "Spanish",
    "Arabic", "German", "Italian"
  ];

  const filteredDocuments = sampleDocuments.filter(doc => {
        const matchesSearch = doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) 

    //const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) 
      //doc.keywords.some(kw => kw.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLevel = !filters.level || doc.level === parseInt(filters.level);
    const matchesSubject = !filters.subject || doc.subject.toLocaleLowerCase() == filters.subject;
    const matchesField = !filters.field || doc.field === filters.field;

    return matchesSearch && matchesLevel && matchesSubject && matchesField;
  }).sort((a, b) => {
    if (filters.sort === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (filters.sort === 'downloads') return b.downloads - a.downloads;
    if (filters.sort === 'rating') return b.rating - a.rating;
    return 0;
  });

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setFilters({ level: '', subject: '', field: '', sort: 'date' });
    setSearchQuery('');
  };

  const handleOpenModal = (doc: Document) => {
    setSelectedDocument(doc);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (data: any) => {
    console.log('Print Request Submitted:', data);

    try {
      const formData = new FormData();
      formData.append('copies', data.copies);
      formData.append('printMode', data.printMode);
      formData.append('notes', data.notes);
      //formData.append('file', data.file);
      //formData.append('documentName', selectedDocument);

      const response = await axios.post(`${import.meta.env.VITE_PRINT_REQUEST_URL}`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        console.log('Print request successful:', response.data);
      } else {
        console.error('Print request failed:', response.data);
      }
    } catch (error) {
      console.error('Error submitting print request:', error);
    }

    //handleCloseModal();
  };



  useEffect(() => {

    dispatch(fetchDocuments()).then((action: any) => {

    })
  }, [])
  return (
    <Container fluid className="documents-page">


      <CustomToast
        show={toast.show}
        onClose={hideToast}
        type={toast.type}
        message={toast.message}
      />

      <PrintRequestModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        // onSubmit={handleSubmit}
        showToast={showToast}

        document={selectedDocument as Document}
      //documentName="Mathematics Basics"
      //documentInfo="Final exam version - Algebra section"
      />

      <Row>
        <Col md={3} className={`filters-sidebar ${showFilters ? 'open' : 'collapsed'}`}>
          <div className="sidebar-header">
            <h3>Filters</h3>
            <Button variant="link" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? <FiX /> : <FiFilter />}
            </Button>
          </div>

          {showFilters && (
            <div className="filter-content">
              <Form.Group className="filter-group">
                <Form.Label>Education Level</Form.Label>
                <Form.Select
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                >
                  <option value="">All Levels</option>
                  {[1, 2, 3, 4].map(level => (
                    <option key={level} value={level}>Grade {level}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="filter-group">
                <Form.Label>Subject</Form.Label>
                <Form.Select
                  value={filters.subject}
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
                >
                  <option value="">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject.toLowerCase()}>{subject}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="filter-group">
                <Form.Label>Field</Form.Label>
                <Form.Select
                  value={filters.field}
                  onChange={(e) => handleFilterChange('field', e.target.value)}
                >
                  <option value="">All Fields</option>
                  <option value="computer-science">Computer Science</option>
                  <option value="math">Mathematics</option>
                  <option value="technical-science">Technical Science</option>
                  <option value="experimental-science">Experimental Science</option>
                </Form.Select>
              </Form.Group>

              <Button variant="outline-secondary" onClick={clearFilters} className="clear-filters">
                <FiX /> Clear All Filters
              </Button>
            </div>
          )}
        </Col>

        <Col md={showFilters ? 9 : 12} className="main-content">
          <div className="search-controls">
            <InputGroup className="search-bar">
              <InputGroup.Text>
                <FiSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>

            <Form.Select
              className="sort-select"
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="date">Sort by Date</option>
              <option value="downloads">Sort by Popularity</option>
              <option value="rating">Sort by Rating</option>
            </Form.Select>
          </div>
          {filteredDocuments.length > 0 ? (
            <Row className="documents-grid">
              {filteredDocuments.map(doc => (
                <Col key={doc.id} xs={12} sm={6} lg={4} xl={4}>
                  <DocumentCard document={doc} handleOpenModal={handleOpenModal} />
                </Col>
              ))}
            </Row>
          ) : (
            <div className="empty-state">
              <h3>No documents found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default DocumentsPage;