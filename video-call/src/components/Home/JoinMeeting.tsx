import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import exit from "../../assets/HomePage/exit.png";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

const JoinMeeting = () => {
  const navigate = useNavigate();
  const { client } = useVideoClient();
  const [meetingId, setMeetingId] = useState("");
  const [call, setCall] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(true);

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
      setDialogOpen(false); // Close the dialog
    } catch (error) {
      console.error("Error joining call:", error);
      // Handle error (show message, retry, etc.)
    }
  };

  const handleLogout = () => {
    navigate("/");
    // Implement logout logic here
    // For example, clear session, localStorage, etc.
  };

  return (
    <div className="join-meeting-page">
      <Link to="/" className="exit-button">
        <img
          src={exit}
          onClick={handleLogout}
          alt="Exit"
          className="exit-icon"
        />
      </Link>
      <div className="main-content">
        {!call ? (
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
            <DialogTitle>Enter Meeting ID</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Please enter the meeting ID to join the meeting.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="meeting-id"
                label="Meeting ID"
                type="text"
                fullWidth
                variant="standard"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleJoinMeeting}>Join Meeting</Button>
            </DialogActions>
          </Dialog>
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
