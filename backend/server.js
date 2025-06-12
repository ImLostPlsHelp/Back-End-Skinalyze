import Hapi from "@hapi/hapi";
import dotenv from "dotenv";
import { routes } from "./routes.js";
dotenv.config(); // Panggil ini di awal

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000, // Render akan menyediakan process.env.PORT
    host: "0.0.0.0",         // Penting untuk lingkungan container seperti Render
    routes: {
      cors: {
        origin: ["https://capstone-dbs-skinalyze.vercel.app"], // Sesuaikan jika frontend juga pindah
        credentials: true,
        headers: [
          "Accept",
          "Authorization",
          "Content-Type",
          "If-None-Match",
          "Origin",
          "X-Requested-With",
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        exposedHeaders: ["WWW-Authenticate", "Server-Authorization"],
        maxAge: 600,
      },
    },
  });

  server.route(routes);
  // await server.initialize(); // Ganti ini
  await server.start();      // Dengan ini untuk memulai server
  console.log("Server running on", server.info.uri);
};

init().catch((err) => { // Tambahkan penanganan error untuk init
    console.error("Failed to start server:", err);
    process.exit(1);
});
