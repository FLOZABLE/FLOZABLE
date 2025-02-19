//acconut information validation
function validateEmail(email) {
  if (!email) {
    return { isValid: false, reason: "Invalid Email" };
  }
  if (email.length > 60) {
    return { isValid: false, reason: "Email too long" };
  }
  if (!/^[^\s@%]+@[^\s@%]+\.[^\s@%]+$/.test(email)) {
    return { isValid: false, reason: "Invalid Email" };
  }
  return { isValid: true };
}

function validateStrictString(value, type, maxLength = 20, minLength = 1) {
  if (!value) {
    return { isValid: false, reason: `Please provide ${type}` };
  }
  if (value.length < minLength) {
    return { isValid: false, reason: `${type} is too short` };
  }
  if (value.length > maxLength) {
    return { isValid: false, reason: `${type} is too long` };
  }
  if (!/^[a-zA-Z0-9]+$/.test(value)) {
    return {
      isValid: false,
      reason: `Invalid ${type} (Only A-Z, a-z, and 0-9 available)`,
    };
  }
  return { isValid: true };
}

function validateString(value, type, maxLength = 20, minLength = 1) {
  if (!value) {
    return { isValid: false, reason: `Please provide ${type}` };
  }
  if (value.length < minLength) {
    return { isValid: false, reason: `${type} is too short` };
  }
  if (value.length > maxLength) {
    return { isValid: false, reason: `${type} is too long` };
  }
  if (!/^[a-zA-Z0-9!?#@&()<>'[\],~".,/\p{Emoji}\s]+$/u.test(value)) {
    return { isValid: false, reason: `Invalid ${type} (Illegal Characters)` };
  }
  return { isValid: true };
}

function validateInteger(value, type, max, min = 0) {
  if (typeof value !== "number") {
    return { isValid: false, reason: `Invalid ${type} (Only number allowed)` };
  }
  if (value.length > max) {
    return { isValid: false, reason: `${type} is too large` };
  }
  if (value.length < min) {
    return { isValid: false, reason: `${type} is too small` };
  }
  return { isValid: true };
}

function validatePassword(password, max = 20, min = 5, specialNeeded = true) {
  if (!password) {
    return { isValid: false, reason: `Please provide a password` };
  }
  if (password.length < min) {
    return {
      isValid: false,
      reason: "Password is too short (" + min + " characters minimum)",
    };
  }
  if (password.length > max) {
    return {
      isValid: false,
      reason: "Password is too long (" + max + " characters maximum)",
    };
  }
  if (
    !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) &&
    specialNeeded
  ) {
    return { isValid: false, reason: "You need special characters" };
  }
  return { isValid: true };
}

function validateLength(value, type, max, min = 0) {
  if (!value) {
    return { isValid: false, reason: `Please provide ${type}` };
  }
  if (value.length < min) {
    return { isValid: false, reason: `${type} is too short` };
  }
  if (value.length > max) {
    return { isValid: false, reason: `${type} is too long` };
  }
  return { isValid: true };
}

function validateURL(url, strict = false, allowedOrigins) {
  try {
    if (!url) {
      return { isValid: false, reason: "Please provide URL" };
    }
    let origin;
    let domain;

    if (!url.includes("https://") && !url.includes("http://")) {
      url = new URL("https://" + url);
    } else {
      url = new URL(url);
    }

    origin = url.origin;
    domain = url.hostname;

    origin = origin.replace(/^www\.(.*)$/, "$1");
    domain = domain.replace(/^www\.(.*)$/, "$1");

    if (domain.length > 100) {
      return { isValid: false, reason: "Invalid URL" };
    }

    // NEW CHECK: Require at least one dot in the domain
    if (!domain.includes(".")) {
      return { isValid: false, reason: "Invalid public domain" };
    }

    if (strict && !allowedOrigins.includes(origin)) {
      return { isValid: false, reason: "Invalid Domain" };
    }

    return { isValid: true, domain, origin, url };
  } catch (err) {
    return { isValid: false, reason: "Invalid URL" };
  }
}

function validateBoolean(value, type, isStrict) {
  if (isStrict) {
    if (value === true || value === false) {
      return { isValid: true, value };
    }
    return { isValid: false, reason: `Invalid ${type} value` };
  }
  if (value) {
    return { isValid: true, value: true };
  } else {
    return { isValid: true, value: false };
  }
}

function validateTimeZone(timeZone) {
  if (!timeZone) {
    return { isValid: false, reason: "Please provide timezone" };
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone: timeZone });
    return { isValid: true };
  } catch {
    return { isValid: false, reason: "Invalid timeZone" };
  }
}

function validateArray(value, type, maxLength, minLength = 0) {
  if (!value) {
    return { isValid: false, reason: `Please provide ${type}` };
  }
  if (!Array.isArray(value)) {
    return { isValid: false, reason: `Invalid format for ${type}` };
  }
  if (value.length < minLength) {
    return { isValid: false, reason: `${type} is too short` };
  }
  if (value.length > maxLength) {
    return { isValid: false, reason: `${type} is too long` };
  }
  return { isValid: true };
}

function validateHEX(value, type, maxLength = 9, minLength = 7) {
  if (!value) {
    return { isValid: false, reason: `Please provide ${type}` };
  }
  if (typeof value !== "string") {
    return { isValid: false, reason: `${type} should be hex` };
  }
  if (!/^#?[0-9a-f]+$/i.test(value)) {
    return { isValid: false, reason: `${type} should be hex` };
  }
  if (value.length < minLength) {
    return { isValid: false, reason: `${type} is too short` };
  }
  if (value.length > maxLength) {
    return { isValid: false, reason: `${type} is too long` };
  }
  return { isValid: true };
}

function validateOption(value, type, options) {
  if (!value) {
    return { isValid: false, reason: `Please provide ${type}` };
  }
  if (!options.includes(value)) {
    return {
      isValid: false,
      reason: `${type} should be one of ${options.toString()}`,
    };
  }
  return { isValid: true };
}

function validateISO(value, type) {
  if (!value) {
    return { isValid: false, reason: `Please provide ${type}` };
  }
  if (!/\d{4}-\d{2}-\d{2}/.test(value)) {
    return { isValid: false, reason: `${type} should be ISO(YYYY-MM-DD)` };
  }
  return { isValid: true };
}

module.exports = {
  validateEmail,
  validateStrictString,
  validateString,
  validateInteger,
  validatePassword,
  validateLength,
  validateURL,
  validateBoolean,
  validateTimeZone,
  validateArray,
  validateHEX,
  validateOption,
  validateISO,
};
