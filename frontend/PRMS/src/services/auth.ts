import { response } from "express";
import { encryptData, encryptPassword } from "../features/encrypt";
import { SignUpFormData } from "../types/authentication";
import axios from 'axios';

const basicAuth = 'Basic ' + btoa('admin:admin');



export const sendVerifEmail = async (email: string, passwd: string, firstname: string): Promise<boolean> => {

    try {
        const timestamp = new Date().getTime()
        const password: string = await encryptPassword(JSON.stringify({ passwd, timestamp }));

        const response = await axios.post(
            import.meta.env.VITE_VERIF_EMAIL_URL,
            { email, password, firstname },
            {
                withCredentials: true, // Allow cookies
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': basicAuth
                }
            }
        );

        if (response.status === 200) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Email verification failed:", error);
        return false;
    }
};