import React from "react";
import { Card, Button } from "react-bootstrap";
import CustomButton from "../components/Button/Button";

interface DocumentType {
  title: string;
  description: string;
  image: string;
}

interface ProductCardProps {
  document: DocumentType;
}

const ProductCard: React.FC<ProductCardProps> = ({ document }) => {
  return (
    <Card className="custom-card shadow-lg border-0">
      <div className="image-container">
        <Card.Img variant="top" src={document.image} alt={document.title} className="card-img" />
      </div>
      <Card.Body className="d-flex flex-column">
        <Card.Title className="fw-bold">{document.title}</Card.Title>
        <Card.Text className="text-muted">{document.description}</Card.Text>
        <div className="mt-auto d-flex justify-content-between">
          <Button variant="outline-primary">Preview</Button>
          <CustomButton type ="button" width = {150} text="Download"/>
          
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
