export interface User {
  user_id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  created_at: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, authToken: string) => void;
  logout: () => void;
  loading: boolean;
}

export interface FormErrors {
  email?: string;
  password?: string;
}
