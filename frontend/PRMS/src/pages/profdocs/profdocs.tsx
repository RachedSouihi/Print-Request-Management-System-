import React, { useState } from 'react';
import './profdocs.css';

interface Document {
  id: string;
  title: string;
  type: 'cours' | 'exercice' | 'examen';
  dateAdded: string;
  deadline?: string;
  fileUrl: string;
}

const ProfDocs: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      title: 'Introduction to React',
      type: 'cours',
      dateAdded: '2023-10-15',
      fileUrl: '#'
    },
    {
      id: '2',
      title: 'Algorithm Lab',
      type: 'exercice',
      dateAdded: '2023-10-18',
      deadline: '2023-11-05',
      fileUrl: '#'
    },
    {
      id: '3',
      title: 'Final Exam',
      type: 'examen',
      dateAdded: '2023-11-01',
      deadline: '2023-12-15',
      fileUrl: '#'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<Document | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);

  const [formData, setFormData] = useState<Omit<Document, 'id'>>({
    title: '',
    type: 'cours',
    dateAdded: new Date().toISOString().split('T')[0],
    deadline: '',
    fileUrl: ''
  });

  const handleAddDocument = () => {
    setCurrentDoc(null);
    setFormData({
      title: '',
      type: 'cours',
      dateAdded: new Date().toISOString().split('T')[0],
      deadline: '',
      fileUrl: ''
    });
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleEditDocument = (doc: Document) => {
    setCurrentDoc(doc);
    setFormData({
      title: doc.title,
      type: doc.type,
      dateAdded: doc.dateAdded,
      deadline: doc.deadline || '',
      fileUrl: doc.fileUrl
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleViewDocument = (doc: Document) => {
    setViewingDoc(doc);
  };

  const handleCloseView = () => {
    setViewingDoc(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && currentDoc) {
      setDocuments(documents.map(doc =>
        doc.id === currentDoc.id ? { ...doc, ...formData } : doc
      ));
    } else {
      const newDoc: Document = {
        ...formData,
        id: Date.now().toString(),
        deadline: formData.deadline || undefined
      };
      setDocuments([...documents, newDoc]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter(doc => doc.id !== id));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cours': return '📚';
      case 'exercice': return '✍️';
      case 'examen': return '📝';
      default: return '📄';
    }
  };

  const translateType = (type: string) => {
    switch (type) {
      case 'cours': return 'COURSE';
      case 'exercice': return 'EXERCISE';
      case 'examen': return 'EXAM';
      default: return type.toUpperCase();
    }
  };

  return (
    <div className="prof-docs-container">
      <div className="header">
        <div className="header-content">
          <h1>My Documents</h1>
          <p className="subtitle">Manage your teaching materials</p>
        </div>
        <button className="add-button" onClick={handleAddDocument}>
          <span className="button-icon">+</span> Add Document
        </button>
      </div>

      <div className="documents-grid">
        {documents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>No documents yet</h3>
            <p>Add your first document by clicking the button above</p>
          </div>
        ) : (
          documents.map(doc => (
            <div className="document-card" key={doc.id}>
              <div className="document-type">
                <span className="type-icon">{getTypeIcon(doc.type)}</span>
                {translateType(doc.type)}
              </div>
              <div className="document-content">
                <h3>{doc.title}</h3>
                <div className="document-meta">
                  <div className="meta-item">
                    <span className="meta-icon">📅</span>
                    <span>Added: {doc.dateAdded}</span>
                  </div>
                  {doc.deadline && (
                    <div className="meta-item deadline">
                      <span className="meta-icon">⏰</span>
                      <span>Due: {doc.deadline}</span>
                    </div>
                  )}
                </div>
                <div className="document-actions">
                  <button 
                    className="action-button view-button" 
                    onClick={() => handleViewDocument(doc)}
                  >
                    <span className="button-icon">👁️</span> View
                  </button>
                  <button 
                    className="action-button edit-button" 
                    onClick={() => handleEditDocument(doc)}
                  >
                    <span className="button-icon">✏️</span> Edit
                  </button>
                  <button 
                    className="action-button delete-button" 
                    onClick={() => handleDelete(doc.id)}
                  >
                    <span className="button-icon">🗑️</span> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditMode ? 'Edit Document' : 'Add Document'}</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Enter document title"
                />
              </div>

              <div className="form-group">
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  required
                >
                  <option value="cours">Course</option>
                  <option value="exercice">Exercise</option>
                  <option value="examen">Exam</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date Added</label>
                  <input
                    type="date"
                    value={formData.dateAdded}
                    onChange={(e) => setFormData({ ...formData, dateAdded: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Deadline (optional)</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group file-upload">
                <label>File</label>
                <div className="upload-area">
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFormData({ ...formData, fileUrl: URL.createObjectURL(e.target.files[0]) });
                      }
                    }}
                    required={!isEditMode}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="upload-button">
                    <span className="upload-icon">📤</span>
                    <span>Choose a file</span>
                  </label>
                  {formData.fileUrl && (
                    <div className="file-preview">
                      <span className="file-icon">📄</span>
                      <span className="file-name">
                        {formData.fileUrl.split('/').pop() || 'Selected file'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  {isEditMode ? 'Update Document' : 'Add Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingDoc && (
        <div className="modal-overlay">
          <div className="view-modal-content">
            <div className="modal-header">
              <h2>{viewingDoc.title}</h2>
              <button className="close-button" onClick={handleCloseView}>
                &times;
              </button>
            </div>
            <div className="document-info">
              <div className="info-row">
                <span className="info-label">Type:</span>
                <span className="info-value">
                  {getTypeIcon(viewingDoc.type)} {translateType(viewingDoc.type)}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Added on:</span>
                <span className="info-value">{viewingDoc.dateAdded}</span>
              </div>
              {viewingDoc.deadline && (
                <div className="info-row">
                  <span className="info-label">Deadline:</span>
                  <span className="info-value deadline">{viewingDoc.deadline}</span>
                </div>
              )}
            </div>
            <div className="document-preview">
              <iframe 
                src={viewingDoc.fileUrl} 
                title={viewingDoc.title}
                className="preview-iframe"
              >
                Your browser does not support iframes.
              </iframe>
            </div>
            <div className="view-actions">
              <button className="close-view-button" onClick={handleCloseView}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfDocs;