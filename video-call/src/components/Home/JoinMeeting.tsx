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

// Fetch environment variables
const isProduction = import.meta.env.MODE === "production";
const server_ip = isProduction ? "rmvideocall.vercel.app" : "localhost:3002";
const server_protocol = isProduction ? "https" : "http";

interface CallControlsProps {
  onLeave: () => void;
}

/**
 * `CallControls` component provides UI elements for managing a video call.
 * It includes buttons for toggling audio, video, screen sharing, and cancelling the call.
 *
 * @component
 * @param {CallControlsProps} props - The properties for the component.
 * @param {Function} props.onLeave - Function to call when the user leaves the call.
 * @example
 * return (
 *   <CallControls onLeave={handleLeave} />
 * );
 */
const CallControls: React.FC<CallControlsProps> = ({ onLeave }) => (
  <div className="str-video__call-controls">
    <ToggleAudioPublishingButton />
    <ToggleVideoPublishingButton />
    <ScreenShareButton />
    <CancelCallButton onLeave={onLeave} />
  </div>
);
/**
 * `JoinMeeting` component handles the process of joining a video call.
 * It manages state for the call ID, current call, and dialog visibility.
 * It provides functionality to join a meeting by entering the call ID and sends participant data to the server.
 *
 * @component
 * @example
 * return (
 *   <JoinMeeting />
 * );
 */
const JoinMeeting = () => {
  const navigate = useNavigate();
  const { client, user } = useVideoClient();
  const [callId, setCallId] = useState("");
  const [call, setCall] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(true);
  /**
   * Sends participant data to the server.
   *
   * @async
   * @function
   * @param {any} callId - The ID of the call.
   * @param {any} userId - The ID of the user.
   * @returns {Promise<void>}
   */
  const sendParticipantDataToServer = async (callId: any, userId: any) => {
    try {
      const response = await fetch(
        `${server_protocol}://${server_ip}/api/meeting-add-participant`,
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
  /**
   * Handles the process of joining a meeting.
   * It creates a new call, joins it, and updates the local storage.
   *
   * @async
   * @function
   * @returns {Promise<void>}
   */
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
  /**
   * Handles the cancellation of the join meeting dialog.
   * It closes the dialog and navigates to the home page.
   */
  const handleCancel = () => {
    setDialogOpen(false);
    navigate("/home");
  };
  /**
   * Handles user logout by navigating to the home page.
   */
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
  /**
   * Handles leaving the call by showing a dialog and removing the call ID from local storage.
   * It navigates to the home page after a 30-second delay.
   */
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
