const CryptoJS = require("crypto-js");



export default function hashPassword(password: string): string {
    return CryptoJS.AES.encrypt(password, import.meta.env.VITE_SECRET_KEY).toString(); 
  }