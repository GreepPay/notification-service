type Handler = (req: BunRequest) => Response | Promise<Response>;

interface Route {
  method: string;
  path: string;
  handler: Handler;
}

export interface BunRequest extends Request {
  params: Record<string, string>;
  query: URLSearchParams;
}

class Router {
  private routes: Route[] = [];

  // Register a new route
  add(method: string, path: string, handler: Handler) {
    this.routes.push({ method: method.toUpperCase(), path, handler });
  }

  // Match incoming request with registered routes
  match(req: Request) {
    const url = new URL(req.url);
    const method = req.method.toUpperCase();
    const pathParts = url.pathname.split("/").filter(Boolean);

    for (const route of this.routes) {
      const routeParts = route.path.split("/").filter(Boolean);

      if (route.method !== method || routeParts.length !== pathParts.length) {
        continue;
      }

      const params: Record<string, string> = {};
      let match = true;

      for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(":")) {
          params[routeParts[i].slice(1)] = pathParts[i];
        } else if (routeParts[i] !== pathParts[i]) {
          match = false;
          break;
        }
      }

      if (match) {
        // Extend the Request object with `params` and `query`
        const extendedRequest: BunRequest = Object.assign(req, {
          params,
          query: url.searchParams,
        });

        return route.handler(extendedRequest);
      }
    }

    return new Response("Not Found", { status: 404 });
  }
}

// Initialize Router
const router = new Router();

export default router;