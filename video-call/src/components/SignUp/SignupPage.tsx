import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");
  const navigate = useNavigate();
  const server_ip = "rmvideocall.vercel.app";

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (password.length < 8) {
      setPasswordError("Password must be 8 characters or longer");
      return;
    }

    try {
      const response = await fetch(`https://${server_ip}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Signup failed");
      }

      navigate("/home");
    } catch (error) {
      console.error("Error during signup:", error);
      setEmailError("Signup failed, please try again");
      setPasswordError("Signup failed, please try again");
      setConfirmPasswordError("Signup failed, please try again");
    }
  };

  return (
    <div className="signup-box">
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
        <div className="user-box">
          <input
            value={email}
            placeholder="Enter email address here"
            onChange={(e) => setEmail(e.target.value)}
            className="user-box"
          />
          <label className="errorLabel">{emailError}</label>
        </div>
        <div className="user-box">
          <input
            value={password}
            placeholder="Enter password here"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            className="user-box"
          />
          <label className="errorLabel">{passwordError}</label>
        </div>
        <div className="user-box">
          <input
            value={confirmPassword}
            placeholder="Confirm password"
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="user-box"
          />
          <label className="errorLabel">{confirmPasswordError}</label>
        </div>
        <button type="submit" className="inputButton">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignupPage;
