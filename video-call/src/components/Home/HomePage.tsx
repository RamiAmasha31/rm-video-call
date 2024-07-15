// HomePage.tsx

import { Link } from "react-router-dom";

const HomePage = () => {
  const handleLogout = () => {
    // Implement logout logic here
    // For example, clear session, localStorage, etc.
    console.log("Logged out");
  };

  return (
    <div className="home-page">
      <nav className="navbar">
        <div className="navbar-brand">RM-VIDEO-CONFERENCE</div>
        <div className="navbar-links">
          <Link to="/home" className="nav-link">
            Home
          </Link>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
          <Link to="/create-meeting" className="nav-link">
            {" "}
            {/* Link to CreateMeeting component */}
            Create Meeting
          </Link>
          <Link to="/join-meeting" className="nav-link">
            {" "}
            {/* Link to CreateMeeting component */}
            Create Meeting
          </Link>
        </div>
      </nav>
      <div className="main-content">
        <h2>Welcome to the Home Page</h2>
        <p>This is a simple home page for your application.</p>
        <p>You can add more content or features here as needed.</p>
      </div>
    </div>
  );
};

export default HomePage;
