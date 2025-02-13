import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";

import axios from "axios"; // Pour récupérer les documents d'une API
import ProductCard from "../features/ProductCart";

const DocumentOverview: React.FC = () => {
  const [documents, setDocuments] = useState<{ title: string; description: string; image: string }[]>([]);

  useEffect(() => {
    // ⚠️ Simulation de données, à remplacer avec un appel API plus tard
    const mockData = [
      {
        title: "Algebra Basics",
        description: "Understand the fundamentals of algebra with step-by-step exercises.",
        image: "/images/algebra.jpg"
      },
      {
        title: "Geometry Essentials",
        description: "Explore geometric shapes and their properties with detailed explanations.",
        image: "/images/images.png"
      },
      {
        title: "Calculus Intro",
        description: "Learn the basics of calculus, including limits and derivatives.",
        image: "/images/calc268f.jpg"
      },
      {
        title: "Physics Basics",
        description: "Dive into the principles of physics with practical examples.",
        image: "/images/Physics.webp"
      },
      {
        title: "Chemistry Concepts",
        description: "An overview of essential chemistry concepts, including reactions.",
        image: "/images/chemestry.jpg"
      },
      {
        title: "Statistics Overview",
        description: "Overview of the statistics basics.",
        image: "/images/statics.jpg"
      }
    ];
    setDocuments(mockData);
  }, []);

  return (
    <Container className="py-5">
      <h2 className="text-center fw-bold mb-5">📚 Document Overview</h2>
      <Row xs={1} md={2} lg={3} className="g-4">
        {documents.map((doc, index) => (
          <Col key={index}>
            <ProductCard document={doc} />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default DocumentOverview;
