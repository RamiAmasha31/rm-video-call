import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/Login/LoginPage";
import SignupPage from "./components/SignUp/SignupPage";
import HomePage from "./components/Home/HomePage";
import { VideoClientProvider } from "./components/VideoClientContext";

// Import necessary Firebase modules
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

const App: React.FC = () => {
  return (
    <VideoClientProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />

          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </Router>
    </VideoClientProvider>
  );
};

export default App;
