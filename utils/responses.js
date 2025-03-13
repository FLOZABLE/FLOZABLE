const RESPONSE_MESSAGES = {
  noUser: (message = "Invalid User") => ({
    success: false,
    message,
    status: 400,
    error: {
      reason: "Invalid User",
    },
    action: "signin",
  }),

  noSession: (message = "Sign In") => ({
    success: false,
    message,
    status: 400,
    error: {
      reason: "Invalid User",
    },
    action: "signin",
  }),

  noTargetUser: (message = "Invalid User") => ({
    success: false,
    message,
    status: 400,
    error: {
      reason: "Invalid User",
    },
  }),

  noGroup: (message = "Invalid Group") => ({
    success: false,
    message,
    status: 404,
    error: {
      reason: "Invalid Group",
    },
  }),

  noSubject: (message = "Invalid Subject") => ({
    success: false,
    message,
    status: 400,
    error: {
      reason: "Invalid Subject",
    },
  }),

  noPlan: (message = "Invalid Plan") => ({
    success: false,
    message,
    status: 400,
    error: {
      reason: "Invalid Plan",
    },
  }),

  nonMember: (message = "Not a member of this group") => ({
    success: false,
    message,
    status: 403,
    error: {
      reason: "Not a member of this group",
    },
  }),

  friendsLimitReached: (message = "Friends limit reached") => ({
    success: false,
    message,
    status: 409,
    error: {
      reason: "Friends limit reached",
    },
  }),

  expiredRequest: (message = "Expired Request") => ({
    success: false,
    message,
    status: 410,
    error: {
      reason: "Expired Request",
    },
  }),
  error: (message = "Unexpected Error") => ({
    success: false,
    message,
    status: 500,
    error: {
      reason: "Unexpected Error",
    },
  }),

  notAuthed: (message = "Not Authenticated") => ({
    success: false,
    message,
    status: 401,
    error: {
      reason: "Not Authenticated",
    },
  }),

  wrongPassword: (message = "Wrong Password") => ({
    success: false,
    message,
    status: 403,
    error: {
      reason: "Wrong Password",
    },
  }),

  forbidden: (
    message = "You do not have permission to perform this action"
  ) => ({
    success: false,
    message,
    status: 403,
    error: {
      reason: "Insufficient Privileges",
    },
  }),
  validationError: (error) => ({
    success: false,
    message: error.reason,
    status: 400,
    error: {
      reason: error.reason,
    },
  }),
  missingValue: (value) => ({
    success: false,
    message: `Please provide ${value}`,
    status: 400,
    error: {
      reason: `Missing ${value}`,
    },
  }),
  existingValue: (value) => ({
    success: false,
    message: `${value} already in use`,
    status: 400,
    error: {
      reason: `Missing ${value}`,
    },
  }),
};

module.exports = RESPONSE_MESSAGES;
