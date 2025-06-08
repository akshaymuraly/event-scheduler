const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const cors = require("cors");
require("dotenv").config();

const { connectDB, getDB } = require("./config/database");
const typeDefs = require("./config/typeDef");
const resolvers = require("./resolvers");

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Create Express app
    const app = express();

    // CORS configuration
    app.use(
      cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        credentials: true,
      })
    );

    // Create Apollo Server
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req }) => ({
        db: getDB(),
        req,
      }),
      introspection: process.env.NODE_ENV !== "production",
      playground: process.env.NODE_ENV !== "production",
    });

    // Start the server
    await server.start();

    // Apply the Apollo GraphQL middleware
    server.applyMiddleware({
      app,
      path: "/graphql",
      cors: false, // We handle CORS above
    });

    const PORT = process.env.PORT || 4000;

    app.listen(PORT, () => {
      console.log(
        `🚀 Server running at http://localhost:${PORT}${server.graphqlPath}`
      );
      console.log(
        `📊 GraphQL Playground available at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🔄 Shutting down server gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🔄 Shutting down server gracefully...");
  process.exit(0);
});

startServer();
