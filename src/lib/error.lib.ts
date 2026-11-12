import { isAxiosError } from "axios";

// pesan BE yang terlalu teknis -> versi yang lebih ramah untuk user
const MESSAGE_MAP: Record<string, string> = {
  "Invalid email or password": "Incorrect email or password.",
  "Email is already registered": "This email is already registered. Please log in instead.",
  "Invalid or expired reset link": "This password reset link is invalid or has expired.",
  "Access token must be provided": "Your session has ended. Please log in again.",
  "Refresh token must be provided": "Your session has ended. Please log in again.",
};

// ambil pesan error yang bisa ditampilkan ke user dari error axios / error biasa
export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (isAxiosError(error)) {
    if (!error.response) return "Can't connect to the server. Please check your internet connection.";

    const message: string | undefined = error.response.data?.message;
    if (error.response.status === 429) {
      return message?.startsWith("Too many")
        ? "Too many attempts. Please wait a few minutes and try again."
        : (message ?? fallback);
    }
    if (error.response.status >= 500) return fallback;
    if (message) return MESSAGE_MAP[message] ?? message;
  }

  return fallback;
}
