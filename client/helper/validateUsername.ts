export const validateUsername = (username: string): boolean => {
  if (
    username.length <= 3 ||
    username.length > 15 ||
    !username ||
    username === ""
  ) {
    return false;
  }

  if (/[^a-zA-Z0-9_]/.test(username)) {
    return false;
  }

  return true;
};

export const usernameRules =
  "Username must be between 3 and 15 characters. \n" +
  "Remove extra space and special characters.";
