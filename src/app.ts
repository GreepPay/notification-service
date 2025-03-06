import "./routes";
import router from "./routes/router";
import { AppDataSource } from "./data-source.ts";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { swaggerSpec } from "./config/swagger.ts";

const swaggerUiPath = join(__dirname, "../node_modules/swagger-ui-dist");

AppDataSource.initialize()
  .then(() => {
    Bun.serve({
      hostname: "0.0.0.0", // Bind to all IP addresses
      port: parseInt(process.env.PORT || "8080"),
      async fetch(req: Request) {
        const url = new URL(req.url);

        if (url.pathname === "/api-docs") {
          let swaggerHtml = readFileSync(
            join(swaggerUiPath, "index.html"),
            "utf-8",
          );

          let initializerPath = join(swaggerUiPath, "swagger-initializer.js");

          // Replace "https://petstore.swagger.io/v2/swagger.json" with "/swagger.json" in file
          if (existsSync(initializerPath)) {
            let initializerContent = readFileSync(initializerPath, "utf-8");
            initializerContent = initializerContent.replace(
              "https://petstore.swagger.io/v2/swagger.json",
              "/swagger.json",
            );

            swaggerHtml = swaggerHtml.replace(
              /<script src=".\/swagger-initializer\.js" charset="UTF-8"> <\/script>/,
              `<script>${initializerContent}</script>`,
            );
          }

          return new Response(swaggerHtml, {
            headers: { "Content-Type": "text/html" },
          });
        }

        if (url.pathname === "/swagger.json") {
          return new Response(JSON.stringify(swaggerSpec), {
            headers: { "Content-Type": "application/json" },
          });
        }

        const filePath = join(swaggerUiPath, url.pathname);
        if (existsSync(filePath)) {
          const fileContent = readFileSync(filePath);
          return new Response(fileContent, {
            headers: { "Content-Type": getContentType(url.pathname) },
          });
        }

        // Handle API routes
        return router.match(req);
      },
    });

    console.log(
      `Server running on http://localhost:${process.env.PORT || 8080}`,
    );
  })
  .catch((error) => console.log(error));

function getContentType(pathname: string): string {
  if (pathname.endsWith(".css")) return "text/css";
  if (pathname.endsWith(".js")) return "application/javascript";
  if (pathname.endsWith(".png")) return "image/png";
  if (pathname.endsWith(".json")) return "application/json";
  return "text/plain";
}
