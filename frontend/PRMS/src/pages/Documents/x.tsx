import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Badge, InputGroup } from 'react-bootstrap';
import { FiSearch, FiDownload, FiStar, FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import './Documents.scss';

interface Document {
  id: number;
  title: string;
  type: 'Exam' | 'Series';
  level: number;
  subject: string;
  field: string;
  date: string;
  downloads: number;
  keywords: string[];
  fileUrl: string;
  rating: number;
}

const DocumentsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    level: '',
    subject: '',
    field: '',
    sort: 'date'
  });
  const [documents, setDocuments] = useState<Document[]>(sampleDocuments);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(true);

  // Filter and sort documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.keywords.some(kw => kw.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLevel = !filters.level || doc.level === parseInt(filters.level);
    const matchesSubject = !filters.subject || doc.subject === filters.subject;
    const matchesField = !filters.field || doc.field === filters.field;
    
    return matchesSearch && matchesLevel && matchesSubject && matchesField;
  }).sort((a, b) => {
    if(filters.sort === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if(filters.sort === 'downloads') return b.downloads - a.downloads;
    if(filters.sort === 'rating') return b.rating - a.rating;
    return 0;
  });

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setFilters({ level: '', subject: '', field: '', sort: 'date' });
    setSearchQuery('');
  };

  const toggleFavorite = (docId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      newFavorites.has(docId) ? newFavorites.delete(docId) : newFavorites.add(docId);
      return newFavorites;
    });
  };

  return (
    <Container fluid className="documents-page">
      <Row>
        {/* Filters Sidebar */}
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
                  <option value="math">Mathematics</option>
                  <option value="physics">Physics</option>
                  <option value="biology">Biology</option>
                  <option value="english">English</option>
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

        {/* Main Content */}
        <Col md={showFilters ? 9 : 12} className="main-content">
          {/* Search and Sorting */}
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

          {/* Documents Grid */}
          {filteredDocuments.length > 0 ? (
            <Row className="documents-grid">
              {filteredDocuments.map(doc => (
                <Col key={doc.id} xs={12} sm={6} lg={4} xl={3}>
                  <Card className="document-card">
                    <div className="card-header">
                      <Badge bg={doc.type === 'Exam' ? 'primary' : 'secondary'}>{doc.type}</Badge>
                      <Button 
                        variant="link" 
                        onClick={() => toggleFavorite(doc.id)}
                        className={`favorite-btn ${favorites.has(doc.id) ? 'active' : ''}`}
                      >
                        <FiStar />
                      </Button>
                    </div>
                    
                    <Card.Body>
                      <Card.Title>{doc.title}</Card.Title>
                      <div className="document-meta">
                        <span className="subject">{doc.subject}</span>
                        <span className="grade">Grade {doc.level}</span>
                        <span className="date">{new Date(doc.date).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="keywords">
                        {doc.keywords.map(keyword => (
                          <Badge key={keyword} bg="light" text="dark">{keyword}</Badge>
                        ))}
                      </div>
                    </Card.Body>

                    <Card.Footer className="document-footer">
                      <Button variant="primary" href={doc.fileUrl} download>
                        <FiDownload /> Download ({doc.downloads})
                      </Button>
                      <div className="rating">
                        {Array.from({ length: 5 }, (_, i) => (
                          <FiStar key={i} className={i < doc.rating ? 'filled' : ''} />
                        ))}
                      </div>
                    </Card.Footer>
                  </Card>
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

// Sample Data
const sampleDocuments: Document[] = [
  {
    id: 1,
    title: "Grade 9 Mathematics Final Exam",
    type: "Exam",
    level: 9,
    subject: "math",
    field: "computer-science",
    date: "2023-05-15",
    downloads: 1423,
    keywords: ["algebra", "geometry", "trigonometry"],
    fileUrl: "/documents/math-9-exam.pdf",
    rating: 4
  },
  // Add more sample documents...
];

export default DocumentsPage;