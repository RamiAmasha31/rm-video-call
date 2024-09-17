import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useVideoClient } from "../VideoClientContext"; // Import the useVideoClient hook

import "./Login.css";

// Fetch the environment variables
const isProduction = import.meta.env.MODE === "production"; // Check if in production
const server_ip = isProduction ? "rmvideocall.vercel.app" : "localhost:3002"; // Adjust based on environment
const server_protocol = isProduction ? "https" : "http"; // Use HTTPS in production, HTTP in development
// console.log(server_ip);
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
      // Validate the inputs
      if (email === "") {
        setEmailError("Please enter your email");
        return;
      }

      if (password === "") {
        setPasswordError("Please enter a password");
        return;
      }

      // Make POST request to server endpoint using Fetch API
      const response = await fetch(
        `${server_protocol}://${server_ip}/api/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

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
            type="email"
            value={email}
            placeholder="Enter email address here"
            onChange={(ev) => setEmail(ev.target.value)}
          />
          <label className="errorLabel">{emailError}</label>
        </div>
        <div className="user-box">
          <input
            type="password"
            value={password}
            placeholder="Enter password here"
            onChange={(ev) => setPassword(ev.target.value)}
          />
          <label className="errorLabel">{passwordError}</label>
        </div>
        <button type="submit" className="inputButton">
          Login
        </button>
      </form>
      <p>
        Don't have an account? <Link to="/signup">Sign up here</Link>
      </p>
    </div>
  );
}

export default LoginPage;
