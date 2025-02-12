import React from 'react';
import { Carousel, Card, Row, Col } from 'react-bootstrap';
import { FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import '../pages/Home/Testimonials.scss';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Marketing Director',
    review: 'Exceptional service! The team delivered beyond our expectations and ahead of schedule.',
    avatar: 'https://via.placeholder.com/80',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Product Manager',
    review: 'Transformed our digital presence completely. Highly recommended for professional solutions.',
    avatar: 'https://via.placeholder.com/80',
  },
  {
    id: 3,
    name: 'Emma Wilson',
    role: 'CEO',
    review: 'Outstanding results and great communication throughout the project lifecycle.',
    avatar: 'https://via.placeholder.com/80',
  },
  {
    id: 4,
    name: 'David Martinez',
    role: 'CTO',
    review: 'Technical expertise at its finest. They solved complex challenges effortlessly.',
    avatar: 'https://via.placeholder.com/80',
  },
  {
    id: 5,
    name: 'Lisa Nguyen',
    role: 'UX Designer',
    review: 'User-centric approach that significantly improved our product interface.',
    avatar: 'https://via.placeholder.com/80',
  },
  {
    id: 6,
    name: 'James Peterson',
    role: 'Startup Founder',
    review: 'Partnered with them for multiple projects - consistent excellence every time.',
    avatar: 'https://via.placeholder.com/80',
  },
];

const TestimonialCarousel = () => {
  const slides = [];
  for (let i = 0; i < testimonials.length; i += 3) {
    slides.push(testimonials.slice(i, i + 3));
  }

  return (
    <div className="testimonial-carousel py-5">


        <div className='text-center'>
            <h2>Hear from our awesome users</h2>
        </div>
      <Carousel
        prevIcon={<FaChevronLeft className="text-dark" size={24} />}
        nextIcon={<FaChevronRight className="text-dark" size={24} />}
        indicators
      >
        {slides.map((slide, index) => (
          <Carousel.Item key={index}>
            <Row className="g-4 justify-content-center">
              {slide.map((testimonial) => (
                <Col lg={4} md={6} key={testimonial.id}>
                  <Card className="h-100 shadow-sm border-0">
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-center mb-3">
                        <img
                          src="boy.png"
                          alt={testimonial.name}
                          className="rounded-circle me-3"
                          width="60"
                          height="60"
                        />
                        <div>
                          <h5 className="mb-0">{testimonial.name}</h5>
                          <small className="text-muted">{testimonial.role}</small>
                        </div>
                      </div>
                      <div className="mb-3">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className="text-warning" />
                        ))}
                      </div>
                      <p className="mb-0">{testimonial.review}</p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
};

export default TestimonialCarousel;