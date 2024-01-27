
//acconut information validation
function validateEmail(email) {
  if (email.length >= 60) {
    return { isValid: false, reason: "Email too long" };
  };
  if (!/^[^\s@%]+@[^\s@%]+\.[^\s@%]+$/.test(email)) {
    return { isValid: false, reason: "Invalid Email" };
  };
  return { isValid: true };
};

function validateString(value, type, max = 20, min = 1) {
  if (value.length < min) {
    return { isValid: false, reason: `${type} is too short` };
  };
  if (value.length > max) {
    return { isValid: false, reason: `${type} is too long` };
  };
  if (!/^[a-zA-Z0-9]+$/.test(value)) {
    return { isValid: false, reason: `Invalid ${type} (Only A-Z, a-z, and 0-9 available)` };
  };
  return { isValid: true };
};

function isValidInteger(value, type, max, min) {
  if (typeof value !== 'number') {
    return { isValid: false, reason: `Invalid value ${type} (Only number allowed)` };
  };
  if (value.length >= max) {
    return { isValid: false, reason: `${type} is too large` };
  };
  if (value.length <= min) {
    return { isValid: false, reason: `${type} is too small` };
  };
  return { isValid: true };
};

function validatePassword(password, max = 20, min = 5) {
  if (password.length <= min) {
    return { isValid: false, reason: "Password is too short" };
  };
  if (password.length >= max) {
    return { isValid: false, reason: "Password is too long" };
  };
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, reason: "You need special characters" };
  };
  return { isValid: true };
};

module.exports = {
  validateEmail,
  validateString,
  isValidInteger,
  validatePassword
};