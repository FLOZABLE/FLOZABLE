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

export type PostAuthLoginAppBody = {
  email: string;
  password: string;
  device_id: string;
  brand: string | null;
  device_name: string | null;
};

export type PostAuthTokenVerifyBody = {
  token: string;
  device_id: string;
};

export type GetAuthGoogleCallbackQuery = {
  code: string;
  state: string;
};
