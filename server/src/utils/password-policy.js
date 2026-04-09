export const passwordPolicy = {
  minLength: 12,
  regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,128}$/
};

export const passwordPolicyMessage =
  "Password must be 12-128 chars and include uppercase, lowercase, number, and special character.";
