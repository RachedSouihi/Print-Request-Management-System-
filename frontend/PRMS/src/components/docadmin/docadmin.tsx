import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './design.css';
import {
  fetchDocuments,
  uploadDocument,
  clearUploadStatus,
  Document,
  fetchDocumentsForAdmin,
} from '../../store/adminDocApi';

const DocAdmin: React.FC = () => {
  const dispatch = useDispatch<any>();
  const documentsState = useSelector((state: any) => state.admindoc || {});
  const {
    documents = [],
    loading = false,
    error = null,
    uploadSuccess = false,
  } = documentsState;

  const [activeTab, setActiveTab] = useState<'documents' | 'add'>('documents');
  const [showOnlyMyDocuments, setShowOnlyMyDocuments] = useState(false);
  const currentUser = 'Mr. Dupont';

  const [newDocument, setNewDocument] = useState<{
    title: string;
    type: 'Administrative' | 'Educational';
    visibility: 'For all professors' | 'For admin only';
    file: File | null;
    message: string;
  }>({
    title: '',
    type: 'Administrative',
    visibility: 'For all professors',
    file: null,
    message: '',
  });

  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setIsChecked(checked);
    setShowOnlyMyDocuments(checked);

    if (checked) {
      dispatch(fetchDocumentsForAdmin());
    } else {
      dispatch(fetchDocuments());
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewDocument({ ...newDocument, file: e.target.files[0] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { title, type, visibility, message, file } = newDocument;
    if (file) {
      dispatch(uploadDocument({ title, type, visibility, message, file }));
      setActiveTab('documents');
      dispatch(clearUploadStatus());
    }
  };

  const getFileIcon = (fileName: string) => {
    if (!fileName) return '📁';
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      default:
        return '📁';
    }
  };

  const filteredDocuments = documents;

  const handlePrint = (fileUrl: string) => {
    const printWindow = window.open(fileUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="doc-admin-container">
      <header className="doc-header">
        <h1 className="doc-title">Administrative and Educational Documents</h1>
      </header>

      <div className="doc-tabs">
        <nav className="tab-nav">
          <button
            onClick={() => setActiveTab('documents')}
            className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
          >
            <span className="tab-icon">📚</span>
            <span className="tab-label">Documents</span>
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
          >
            <span className="tab-icon">➕</span>
            <span className="tab-label">Add</span>
          </button>
        </nav>
      </div>

      {activeTab === 'documents' ? (
        <div className="documents-container">
          <div className="documents-header">
            <h2 className="section-title">Shared Documents</h2>
            <div className="filter-container">
              <label className="filter-label">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                />{' '}
                Show only my documents
              </label>
            </div>
          </div>

          <div className="table-container">
            <table className="documents-table">
              <thead>
                <tr>
                  <th className="table-header">Document</th>
                  <th className="table-header">Author</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Visibility</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc: Document) => (
                  <tr key={doc.id} className="table-row">
                    <td className="table-cell document-cell">
                      <div className="document-info">
                        <span className="file-icon">{getFileIcon(doc.file)}</span>
                        <div className="document-title">{doc.title}</div>
                      </div>
                    </td>
                    <td className="table-cell">{doc.author}</td>
                    <td className="table-cell">
                      <span className={`type-badge ${doc.type.toLowerCase()}`}>{doc.type}</span>
                    </td>
                    <td className="table-cell">
                      <span
                        className={`visibility-badge ${doc.visibility
                          ?.toLowerCase()
                          .replace(/ /g, '-')}`}
                      >
                        {doc.visibility}
                      </span>
                    </td>
                    <td className="table-cell">
                      {new Date(doc.date).toLocaleDateString('en-US')}
                    </td>
                    <td className="table-cell actions-cell">
                      <a
                        href={`http://localhost:8082/doc/files/${doc.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-button view-button"
                      >
                        👁️ View
                      </a>
                      <button
                        onClick={() => handlePrint(`http://localhost:8082/doc/files/${doc.file}`)}
                        className="action-button print-button"
                      >
                        🖨️ Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="add-document-container">
          <h2 className="section-title">Add New Document</h2>

          <form className="document-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Document Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="ex: Class council report"
                value={newDocument.title}
                onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Document Type *</label>
              <select
                className="form-select"
                value={newDocument.type}
                onChange={(e) =>
                  setNewDocument({ ...newDocument, type: e.target.value as 'Administrative' | 'Educational' })
                }
                required
              >
                <option value="Administrative">Administrative</option>
                <option value="Educational">Educational</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Visibility *</label>
              <select
                className="form-select"
                value={newDocument.visibility}
                onChange={(e) =>
                  setNewDocument({ ...newDocument, visibility: e.target.value as 'For all professors' | 'For admin only' })
                }
                required
              >
                <option value="For all professors">For all professors</option>
                <option value="For admin only">For admin only</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">File *</label>
              <div className="file-upload">
                <div className="upload-content">
                  <div className="upload-text">
                    <label className="upload-label">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        className="file-input"
                        onChange={handleFileChange}
                        required
                      />
                    </label>
                    <p>or drag and drop</p>
                  </div>
                  <p className="upload-hint">PDF, DOCX, XLSX up to 10MB</p>
                  {newDocument.file && (
                    <p className="file-selected">Selected: {newDocument.file.name}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea
                rows={3}
                className="form-textarea"
                placeholder="Optional message"
                value={newDocument.message}
                onChange={(e) => setNewDocument({ ...newDocument, message: e.target.value })}
              ></textarea>
            </div>

            <button
  type="button"
  className="scan-button"
  onClick={async () => {
    try {
      // Vérification de la détection du scanner avant de lancer le scan
      const checkScannerResponse = await fetch('http://localhost:8082/doc/check-scanner', {
        method: 'GET',
      });

      // Si le scanner n'est pas détecté
      if (!checkScannerResponse.ok) {
        const errorMessage = await checkScannerResponse.text();
        alert('Scanner non détecté : ' + errorMessage);
        return; // On arrête la procédure si le scanner n'est pas trouvé
      }

      // Si le scanner est détecté, lancer le scan
      const response = await fetch('http://localhost:8082/doc/scan', {
        method: 'POST',
      });

      if (response.ok) {
        alert('Scan lancé avec succès !');
        dispatch(fetchDocuments());
      } else {
        const text = await response.text();
        alert('Échec du scan : ' + text);
      }
    } catch (error) {
      alert('Erreur lors de la requête scan : ' + (error).message);
    }
  }}
>
  📠 Launch Scanner
</button>




            <button type="submit" className="submit-button">
              Upload Document
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default DocAdmin;
