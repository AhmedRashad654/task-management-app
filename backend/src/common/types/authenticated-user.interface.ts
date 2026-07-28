export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}
