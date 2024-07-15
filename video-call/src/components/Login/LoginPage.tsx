import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useVideoClient } from "../VideoClientContext"; // Import the useVideoClient hook

import "./Login.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate hook
  const { setClientDetails } = useVideoClient(); // Destructure setClientDetails from context

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      // Validate inputs
      if (email === "") {
        setEmailError("Please enter your email");
        return;
      }

      if (password === "") {
        setPasswordError("Please enter a password");
        return;
      }

      // Initialize Firestore
      const db = getFirestore();

      // Query Firestore for the user document based on email and password
      const q = query(
        collection(db, "users"),
        where("email", "==", email),
        where("password", "==", password)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setEmailError("Invalid email or password");
        return;
      }

      // Assuming there's only one user document that matches the query
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      const userId = userData.userId;
      const token = userData.token;
      console.log(token);
      // Set the client details in context
      setClientDetails(userId, token);

      // Navigate to home page after successful login
      navigate("/home");
    } catch (error) {
      console.error("Error during login:", error);
      // Handle error (show error message, retry, etc.)
    }
  };

  return (
    <div className="login-box">
      <h2>Login</h2>
      <form onSubmit={handleFormSubmit}>
        <div className="user-box">
          <input
            value={email}
            placeholder="Enter email address here"
            onChange={(ev) => setEmail(ev.target.value)}
          />
          <label className="errorLabel">{emailError}</label>
        </div>
        <div className="user-box">
          <input
            value={password}
            placeholder="Enter password here"
            type="password"
            onChange={(ev) => setPassword(ev.target.value)}
          />
          <label className="errorLabel">{passwordError}</label>
        </div>
        <button type="submit" className="inputButton">
          Submit
        </button>
      </form>
      <p>
        Don't have an account? <Link to="/signup">Sign up here</Link>
      </p>
    </div>
  );
}

export default LoginPage;
