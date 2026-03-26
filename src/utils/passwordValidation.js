export const PASSWORD_RULES = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLetter: /[A-Za-z]/,
  hasNumber: /\d/,
  hasSpecial: /[^A-Za-z0-9]/,
};

export const PASSWORD_PATTERN =
  "^(?=.*[A-Z])(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$";

export const PASSWORD_REQUIREMENTS_MESSAGE =
  "Password must be at least 8 characters and include 1 uppercase letter, letters, numbers, and special characters.";

export const getPasswordValidationState = (password = "") => ({
  minLength: password.length >= PASSWORD_RULES.minLength,
  hasUppercase: PASSWORD_RULES.hasUppercase.test(password),
  hasLetter: PASSWORD_RULES.hasLetter.test(password),
  hasNumber: PASSWORD_RULES.hasNumber.test(password),
  hasSpecial: PASSWORD_RULES.hasSpecial.test(password),
});

export const isStrongPassword = (password = "") => {
  const status = getPasswordValidationState(password);
  return Object.values(status).every(Boolean);
};
