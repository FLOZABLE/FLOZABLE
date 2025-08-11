export interface PostSignupBody {
  name: string;
  email: string;
  timezone: string;
  password: string;
}

export interface PostSignupAppBody extends PostSignupBody {
  device_id: string;
  brand: string | null;
  device_name: string | null;
}

export interface PostAuthLoginBody {
  email: string;
  password: string;
}

export interface PostAuthLoginAppBody extends PostAuthLoginBody {
  device_id: string;
  brand: string | null;
  device_name: string | null;
}

export interface PostAuthTokenVerifyBody {
  token: string;
  device_id: string;
}

export interface GetAuthGoogleCallbackQuery {
  code: string;
  state: string;
}
