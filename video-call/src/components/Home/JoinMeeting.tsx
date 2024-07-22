import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useVideoClient } from "../VideoClientContext";
import {
  StreamCall,
  StreamTheme,
  SpeakerLayout,
  useCallStateHooks,
  CallingState,
  CancelCallButton,
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
  ScreenShareButton,
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

// Custom CallControls component without RecordCallButton
const CallControls = ({ onLeave }) => (
  <div className="str-video__call-controls">
    <ToggleAudioPublishingButton />
    <ToggleVideoPublishingButton />
    <ScreenShareButton />
    <CancelCallButton onLeave={onLeave} />
  </div>
);

const JoinMeeting = () => {
  const navigate = useNavigate();
  const { client, user } = useVideoClient(); // Extract user from context
  const [callId, setCallId] = useState("");
  const [call, setCall] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(true);

  // Function to send participant data to the server
  const sendParticipantDataToServer = async (callId, userId) => {
    try {
      const response = await fetch(
        "http://localhost:3002/api/meeting/add-participant",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ callId, userId }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text(); // Get the error message from the server
        throw new Error(
          `Failed to send participant data to server: ${errorText}`
        );
      }

      console.log("Participant data sent successfully");
    } catch (error) {
      console.error("Error sending participant data:", error);
    }
  };

  useEffect(() => {
    // Check if there's a stored call ID in localStorage
    const storedCallId = localStorage.getItem("currentCallId");

    // If there's a stored call ID, attempt to join the call on mount
    if (storedCallId && client) {
      const callType = "default";
      const trimmedCallId = storedCallId.trim(); // Use the stored call ID

      const joinStoredCall = async () => {
        try {
          const existingCall = client.call(callType, trimmedCallId);
          await existingCall.join();
          console.log("Joined existing call successfully:", existingCall);
          setCall(existingCall); // Set the active call instance

          // Send participant data to the server
          if (user) {
            await sendParticipantDataToServer(trimmedCallId, user.id);
          }
        } catch (error) {
          console.error("Error joining existing call:", error);
          // Handle error (show message, retry, etc.)
        }
      };

      joinStoredCall();
    }
  }, [client, user]);

  const handleJoinMeeting = async () => {
    const callType = "default";
    const trimmedCallId = callId.trim(); // Use the entered call ID
    if (!client) {
      console.error("StreamVideoClient is not initialized.");
      return;
    }

    try {
      const newCall = client.call(callType, trimmedCallId);
      await newCall.join();
      console.log("Joined call successfully:", newCall);
      setCall(newCall); // Set the active call instance

      // Store the current call ID in localStorage for persistence
      localStorage.setItem("currentCallId", trimmedCallId);
      setDialogOpen(false); // Close the dialog

      // Send participant data to the server
      if (user) {
        await sendParticipantDataToServer(trimmedCallId, user.id);
      }
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
            <DialogTitle>Enter Call ID</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Please enter the call ID to join the meeting.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="call-id"
                label="Call ID"
                type="text"
                fullWidth
                variant="standard"
                value={callId}
                onChange={(e) => setCallId(e.target.value)}
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
