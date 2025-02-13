import { Button, Card } from "react-bootstrap";
import { CiBookmark } from "react-icons/ci";

//import { IoBookmark } from "react-icons/io5";

export default function ExamCard({ course }: any) {
  return (
    <Card className="course-card">
      <Card.Body>
        <Card.Title className="course-title">{course.title}</Card.Title>
        <Card.Subtitle className="course-subtitle">
          {course.subtitle}
        </Card.Subtitle>
        <Card.Text className="course-description">
          {course.description}
        </Card.Text>
        {/* Save icon positioned at the bottom right */}
       


        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <Button variant="outline-primary preview-btn" size="sm">
              Preview
            </Button>
            <CiBookmark
            style={{ cursor: "pointer", color: "#6c757d" }}
            size="20px"
          />          </div>
      </Card.Body>
    </Card>
  );
}
