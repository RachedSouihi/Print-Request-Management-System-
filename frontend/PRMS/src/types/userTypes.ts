export interface Profile{
  firstName: string;
  lastName: string;
  phone: string;
  educationLevel: string;

  role: 'student' | 'professor' | 'admin'

}


export interface User{
  user_id: string,
  email: string

  profile: Profile
}




export interface UserState {
  user: User,
  profile: Profile
}