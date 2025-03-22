// src/loaders/authLoader.js
import { redirect } from "react-router-dom";
import { getCurrentUser } from "../api/authApi";
import { isAxiosError, ErrorResponse } from "../utils/axiosUtils"; 

export async function requireAuthLoader() {
  try {
    const data = await getCurrentUser();

    if (data.user) {
      return data.user;
    }

    if (window.location.pathname !== "/login") {
      return redirect("/login");
    }
  } catch (error: unknown) {
    if (isAxiosError<ErrorResponse>(error)) {
      console.error("Authentication error:", error.response?.data?.error || "Unauthorized access.");
    } else if (error instanceof Error) {
      console.error("Unexpected error:", error.message);
    } else {
      console.error("Unknown error occurred.");
    }

    if (window.location.pathname !== "/login") {
      return redirect("/login");
    }
  }

  return null;
}

export async function requireNotAuthLoader() {
  try {
    const data = await getCurrentUser();

    // If the user is authenticated, redirect them to the map page
    if (data.user) {
      return redirect("/map");
    }
  } catch (error: unknown) {
    // If an error occurs, it may indicate the user is not authenticated,
    // so we simply allow the welcome page to render.
    console.error("User not authenticated or an error occurred:", error);
  }

  // Allow the welcome page to render if no authenticated user is found.
  return null;
}
