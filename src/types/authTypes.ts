export type SignupRequestBody = {
  name: string;
  email: string;
  timezone: string;
  password: string;
};

export type LoginRequestBody = {
  email: string;
  password: string;
};
