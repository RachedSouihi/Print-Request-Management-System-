import { useState } from 'react';
import { Table, Button, Form, Pagination, Modal, Badge } from 'react-bootstrap';
import { FiFilter, FiAlertTriangle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import './Admin.scss';

import sampleRequests from './data';
import RequestDetailModal from './RequestDetailsModal';

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

interface Filters {
  status: string;
  urgency: string;
  date: string;
}

interface SortConfig {
  key: keyof PrintRequest;
  direction: 'asc' | 'desc';
}

const PrintRequestsTable: React.FC = () => {
  const [requests, setRequests] = useState<PrintRequest[]>(sampleRequests);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({
    status: '',
    urgency: '',
    date: '',
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showDetail, setShowDetail] = useState<PrintRequest | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState<boolean>(false);
  const itemsPerPage = 10;

  // Filtering and sorting logic
  const filteredRequests = requests.filter(request => {
    return (
      (!filters.status || request.status === filters.status) &&
      (!filters.urgency || request.urgency === filters.urgency) &&
      (!filters.date || request.date === filters.date)
    );
  }).sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key]! > b[sortConfig.key]! ? 1 : -1;
    }
    return a[sortConfig.key]! < b[sortConfig.key]! ? 1 : -1;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

  const handleSort = (key: keyof PrintRequest) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleBulkAction = (action: string) => {
    // Implement bulk action logic
    setShowBulkConfirm(false);
  };

  const handleRowClick = (event: React.MouseEvent, request: PrintRequest) => {
    // Prevent modal from opening if the checkbox is clicked
    if ((event.target as HTMLElement).tagName !== 'INPUT') {
      setShowDetail(request);
    }
  };

  return (
    <div className="print-requests-admin">
      {/* Filters Section */}
      <div className="filters-section">
        <Form.Group className="filter-group">
          <Form.Select
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="filter-group">
          <Form.Select
            value={filters.urgency}
            onChange={e => setFilters({ ...filters, urgency: e.target.value })}
          >
            <option value="">All Urgency Levels</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Form.Select>
        </Form.Group>

        <Button variant="outline-dark" className="action-button">
          <FiFilter /> Apply Filters
        </Button>
      </div>

      {/* Requests Table */}
      <Table responsive hover className="requests-table">
        <thead>
          <tr>
            <th>
              <Form.Check
                type="checkbox"
                onChange={e => {
                  const allIds = currentItems.map(item => item.id);
                  setSelectedRequests(e.target.checked ? allIds : []);
                }}
              />
            </th>
            {['Document Title', 'User', 'Date', 'Copies', 'Paper Type', 'Status', 'Urgency'].map((header) => (
              <th key={header} onClick={() => handleSort(header.toLowerCase().replace(' ', '_') as keyof PrintRequest)}>
                {header}
                {sortConfig.key === header.toLowerCase().replace(' ', '_') && (
                  <span className="sort-indicator">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentItems.map(request => (
            <tr
              key={request.id}
              className={`request-row ${request.urgency === 'high' ? 'high-priority' : ''}`}
              onClick={(event) => handleRowClick(event, request)}
            >
              <td>
                <Form.Check
                  type="checkbox"
                  checked={selectedRequests.includes(request.id)}
                  onChange={e => {
                    setSelectedRequests(prev =>
                      e.target.checked
                        ? [...prev, request.id]
                        : prev.filter(id => id !== request.id)
                    );
                  }}
                />
              </td>
              <td>{request.title}</td>
              <td>{request.user}</td>
              <td>{request.date}</td>
              <td>{request.copies}</td>
              <td>{request.paperType}</td>
              <td>
                <StatusBadge status={request.status} />
              </td>
              <td>
                <UrgencyIndicator urgency={request.urgency} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <Pagination className="justify-content-center">
        {[...Array(Math.ceil(filteredRequests.length / itemsPerPage)).keys()].map(number => (
          <Pagination.Item
            key={number + 1}
            active={number + 1 === currentPage}
            onClick={() => setCurrentPage(number + 1)}
          >
            {number + 1}
          </Pagination.Item>
        ))}
      </Pagination>

      {/* Bulk Actions */}
      {selectedRequests.length > 0 && (
        <div className="bulk-actions-bar">
          <Button variant="success" onClick={() => handleBulkAction('approve')}>
            <FiCheckCircle /> Approve Selected
          </Button>
          <Button variant="danger" onClick={() => handleBulkAction('reject')}>
            <FiXCircle /> Reject Selected
          </Button>
        </div>
      )}

      {/* Request Detail Modal */}
      <RequestDetailModal
        show={!!showDetail}
        request={showDetail}
        onHide={() => setShowDetail(null)}
      />
    </div>
  );
};

// Helper Components
const StatusBadge: React.FC<{ status: 'pending' | 'in-progress' | 'completed' }> = ({ status }) => {
  const statusConfig: Record<'pending' | 'in-progress' | 'completed', { label: string; variant: string }> = {
    pending: { label: 'Pending', variant: 'warning' },
    'in-progress': { label: 'In Progress', variant: 'primary' },
    completed: { label: 'Completed', variant: 'success' },
  };
  return <Badge bg={statusConfig[status].variant}>{statusConfig[status].label}</Badge>;
};

const UrgencyIndicator: React.FC<{ urgency: string }> = ({ urgency }) => {
  return (
    <div className="urgency-indicator">
      {urgency === 'high' && <FiAlertTriangle className="text-danger" />}
      <span className={`urgency-label ${urgency}`}>{urgency}</span>
    </div>
  );
};

export default PrintRequestsTable;