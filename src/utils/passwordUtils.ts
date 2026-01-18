// Password Generation and Management Utilities

/**
 * Generates a secure random password
 * Format: 2 uppercase + 2 lowercase + 2 digits + 2 special chars (12 chars total)
 */
export const generateSecurePassword = (): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '@#$%&*!';
  
  const getRandomChar = (charset: string) => {
    return charset[Math.floor(Math.random() * charset.length)];
  };
  
  // Build password with guaranteed character types
  const passwordParts = [
    getRandomChar(uppercase),
    getRandomChar(uppercase),
    getRandomChar(lowercase),
    getRandomChar(lowercase),
    getRandomChar(digits),
    getRandomChar(digits),
    getRandomChar(special),
    getRandomChar(special),
    // Add 4 more random characters for complexity
    getRandomChar(uppercase + lowercase + digits),
    getRandomChar(uppercase + lowercase + digits),
    getRandomChar(uppercase + lowercase + digits),
    getRandomChar(uppercase + lowercase + digits),
  ];
  
  // Shuffle the password parts
  for (let i = passwordParts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordParts[i], passwordParts[j]] = [passwordParts[j], passwordParts[i]];
  }
  
  return passwordParts.join('');
};

/**
 * Send credentials via email to the admin
 * In production, this should integrate with an email service like SendGrid, AWS SES, etc.
 */
export const sendCredentialsEmail = async (
  adminName: string,
  adminEmail: string,
  businessName: string,
  generatedPassword: string,
  packageType: string
): Promise<{ success: boolean; message: string }> => {
  // Email functionality removed - frontend only
  console.log('📧 Email sending disabled - frontend only mode');
  return {
    success: true,
    message: 'Credentials generated successfully (email disabled in frontend-only mode)'
  };
};

/**
 * Validates password strength
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[@#$%&*!]/.test(password)) {
    errors.push('Password must contain at least one special character (@#$%&*!)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Hash password (simple hash for demo - use bcrypt in production)
 */
export const hashPassword = (password: string): string => {
  // In production, use proper hashing like bcrypt
  // For demo purposes, we'll use a simple encoding
  return btoa(password); // Base64 encoding (NOT secure for production)
};

/**
 * Verify password (simple verification for demo - use bcrypt in production)
 */
export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  // In production, use proper verification like bcrypt
  return btoa(password) === hashedPassword;
};