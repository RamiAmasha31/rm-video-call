import { useState } from "react";
import { Link } from "react-router-dom";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import "./Login.css";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate hook

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

      // Add a new document with a generated ID
      const docRef = await addDoc(collection(db, "users"), {
        email: email,
        password: password,
      });

      console.log("Document written with ID: ", docRef.id);

      // Clear form inputs after successful login
      setEmail("");
      setPassword("");
      setEmailError("");
      setPasswordError("");

      // Navigate to home page after successful login
      navigate("/home");

      // Handle success (show message, etc.)
      console.log("User data stored successfully!");
    } catch (error) {
      console.error("Error storing user data:", error);
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
