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

const CourseCard: React.FC<ProductCardProps> = ({ document }) => {
  return (
   



<Card className="custom-card shadow-lg border-0 h-100 d-flex flex-column">
      {" "}
      <div className="image-container">
        <Card.Img
          variant="top"
          src={document.image}
          alt={document.title}
          className="card-img"
          style={{
            padding: "5px",
          }}
          height="200px"
        />
      </div>
      <Card.Body className="d-flex flex-column flex-grow-1">
        {" "}
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

export default CourseCard;
