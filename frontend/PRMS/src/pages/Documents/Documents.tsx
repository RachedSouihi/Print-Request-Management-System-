import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Badge, InputGroup } from 'react-bootstrap';
import { FiSearch, FiDownload, FiStar, FiFilter, FiX, FiPrinter } from 'react-icons/fi';
import './Documents.scss';
import { PrintRequestModal } from '../../components/PrintRequest/PrintRequest';
import axios from 'axios';
import { Document } from '../../store/documentsSlice';
import { useToast } from '../../context/ToastContext';
import CustomToast from '../../common/Toast';
import DocumentCard from '../../cards/DocumentCard';





const sampleDocuments: Document[] = [
  {
    id: "117",
    title: "Grade 9 Mathematics Final Exam",
    docType: "exam",
    level: 9,
    subject: "math",
    field: "computer-science",
    date: "2023-05-15",
    downloads: 1423,
    fileUrl: "/docs/math-9-exam.pdf",
    rating: 4
  },
  {
    id: "2",
    title: "Grade 10 Physics Lab Series",
    docType: "serie",
    level: 10,
    subject: "physics",
    field: "experimental-science",
    date: "2023-09-01",
    downloads: 892,
    // keywords: ["mechanics", "thermodynamics"], // This document is about mechanics and thermodynamics.
    fileUrl: "/docs/physics-lab-series.pdf",
    rating: 4
  },
  {
    id: "3",
    title: "Grade 11 Biology Midterm Exam",
    docType: "exam",
    level: 11,
    subject: "biology",
    field: "experimental-science",
    date: "2023-11-10",
    downloads: 1204,
    fileUrl: "/docs/biology-midterm.pdf",
    rating: 5
  },
  {
    id: "4",
    title: "Grade 12 Computer Science Project Series",
    docType: "serie",
    level: 12,
    subject: "computer-science",
    field: "technical-science",
    date: "2023-03-22",
    downloads: 2345,
    // keywords: ["python", "algorithms"], // This document focuses on Python programming and algorithms.
    fileUrl: "/docs/cs-projects.pdf",
    rating: 4
  },
  {
    id: "5",
    title: "Grade 10 English Literature Exam",
    docType: "exam",
    level: 10,
    subject: "english",
    field: "humanities",
    date: "2023-06-05",
    downloads: 675,
    // keywords: ["shakespeare", "poetry"], // This document covers Shakespeare and poetry.
    fileUrl: "/docs/english-lit-exam.pdf",
    rating: 3
  },
  {
    id: "6",
    title: "Grade 9 Chemistry Practice Series",
    docType: "serie",
    level: 9,
    subject: "chemistry",
    field: "experimental-science",
    date: "2023-08-14",
    downloads: 987,
    // keywords: ["periodic-table", "reactions"], // This document explores the periodic table and chemical reactions.
    fileUrl: "/docs/chemistry-practice.pdf",
    rating: 4
  },
  {
    id: "7",
    title: "Grade 11 Advanced Mathematics Exam",
    docType: "exam",
    level: 11,
    subject: "math",
    field: "math",
    date: "2023-10-30",
    downloads: 1567,
    keywords: ["calculus", "vectors"], // This document includes calculus and vectors.
    fileUrl: "/docs/adv-math-exam.pdf",
    rating: 4
  },
  {
    id: "8",
    title: "Grade 12 Physics Final Exam",
    docType: "exam", // Changed "type" to "doc_type"
    level: 12,
    subject: "physics",
    field: "technical-science",
    date: "2023-05-20",
    downloads: 2045,
    keywords: ["quantum-physics", "optics"], // This document covers quantum physics and optics.
    fileUrl: "/docs/physics-final.pdf",
    rating: 5
  },
  {
    id: "9",
    title: "Grade 10 Biology Lab Series",
    docType: "serie", // Changed "type" to "doc_type"
    level: 10,
    subject: "biology",
    field: "experimental-science",
    date: "2023-04-18",
    downloads: 1123,
    keywords: ["microbiology", "dissection"], // This document involves microbiology and dissection.
    fileUrl: "/docs/bio-lab-series.pdf",
    rating: 4
  },
  {
    id: "10",
    title: "Grade 11 Computer Science Exam",
    docType: "exam", // Changed "type" to "doc_type"
    level: 11,
    subject: "computer-science",
    field: "technical-science",
    date: "2023-07-12",
    downloads: 1789,
    keywords: ["database", "networking"], // This document deals with databases and networking.
    fileUrl: "/docs/cs-exam.pdf",
    rating: 4
  },
  {
    id: "11",
    title: "Grade 9 English Grammar Series",
    docType: "serie", // Changed "type" to "doc_type"
    level: 9,
    subject: "english",
    field: "humanities",
    date: "2023-02-28",
    downloads: 543,
    keywords: ["tenses", "punctuation"], // This document focuses on tenses and punctuation.
    fileUrl: "/docs/english-grammar.pdf",
    rating: 3
  },
  {
    id: "12",
    title: "Grade 12 Mathematics Olympiad Series",
    docType: "serie", // Changed "type" to "doc_type"
    level: 12,
    subject: "math",
    field: "math",
    date: "2023-01-15",
    downloads: 1987,
    keywords: ["problem-solving", "algebra"], // This document is about problem-solving and algebra.
    fileUrl: "/docs/math-olympiad.pdf",
    rating: 5
  },
  {
    id: "13",
    title: "Grade 10 History Final Exam",
    docType: "exam", // Changed "type" to "doc_type"
    level: 10,
    subject: "history",
    field: "humanities",
    date: "2023-06-25",
    downloads: 432,
    keywords: ["world-war", "revolution"], // This document covers world war and revolution.
    fileUrl: "/docs/history-exam.pdf",
    rating: 3
  },
  {
    id: "14",
    title: "Grade 11 Physics Practical Series",
    docType: "serie", // Changed "type" to "doc_type"
    level: 11,
    subject: "physics",
    field: "experimental-science",
    date: "2023-03-05",
    downloads: 1321,
    keywords: ["electromagnetism", "kinematics"], // This document explores electromagnetism and kinematics.
    fileUrl: "/docs/physics-practicals.pdf",
    rating: 4
  },
  {
    id: "15",
    title: "Grade 12 Chemistry Final Exam",
    docType: "exam", // Changed "type" to "doc_type"
    level: 12,
    subject: "chemistry",
    field: "experimental-science",
    date: "2023-05-12",
    downloads: 1678,
    keywords: ["organic-chemistry", "stoichiometry"], // This document covers organic chemistry and stoichiometry.
    fileUrl: "/docs/chemistry-final.pdf",
    rating: 4
  },
  {
    id: "16",
    title: "Grade 9 Geography Project Series",
    docType: "serie", // Changed "type" to "doc_type"
    level: 9,
    subject: "geography",
    field: "humanities",
    date: "2023-10-01",
    downloads: 765,
    keywords: ["climate", "ecosystems"], // This document is about climate and ecosystems.
    fileUrl: "/docs/geography-projects.pdf",
    rating: 4
  },
  {
    id: "17",
    title: "Grade 10 Computer Science Basics Exam",
    docType: "exam", // Changed "type" to "doc_type"
    level: 10,
    subject: "computer-science",
    field: "technical-science",
    date: "2023-11-30",
    downloads: 1456,
    keywords: ["html", "css"], // This document covers HTML and CSS.
    fileUrl: "/docs/cs-basics-exam.pdf",
    rating: 4
  },
  {
    id: "18",
    title: "Grade 11 Literature Analysis Series",
    docType: "serie", // Changed "type" to "doc_type"
    level: 11,
    subject: "english",
    field: "humanities",
    date: "2023-04-22",
    downloads: 876,
    keywords: ["novels", "critical-theory"], // This document deals with novels and critical theory.
    fileUrl: "/docs/literature-analysis.pdf",
    rating: 4
  },
  {
    id: "19",
    title: "Grade 12 Advanced Physics Exam",
    docType: "exam", // Changed "type" to "doc_type"
    level: 12,
    subject: "physics",
    field: "technical-science",
    date: "2023-07-18",
    downloads: 2103,
    keywords: ["relativity", "nuclear-physics"], // This document explores relativity and nuclear physics.
    fileUrl: "/docs/adv-physics-exam.pdf",
    rating: 5
  },
  {
    id: "20",
    title: "Grade 9 Environmental Science Series",
    docType: "serie", // Changed "type" to "doc_type"
    level: 9,
    subject: "environmental-science",
    field: "experimental-science",
    date: "2023-12-05",
    downloads: 987,
    keywords: ["sustainability", "ecology"], // This document is about sustainability and ecology.
    fileUrl: "/docs/env-science-series.pdf",
    rating: 4
  }
];

const DocumentsPage: React.FC = () => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    "Math", "Physics", "SVT", "Computer science", "Technologies",
    "History Geography", "English", "French", "Economics",
    "Management", "Philosophy", "Islamic thought", "Spanish",
    "Arabic", "German", "Italian"
  ];

  const filteredDocuments = sampleDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.keywords.some(kw => kw.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLevel = !filters.level || doc.level === parseInt(filters.level);
    const matchesSubject = !filters.subject || doc.subject === filters.subject;
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