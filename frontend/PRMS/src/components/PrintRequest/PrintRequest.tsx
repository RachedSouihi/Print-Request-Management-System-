// components/PrintRequestModal.tsx
import React, { useEffect, useRef } from 'react';
import { Modal, Form, Button, FormText } from 'react-bootstrap';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';

import './PrintRequest.scss';
import { Document } from '../../pages/Documents/Documents';

interface PrintRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  document: Document;
}

const validationSchema = Yup.object().shape({
  copies: Yup.number()
    .min(1, 'Must be at least 1 copy')
    .required('Number of copies is required'),
  printMode: Yup.string()
    .oneOf(['color', 'bw'], 'Invalid print mode')
    .required('Please select a print mode'),
  file: Yup.mixed().required('A file is required'),
  notes: Yup.string().optional()
});

export const PrintRequestModal = ({
  isOpen,
  onClose,
  onSubmit,
  document
}: PrintRequestModalProps) => {
  const copiesInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && copiesInputRef.current) {
      copiesInputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      backdrop="static"
      centered
      className="print-request-modal"
      animation={true}
    >
      <Modal.Header closeButton>
        <Modal.Title>Print Request</Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={{
          copies: 1,
          printMode: 'color',
          notes: '',
          file: null
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => onSubmit({  ...values })}
      >
        {({ handleSubmit, isSubmitting, errors, touched, setFieldValue }) => (
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group controlId="formDocumentName">
                <Form.Label>Document</Form.Label>
                <Form.Control
                  type="text"
                  value={document.subject}
                  readOnly
                  className="bg-light border-0"
                />
                <FormText className="text-muted">
                  {document.field} - Grade {document.level}
                </FormText>
              </Form.Group>

              <Form.Group controlId="formCopies">
                <Form.Label>Copies</Form.Label>
                <Field
                  name="copies"
                  type="number"
                  min="1"
                  ref={copiesInputRef}
                  className={`form-control text-center ${errors.copies && touched.copies ? 'is-invalid' : ''}`}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.copies}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="formPrintMode">
                <Form.Label>Print Mode</Form.Label>
                <div className="d-flex gap-3 mt-2">
                  <Field
                    name="printMode"
                    type="radio"
                    value="color"
                    className="custom-radio"
                  />
                  <label className="form-check-label">Color</label>

                  <Field
                    name="printMode"
                    type="radio"
                    value="bw"
                    className="custom-radio"
                  />
                  <label className="form-check-label">Black & White</label>
                </div>
                {errors.printMode && touched.printMode && (
                  <Form.Control.Feedback type="invalid">
                    {errors.printMode}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              <Form.Group controlId="formFile">
                <Form.Label>Upload File</Form.Label>
                <input
                  name="file"
                  type="file"
                  className={`form-control ${errors.file && touched.file ? 'is-invalid' : ''}`}
                  onChange={(event) => {
                    setFieldValue("file", event.currentTarget.files![0]);
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.file}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="formNotes">
                <Form.Label>Special Instructions</Form.Label>
                <Field
                  as="textarea"
                  name="notes"
                  rows={3}
                  placeholder="Enter any special instructions..."
                  className="form-control"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
              className='submit-btn'
                //variant=""
                type="submit"
                disabled={isSubmitting}
              >
                Submit Request
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};