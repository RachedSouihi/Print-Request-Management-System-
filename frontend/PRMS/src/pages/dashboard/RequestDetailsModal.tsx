import { Modal, Button, Form, Badge, Stack, ProgressBar } from 'react-bootstrap';
import { FiX, FiPrinter, FiClock, FiAlertCircle, FiEdit, FiCheckCircle, FiXCircle } from 'react-icons/fi';
//import './RequestDetailsModal.scss';

interface RequestDetailModalProps {
  show: boolean;
  request: PrintRequest | null;
  onHide: () => void;
}

interface PrintRequest {
  id: string;
  title: string;
  user: string;
  date: string;
  copies: number;
  paperType: string;
  inkUsage: string;
  status: 'pending' | 'in-progress' | 'completed';
  urgency: 'low' | 'medium' | 'high';
  statusHistory?: { status: string; timestamp: string }[];
}

const defaultRequest: PrintRequest = {
  id: '0',
  title: 'Default Title',
  user: 'default@user.com',
  date: '2023-01-01',
  copies: 1,
  paperType: 'A4',
  inkUsage: '0.00',
  status: 'pending',
  urgency: 'low',
  statusHistory: [],
};

const RequestDetailModal: React.FC<RequestDetailModalProps> = ({ show, request = defaultRequest, onHide }) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="request-detail-modal"
    >
      <Modal.Header className="modal-header">
        <Stack direction="horizontal" gap={3} className="w-100">
          <div className="flex-grow-1">
            <Modal.Title className="modal-title">
              {request?.title || 'Print Request Details'}
              {request?.urgency === 'high' && (
                <Badge bg="danger" className="ms-2">
                  <FiAlertCircle className="me-1" /> High Priority
                </Badge>
              )}
            </Modal.Title>
            <div className="text-muted modal-subtitle">
              Submitted by {request?.user} on {request?.date}
            </div>
          </div>
          <Button variant="link" onClick={onHide} className="close-button">
            <FiX size={24} />
          </Button>
        </Stack>
      </Modal.Header>

      <Modal.Body className="modal-body">
        <div className="detail-grid">
          {/* Left Column */}
          <div className="detail-section">
            <h5 className="section-title">Request Details</h5>
            <DetailItem label="Document Title" value={request?.title} />
            <DetailItem label="Submitted By" value={request?.user} />
            <DetailItem label="Submission Date" value={request?.date} />
            <DetailItem label="Current Status">
              <StatusIndicator status={request?.status} />
            </DetailItem>
          </div>

          {/* Right Column */}
          <div className="detail-section">
            <h5 className="section-title">Print Specifications</h5>
            <DetailItem label="Copies" value={request?.copies} />
            <DetailItem label="Paper Type" value={request?.paperType} />
            <DetailItem label="Ink Usage" value={`${request?.inkUsage ?? '0.00'} ml`} />
            <DetailItem label="Urgency Level">
              <UrgencyIndicator urgency={request?.urgency} />
            </DetailItem>
          </div>
        </div>

        {/* Status Timeline */}
        {request?.statusHistory && (
          <div className="status-timeline">
            <h5 className="section-title">Status History</h5>
            <div className="timeline-steps">
              {request.statusHistory.map((step, index) => (
                <TimelineStep key={index} {...step} isLast={index === request.statusHistory!.length - 1} />
              ))}
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="modal-footer">
        <Stack direction="horizontal" gap={3} className="w-100 justify-content-between">
          <Button variant="outline-secondary" onClick={onHide}>
            Close
          </Button>
          <Stack direction="horizontal" gap={2}>
            <Button variant="outline-primary">
              <FiEdit className="me-2" /> Reassign
            </Button>
            <Button variant="danger">
              <FiXCircle className="me-2" /> Reject
            </Button>
            <Button variant="success">
              <FiCheckCircle className="me-2" /> Approve
            </Button>
          </Stack>
        </Stack>
      </Modal.Footer>
    </Modal>
  );
};

// Helper Components
interface DetailItemProps {
  label: string;
  value?: string | number;
  children?: React.ReactNode;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, children }) => (
  <div className="detail-item">
    <span className="detail-label">{label}</span>
    {children || <span className="detail-value">{value}</span>}
  </div>
);

interface StatusIndicatorProps {
  status?: 'pending' | 'in-progress' | 'completed';
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const statusConfig = {
    pending: { label: 'Pending', color: 'warning' },
    'in-progress': { label: 'In Progress', color: 'primary' },
    completed: { label: 'Completed', color: 'success' }
  };
  
  return (
    <Badge pill bg={status ? statusConfig[status]?.color: 'Unknown'} className="status-badge">
      {status ? statusConfig[status]?.label : 'Unknown'}
    </Badge>
  );
};

interface TimelineStepProps {
  status: string;
  timestamp: string;
  isLast: boolean;
}

const TimelineStep: React.FC<TimelineStepProps> = ({ status, timestamp, isLast }) => (
  <div className={`timeline-step ${isLast ? 'current' : ''}`}>
    <div className="timeline-marker" />
    <div className="timeline-content">
      <div className="timeline-status">{status}</div>
      <div className="timeline-date">{timestamp}</div>
    </div>
    {!isLast && <div className="timeline-connector" />}
  </div>
);

interface UrgencyIndicatorProps {
  urgency?: 'low' | 'medium' | 'high';
}

const UrgencyIndicator: React.FC<UrgencyIndicatorProps> = ({ urgency }) => {
  return (
    <div className="urgency-indicator">
      {urgency === 'high' && <FiAlertCircle className="text-danger" />}
      <span className={`urgency-label ${urgency}`}>{urgency}</span>
    </div>
  );
};

export default RequestDetailModal;