interface IMessages {
  AUTH: {
    MISSING_CREDENTIALS: string;
    EMAIL_PASSWORD_REQUIRED: string;
    LOGIN_FAILED: string;
    INVALID_RESPONSE: string;
    LOGIN_SUCCESS: string;
    UNKNOWN_ERROR: string;
  };
}

export const MESSAGES: IMessages = {
  AUTH: {
    MISSING_CREDENTIALS: "Missing credentials",
    EMAIL_PASSWORD_REQUIRED: "Email and password are required",
    LOGIN_FAILED: "Login failed",
    INVALID_RESPONSE: "Invalid response from server",
    LOGIN_SUCCESS: "Login successful",
    UNKNOWN_ERROR: "Unknown error occurred",
  },
} as const satisfies IMessages;
