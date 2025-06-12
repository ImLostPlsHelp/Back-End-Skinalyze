import Hapi from "@hapi/hapi";
import dotenv from "dotenv";
import { routes } from "./routes.js";
dotenv.config();

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
          "X-Requested-With",
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        exposedHeaders: ["WWW-Authenticate", "Server-Authorization"],
        maxAge: 600,
      },
    },
  });

  server.route(routes);
  server.initialize();
  console.log("Server running on", server.info.uri);
};

init();
