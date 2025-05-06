
import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";

import axios from "axios"; // Pour récupérer les documents d'une API
import CourseCard from "../features/CourseCart";

const DocumentOverview: React.FC = () => {
  const [documents, setDocuments] = useState<{ documentId: string, docType: string, title: string; description: string; image: string }[]>([]);

  useEffect(() => {
    // ⚠️ Simulation de données, à remplacer avec un appel API plus tard
    const mockData = [
      {
        documentId: "121",
        docType: "pdf",
        title: "Algebra Basics",
        description: "Understand the fundamentals of algebra with step-by-step exercises.",
        image: "/antoine-dautry-05A-kdOH6Hw-unsplash-scaled.jpg"
      },
      {
        documentId: "116",
        docType: "pdf",
        title: "Geometry Essentials",
        description: "Explore geometric shapes and their properties with detailed explanations.",
        image: "/geometry.png"
      },
      {
        documentId: "117",
        docType: "pdf",
        title: "Calculus Intro",
        description: "Learn the basics of calculus, including limits and derivatives.",
        image: "/calc268f.jpg"
      },

      {
        documentId: "118",
        docType: "pdf",
        title: "Physics Basics",
        description: "Dive into the principles of physics with practical examples.",
        image: "/Physics.webp"
      },
      {
        documentId: "119",
        docType: "pdf",
        title: "Chemistry Concepts",
        description: "An overview of essential chemistry concepts, including reactions.",
        image: "/chemestry.jpg"
      },
      {
        documentId: "120",
        docType: "pdf",
        title: "Statistics Overview",
        description: "Overview of the statistics basics.",
        image: "/statics.jpg"
      }
    ];
    setDocuments(mockData);
  }, []);

  return (
    <Container className="py-5">
      <h2 className="text-center fw-bold mb-5">📚 Document Overview</h2>
      <Row xs={1} md={2} lg={3} className="g-4">
        {documents.map((doc, index) => (
          // Update the Col component rendering
          <Col key={index} className="d-flex">
            <CourseCard document={doc} />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default DocumentOverview;

