// server/server.js
const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 5000;

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../public")));

// Example API endpoint
app.get("/api/data", (req, res) => {
  res.json({ message: "Hello from the server!" });
});

// Handle other routes or API endpoints as needed

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
