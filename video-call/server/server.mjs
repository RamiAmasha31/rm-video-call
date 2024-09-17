/**
 * @file server.js
 * @description Sets up and configures an Express server that handles API requests and serves static files.
 * - Initializes the Express app.
 * - Parses JSON bodies and sets CORS headers.
 * - Dynamically imports API modules based on the request URL.
 * - Serves static files from the `dist` directory.
 * - Handles 404 errors for static files.
 *
 * @module server
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises"; // Use the Promise-based version of fs for better async handling

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = 3002;

// Middleware to parse JSON bodies
app.use(express.json());

/**
 * Middleware to set CORS headers and handle preflight requests.
 * - Sets headers to allow cross-origin requests.
 * - Handles OPTIONS method for preflight requests.
 *
 * @function
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function.
 */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Or specify origin
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle OPTIONS method for preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  next();
});

/**
 * Middleware to route API requests.
 * - Dynamically imports the API module based on the request URL.
 * - Calls the module's default export as an Express handler.
 *
 * @function
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function.
 */
app.use("/api", async (req, res, next) => {
  // Strip query parameters from the URL
  const cleanUrl = req.url.split("?")[0];

  // Construct the file path dynamically
  const apiFile = path.join(__dirname, `../api${cleanUrl}.js`);

  try {
    // Dynamically import the API module
    const module = await import(`file://${apiFile}`);

    // Call the module's default export as a function (assuming it's an Express handler)
    module.default(req, res);
  } catch (error) {
    console.error("Error loading API file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * Middleware to serve static files from the `dist` directory.
 * - Handles requests for static files and falls back to `index.html` for single-page applications.
 *
 * @function
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
app.use(express.static(path.join(__dirname, "../dist")));

/**
 * Middleware to handle 404 errors for static files.
 * - Serves `index.html` for root requests or attempts to serve requested files.
 *
 * @function
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
app.use(async (req, res) => {
  const filePath = path.join(
    __dirname,
    `../dist${req.url === "/" ? "/index.html" : req.url}`
  );
  try {
    const data = await fs.readFile(filePath);
    res.send(data);
  } catch (err) {
    res.status(404).send("Not Found");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
