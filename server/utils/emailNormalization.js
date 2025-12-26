/**
 * Normalize email address for consistent handling
 * For Gmail addresses, removes dots from the local part
 * Also converts to lowercase
 *
 * @param {string} email - The email address to normalize
 * @returns {string} - The normalized email address
 */
export const normalizeEmail = (email) => {
  if (!email) return email;

  // Trim and convert to lowercase
  let normalized = email.trim().toLowerCase();

  // For Gmail addresses, remove dots from local part
  // Gmail treats user.name@gmail.com and username@gmail.com as identical
  if (normalized.endsWith("@gmail.com")) {
    const [localPart, domain] = normalized.split("@");
    normalized = `${localPart.replace(/\./g, "")}@${domain}`;
  }

  return normalized;
};

export default normalizeEmail;
