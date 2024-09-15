import { useState, useEffect } from "react";
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

// Call controls component
const CallControls = ({ onLeave }) => (
  <div className="str-video__call-controls">
    <ToggleAudioPublishingButton />
    <ToggleVideoPublishingButton />
    <ScreenShareButton />
    <CancelCallButton onLeave={onLeave} />
  </div>
);

// Dialog component for joining a meeting
const JoinMeetingDialog = ({ open, callId, onJoin, onCancel }) => (
  <Dialog open={open} onClose={onCancel}>
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
        onChange={(e) => onJoin(e.target.value)}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button onClick={onJoin}>Join Meeting</Button>
    </DialogActions>
  </Dialog>
);

// Main component for joining a meeting
const JoinMeeting = () => {
  const server_ip = "rmvideocall.vercel.app";
  const navigate = useNavigate();
  const { client, user } = useVideoClient();
  const [callId, setCallId] = useState("");
  const [call, setCall] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(true);

  // Function to send participant data to the server
  const sendParticipantDataToServer = async (callId, userId) => {
    try {
      const response = await fetch(
        `https://${server_ip}/api/meeting-add-participant`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ callId, userId }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
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
    const storedCallId = localStorage.getItem("currentCallId");

    if (storedCallId && client) {
      const joinStoredCall = async () => {
        try {
          const existingCall = client.call("default", storedCallId.trim());
          await existingCall.join();
          console.log("Joined existing call successfully:", existingCall);
          setCall(existingCall);

          if (user) {
            await sendParticipantDataToServer(storedCallId.trim(), user.id);
          }
        } catch (error) {
          console.error("Error joining existing call:", error);
        }
      };

      joinStoredCall();
    }
  }, [client, user]);

  const handleJoinMeeting = async () => {
    if (!client) {
      console.error("StreamVideoClient is not initialized.");
      return;
    }

    try {
      const newCall = client.call("default", callId.trim());
      await newCall.join();
      console.log("Joined call successfully:", newCall);
      setCall(newCall);
      localStorage.setItem("currentCallId", callId.trim());
      setDialogOpen(false);

      if (user) {
        await sendParticipantDataToServer(callId.trim(), user.id);
      }
    } catch (error) {
      console.error("Error joining call:", error);
    }
  };

  const handleCancel = () => {
    setDialogOpen(false);
    navigate("/home");
  };

  const handleLogout = () => {
    navigate("/");
    // Implement logout logic here
    localStorage.removeItem("currentCallId");
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
          <JoinMeetingDialog
            open={dialogOpen}
            callId={callId}
            onJoin={handleJoinMeeting}
            onCancel={handleCancel}
          />
        ) : (
          <StreamCall call={call}>
            <JoinedMeetingUI />
          </StreamCall>
        )}
      </div>
    </div>
  );
};

// UI for an ongoing meeting
const JoinedMeetingUI = () => {
  const navigate = useNavigate();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      localStorage.removeItem("currentCallId");
      navigate("/home");
    }
  }, [callingState, navigate]);

  const handleLeaveCall = () => {
    localStorage.removeItem("currentCallId");
    navigate("/home");
  };

  return (
    <StreamTheme>
      <SpeakerLayout participantsBarPosition="top" />
      <CallControls onLeave={handleLeaveCall} />
    </StreamTheme>
  );
};

export default JoinMeeting;
