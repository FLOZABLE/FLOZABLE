export type PostSignupBody = {
  name: string;
  email: string;
  timezone: string;
  password: string;
};

export type PostLoginBody = {
  email: string;
  password: string;
};
