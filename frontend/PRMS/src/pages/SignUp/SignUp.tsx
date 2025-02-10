import React from 'react';
import { Form, Button, Container, FloatingLabel, Row, Col } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import './SignUp.module.scss';
import { SignUpFormData } from '../../types/authentication';

const Signup: React.FC = () => {
    const { values, touched, errors, getFieldProps, handleSubmit } = useFormik<SignUpFormData>({
        initialValues: {
            firstName: '',
            lastName: '',
            phone: '',
            educationLevel: '',
            email: '',
            password: ''
        },

        validationSchema: Yup.object({
            firstName: Yup.string().min(3, 'First name must be at least 3 characters').required('First name is required'),
            lastName: Yup.string().required('Last name is required'),
            phone: Yup.string().required('Phone number is required'),
            educationLevel: Yup.string().required('Education level is required'),
            email: Yup.string().email('Invalid email address').required('Email is required'),
            password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
        }),

        onSubmit: (values) => {
            console.log(values);
        }
    });

    return (
        <Container className="mt-6">
            <Form noValidate onSubmit={handleSubmit}>
                <Row>
                    <Col md={6}>
                        <FloatingLabel controlId="formFirstName" label="First Name" className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="Enter first name"
                                {...getFieldProps('firstName')}
                                isInvalid={touched.firstName && !!errors.firstName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.firstName}
                            </Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                    <Col md={6}>
                        <FloatingLabel controlId="formLastName" label="Last Name" className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="Enter last name"
                                {...getFieldProps('lastName')}
                                isInvalid={touched.lastName && !!errors.lastName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.lastName}
                            </Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <FloatingLabel controlId="formPhone" label="Phone" className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="Enter phone number"
                                {...getFieldProps('phone')}
                                isInvalid={touched.phone && !!errors.phone}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.phone}
                            </Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                    <Col md={6}>
                        <FloatingLabel controlId="formEducationLevel" label="Education Level" className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="Enter education level"
                                {...getFieldProps('educationLevel')}
                                isInvalid={touched.educationLevel && !!errors.educationLevel}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.educationLevel}
                            </Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                </Row>

                <FloatingLabel controlId="formEmail" label="Email address" className="mb-3">
                    <Form.Control
                        type="email"
                        placeholder="Enter email"
                        {...getFieldProps('email')}
                        isInvalid={touched.email && !!errors.email}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.email}
                    </Form.Control.Feedback>
                </FloatingLabel>

                <FloatingLabel controlId="formPassword" label="Password" className="mb-3">
                    <Form.Control
                        type="password"
                        placeholder="Enter password"
                        {...getFieldProps('password')}
                        isInvalid={touched.password && !!errors.password}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.password}
                    </Form.Control.Feedback>
                </FloatingLabel>

                <Row>
                    <Col md={12} className="text-center d-grid">
                        <Button variant="primary" type="submit" >
                            Sign Up
                        </Button>
                    </Col>


                </Row>
            </Form>
        </Container>
    );
};

export default Signup;
