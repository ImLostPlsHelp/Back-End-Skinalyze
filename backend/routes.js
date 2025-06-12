import {
  SignUpHandler,
  LoginHandler,
  GroqHandler,
  saveResultHandler,
  getScanHistoryHandler,
  getUserInformation,
} from "./handler.js";

export const routes = [
  {
    method: "POST",
    path: "/api/signup",
    handler: SignUpHandler,
  },
  {
    method: "POST",
    path: "/api/login",
    handler: LoginHandler,
  },
  {
    method: "POST",
    path: "/api/get-groq-advice",
    handler: GroqHandler,
  },
  {
    method: "POST",
    path: "/api/save-result",
    handler: saveResultHandler,
  },
  {
    method: "GET",
    path: "/api/get-result",
    handler: getScanHistoryHandler,
  },
  {
    method: "GET",
    path: "/api/get-profile",
    handler: getUserInformation,
  },
  {
    method: "OPTIONS",
    path: "/{any*}", // Menangkap semua path untuk metode OPTIONS
    handler: (request, h) => {
      // Cukup kembalikan respons 204 No Content.
      // Header CORS akan ditambahkan oleh Hapi berdasarkan konfigurasi global.
      return h.response().code(204);
    },
  },
];
