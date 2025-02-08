import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button, Container, Form as BootstrapForm } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./Login.module.scss";

const Login = () => {
  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  });

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        {/* 📌 Partie gauche (Triangle) */}
        <div className={styles.leftPanel}></div>

        {/* 📌 Partie droite (Formulaire) */}
        <div className={styles.rightPanel}>
          <h1 className="fw-bold">Welcome back</h1>
          
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={(values) => console.log("Login Submitted:", values)}
          >
            {({ isSubmitting }) => (
              <Form className="w-100" style={{ maxWidth: "400px" }}>
                <BootstrapForm.Group controlId="email">
                  <Field type="email" name="email" className="form-control mb-3" placeholder="Email" />
                  <ErrorMessage name="email" component="div" className={styles.error} />
                </BootstrapForm.Group>

                <BootstrapForm.Group controlId="password">
                  <Field type="password" name="password" className="form-control mb-3" placeholder="Password" />
                  <ErrorMessage name="password" component="div" className={styles.error} />
                </BootstrapForm.Group>

                <div className="text-end">
                  <a href="#" className={styles.forgotPassword}>Forgot password?</a>
                </div>

                <Button type="submit" className={`btn btn-primary w-100 mt-3 ${styles.loginButton}`} disabled={isSubmitting}>
                  {isSubmitting ? "Logging in..." : "Log in"}
                </Button>
              </Form>
            )}
          </Formik>

          <p className="mt-3">
            Don't you have an account? <a href="#" className={styles.signUp}>Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
