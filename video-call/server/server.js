const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { initializeApp } = require("firebase/app");
const { getAnalytics } = require("firebase/analytics");
const {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} = require("firebase/firestore");

const app = express();
const port = process.env.PORT || 3002;

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Middleware to parse JSON bodies

const firebaseConfig = {
  apiKey: "AIzaSyB599j7kOPQ9mWNHUdx4hh8wdKyI5T-i1A",
  authDomain: "finalproject-56ffd.firebaseapp.com",
  projectId: "finalproject-56ffd",
  storageBucket: "finalproject-56ffd.appspot.com",
  messagingSenderId: "208463639673",
  appId: "1:208463639673:web:de2802c7be88673caf50a8",
  measurementId: "G-HV2K04FDW0",
};

// Initialize Firebase
const appFB = initializeApp(firebaseConfig);
// const analytics = getAnalytics(appFB);
const db = getFirestore(appFB);

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // console.log(email, password);

    // Query Firestore for the user document based on email and password
    const q = query(
      collection(db, "users"),
      where("email", "==", email),
      where("password", "==", password)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Assuming there's only one user document that matches the query
    const userData = querySnapshot.docs[0].data();
    const userId = userData.userId;
    const token = userData.token;

    // Return success response with user data
    res.status(200).json({ userId, token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
