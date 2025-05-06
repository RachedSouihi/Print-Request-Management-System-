import React, { useState, useEffect } from 'react';
import './profdocs.css';
import {
  getProfDocuments,
  updateProfDocument,
  deleteProfDocument,
  BackendDocument,
  BASE_URL
} from '../../store/profdocs';
import axios from 'axios';

interface Document {
  id: string;
  title: string;
  type: 'cours' | 'exercice' | 'examen';
  dateAdded: string;
  deadline?: string;
  fileUrl: string;
  description?: string;
  subject?: string;
  visibility?: string;
}

const ProfDocs: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [profId] = useState('current-prof-id'); // Vous devriez récupérer l'ID du prof depuis l'authentification
  const [showModal, setShowModal] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<Document | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Document, 'id'>>({
    title: '',
    type: 'cours',
    dateAdded: new Date().toISOString().split('T')[0],
    deadline: '',
    fileUrl: '',
    description: '',
    subject: '',
    visibility: 'public'
  });

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await getProfDocuments(profId);
        const formattedDocs = data.map((doc: BackendDocument) => ({
          id: doc.id,
          title: doc.title,
          type: doc.docType.toLowerCase() as 'cours' | 'exercice' | 'examen',
          dateAdded: doc.dateAdded,
          deadline: doc.deadline,
          fileUrl: doc.fileUrl,
          description: doc.description,
          subject: doc.subject,
          visibility: doc.visibility
        }));
        setDocuments(formattedDocs);
        setLoading(false);
      } catch (err) {
        setError('Failed to load documents');
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [profId]);

  const handleAddDocument = () => {
    setCurrentDoc(null);
    setFormData({
      title: '',
      type: 'cours',
      dateAdded: new Date().toISOString().split('T')[0],
      deadline: '',
      fileUrl: '',
      description: '',
      subject: '',
      visibility: 'public'
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
      fileUrl: doc.fileUrl,
      description: doc.description || '',
      subject: doc.subject || '',
      visibility: doc.visibility || 'public'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && currentDoc) {
        const updatedDoc = {
          title: formData.title,
          docType: formData.type.charAt(0).toUpperCase() + formData.type.slice(1) as 'Cours' | 'Exercice' | 'Examen',
          dateAdded: formData.dateAdded,
          deadline: formData.deadline || undefined,
          fileUrl: formData.fileUrl,
          description: formData.description,
          subject: formData.subject,
          visibility: formData.visibility
        };
        
        await updateProfDocument(currentDoc.id, updatedDoc);
        
        setDocuments(documents.map(doc =>
          doc.id === currentDoc.id ? { ...doc, ...formData } : doc
        ));
      } else {
        const newDoc = {
          title: formData.title,
          docType: formData.type.charAt(0).toUpperCase() + formData.type.slice(1) as 'Cours' | 'Exercice' | 'Examen',
          dateAdded: formData.dateAdded,
          deadline: formData.deadline || undefined,
          fileUrl: formData.fileUrl,
          description: formData.description,
          subject: formData.subject,
          visibility: formData.visibility
        };
        
        // Note: Vous devrez ajouter une fonction createProfDocument dans le service
        // Pour l'exemple, nous simulons la création
        const response = await axios.post(`${BASE_URL}/profdoccreate`, newDoc);
        const createdDoc = {
          ...newDoc,
          id: response.data.id,
          type: newDoc.docType.toLowerCase() as 'cours' | 'exercice' | 'examen'
        };
        
        setDocuments([...documents, createdDoc]);
      }
      setShowModal(false);
    } catch (err) {
      setError('Failed to save document');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteProfDocument(id);
        setDocuments(documents.filter(doc => doc.id !== id));
      } catch (err) {
        setError('Failed to delete document');
      }
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

  if (loading) {
    return <div className="prof-docs-container">Loading...</div>;
  }

  if (error) {
    return <div className="prof-docs-container">Error: {error}</div>;
  }

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

              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter document description"
                />
              </div>

              <div className="form-group">
                <label>Subject (optional)</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Enter subject"
                />
              </div>

              <div className="form-group">
                <label>Visibility</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
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
              {viewingDoc.description && (
                <div className="info-row">
                  <span className="info-label">Description:</span>
                  <span className="info-value">{viewingDoc.description}</span>
                </div>
              )}
              {viewingDoc.subject && (
                <div className="info-row">
                  <span className="info-label">Subject:</span>
                  <span className="info-value">{viewingDoc.subject}</span>
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