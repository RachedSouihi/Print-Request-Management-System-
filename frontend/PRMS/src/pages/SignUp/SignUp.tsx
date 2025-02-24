import React, { useEffect, useState, FC } from "react";
import { Form, Row, Button, Col, InputGroup } from "react-bootstrap";
import { useFormik } from "formik";
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { sendVerifEmail, signUpUser } from '../../store/authSlice';
import { signUpValidationSchema } from "../../validations/SignUpValidation";
import "./SignUp.css"; // Import the SCSS file
import CustomButton from "../../components/Button/Button";
import OtpModal from "../../auth/OTP/OTP";
import Loading from "../../common/Loading";
import CustomToast from "../../common/Toast";
import { useNavigate } from "react-router";
import { useToast } from "../../context/ToastContext";


const SignupForm: FC = (): React.ReactNode => {
    const dispatch = useDispatch<AppDispatch>();
    const {  isAuthenticated } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    const { toast, showToast, hideToast } = useToast()

    

    const [isLoading, setIsLoading] = useState<boolean>(false); // we have already loading state from slice

    const [showOtpModal, setShowOtpModal] = useState<boolean>(false)

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
        onSubmit: async (values) => {
            setIsLoading(true);
            const { password, ...rest } = values;
            sessionStorage.setItem("signupData", JSON.stringify(rest));

            try {
                const emailSent = await dispatch(sendVerifEmail({
                    email: values.email,
                    passwd: values.password,
                    firstname: values.firstname
                })).unwrap();

                if (emailSent) {
                    setShowOtpModal(true);
                } else {

                    showToast("Wrong code, try again", "danger")
                }
            } catch (error) {
                console.error("Error during sign-up:", error);
                showToast("Error during sign-up", "danger")
            } finally {
                setIsLoading(false);
            }
        },
    });

    const signUp = async (otp: string) => {
        try {


            dispatch(signUpUser({ otp })).then((action: any) => {
                if (action.type === 'auth/signUp/fulfilled') {

                }

                showToast(action.payload.message, action.payload.status === 200 ? 'success' : 'danger');

                if(action.payload.status === 200) {
                    navigate('/');
                }



            })
            
        } catch (error) {
            console.error("Error during sign-up:");

            showToast("Error during sign-up", "danger")
        }
    };

    useEffect(() => {
        if (formik.values.educationLevel === "1") {
            formik.setFieldValue("field", "");
        }
    }, [formik.values.educationLevel]);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/'); // Redirect to login if authenticated
        }
    }, [isAuthenticated, navigate]);

    return (
        <>
            <CustomToast
                show={toast.show}
                onClose={hideToast}
                type={toast.type}
                message={toast.message}
            />
            {isLoading && <Loading />} {/* Conditionally render Loading component */}
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
                                            disabled={isLoading}
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
                                            disabled={isLoading}
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
                                            required
                                            disabled={isLoading}
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
                                            disabled={isLoading}
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
                                    disabled={formik.values.educationLevel === "1" || isLoading}
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
                                    disabled={isLoading}
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
                                        disabled={isLoading}
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
                                    disabled={isLoading}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.agree}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <CustomButton type="submit" text="Create account" disabled={isLoading} />
                            <div className="social-signup text-center mt-3">
                                <p className="text-muted">Or sign up with</p>
                                <div className="d-flex justify-content-center gap-3">
                                    <Button variant="outline-secondary" disabled={isLoading}>Google</Button>
                                    <Button variant="outline-secondary" disabled={isLoading}>Facebook</Button>
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

            {showOtpModal && (
                <OtpModal
                    show={showOtpModal}
                    showToast={showToast}
                    onClose={() => setShowOtpModal(false)}
                    email={formik.values.email}
                    signUp={signUp}
                />
            )}
        </>
    );
};

export default SignupForm;