import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Greep Notification API",
      version: "1.0.0",
      description: "API documentation for Greep Notification backend",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Local server",
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Path to your route files
};

export const swaggerSpec = swaggerJsdoc(options);
