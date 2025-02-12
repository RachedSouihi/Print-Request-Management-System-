import * as Yup from 'yup';

export const signUpValidationSchema = Yup.object().shape({
    firstname: Yup.string().required('First name is required'),
    lastname: Yup.string().required('Last name is required'),
    phone: Yup.string(),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    educationLevel: Yup.number().required('Education level is required'),
    field: Yup.string().when('educationLevel', {
        is: (value: number) => value !== 1,
        then: (schema) => schema.required('Field is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
});
