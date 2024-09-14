import { createServer } from "http";
import { parse } from "url";
import { join } from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = createServer((req, res) => {
  const parsedUrl = parse(req.url, true);
  const { pathname } = parsedUrl;

  // Route API requests
  if (pathname.startsWith("/api/")) {
    const apiFile = join(__dirname, `../api${pathname}.js`);
    if (fs.existsSync(apiFile)) {
      const handler = require(apiFile).default;
      return handler(req, res);
    } else {
      res.statusCode = 404;
      res.end("Not Found");
      return;
    }
  }

  // Serve static files
  const filePath = join(
    __dirname,
    `../dist${pathname === "/" ? "/index.html" : pathname}`
  );
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // If file not found, serve index.html for client-side routing
      if (err.code === "ENOENT") {
        const fallbackPath = join(__dirname, "../dist/index.html");
        fs.readFile(fallbackPath, (fallbackErr, fallbackData) => {
          if (fallbackErr) {
            res.statusCode = 404;
            res.end("Not Found");
            return;
          }
          res.setHeader("Content-Type", "text/html");
          res.end(fallbackData);
        });
        return;
      }
      res.statusCode = 404;
      res.end("Not Found");
      return;
    }
    res.setHeader("Content-Type", getContentType(filePath));
    res.end(data);
  });
});

// Helper function to determine content type
function getContentType(filePath) {
  const extname = path.extname(filePath);
  switch (extname) {
    case ".js":
      return "application/javascript";
    case ".css":
      return "text/css";
    case ".html":
      return "text/html";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

export default server;
