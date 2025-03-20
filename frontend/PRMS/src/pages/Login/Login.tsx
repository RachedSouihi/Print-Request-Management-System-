import React, { FC, useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button, Spinner, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../../store/authSlice";
import styles from "./Login.module.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import { AppDispatch, RootState } from "../../store/store";
import { Form as BootstrapForm } from "react-bootstrap";
import ForgetPassword from "../../components/ForgetPassword/ForgetPassword";

const Login: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [showForgetModal, setShowForgetModal] = useState(false);

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  });
  

  
  
  

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.leftPanel}></div>

        <div className={styles.rightPanel}>
          <h1 className="fw-bold">Welcome back</h1>

          {error && <Alert variant="danger">{error}</Alert>}

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting }) => {
              dispatch(loginUser(values))
                
                .then((action: any) => {

                  console.log("LOGIN ACTION: ", action)
                  if (action.type === 'auth/login/fulfilled') {
                    setSubmitting(false);
                    if(action.payload.status === 200) {
                      navigate("/");
                    }


                  }



                })
                .catch((err) => {
                  setSubmitting(false);
                  console.error("Error:", err);
                });
            }}
            
          >
            {({ isSubmitting }) => (
              <Form className="w-100" style={{ maxWidth: "400px" }}>
                <BootstrapForm.Group controlId="email">
                  <Field
                    type="email"
                    name="email"
                    className="form-control mb-3"
                    placeholder="Email"
                  />
                  <ErrorMessage name="email" component="div" className={styles.error} />
                </BootstrapForm.Group>

                <BootstrapForm.Group controlId="password">
                  <Field
                    type="password"
                    name="password"
                    className="form-control mb-3"
                    placeholder="Password"
                  />
                  <ErrorMessage name="password" component="div" className={styles.error} />
                </BootstrapForm.Group>

                <div className="text-end">
                  {/* Utilisation d'un bouton avec type button pour ouvrir le modal */}
                  <Button variant="link" className={styles.forgotPassword} onClick={() => setShowForgetModal(true)}>
                    Forgot password?
                  </Button>
                </div>

                <Button
                  type="submit"
                  className={`btn btn-primary w-100 mt-3 ${styles.loginButton}`}
                  disabled={isSubmitting || loading}
                >
                  {loading ? <Spinner animation="border" size="sm" /> : "Log in"}
                </Button>
              </Form>
            )}
          </Formik>

          <p className="mt-3">
            Don't you have an account?{" "}
            <Button variant="link" className={styles.signUp}onClick={() => navigate("/signup")}>
              Sign up
            </Button>
          </p>
        </div>
      </div>

      <ForgetPassword show={showForgetModal} handleClose={() => setShowForgetModal(false)} />
    </div>
  );
};

export default Login;