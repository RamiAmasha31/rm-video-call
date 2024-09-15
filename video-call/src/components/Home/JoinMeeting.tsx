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
  const { client, user } = useVideoClient();
  const [callId, setCallId] = useState("");
  const [call, setCall] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(true);

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
      const callType = "default";
      const trimmedCallId = storedCallId.trim();

      const joinStoredCall = async () => {
        try {
          const existingCall = client.call(callType, trimmedCallId);
          await existingCall.join();
          console.log("Joined existing call successfully:", existingCall);
          setCall(existingCall);

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
      console.log("Joined call successfully:", newCall);
      setCall(newCall);

      localStorage.setItem("currentCallId", trimmedCallId);
      setDialogOpen(false);

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
            <JoinedMeetingUI />
          </StreamCall>
        )}
      </div>
    </div>
  );
};

const JoinedMeetingUI = () => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleLeaveCall = () => {
    setDialogOpen(true);
    setTimeout(() => {
      localStorage.removeItem("currentCallId");
      navigate("/home");
    }, 30000); // 30 seconds delay
  };

  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      handleLeaveCall();
    }
  }, [callingState]);

  return (
    <StreamTheme>
      <SpeakerLayout participantsBarPosition="top" />
      <CallControls onLeave={handleLeaveCall} />
      <Dialog open={dialogOpen}>
        <DialogTitle>Leaving Call</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are leaving the call. This window will close in 30 seconds.
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </StreamTheme>
  );
};

export default JoinMeeting;
