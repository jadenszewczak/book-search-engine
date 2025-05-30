console.log("Server file loaded, starting imports...");

import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import path from "node:path";
import { fileURLToPath } from "node:url";
import db from "./config/connection.js";
import { typeDefs, resolvers } from "./schemas/index.js";
import { authenticateToken } from "./services/auth.js";

console.log("Imports completed, setting up server...");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  console.log("Starting Apollo Server...");
  await server.start();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: authenticateToken as any,
    })
  );

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../../client/dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
    });
  }

  console.log("Setting up server...");

  // Function to start the Express server
  const startServer = () => {
    app.listen(PORT, () => {
      console.log(`🌍 API server running on port ${PORT}!`);
      console.log(`🚀 Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  };

  // Check if already connected
  if (db.readyState === 1) {
    console.log("MongoDB already connected!");
    startServer();
  } else {
    console.log("Waiting for MongoDB connection...");
    db.once("open", () => {
      console.log("MongoDB connected!");
      startServer();
    });
  }
};

console.log("Calling startApolloServer...");
startApolloServer();
