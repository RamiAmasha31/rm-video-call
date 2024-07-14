import React from "react";
import { Link } from "react-router-dom";
import { useVideoClient } from "../VideoClientContext"; // Import the context hook
// import { MyUILayout } from "./MyUILayout"; // Import MyUILayout component
import {
  CallControls,
  CallingState,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";

function HomePage() {
  const { client } = useVideoClient(); // Access the StreamVideoClient instance from context
  const [call, setCall] = React.useState(null); // State to hold the active call instance
  const [callCreated, setCallCreated] = React.useState(false); // State to track if call is created

  const handleCreateMeeting = async () => {
    if (!client) {
      console.error("StreamVideoClient is not initialized.");
      return;
    }

    const callType = "default";
    const callId = "test-call2";

    try {
      const newCall = client.call(callType, callId);
      await newCall.getOrCreate();
      await newCall.join();
      console.log("Call created and joined successfully:", newCall);
      setCall(newCall); // Set the active call instance
      setCallCreated(true); // Trigger rendering of MyUILayout
    } catch (error) {
      console.error("Error creating or joining call:", error);
      // Handle error (show message, retry, etc.)
    }
  };

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
          <button onClick={handleCreateMeeting} className="nav-link">
            Create Meeting
          </button>
          <Link to="/join-meeting" className="nav-link">
            Join Meeting
          </Link>
          <Link to="/display-logs" className="nav-link">
            Display Logs
          </Link>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </nav>
      <div className="main-content">
        <h2>Welcome to the Home Page</h2>
        <p>This is a simple home page for your application.</p>
        <p>You can add more content or features here as needed.</p>
      </div>
      {callCreated && (
        <StreamCall call={call}>
          <MyUILayout client={client} call={call} />
        </StreamCall>
      )}
    </div>
  );
}

export default HomePage;

export const MyUILayout = ({ client, call }) => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) {
    return <div>Loading...</div>;
  }

  return (
    <StreamVideo client={client}>
      <StreamTheme>
        <SpeakerLayout participantsBarPosition="bottom" />
        <CallControls />
      </StreamTheme>
    </StreamVideo>
  );
};
