import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css"; // Ensure to style your modal here

const isProduction = import.meta.env.MODE === "production";
const server_ip = isProduction ? "rmvideocall.vercel.app" : "localhost:3002";
const server_protocol = isProduction ? "https" : "http";

/**
 * Modal Component
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Modal visibility state.
 * @param {string} props.message - Message to be displayed in the modal.
 * @param {() => void} props.onClose - Function to close the modal.
 */
const Modal: React.FC<{
  isOpen: boolean;
  message: string;
  onClose: () => void;
}> = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
        <button onClick={onClose} className="close-button">
          Close
        </button>
      </div>
    </div>
  );
};

/**
 * SignupPage Component
 *
 * Renders a signup form for user registration.
 * @returns {JSX.Element}
 */
const SignupPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setModalOpen(false);

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
      const response = await fetch(
        `${server_protocol}://${server_ip}/api/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (response.ok) {
        setModalMessage("Signup successful! Redirecting...");
        setModalOpen(true);
        setTimeout(() => navigate("/"), 2000); // Redirect after 2 seconds
      } else {
        const errorData = await response.json();
        setModalMessage(
          errorData.error === "Email already exists"
            ? "Email already in use"
            : "Signup failed, please try again"
        );
        setModalOpen(true);
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setModalMessage("Signup failed, please try again");
      setModalOpen(true);
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

      {/* Modal for success or error messages */}
      <Modal
        isOpen={modalOpen}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default SignupPage;
