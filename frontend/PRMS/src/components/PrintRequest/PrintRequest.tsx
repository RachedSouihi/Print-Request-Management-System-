// components/PrintRequestModal.tsx
import React, { useEffect, useRef } from 'react';
import { Modal, Form, Button, FormText } from 'react-bootstrap';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';

import './PrintRequest.scss';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { sendPrintRequest } from '../../store/requestSlice';
import { Document } from '../../store/documentsSlice';
import { useToast } from '../../context/ToastContext';

interface PrintRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
  showToast: any
}

const validationSchema = Yup.object().shape({
  copies: Yup.number()
    .min(1, 'Must be at least 1 copy')
    .required('Number of copies is required'),
  printMode: Yup.string()
    .oneOf(['color', 'bw'], 'Invalid print mode')
    .required('Please select a print mode'),
  paperType: Yup.string()
    .oneOf(['plain', 'glossy', 'recycled', 'A4', 'A3'], 'Invalid paper type')
    .required('Please select a paper type'),
  notes: Yup.string().optional()
});

export const PrintRequestModal = ({
  isOpen,
  onClose,
  document,
  showToast
}: PrintRequestModalProps) => {

  
  const copiesInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();

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
          paperType: 'A4',
          notes: '',
        }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          // handle form submission

          dispatch(sendPrintRequest({
            copies: values.copies,
            color: values.printMode === 'color',
            notes: values.notes,
            document: document,
            paperType: {
              paperType:  values.paperType
            }
          })).then((action: any) => {
            console.log("p-req action: ", action)
            if(action.payload.status === 200) {
              showToast('Print request sent successfully', 'success');

            }

            if (action.type === 'printRequest/sendPrintRequest/fulfilled') {
              onClose();
            }
          });
          setSubmitting(false);
        }}
      >
        {({ handleSubmit, isSubmitting, errors, touched }) => (
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

              <Form.Group controlId="formPaperType">
                <Form.Label>Paper Type</Form.Label>
                <Field
                  as="select"
                  name="paperType"
                  className={`form-control ${errors.paperType && touched.paperType ? 'is-invalid' : ''}`}
                >
                  <option value="A4">A4</option>
                  <option value="A3">A3</option>
                  <option value="recycled">Recycled</option>
                </Field>
                <Form.Control.Feedback type="invalid">
                  {errors.paperType}
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