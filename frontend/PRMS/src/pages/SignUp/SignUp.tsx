import React, { useEffect } from "react";
import { Form, Row, Button, Col, InputGroup } from "react-bootstrap";
import { useFormik } from "formik";
import { signUpValidationSchema } from "../../validations/SignUpValidation";
import "./SignUp.css"; // Import the SCSS file
import CustomButton from "../../components/Button/Button";
import hashPassword from "../../features/encrypt";

const SignupForm = () => {
    const formik = useFormik({
        initialValues: {
            firstname: "",
            lastname: "",
            email: "",
            password: "",
            educationLevel: "",
            field: "",
            phone: "",
            agree: false,
        },
        validationSchema: signUpValidationSchema,
        onSubmit: (values) => {
            
            console.log(values.password);

            console.log(hashPassword(values.password))
        },
    });


    useEffect(() => {

        formik.values.educationLevel === "1"  && formik.setFieldValue("field", "")

    }, [formik.values.educationLevel])

    return (
        <div className="container py-5 sign-up-container">
            <div className="row g-0 signup-container">
                <div className="col-md-6 form-section p-4 p-md-5">
                    <h2 className="mb-4">Join Our High School Platform</h2>
                    <Form noValidate onSubmit={formik.handleSubmit}>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="firstname">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        {...formik.getFieldProps("firstname")}
                                        isInvalid={formik.touched.firstname && !!formik.errors.firstname}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.firstname}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="lastname">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        {...formik.getFieldProps("lastname")}
                                        isInvalid={formik.touched.lastname && !!formik.errors.lastname}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.lastname}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <Form.Group className="mb-4" controlId="phone">
                                    <Form.Label>Phone Number</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        pattern="[0-9]{8}"
                                        {...formik.getFieldProps("phone")}
                                        //isInvalid={!!formik.errors.phone}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.phone}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3" controlId="educationLevel">
                                    <Form.Label>Level</Form.Label>
                                    <Form.Select
                                        {...formik.getFieldProps("educationLevel")}
                                        isInvalid={formik.touched.educationLevel && !!formik.errors.educationLevel}
                                        required
                                    >
                                        <option value="" disabled>
                                            Select your level
                                        </option>
                                        <option value={1}>1st year</option>
                                        <option value={2}>2nd year</option>
                                        <option value={3}>3rd year</option>
                                        <option value={4}>4th year</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {formik.errors.educationLevel}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3" controlId="educationLevel">
                            <Form.Label>Field</Form.Label>
                            <Form.Select
                                {...formik.getFieldProps("field")}
                                isInvalid={formik.touched.field && !!formik.errors.field && formik.values.educationLevel !== "1"} 
                                disabled={formik.values.educationLevel === "1"}
                            >
                                <option value="" selected disabled>
                                    Select your field
                                </option>
                                <option value="CS" >Computer Science</option>
                                <option value="ES">Experimental Science</option>
                                <option value="M">Math</option>
                                <option value="TS">Technical Sciences</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.educationLevel}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="email">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                {...formik.getFieldProps("email")}
                                isInvalid={formik.touched.email && !!formik.errors.email}
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.email}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3 password-field" controlId="password">
                            <Form.Label>Password</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type="password"
                                    {...formik.getFieldProps("password")}
                                    isInvalid={formik.touched.password &&  !!formik.errors.password}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.password}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>
                       

                        <Form.Group className="mb-3 form-check" controlId="agree">
                            <Form.Check
                                type="checkbox"
                                label="I agree to the Terms of Service and Privacy Policy"
                                {...formik.getFieldProps("agree")}
                                isInvalid={!!formik.errors.agree}
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.agree}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <CustomButton type="submit" text="Create account" />
                        <div className="social-signup text-center mt-3">
                            <p className="text-muted">Or sign up with</p>
                            <div className="d-flex justify-content-center gap-3">
                                <Button variant="outline-secondary">Google</Button>
                                <Button variant="outline-secondary">Facebook</Button>
                            </div>
                        </div>
                    </Form>
                </div>
                <div className="col-md-6 image-section">
                    <img
                        src="https://images.unsplash.com/photo-1523240795612-9a054b0db644"
                        alt="Education Illustration"
                        className="img-fluid h-100 w-100 object-fit-cover"
                    />
                </div>
            </div>
        </div>
    );
};

export default SignupForm;
