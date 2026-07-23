import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  // Sanctum SPA auth: the browser sends the session cookie, and axios mirrors
  // the XSRF-TOKEN cookie into the X-XSRF-TOKEN header for every mutating call.
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
