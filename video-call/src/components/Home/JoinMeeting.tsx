import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useVideoClient } from "../VideoClientContext";
import {
  StreamCall,
  CallControls,
  StreamTheme,
  SpeakerLayout,
  useCallStateHooks,
  CallingState,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

const JoinMeeting = () => {
  const navigate = useNavigate();
  const { client } = useVideoClient();
  const [meetingId, setMeetingId] = useState("");
  const [call, setCall] = useState(null);

  useEffect(() => {
    // Check if there's a stored call ID in localStorage
    const storedCallId = localStorage.getItem("currentCallId");

    // If there's a stored call ID, attempt to join the call on mount
    if (storedCallId && client) {
      const callType = "default";
      const callId = storedCallId.trim(); // Use the stored meeting ID

      const joinStoredCall = async () => {
        try {
          const existingCall = client.call(callType, callId);
          await existingCall.join();
          console.log("Joined existing call successfully:", existingCall);
          setCall(existingCall); // Set the active call instance
        } catch (error) {
          console.error("Error joining existing call:", error);
          // Handle error (show message, retry, etc.)
        }
      };

      joinStoredCall();
    }
  }, [client]);

  const handleJoinMeeting = async () => {
    const callType = "default";
    const callId = meetingId.trim(); // Use the entered meeting ID
    if (!client) {
      console.error("StreamVideoClient is not initialized.");
      return;
    }

    try {
      const newCall = client.call(callType, callId);
      await newCall.join();
      console.log("Joined call successfully:", newCall);
      setCall(newCall); // Set the active call instance

      // Store the current call ID in localStorage for persistence
      localStorage.setItem("currentCallId", callId);
    } catch (error) {
      console.error("Error joining call:", error);
      // Handle error (show message, retry, etc.)
    }
  };

  const handleGoBack = () => {
    navigate("/home");
  };

  return (
    <div className="join-meeting-page">
      <nav className="navbar">
        <div className="navbar-brand">Join Meeting</div>
        <div className="navbar-links">
          <button onClick={handleGoBack} className="nav-link">
            Go Back
          </button>
        </div>
      </nav>
      <div className="main-content">
        {!call ? (
          <div className="join-dialog">
            <h2>Enter Meeting ID</h2>
            <input
              type="text"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              placeholder="Enter Meeting ID"
            />
            <button onClick={handleJoinMeeting}>Join Meeting</button>
          </div>
        ) : (
          <StreamCall call={call}>
            <JoinedMeetingUI call={call} />
          </StreamCall>
        )}
      </div>
    </div>
  );
};

const JoinedMeetingUI = ({ call }) => {
  const navigate = useNavigate();

  const handleLeaveCall = () => {
    // Clear the stored call ID when leaving the call
    localStorage.removeItem("currentCallId");

    // Navigate back to home page when leaving the call
    navigate("/home");
  };

  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState === CallingState.LEFT) {
    handleLeaveCall();
  }

  return (
    <StreamTheme>
      <SpeakerLayout participantsBarPosition="top" />
      <CallControls onLeave={handleLeaveCall} />
    </StreamTheme>
  );
};

export default JoinMeeting;
