import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Button, Form, Pagination, Badge } from "react-bootstrap";
import {
  FiFilter,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import "./Admin.scss";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import RequestDetailModal from "./RequestDetailsModal";
import {
  PrintRequest,
  addRequest,
  fetchPrintRequests,
  approvePrintRequest,
  updateRequestStatus,
  StatusTypes,
  getPrioritizedRequests,
  clearRequests,
  approveRejectRequests,
  

} from "../../store/requestSlice";
import { AppDispatch, RootState } from "../../store/store";
import { useToast } from "../../context/ToastContext";
import CustomToast from "../../common/Toast";
import Loading from "../../common/Loading";

interface Filters {
  status: string;
  urgency: string;
  date: string;
}

interface SortConfig {
  key: keyof PrintRequest;
  direction: "asc" | "desc";
}

const PrintRequestsTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const requests = useSelector(
    (state: RootState) => state.printRequest.requests
  );

  //const [requests, setRequests] = useState<PrintRequest[]>(sampleRequests);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({
    status: "",
    urgency: "",
    date: "",
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "date",
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showDetail, setShowDetail] = useState<PrintRequest | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const itemsPerPage = 10;

  const { toast, showToast, hideToast } = useToast();

  // Fetch print requests once when the component mounts
  useEffect(() => {
    dispatch(fetchPrintRequests());
  }, [dispatch]);

  // WebSocket
  useEffect(() => {
    const socket = new SockJS("http://localhost:9001/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("Connected to WebSocket");
        stompClient.subscribe("/topic/printRequests", (message) => {
          const updatedRequest = JSON.parse(message.body);
          console.log("Incoming request:", updatedRequest); // Log each incoming request
          dispatch(addRequest(updatedRequest)); // Dispatch action to add the new request to the Redux store
        });
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [dispatch]);

  // Function to approve a print request
  const handleApproveRejectRequest = (
    userId: string,
    requestId: string,
    status: StatusTypes
  ) => {
    if (userId && requestId) {
      dispatch(approvePrintRequest({ userId, requestId, status })).then(
        (action: any) => {
          console.log("approve actions: " + action.payload);

          if (action.type === "printRequest/approvePrintRequest/fulfilled") {
            showToast(
              action.payload.message,
              action.payload.status === 200 ? "success" : "danger"
            );
          }

          const statusHistory = {
            status: status,
            timestamp: new Date().toISOString(), // Add the current timestamp
          };

          // Dispatch an action to update the request in the Redux store
          dispatch(updateRequestStatus({ requestId, status, statusHistory }));

          setShowDetail(null);
        }
      );
    }
  };

  // Filtering and sorting logic
  const filteredRequests = requests
    .filter((request) => {
      return (
        (!filters.status || request.status === filters.status) &&
        (!filters.urgency || request.urgency === filters.urgency) &&
        (!filters.date || request.date === filters.date)
      );
    })
    .sort((a, b) => {
      if (sortConfig.direction === "asc") {
        return a[sortConfig.key]! > b[sortConfig.key]! ? 1 : -1;
      }
      return a[sortConfig.key]! < b[sortConfig.key]! ? 1 : -1;
    });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const [currentItems, setCurrentItems] = useState<PrintRequest[]>(
    filteredRequests.slice(indexOfFirstItem, indexOfLastItem)
  );

  useEffect(() => {
    setCurrentItems(filteredRequests.slice(indexOfFirstItem, indexOfLastItem));
  }, [requests, filters, sortConfig, currentPage]);

  const handleSort = (key: keyof PrintRequest) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleBulkAction = (action: string) => {
    // Implement bulk action logic
    setShowBulkConfirm(false);
  };

  const handleRowClick = (event: React.MouseEvent, request: PrintRequest) => {
    // Prevent modal from opening if the checkbox is clicked
    if ((event.target as HTMLElement).tagName !== "INPUT") {
      setShowDetail(request);
      console.log("clicked request: ", request);
    }
  };

  const handleArrangePriority = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    console.log("Arrange Priority: ", isChecked);

    // Set loading state
    setIsLoading(true);

    if (isChecked) {
      try {
        // Clear the requests state
        dispatch(clearRequests());

        const prioritizedRequests = await dispatch(getPrioritizedRequests()).unwrap();
        console.log("Prioritized Requests: ", prioritizedRequests);
        showToast("Requests prioritized successfully", "success");
      } catch (error: any) {
        console.error("Failed to fetch prioritized requests: ", error);
        showToast(error.message || "Failed to prioritize requests", "danger");
      } finally {
        setIsLoading(false); // Stop loading after the operation
      }
    } else {
      try {
        await dispatch(fetchPrintRequests()).unwrap();
        showToast("Requests reloaded successfully", "success");
      } catch (error: any) {
        console.error("Failed to reload requests: ", error);
        showToast(error.message || "Failed to reload requests", "danger");
      } finally {
        setIsLoading(false); // Stop loading after the operation
      }
    }
  };

  const approveRejectSelected = (status: boolean) => {
    if (selectedRequests.length === 0) {
      showToast("No requests selected", "warning");
      return;
    }

    dispatch(approveRejectRequests({ requestIds: selectedRequests, status: status ? "APPROVED" : "REJECTED"}))
      .unwrap()
      .then((response) => {
        showToast(
          response.message,
          response.status === 200 ? "success" : "danger"
        );

        // Update the status of the approved requests in the Redux store
        selectedRequests.forEach((requestId) => {
          const statusHistory = {
            status: "APPROVED" as StatusTypes,
            timestamp: new Date().toISOString(),
          };

          dispatch(
            updateRequestStatus({
              requestId,
              status: status ? "APPROVED" : "REJECTED",
              statusHistory,
            })
          );
        });

        // Clear the selected requests after approval
        setSelectedRequests([]);
      })
      .catch((error) => {
        showToast(error.message, "danger");
      });
  };

  return (
    <div className="print-requests-admin">
      <CustomToast
        show={toast.show}
        onClose={hideToast}
        type={toast.type}
        message={toast.message}
      />

      {/* Filters Section */}
      <div className="print-requests-admin-overview" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div className="filters-section">
          <Form.Group className="filter-group">
            <Form.Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
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
              onChange={(e) =>
                setFilters({ ...filters, urgency: e.target.value })
              }
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


        <div className="d-flex align-items-center">




            
          <Form.Check type="switch" onChange={handleArrangePriority} />

        </div>


      </div>

      {/* Requests Table */}
      <Table responsive hover className="requests-table">
        <thead>
          <tr>
            <th>
              <Form.Check
                type="checkbox"
                onChange={(e) => {
                  const allIds = currentItems
                    .map((item) => item.requestId)
                    .filter((id): id is string => id !== undefined);
                  setSelectedRequests(e.target.checked ? allIds : []);
                }}
              />
            </th>
            {[
              "Document Title",
              "User",
              "Date",
              "Copies",
              "Paper Type",
              "Status",
              "Urgency",
            ].map((header) => (
              <th
                key={header}
                onClick={() =>
                  handleSort(
                    header.toLowerCase().replace(" ", "_") as keyof PrintRequest
                  )
                }
              >
                {header}
                {sortConfig.key === header.toLowerCase().replace(" ", "_") && (
                  <span className="sort-indicator">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentItems.map((request) => (
            <tr
              key={request.requestId}
              className={`request-row ${request.urgency === "high" ? "high-priority" : ""
                }`}
              onClick={(event) => handleRowClick(event, request)}
            >
              <td>
                <Form.Check
                  type="checkbox"
                  checked={selectedRequests.includes(request.requestId ?? "")}
                  onChange={(e) => {
                    setSelectedRequests((prev) =>
                      e.target.checked
                        ? [
                          ...prev,
                          ...(request.requestId ? [request.requestId] : []),
                        ]
                        : prev.filter((id) => id !== request.requestId)
                    );
                  }}
                />
              </td>
              <td>{request.document.title}</td>
              <td>{request.user.email}</td>
              <td>{formatDateTime(request.date ?? "")}</td>
              <td>{request.copies}</td>
              <td>{request.paperType}</td>
              <td>
                {request.status && <StatusBadge status={request.status} />}
              </td>
              <td>
                <UrgencyIndicator urgency={request.urgency ?? ""} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <Pagination className="justify-content-center">
        {[
          ...Array(Math.ceil(filteredRequests.length / itemsPerPage)).keys(),
        ].map((number) => (
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
          <Button variant="success" onClick={() => approveRejectSelected(true)}>
            <FiCheckCircle /> Approve Selected
          </Button>
          <Button variant="danger" onClick={() => approveRejectSelected(false)/*handleBulkAction("reject")*/}>
            <FiXCircle /> Reject Selected
          </Button>
        </div>
      )}

      {/* Request Detail Modal */}
      <RequestDetailModal
        show={!!showDetail}
        request={showDetail}
        onHide={() => setShowDetail(null)}
        onApprove={handleApproveRejectRequest} // Pass the approve function to the modal
      />

      {isLoading && <Loading size="sm" color="accent" />}
    </div>
  );
};

// Helper Components
const StatusBadge: React.FC<{
  status: "pending" | "in-progress" | "completed" | "APPROVED" | "REJECTED";
}> = ({ status }) => {
  const statusConfig: Record<
    "pending" | "in-progress" | "completed" | "APPROVED" | "REJECTED",
    { label: string; variant: string }
  > = {
    pending: { label: "Pending", variant: "warning" },
    "in-progress": { label: "In Progress", variant: "primary" },
    completed: { label: "Completed", variant: "success" },
    APPROVED: { label: "Approved", variant: "success" },
    REJECTED: { label: "Rejected", variant: "danger" },
  };

  if (!statusConfig[status]) {
    return null; // Return null if the status is not valid
  }

  return (
    <Badge bg={statusConfig[status].variant}>
      {statusConfig[status].label}
    </Badge>
  );
};

const UrgencyIndicator: React.FC<{ urgency: string }> = ({ urgency }) => {
  return (
    <div className="urgency-indicator">
      {urgency === "high" && <FiAlertTriangle className="text-danger" />}
      <span className={`urgency-label ${urgency}`}>{urgency}</span>
    </div>
  );
};

const formatDateTime = (dateTime: string) => {
  const date = new Date(dateTime);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

export default PrintRequestsTable;
