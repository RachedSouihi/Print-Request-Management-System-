import hashPassword from "../features/encrypt"

export const signUp = async(data: any) => {
    const encryptedPassword: String = hashPassword(data.password)

    //logic here


}


export const logIn = async(data: any) => {  
    const encryptedPassword: String = hashPassword(data.password)

    //logic here


}