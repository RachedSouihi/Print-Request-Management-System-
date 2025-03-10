import React from "react";

import "../pages/Home/Exams.scss";
import { Carousel, Row, Col } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Button from "./Button/Button";
import ExamCard from "../features/ExamCard";

//import courses from "./courses.ts";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store.ts";
import { Document, saveDocument } from "../store/documentsSlice.ts";
import CustomToast from "../common/Toast.tsx";
import { useToast } from "../context/ToastContext.tsx";

const CoursesCarousel = () => {

  const dispatch = useDispatch();

  const { toast, showToast, hideToast } = useToast();




  const documents = useSelector((state: RootState) => state.documents.documents);

  console.log(documents)

  const examDocuments = documents./*filter((doc) => doc.doc_type.toLocaleLowerCase() === "serie").*/slice(0, 6);



  const chunkSize = 3;
  const examGroups = [];
  for (let i = 0; i < examDocuments.length; i += chunkSize) {
    examGroups.push(examDocuments.slice(i, i + chunkSize));
  }


  const handleSaveDocument = (document: Document) => {

    dispatch(saveDocument(document));

  }

  return (
    <div className="courses-carousel">

      <CustomToast
        show={toast.show}
        onClose={hideToast}
        type={toast.type}
        message={toast.message}
      />
      <Carousel
        prevIcon={<FaChevronLeft className="carousel-control-icon" />}
        nextIcon={<FaChevronRight className="carousel-control-icon" />}
        indicators
      >
        {examGroups.map((group, index) => (
          <Carousel.Item key={index}>
            <Row className="g-4">
              {group.map((course, idx) => (
                <Col md={4} key={idx}>
                  <ExamCard document={course} index={idx} handleSaveDocument={handleSaveDocument} showToast={showToast} />
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
