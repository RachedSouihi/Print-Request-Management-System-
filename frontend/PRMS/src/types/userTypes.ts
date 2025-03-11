export interface Profile{
  firstName: string;
  lastName: string;
  phone: string;
  educationLevel: string;
  field: string;

  role: 'student' | 'professor' | 'admin';


  subject?: string;
  idCard?: string;



}


export interface User{
  userId: string,
  email: string
  active: boolean;

  profile: Partial<Profile>
}




export interface UserState {
  user: User,
  profile: Profile
}