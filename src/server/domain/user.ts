export interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

export interface AuthUser {
  id: number;
  username: string;
  is_admin: boolean;
}
