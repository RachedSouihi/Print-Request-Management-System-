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
import { PrintRequest } from "../../store/requestSlice";



const PrintHistory: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const data = useSelector((state: RootState) => state.history.data as PrintRequest[]);
  console.log("Données dans Redux:", data);

  useEffect(() => {
    dispatch(fetchPrintHistory());
  }, [dispatch]);

  // États pour la recherche et les filtres
  const [searchTerm, setSearchTerm] = useState<string>("");  // Recherche générale
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

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

  console.log("filteredData", filteredData);

  return (
    <Container fluid className="print-history-container">
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
                  <th>Executed By</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((record) => (
                  <tr key={String(record.requestId)}>
                    <td>{record.document?.description || "N/A"}</td> {/* Afficher la description ici */}
                    <td>{record.document?.subject || "N/A"}</td> {/* Afficher le sujet ici */}
                    <td>{record.copies}</td>  {/* Nombre de copies */}
                    <td>{new Date(record.date || "").toLocaleDateString()}</td>  {/* Formater la date */}
                    <td>{record.status}</td>
                    <td>{record.user?.email || "Unknown"}</td>  {/* Email de l'utilisateur */}
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
