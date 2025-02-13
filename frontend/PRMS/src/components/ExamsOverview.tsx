import React from "react";

import "../pages/Home/Exams.scss";
import { Carousel, Row, Col } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Button from "./Button/Button";
import ExamCard from "../features/ExamCard";

const courses = [
  {
    title: "Mathematics Basics",
    subtitle: "Algebra & Geometry",
    description:
      "Master fundamental concepts through interactive lessons and practical exercises.",
  },
  {
    title: "Science Fundamentals",
    subtitle: "Physics & Chemistry",
    description:
      "Explore core scientific principles with real-world applications.",
  },
  {
    title: "Literature Review",
    subtitle: "Classic & Modern",
    description:
      "Dive into literary analysis and critical thinking techniques.",
  },
  {
    title: "History Studies",
    subtitle: "World History",
    description:
      "Chronological exploration of major global events and cultures.",
  },
  {
    title: "Computer Science",
    subtitle: "Programming Basics",
    description: "Introduction to algorithms and problem-solving strategies.",
  },
  {
    title: "Art Appreciation",
    subtitle: "Visual Arts",
    description: "Understanding artistic techniques and historical contexts.",
  },
];

const CoursesCarousel = () => {
  const chunkSize = 3;
  const courseGroups = [];
  for (let i = 0; i < courses.length; i += chunkSize) {
    courseGroups.push(courses.slice(i, i + chunkSize));
  }

  return (
    <div className="courses-carousel">
      <Carousel
        prevIcon={<FaChevronLeft className="carousel-control-icon" />}
        nextIcon={<FaChevronRight className="carousel-control-icon" />}
        indicators
      >
        {courseGroups.map((group, index) => (
          <Carousel.Item key={index}>
            <Row className="g-4">
              {group.map((course, idx) => (
                <Col md={4} key={idx}>
                  <ExamCard course={course} />
                </Col>
                
              ))}
            </Row>
          </Carousel.Item>
        ))}
      </Carousel>

      <Row className="d-flex align-items-center justify-content-center mt-5">
        <Col md={4}>
          
          <Button text="explore more" />
        </Col>
      </Row>
    </div>
  );
};

export default CoursesCarousel;
