import { serve } from "bun";

const isDev = process.env.NODE_ENV !== "production";
const FRONTEND_PORT = process.env.PORT || 5173;
const PROJECTS_SERVICE_PORT = process.env.PROJECTS_SERVICE_PORT || 8000;
const TASKS_SERVICE_PORT = process.env.TASKS_SERVICE_PORT || 3000;

// Load index.html as text using Bun's file API
const indexHtmlFile = Bun.file(import.meta.dir + "/index.html");
const indexHtml = await indexHtmlFile.text();

const server = serve({
  port: FRONTEND_PORT,
  
  development: isDev && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },

  // Handle all requests - proxy API requests and serve SPA for others
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;
    
    // Serve static files (assets, scripts, styles, etc.)
    const staticFileExtensions = ['.tsx', '.ts', '.js', '.jsx', '.css', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.json', '.woff', '.woff2', '.ttf', '.eot'];
    const isStaticFile = staticFileExtensions.some(ext => pathname.endsWith(ext));
    
    if (isStaticFile) {
      // Normalize path - remove leading slashes and resolve to src directory
      // Handle both absolute paths (/frontend.tsx) and nested paths (/projects/frontend.tsx)
      const normalizedPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
      // Extract just the filename if it's in a nested path (e.g., /projects/frontend.tsx -> frontend.tsx)
      const filename = normalizedPath.split('/').pop();
      if (!filename) {
        return new Response("Invalid file path", { status: 400 });
      }
      
      // Try the requested path first, then try root directory
      let filePath = import.meta.dir + '/' + normalizedPath;
      let file = Bun.file(filePath);
      
      // If file doesn't exist at nested path, try root directory
      if (!(await file.exists()) && normalizedPath !== filename) {
        filePath = import.meta.dir + '/' + filename;
        file = Bun.file(filePath);
      }
      
      if (await file.exists()) {
        // Transpile TypeScript/TSX files to JavaScript for the browser
        if (pathname.endsWith('.tsx') || pathname.endsWith('.ts')) {
          try {
            const result = await Bun.build({
              entrypoints: [filePath],
              target: 'browser',
              format: 'esm',
              sourcemap: 'inline',
              minify: false,
            });
            
            if (result.success && result.outputs.length > 0 && result.outputs[0]) {
              const transpiledCode = await result.outputs[0].text();
              return new Response(transpiledCode, {
                headers: {
                  'Content-Type': 'application/javascript',
                },
              });
            } else {
              console.error('Build failed:', result.logs);
              return new Response('Transpilation failed', { status: 500 });
            }
          } catch (error) {
            console.error('Error transpiling:', error);
            return new Response('Transpilation error', { status: 500 });
          }
        }
        
        // For other static files, serve as-is
        return new Response(file);
      }
      
      // If file doesn't exist, return 404
      return new Response("File not found", { status: 404 });
    }
    
    // Proxy requests to /api/projects to projects_service
    if (pathname.startsWith("/api/projects")) {
      const targetUrl = `http://localhost:${PROJECTS_SERVICE_PORT}${url.pathname}${url.search}`;
      try {
        // Get request body if present
        let body: string | undefined;
        if (req.method !== "GET" && req.method !== "HEAD") {
          body = await req.text();
        }
        
        // Create headers object, excluding host header
        const headers: Record<string, string> = {};
        req.headers.forEach((value, key) => {
          if (key.toLowerCase() !== 'host') {
            headers[key] = value;
          }
        });
        
        const response = await fetch(targetUrl, {
          method: req.method,
          headers,
          body,
        });
        
        const responseBody = await response.text();
        return new Response(responseBody, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: `Failed to proxy to projects service: ${error}` }),
          { status: 502, headers: { "Content-Type": "application/json" } }
        );
      }
    }
    
    // Proxy requests to /api/tasks and /api/comments to tasks_service
    if (pathname.startsWith("/api/tasks") || pathname.startsWith("/api/comments")) {
      const targetUrl = `http://localhost:${TASKS_SERVICE_PORT}${url.pathname}${url.search}`;
      try {
        // Get request body if present
        let body: string | undefined;
        if (req.method !== "GET" && req.method !== "HEAD") {
          body = await req.text();
        }
        
        // Create headers object, excluding host header
        const headers: Record<string, string> = {};
        req.headers.forEach((value, key) => {
          if (key.toLowerCase() !== 'host') {
            headers[key] = value;
          }
        });
        
        const response = await fetch(targetUrl, {
          method: req.method,
          headers,
          body,
        });
        
        const responseBody = await response.text();
        return new Response(responseBody, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: `Failed to proxy to tasks service: ${error}` }),
          { status: 502, headers: { "Content-Type": "application/json" } }
        );
      }
    }
    
    // For all other routes, serve the index.html (SPA fallback)
    return new Response(indexHtml, {
      headers: { "Content-Type": "text/html" },
    });
  },
});

console.log(`🚀 Frontend server running at ${server.url}`);
if (isDev) {
  console.log(`📡 Proxying /api/projects/* to http://localhost:${PROJECTS_SERVICE_PORT}`);
  console.log(`📡 Proxying /api/tasks/* and /api/comments/* to http://localhost:${TASKS_SERVICE_PORT}`);
}
