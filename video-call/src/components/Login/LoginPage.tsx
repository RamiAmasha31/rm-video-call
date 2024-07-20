import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useVideoClient } from "../VideoClientContext"; // Import the useVideoClient hook

import "./Login.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate hook
  const { setClientDetails } = useVideoClient(); // Destructure setClientDetails from context

  const handleFormSubmit = async (event) => {
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

      // Make POST request to server endpoint using Fetch API
      const response = await fetch("http://localhost:3002/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // Check if the response is OK
      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      const data = await response.json();
      const { userId, token } = data;

      setClientDetails(userId, token);

      // Navigate to home page after successful login
      navigate("/home");
    } catch (error) {
      console.error("Error during login:", error);
      setEmailError("Invalid email or password");
      setPasswordError("Invalid email or password");
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
