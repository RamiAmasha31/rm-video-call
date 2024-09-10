import React from "react";
import { Link } from "react-router-dom";
import createMeeting from "../../assets/HomePage/workshop.png";
import joinMeeting from "../../assets/HomePage/join.png";
import log from "../../assets/HomePage/log.png";
import rami from "../../assets/HomePage/rami.jpg";
import moaed from "../../assets/HomePage/moaed.jpg";
import ronen from "../../assets/HomePage/ronen.png";
import exit from "../../assets/HomePage/exit.png";
import logo from "../../assets/HomePage/logo.png";
import { useNavigate } from "react-router-dom";
import "../Home/HomePage.css";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="home-page">
      <nav className="navbar">
        <div className="brand-logo">
          <img src={logo} alt="Logo" />
        </div>
        <img
          src={exit}
          onClick={handleLogout}
          alt="Exit"
          className="exit-icon"
        />
      </nav>

      <div className="main-content">
        <section className="cards-section">
          <div className="cards-container">
            <Link to="/create-meeting" className="card">
              <img src={createMeeting} alt="Create Meeting" />
              <h3>Create Meeting</h3>
              <p>
                Create Meeting and invite your colleagues by sending them the
                meeting ID.
              </p>
            </Link>
            <Link to="/join-meeting" className="card">
              <img src={joinMeeting} alt="Join Meeting" />
              <h3>Join Meeting</h3>
              <p>Join an active meeting by only entering its ID.</p>
            </Link>
            <Link to="/fetchlogs" className="card">
              <img src={log} alt="Display Logs" />
              <h3>Display Logs</h3>
              <p>Display your transcription files of previous meetings!</p>
            </Link>
          </div>
        </section>
        <section className="about-section">
          <div className="about-us">
            <h2>About Us</h2>
            <p>
              We are two software engineering students working on this project
              as our final year project. Our goal is to create a video chatting
              website with a focus on saving transcriptions of the meetings,
              making it easy for users to access and review them later. This
              project aims to provide a seamless video conferencing experience
              with the added benefit of automatic transcription and storage,
              enhancing productivity and collaboration.
            </p>
          </div>
        </section>
        <section className="staff-section">
          <div className="staff-members">
            <h2>Staff Members</h2>
            <div className="staff-member">
              <img src={rami} alt="Rami Amasha" />
              <h3>Rami Amasha</h3>
              <p>Software Engineer & Applied Mathematics Department</p>
            </div>
            <div className="staff-member">
              <img src={moaed} alt="Moaed Hamze" />
              <h3>Moaed Hamze</h3>
              <p>Software Engineer Department</p>
            </div>
            <div className="staff-member">
              <img src={ronen} alt="Ronen Zelber" />
              <h3>Ronen Zelber</h3>
              <p>
                Project supervisor and Senior Software engineer,
                <br />
                Rafael Advanced Defense Systems{" "}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
