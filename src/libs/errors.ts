import createHttpError from 'http-errors';

export const AppErrorFactory = {
  // --- Authentication ---
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

  tokenMissing: (message: string = 'Authentication token is missing') =>
    createHttpError(401, message, {
      reason: 'No token provided in headers or cookies',
      code: 'AUTH_TOKEN_MISSING',
    }),

  tokenInvalid: () =>
    createHttpError(401, 'Invalid or expired session token', {
      reason: 'Session token not found or expired in Redis',
      code: 'AUTH_TOKEN_INVALID',
    }),

  // --- Authorization ---
  unauthorizedAccess: () =>
    createHttpError(403, 'You do not have permission to access this resource', {
      reason: 'User lacks required privileges',
      code: 'AUTH_UNAUTHORIZED_ACCESS',
    }),

  // --- OAuth / Google Integration ---
  googleOAuthFailed: (status?: number) =>
    createHttpError(400, 'Failed to authenticate with Google', {
      reason: 'OAuth token exchange failed',
      code: 'GOOGLE_OAUTH_FAILED',
      status,
    }),

  googleEmailMissing: () =>
    createHttpError(400, 'Email not found in Google profile', {
      reason: 'Missing email in userinfo response',
      code: 'GOOGLE_EMAIL_MISSING',
    }),

  googleTokenMissing: () =>
    createHttpError(400, 'No refresh token received from Google', {
      reason: 'Refresh token is missing in token response',
      code: 'GOOGLE_REFRESH_TOKEN_MISSING',
    }),

  // --- Validation ---
  invalidTimezone: () =>
    createHttpError(400, 'Invalid timezone format', {
      reason: 'Failed Joi validation for timezone',
      code: 'VALIDATION_INVALID_TIMEZONE',
    }),

  invalidInput: (details?: string) =>
    createHttpError(400, 'Invalid input', {
      reason: details || 'Request data failed schema validation',
      code: 'VALIDATION_FAILED',
    }),

  // --- Calendar / Sync ---
  calendarScopeMissing: () =>
    createHttpError(403, 'Google Calendar permission required', {
      reason: 'Missing calendar scope in OAuth access',
      code: 'CALENDAR_SCOPE_MISSING',
    }),

  calendarSyncFailed: () =>
    createHttpError(500, 'Failed to sync with Google Calendar', {
      reason: 'Google API error during calendar sync',
      code: 'CALENDAR_SYNC_FAILED',
    }),

  // --- User ---
  userNotFound: () =>
    createHttpError(404, 'User not found', {
      reason: 'User ID or email does not exist',
      code: 'USER_NOT_FOUND',
    }),

  userAlreadyExists: () =>
    createHttpError(409, 'User already exists', {
      reason: 'Attempt to create duplicate user',
      code: 'USER_ALREADY_EXISTS',
    }),

  chatroomNotFound: () =>
    createHttpError(404, 'Chatroom not found', {
      reason: 'The specified chatroom_id does not exist in the database',
      code: 'CHATROOM_NOT_FOUND',
    }),

  chatroomAccessDenied: () =>
    createHttpError(403, 'You do not have access to this chatroom', {
      reason: 'User is not a member of the chatroom or group',
      code: 'CHATROOM_ACCESS_DENIED',
    }),

  // --- General / Fallback ---
  unknownServerError: () =>
    createHttpError(500, 'Something went wrong', {
      reason: 'Unhandled server error',
      code: 'INTERNAL_SERVER_ERROR',
    }),
};
