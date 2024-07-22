import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/Login/LoginPage";
import SignupPage from "./components/SignUp/SignupPage";
import HomePage from "./components/Home/HomePage";
import { VideoClientProvider } from "./components/VideoClientContext";
import CreateMeeting from "./components/Home/CreateMeeting"; // Import the CreateMeeting component
import JoinMeeting from "./components/Home/JoinMeeting"; // Import the CreateMeeting component
import Logs from "./components/Home/Logs"; // Import the Logs component

const App: React.FC = () => {
  return (
    <VideoClientProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/create-meeting" element={<CreateMeeting />} />{" "}
          <Route path="/join-meeting" element={<JoinMeeting />} />{" "}
          <Route path="/display-logs" element={<Logs />} />
          {/* Define route for CreateMeeting component */}
        </Routes>
      </Router>
    </VideoClientProvider>
  );
};

export default App;
