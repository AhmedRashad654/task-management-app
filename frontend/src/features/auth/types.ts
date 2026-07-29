export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  createdAt: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  email: string;
  otp: string;
  newPassword: string;
};

export type AuthResponseData = {
  accessToken: string;
  user: AuthUser;
};

export type RefreshResponseData = {
  accessToken: string;
};
