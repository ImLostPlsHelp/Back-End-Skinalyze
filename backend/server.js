import Hapi from "@hapi/hapi";
import dotenv from "dotenv";
import { routes } from "./routes.js";
dotenv.config(); // Panggil ini di awal

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: "0.0.0.0",
    routes: {
      cors: {
        origin: ["https://capstone-dbs-skinalyze.vercel.app"],
        credentials: true,
        headers: [
          "Accept",
          "Authorization",
          "Content-Type",
          "If-None-Match",
          "Origin",
          "X-Requested-With"
        ],
        exposedHeaders: ["WWW-Authenticate", "Server-Authorization"],
        maxAge: 600
        // ✅ Jangan tambahkan 'methods' di sini
      }
    }
  });

  server.route(routes);
  await server.start();
  console.log("Server running on", server.info.uri);
};

init().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
