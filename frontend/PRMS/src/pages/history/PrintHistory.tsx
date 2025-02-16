import React, { useState } from "react";
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

// Type pour chaque enregistrement d'impression
type PrintRecord = {
  id: number;
  documentName: string;
  pages: number;
  date: string; // format "YYYY-MM-DD"
  status: string;
  executedBy: string;
};

const initialData: PrintRecord[] = [
  {
    id: 1,
    documentName: "Report.pdf",
    pages: 10,
    date: "2025-02-07",
    status: "Printed",
    executedBy: "Olivia Rhye",
  },
  {
    id: 2,
    documentName: "Invoice.docx",
    pages: 2,
    date: "2025-02-06",
    status: "Failed",
    executedBy: "Phoenix Baker",
  },
  {
    id: 3,
    documentName: "Presentation.pptx",
    pages: 15,
    date: "2025-02-05",
    status: "Pending",
    executedBy: "Lana Steiner",
  },
  {
    id: 4,
    documentName: "Contract.pdf",
    pages: 5,
    date: "2025-02-04",
    status: "Printed",
    executedBy: "Demi Wilkinson",
  },
  {
    id: 5,
    documentName: "Budget.xlsx",
    pages: 7,
    date: "2025-02-03",
    status: "Canceled",
    executedBy: "Candice Wu",
  },
];

const PrintHistory: React.FC = () => {
  // État pour la liste des enregistrements
  const [data] = useState<PrintRecord[]>(initialData);

  // États pour la recherche et le filtre d'état
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // État pour la date de début
  const [startDate, setStartDate] = useState<string>("");

  // Calcul de la date de fin (15 jours après la date de début)
  const computedEndDate = startDate
    ? new Date(new Date(startDate).getTime() + 15 * 24 * 60 * 60 * 1000)
    : null;
  const endDateString = computedEndDate
    ? computedEndDate.toISOString().split("T")[0]
    : "";

  // Gestion du changement de date de début
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(event.target.value);
  };

  // Mise à jour de la recherche
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Mise à jour du filtre d'état
  const handleStatusFilter = (newStatus: string) => {
    setStatusFilter(newStatus);
  };

  // Filtrer les données en fonction de la recherche, du filtre d'état et de la date
  const filteredData = data.filter((record) => {
    const matchesSearch = record.documentName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ? true : record.status === statusFilter;

    // Si une date de début est sélectionnée, filtrer sur la plage de 15 jours
    let matchesDate = true;
    if (startDate && computedEndDate) {
      const recordDate = new Date(record.date);
      const start = new Date(startDate);
      matchesDate = recordDate >= start && recordDate <= computedEndDate;
    }
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Fonctions placeholders pour l'export et l'ajout d'opération
  const handleExport = () => {
    alert("Exporting data (placeholder)...");
  };

  const handleAddOperation = () => {
    alert("Adding new operation (placeholder)...");
  };

  return (
    <Container fluid className="print-history-container">
      <Card className="print-history-card">
        {/* Titre centré */}
        <Row className="mb-4">
          <Col>
            <h1 className="print-history-title">Print History</h1>
          </Col>
        </Row>

        {/* En-tête avec sélection de date, export et action */}
        <Row className="align-items-center mb-4">
          <Col xs={12} md={6}>
            <InputGroup className="date-group">
              <Form.Control
                type="date"
                value={startDate}
                onChange={handleDateChange}
                placeholder="Select start date"
              />
              <Form.Control
                type="text"
                value={startDate && endDateString ? `${startDate} to ${endDateString}` : ""}
                readOnly
                placeholder="15-day range"
              />
            </InputGroup>
          </Col>
          <Col xs={12} md={6} className="text-md-end mt-3 mt-md-0">
            <Button variant="outline-light" className="me-2" onClick={handleExport}>
              <FaFileExport className="me-1" />
              Export
            </Button>
            <Button variant="primary" onClick={handleAddOperation}>
              <FaPlus className="me-1" />
              Make an operation
            </Button>
          </Col>
        </Row>

        {/* Boutons de filtre d'état */}
        <Row className="mb-3">
          <Col className="text-center">
            {["All", "Printed", "Failed", "Pending", "Canceled"].map((status) => (
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

        {/* Barre de recherche agrandie */}
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

        {/* Tableau des enregistrements */}
        <Row>
          <Col>
            <Table striped bordered hover responsive className="print-history-table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Pages</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Executed By</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((record) => (
                  <tr key={record.id}>
                    <td>{record.documentName}</td>
                    <td>{record.pages}</td>
                    <td>{record.date}</td>
                    <td>{record.status}</td>
                    <td>{record.executedBy}</td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center">
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
