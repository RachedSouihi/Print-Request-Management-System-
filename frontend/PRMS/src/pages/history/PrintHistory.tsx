import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Form,
  InputGroup,
  Card,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./PrintHistory.css";
import { FaSearch, FaFileExport, FaPlus } from "react-icons/fa";

import { AppDispatch, RootState } from "../../store/store";
import { fetchPrintHistory } from "../../store/historySlice";
import { deletePrintRequest, fetchPrintRequests, PrintRequest, sendPrintRequest, updatePrintRequest } from "../../store/requestSlice";
import { PrintRequestModal } from "../../components/PrintRequest/PrintRequest";
import { useToast } from "../../context/ToastContext";
import CustomToast from "../../common/Toast";



const PrintHistory: React.FC = () => {

  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PrintRequest | null>(null);
    const { toast, showToast, hideToast } = useToast()
  



  const dispatch = useDispatch<AppDispatch>();
  const data = useSelector((state: RootState) => state.printRequest.requests as PrintRequest[]);
  console.log("Données dans Redux:", data);

  useEffect(() => {
    dispatch(fetchPrintRequests());
  }, [dispatch]);



  // États pour la recherche et les filtres
  const [searchTerm, setSearchTerm] = useState<string>("");  // Recherche générale
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");





  // handler function to update print request
const handlePrintSubmit = (values: any, isUpdate: boolean) => {
  if (isUpdate && selectedRequest) {
    const updatedRequest = {
      ...selectedRequest,
      copies: values.copies,
      color: values.printMode === 'color',
      instructions: values.notes,
      paperType: values.paperType
    };
    
    dispatch(updatePrintRequest(updatedRequest))
      .then((action) => {
        if (action.type === 'printRequest/updatePrintRequest/fulfilled') {
          showToast('Request updated successfully', 'success');
          setShowModal(false);
        }
        if (action.type === 'printRequest/updatePrintRequest/rejected') {
          showToast('Update failed', 'danger');
        }
      });
  } else {
    dispatch(sendPrintRequest({
      copies: values.copies,
      color: values.printMode === 'color',
      notes: values.notes,
      document: selectedRequest!.document,
      paperType: { paperType: values.paperType }
    })).then((action) => {
      if (action.type === 'printRequest/sendPrintRequest/fulfilled') {
        showToast('Print request sent successfully', 'success');
        setShowModal(false);
      }
      if (action.type === 'printRequest/sendPrintRequest/rejected') {
        showToast('Submission failed', 'danger');
      }
    });
  }
};






  // Gestion du changement de la date de début
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(event.target.value);
  };

  // Gestion du changement de la date de fin
  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
  };

  // Mise à jour de la recherche par terme
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Mise à jour du filtre d'état
  const handleStatusFilter = (newStatus: string) => {
    setStatusFilter(newStatus);
  };

  // Filtrer les données en fonction de la recherche, du filtre d'état, et des dates
  const filteredData = (data ?? []).filter((record) => {
    const documentName = record.document?.description || ""; // Utilisation de la description pour "Document Name"
    const matchesSearch = documentName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ? true : record.status === statusFilter;

    let matchesDate = true;

    // Vérifier si des dates de début et de fin ont été sélectionnées
    if (startDate && endDate) {
      // Convertir la date du document en date sans heure
      const recordDate = new Date(record.date || "");
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Réinitialiser l'heure de chaque date pour ne comparer que la partie "date"
      recordDate.setHours(0, 0, 0, 0); // Réinitialise l'heure de la date du document
      start.setHours(0, 0, 0, 0); // Réinitialise l'heure de la date de début
      end.setHours(23, 59, 59, 999); // Réinitialise l'heure de la date de fin pour inclure toute la journée

      // Comparer uniquement les dates sans l'heure
      matchesDate = recordDate >= start && recordDate <= end;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });


  // Add handlers
  const handleDelete = (requestId: string) => {
    if (window.confirm("Are you sure you want to cancel this request?")) {
      dispatch(deletePrintRequest(requestId)).then((action: any) => {
        if(action.type === "printRequest/deletePrintRequest/fulfilled") {
          showToast("Print request cancelled successfully", "success");
        }
        if (action.type === "printRequest/deletePrintRequest/rejected") {
          showToast("Failed to cancel print request", "danger");
        }
        console.log("Delete action: ", action);
      });
    }
  };

  const handleUpdate = (request: PrintRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
  };


  return (
    <Container fluid className="print-history-container">
<CustomToast
        show={toast.show}
        onClose={hideToast}
        type={toast.type}
        message={toast.message}
      />

{showModal && (
  <PrintRequestModal
    isOpen={showModal}
    onClose={() => setShowModal(false)}
    document={selectedRequest?.document!}
    existingRequest={selectedRequest!}
    onSubmit={handlePrintSubmit}
  />
)}
      <Card className="print-history-card">
        <Row className="mb-4">
          <Col>
            <h1 className="print-history-title">Print History</h1>
          </Col>
        </Row>

        <Row className="align-items-center mb-4">
          <Col xs={12} md={6}>
            <InputGroup className="date-group">
              <Form.Control
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                placeholder="Select start date"
              />
              <Form.Control
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                placeholder="Select end date"
              />
            </InputGroup>
          </Col>
          <Col xs={12} md={6} className="text-md-end mt-3 mt-md-0">
            <Button variant="outline-light" className="me-2">
              <FaFileExport className="me-1" /> Export
            </Button>
            <Button variant="primary">
              <FaPlus className="me-1" /> Make an operation
            </Button>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col className="text-center">
            {["All", "pending", "in-progress", "completed", "APPROVED"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "secondary" : "outline-secondary"}
                onClick={() => handleStatusFilter(status)}
              >
                {status}
              </Button>
            ))}
          </Col>
        </Row>

        <Row className="mb-3 justify-content-center">
          <Col xs={12} md={6}>
            <InputGroup className="search-bar">
              <Form.Control
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <Button variant="outline-secondary">
                <FaSearch />
              </Button>
            </InputGroup>
          </Col>
        </Row>

        <Row>
          <Col>
            <Table striped bordered hover responsive className="print-history-table">
              <thead>
                <tr>
                  <th>Document Name</th> {/* Change description here */}
                  <th>Subject</th> {/* Nouvelle colonne Subject après Document Name */}
                  <th>Copies</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((record) => (
                  <tr key={String(record.requestId)}>
                    <td>{record.document?.description || "N/A"}</td> {/* Afficher la description ici */}
                    <td>{record.document.subject?.name || "N/A"}</td> {/* Afficher le sujet ici */}
                    <td>{record.copies}</td>  {/* Nombre de copies */}
                    <td>{new Date(record.date || "").toLocaleDateString()}</td>  {/* Formater la date */}
                    <td>{record.status}</td>

                    <td>
          <Button 
            variant="warning" 
            onClick={() => handleUpdate(record)}
            className="me-2"
          >
            Update
          </Button>
          <Button 
            variant="danger" 
            onClick={() => handleDelete(record.requestId!)}
          >
            Cancel
          </Button>
        </td>

                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center"> {/* Colspan doit être 6 maintenant avec la nouvelle colonne */}
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default PrintHistory;
