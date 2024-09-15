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

interface CallControlsProps {
  onLeave: () => void;
}

const CallControls: React.FC<CallControlsProps> = ({ onLeave }) => (
  <div className="str-video__call-controls">
    <ToggleAudioPublishingButton />
    <ToggleVideoPublishingButton />
    <ScreenShareButton />
    <CancelCallButton onLeave={onLeave} />
  </div>
);

const JoinMeeting = () => {
  const server_ip = "rmvideocall.vercel.app";
  const navigate = useNavigate();
  const { client, user } = useVideoClient(); // Extract user from context
  const [callId, setCallId] = useState("");
  const [call, setCall] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(true);
  const [postCallDialogOpen, setPostCallDialogOpen] = useState(false); // New dialog state
  const [dialogTimer, setDialogTimer] = useState<NodeJS.Timeout | null>(null); // Timer for post-call dialog

  // Function to send participant data to the server
  const sendParticipantDataToServer = async (callId: any, userId: any) => {
    try {
      const response = await fetch(
        `https://${server_ip}/api/meeting-add-participant`,
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
    const storedCallId = localStorage.getItem("currentCallId");
    if (storedCallId && client) {
      const callType = "default";
      const trimmedCallId = storedCallId.trim();

      const joinStoredCall = async () => {
        try {
          const existingCall = client.call(callType, trimmedCallId);
          await existingCall.join();
          setCall(existingCall); // Set active call instance

          if (user) {
            await sendParticipantDataToServer(trimmedCallId, user.id);
          }
        } catch (error) {
          console.error("Error joining existing call:", error);
        }
      };

      joinStoredCall();
    }
  }, [client, user]);

  const handleJoinMeeting = async () => {
    const callType = "default";
    const trimmedCallId = callId.trim();
    if (!client) {
      console.error("StreamVideoClient is not initialized.");
      return;
    }

    try {
      const newCall = client.call(callType, trimmedCallId);
      await newCall.join();
      setCall(newCall); // Set active call instance

      localStorage.setItem("currentCallId", trimmedCallId);
      setDialogOpen(false); // Close join dialog

      if (user) {
        await sendParticipantDataToServer(trimmedCallId, user.id);
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
    // Implement logout logic
  };

  // Timer for the post-call dialog
  const startPostCallTimer = () => {
    const timer = setTimeout(() => {
      setPostCallDialogOpen(false);
      navigate("/home"); // Navigate after 30 seconds
    }, 30000); // 30 seconds
    setDialogTimer(timer);
  };

  const handlePostCallClose = () => {
    setPostCallDialogOpen(false);
    if (dialogTimer) {
      clearTimeout(dialogTimer);
    }
    navigate("/home");
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
          <Dialog open={dialogOpen} onClose={handleCancel}>
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
              <Button onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleJoinMeeting}>Join Meeting</Button>
            </DialogActions>
          </Dialog>
        ) : (
          <StreamCall call={call}>
            <JoinedMeetingUI
              onCallEnd={() => setPostCallDialogOpen(true)} // Open post-call dialog on call end
            />
          </StreamCall>
        )}
      </div>

      {/* Post-call dialog */}
      <Dialog open={postCallDialogOpen} onClose={handlePostCallClose}>
        <DialogTitle>Call Ended</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The call has ended. You will be redirected to the home page in 30
            seconds.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePostCallClose}>Close Now</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const JoinedMeetingUI = ({ onCallEnd }: { onCallEnd: () => void }) => {
  const navigate = useNavigate();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const handleLeaveCall = () => {
    localStorage.removeItem("currentCallId");
    navigate("/home");
  };

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      onCallEnd();
    }
  }, [callingState, onCallEnd]);

  return (
    <StreamTheme>
      <SpeakerLayout participantsBarPosition="top" />
      <CallControls onLeave={handleLeaveCall} />
    </StreamTheme>
  );
};

export default JoinMeeting;
