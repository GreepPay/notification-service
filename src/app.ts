import { routes } from './routes';
import { AppDataSource } from './data-source.ts';
import { readFileSync } from 'fs';
import { join } from 'path';
import { swaggerSpec } from './config/swagger.ts';

AppDataSource.initialize()
  .then(() => {
    Bun.serve({
      port: parseInt(process.env.PORT || '3000'),
      async fetch(req: Request) {
        const url = new URL(req.url);
        const pathname = url.pathname as keyof typeof routes;
        
        // Serve Swagger UI
        if (url.pathname === '/api-docs') {
            const swaggerHtml = readFileSync(
              join(__dirname, '../node_modules/swagger-ui-dist/index.html'),
              'utf-8'
            );
            return new Response(swaggerHtml.replace(
              'https://petstore.swagger.io/v2/swagger.json',
              '/swagger.json'
            ), {
              headers: { 'Content-Type': 'text/html' },
            });
          }
  
          // Serve OpenAPI specification
          if (url.pathname === '/swagger.json') {
            return new Response(JSON.stringify(swaggerSpec), {
              headers: { 'Content-Type': 'application/json' },
            });
          }

        // Handle API routes
        const route = routes[pathname];
        if (route) {
          switch (req.method) {
            case 'GET':
              const getData = await route.GET();
              return new Response(JSON.stringify(getData), {
                headers: { 'Content-Type': 'application/json' },
              });
            case 'POST':
              const body = await req.json();
              const postData = await route.POST(body as any);
              return new Response(JSON.stringify(postData), {
                headers: { 'Content-Type': 'application/json' },
                status: 201,
              });
            default:
              return new Response('Method Not Allowed', { status: 405 });
          }
        } else {
          return new Response('Not Found', { status: 404 });
        }
      },
    });

    console.log(`Server running on http://localhost:${process.env.PORT || 3000}`);
  })
  .catch((error) => console.log(error));