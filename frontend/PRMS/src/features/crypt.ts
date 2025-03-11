import CryptoJS from 'crypto-js';


export const encryptPassword = (password: any): String => {
    

    return CryptoJS.AES.encrypt(password, import.meta.env.VITE_SECRET_KEY).toString();

}



