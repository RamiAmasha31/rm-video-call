import { createServer } from "http";
import { parse } from "url";
import { join } from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path"; // Add this import for `path`
import { Handler } from "@vercel/node";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = createServer((req, res) => {
  const parsedUrl = parse(req.url, true);
  const { pathname } = parsedUrl;

  // Route API requests
  if (pathname.startsWith("/api/")) {
    const apiFile = join(__dirname, `api${pathname}.js`);
    if (fs.existsSync(apiFile)) {
      const handler = require(apiFile).default;
      return handler(req, res);
    } else {
      res.statusCode = 404;
      res.end("Not Found");
      return;
    }
  }

  // Static file handling is no longer needed here
  // This is now handled by Vercel directly from the `dist` folder

  // 404 for other routes
  res.statusCode = 404;
  res.end("Not Found");
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

export default server;
