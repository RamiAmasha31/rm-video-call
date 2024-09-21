import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import createMeeting from "../../assets/HomePage/workshop.png";
import joinMeeting from "../../assets/HomePage/join.png";
import log from "../../assets/HomePage/log.png";
import rami from "../../assets/HomePage/rami.jpg";
import moaed from "../../assets/HomePage/moaed.jpg";
import ronen from "../../assets/HomePage/ronen.png";
import exit from "../../assets/HomePage/exit.png";
import logo from "../../assets/HomePage/logo.png";
import ConUs from "../../assets/HomePage/email.png";
import { useNavigate } from "react-router-dom";
import "../Home/HomePage.css";

const tutorialSteps = [
  {
    text: "Welcome to RM-VIDEO-CONFRENCE website! Here are some instructions to help you!",
    image: logo, // Replace with your image path
  },
  {
    text: "1. Create Meeting: Click on 'Create Meeting' to generate a new meeting ID and invite others.",
    image: createMeeting, // Replace with your image path
  },
  {
    text: "2. Join Meeting: Enter the meeting ID provided by the host to join an ongoing meeting.",
    image: joinMeeting, // Replace with your image path
  },
  {
    text: "3. Display Logs: Access your previous meeting transcriptions by clicking on 'Display Logs.'",
    image: log, // Replace with your image path
  },
  {
    text: "If you have any questions, feel free to reach out at :\n Ramiamasha84@gmail.com",
    image: ConUs, // Replace with your image path
  },
];

const HomePage: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  const handleLogout = () => {
    navigate("/");
  };

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      toggleModal();
    }
  };

  return (
    <div className="home-page">
      <nav className="navbar">
        <div className="brand-logo">
          <img src={logo} alt="Logo" />
        </div>
        <div className="icon-container">
          <span className="help-icon" onClick={toggleModal} title="User Help">
            <FontAwesomeIcon icon={faQuestionCircle} color="#d3d3d3" />
          </span>
          <img
            src={exit}
            onClick={handleLogout}
            alt="Exit"
            className="exit-icon"
          />
        </div>
      </nav>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={toggleModal}>
              &times;
            </span>
            <h2>User Help</h2>
            <div className="tutorial-step">
              <img src={tutorialSteps[currentStep].image} alt="Tutorial Step" />
              <p>{tutorialSteps[currentStep].text}</p>
            </div>
            <button onClick={nextStep}>
              {currentStep < tutorialSteps.length - 1 ? "Next" : "Exit"}
            </button>
          </div>
        </div>
      )}

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
            <Link to="/logs" className="card">
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
                Rafael Advanced Defense Systems
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
