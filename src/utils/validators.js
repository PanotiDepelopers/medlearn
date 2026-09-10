export const validateLogin = (username, password) => {
  if (!username || !password) {
    return { valid: false, error: 'Please enter both username and password.' };
  }
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters.' };
  }
  if (password.length < 3) {
    return { valid: false, error: 'Password must be at least 3 characters.' };
  }
  return { valid: true };
};