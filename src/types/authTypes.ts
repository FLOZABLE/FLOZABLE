export type PostSignupBody = {
  name: string;
  email: string;
  timezone: string;
  password: string;
};

export type PostAuthLoginBody = {
  email: string;
  password: string;
};

export type GetAuthGoogleCallbackQuery = {
  code: string;
  state: string;
};
