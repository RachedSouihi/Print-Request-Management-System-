import { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Breadcrumb } from 'react-bootstrap';
import { FiSearch, FiTrash2, FiEdit, FiShare2, FiFile } from 'react-icons/fi';
import './SavedDocuments.scss';
import { PrintRequestModal } from '../../components/PrintRequest/PrintRequest';
import { useToast } from '../../context/ToastContext';
import { Document } from '../../store/documentsSlice';
import DocumentCard from '../../cards/DocumentCard';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';



const SavedDocumentsPage = () => {

  const [selectedDocument, setSelectedDocument] = useState<Document | null>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  /*const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'doc-101',
      title: 'Algebra I Practice Test - Midterm',
      level: 9,
      subject: 'Mathematics',
      field: 'Algebra',
      description: 'Practice midterm exam covering basic algebraic equations and inequalities.',
      doc_type: 'exam',
      date: '2024-08-20',
      downloads: 152,
      fileUrl: '/docs/algebra1-midterm-practice.pdf',
      rating: 4.5,
    },
    {
      id: 'doc-102',
      title: 'Introduction to Geometry - Serie 1',
      level: 10,
      subject: 'Mathematics',
      field: 'Geometry',
      description: 'First serie of exercises on fundamental geometric shapes and theorems.',
      doc_type: 'serie',
      date: '2024-09-05',
      downloads: 210,
      fileUrl: '/docs/geometry-serie1.pdf',
      rating: 4.8,
    },
    {
      id: 'doc-201',
      title: 'Essay Writing Guide - Argumentative Essays',
      level: 11,
      subject: 'English',
      field: 'Writing',
      description: 'Comprehensive guide on how to write effective argumentative essays for high school students.',
      doc_type: 'serie',
      date: '2024-07-15',
      downloads: 305,
      fileUrl: '/docs/essay-guide-argumentative.pdf',
      rating: 4.2,
    },
    {
      id: 'doc-202',
      title: 'Romeo and Juliet - Act 1 Quiz',
      level: 10,
      subject: 'English',
      field: 'Literature',
      description: 'Short quiz to assess understanding of Act 1 of Romeo and Juliet.',
      doc_type: 'exam',
      date: '2024-09-10',
      downloads: 188,
      fileUrl: '/docs/romeo-juliet-act1-quiz.pdf',
      rating: 4.0,
    },
    {
      id: 'doc-301',
      title: 'Chemical Reactions - Balancing Equations Worksheet',
      level: 10,
      subject: 'Chemistry',
      field: 'Reactions',
      description: 'Worksheet for practicing balancing chemical equations, including answer key.',
      doc_type: 'serie',
      date: '2024-08-28',
      downloads: 255,
      fileUrl: '/docs/chemistry-balancing-equations.pdf',
      rating: 4.6,
    },
    {
      id: 'doc-302',
      title: 'Periodic Table - Element Properties Exam',
      level: 9,
      subject: 'Chemistry',
      field: 'Periodic Table',
      description: 'Exam testing knowledge of the periodic table and properties of elements.',
      doc_type: 'exam',
      date: '2024-09-15',
      downloads: 120,
      fileUrl: '/docs/chemistry-periodic-table-exam.pdf',
      rating: 3.9,
    },
    {
      id: 'doc-401',
      title: 'World War II - Causes and Effects Summary',
      level: 11,
      subject: 'History',
      field: 'Modern History',
      description: 'Summary document outlining the main causes and effects of World War II.',
      doc_type: 'serie',
      date: '2024-07-22',
      downloads: 280,
      fileUrl: '/docs/ww2-summary.pdf',
      rating: 4.7,
    },
    {
      id: 'doc-402',
      title: 'The French Revolution - Key Figures Quiz',
      level: 10,
      subject: 'History',
      field: 'European History',
      description: 'Quiz to identify key figures and events of the French Revolution.',
      doc_type: 'exam',
      date: '2024-09-01',
      downloads: 195,
      fileUrl: '/docs/french-revolution-quiz.pdf',
      rating: 4.1,
    },
    {
      id: 'doc-501',
      title: 'Cell Biology - Organelles and Functions Guide',
      level: 9,
      subject: 'Biology',
      field: 'Cell Biology',
      description: 'Informative guide detailing the different organelles within a cell and their functions.',
      doc_type: 'serie',
      date: '2024-08-10',
      downloads: 320,
      fileUrl: '/docs/cell-biology-organelles.pdf',
      rating: 4.9,
    },
    {
      id: 'doc-502',
      title: 'Genetics - Punnett Square Practice Problems',
      level: 10,
      subject: 'Biology',
      field: 'Genetics',
      description: 'Practice problems using Punnett squares to predict genetic inheritance.',
      doc_type: 'serie',
      date: '2024-09-25',
      downloads: 240,
      fileUrl: '/docs/genetics-punnett-squares.pdf',
      rating: 4.4,
    },
    {
      id: 'doc-601',
      title: 'Spanish Verbs - Present Tense Conjugation Exercises',
      level: 9,
      subject: 'Spanish',
      field: 'Grammar',
      description: 'Exercises to practice conjugation of regular and irregular verbs in the present tense in Spanish.',
      doc_type: 'serie',
      date: '2024-07-30',
      downloads: 270,
      fileUrl: '/docs/spanish-verbs-present-tense.pdf',
      rating: 4.5,
    },
    {
      id: 'doc-602',
      title: 'Spanish Vocabulary - Food and Meals Quiz',
      level: 10,
      subject: 'Spanish',
      field: 'Vocabulary',
      description: 'Quiz testing vocabulary related to food and meals in Spanish.',
      doc_type: 'exam',
      date: '2024-09-08',
      downloads: 160,
      fileUrl: '/docs/spanish-food-vocabulary-quiz.pdf',
      rating: 3.8,
    },
    {
      id: 'doc-701',
      title: 'Python Programming - Basic Syntax Tutorial',
      level: 11,
      subject: 'Computer Science',
      field: 'Programming',
      description: 'Tutorial covering the basic syntax and data types in Python programming language.',
      doc_type: 'serie',
      date: '2024-08-15',
      downloads: 350,
      fileUrl: '/docs/python-syntax-tutorial.pdf',
      rating: 5.0,
    },
    {
      id: 'doc-702',
      title: 'Algorithms - Sorting Algorithms Exam',
      level: 12,
      subject: 'Computer Science',
      field: 'Algorithms',
      description: 'Exam testing knowledge of different sorting algorithms and their efficiency.',
      doc_type: 'exam',
      date: '2024-09-20',
      downloads: 135,
      fileUrl: '/docs/algorithms-sorting-exam.pdf',
      rating: 4.3,
    },
    {
      id: 'doc-801',
      title: 'Economics - Supply and Demand Principles Explained',
      level: 11,
      subject: 'Economics',
      field: 'Microeconomics',
      description: 'Explanation of the basic principles of supply and demand in microeconomics.',
      doc_type: 'serie',
      date: '2024-07-28',
      downloads: 290,
      fileUrl: '/docs/economics-supply-demand.pdf',
      rating: 4.8,
    },
    {
      id: 'doc-802',
      title: 'Market Structures - Monopoly vs Competition Quiz',
      level: 12,
      subject: 'Economics',
      field: 'Market Structures',
      description: 'Quiz differentiating between monopoly and perfect competition market structures.',
      doc_type: 'exam',
      date: '2024-09-03',
      downloads: 170,
      fileUrl: '/docs/economics-market-structures-quiz.pdf',
      rating: 4.2,
    },
    {
      id: 'doc-901',
      title: 'Geography - World Climates Overview',
      level: 9,
      subject: 'Geography',
      field: 'Climatology',
      description: 'Overview of different climate zones around the world and their characteristics.',
      doc_type: 'serie',
      date: '2024-08-05',
      downloads: 310,
      fileUrl: '/docs/geography-world-climates.pdf',
      rating: 4.7,
    },
    {
      id: 'doc-902',
      title: 'Map Reading Skills - Latitude and Longitude Exam',
      level: 10,
      subject: 'Geography',
      field: 'Cartography',
      description: 'Exam testing skills in reading maps using latitude and longitude coordinates.',
      doc_type: 'exam',
      date: '2024-09-12',
      downloads: 145,
      fileUrl: '/docs/geography-map-reading-exam.pdf',
      rating: 4.0,
    }
    // Add more diverse documents following the same pattern
  ]);
*/
  const dispatch = useDispatch();
  const documents = useSelector((state: RootState) => state.documents.savedDocuments);




  const { toast, showToast, hideToast } = useToast()



  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredDocuments = documents
  const handleOpenModal = (doc: Document) => {
    setSelectedDocument(doc);
    setIsModalOpen(true);
  };

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

  return (
    <Container fluid className="saved-documents-page">
      <PrintRequestModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        // onSubmit={handleSubmit}
        showToast={showToast}

        document={selectedDocument as Document}
      //documentName="Mathematics Basics"
      //documentInfo="Final exam version - Algebra section"
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
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map(document => (
            <Col key={document.id} xs={12} sm={6} lg={5} xl={4} className="mb-4">
              <DocumentCard document={document} handleOpenModal={handleOpenModal} />
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

