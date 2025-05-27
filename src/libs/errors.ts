import createHttpError from 'http-errors';

export const AppErrorFactory = {
  invalidCredentials: () =>
    createHttpError(401, 'Invalid email or password', {
      reason: 'User not found or invalid password',
      code: 'AUTH_INVALID_CREDENTIALS',
    }),
  passwordMismatch: () =>
    createHttpError(401, 'Invalid email or password', {
      reason: 'Password mismatch',
      code: 'AUTH_INVALID_PASSWORD',
    }),
};
